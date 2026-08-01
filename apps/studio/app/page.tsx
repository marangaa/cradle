"use client";

import { useState, useEffect, useRef, useMemo, type FormEvent } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AccountGate } from "./components/account-gate";
import { authClient } from "./lib/auth-client";

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Canonical Petdex row -> state map, mirroring @cradle/widget. Duplicated here (rather than a
 * shared import) to avoid wiring a new cross-package dependency for this fix; keep both in sync
 * if Petdex ever changes its convention.
 */
const STATE_ROWS = {
  idle: 0,
  "running-right": 1,
  "running-left": 2,
  waving: 3,
  jumping: 4,
  failed: 5,
  waiting: 6,
  running: 7,
  review: 8,
} as const;

const STATE_ORDER = Object.keys(STATE_ROWS) as PetdexState[];
type PetdexState = keyof typeof STATE_ROWS;

type Page = { url: string; title: string; markdown: string };

type Character = { displayName: string; greeting?: string; theme?: "neobrutalist" | "modern" | "cyberpunk" | "terminal" | "minimal" | "synthwave" | "paper" };
type Installation = { id: string; name: string };
type OwnedInstallation = {
  id: string;
  name: string;
  origin: string;
  knowledgeVersion?: number;
  updatedAt?: string;
  companionSlug?: string;
  character?: Character | null;
};

type Knowledge = { pages: Page[]; sourceUrl: string; version: number };
type BrandProfile = {
  name: string;
  colors: Array<{ hex: string; usage?: string }>;
  logos: Array<{ url: string; alt?: string }>;
  backdrops: Array<{ url: string; description?: string }>;
  source: "openbrand" | "manual";
};
type StudioSession = {
  installation: Installation;
  knowledge: Knowledge;
  character: Character;
  brandProfile: BrandProfile | null;
};
type CatalogCompanion = {
  slug: string;
  displayName: string;
  description: string;
  kind: "character" | "creature" | "object";
  submittedBy: string;
  spritesheetUrl: string;
  petJsonUrl: string;
};
type ImportedCompanion = CatalogCompanion & {
  id: string;
  installationId: string;
  provider: "petdex";
  sourceUrl: string;
  objectKey: string;
  checksum: string;
  columns: number;
  rows: number;
  cellWidth: number;
  cellHeight: number;
};

type HealthPayload = { ok: boolean; services: Record<string, { ok: boolean }> };

type Screen = "connect" | "review" | "shape" | "live";
type PreviewState = PetdexState;
type KindFilter = "all" | "character" | "creature" | "object";

// ─── Constants ─────────────────────────────────────────────────────────────────

const RUNTIME_URL = process.env.NEXT_PUBLIC_RUNTIME_URL || "";
const runtime = RUNTIME_URL;

const KIND_LABELS: Record<KindFilter, string> = {
  all: "All", character: "Characters", creature: "Creatures", object: "Objects",
};

// ─── Fetchers (Native Next.js Rewrites to /api/runtime/*) ───────────────────────

async function runtimeFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api/runtime${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...init.headers,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? `Request failed with status ${response.status}`);
  }
  return data as T;
}

async function fetchHealth(): Promise<HealthPayload> {
  return runtimeFetch<HealthPayload>("/health");
}

async function fetchOwnedInstallations(): Promise<OwnedInstallation[]> {
  const res = await runtimeFetch<{ installations: OwnedInstallation[] }>("/installations");
  return res.installations;
}

type CatalogResponse = {
  companions: CatalogCompanion[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
};

async function fetchCatalog(page: number, kind: KindFilter, query: string): Promise<CatalogResponse> {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  params.set("limit", "24");
  if (query.trim()) params.set("query", query.trim());
  if (kind !== "all") params.set("kind", kind);

  const path = `/companions/petdex?${params.toString()}`;
  return runtimeFetch<CatalogResponse>(path);
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function makeCharacter(name: string): Character {
  return { displayName: name, greeting: `Welcome to ${name}. What can I help you find?` };
}

function getSpriteUrl(companion: CatalogCompanion | ImportedCompanion) {
  const url = "sourceUrl" in companion && companion.sourceUrl ? companion.sourceUrl : companion.spritesheetUrl;
  if (url.includes("assets.petdex.dev")) {
    return `/api/assets?url=${encodeURIComponent(url)}`;
  }
  return url;
}

/**
 * Petdex declares neither grid dimensions nor frame counts anywhere in its manifest or pet.json,
 * so this is the only reliable source of truth: decode the real spritesheet once, derive
 * columns/rows from its actual pixel size (192x208 cells), and detect each row's real frame
 * count from its alpha channel — mirroring the same technique @cradle/widget uses at runtime.
 */
type DetectedAtlas = { columns: number; rows: number; frameCounts: number[] };

const CELL_WIDTH = 192;
const CELL_HEIGHT = 208;
const ALPHA_THRESHOLD = 12;

function detectAtlas(spriteUrl: string): Promise<DetectedAtlas> {
  return new Promise<DetectedAtlas>((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const width = image.naturalWidth || CELL_WIDTH * 8;
      const height = image.naturalHeight || CELL_HEIGHT * 9;
      const columns = Math.max(1, Math.round(width / CELL_WIDTH));
      const rows = Math.max(1, Math.round(height / CELL_HEIGHT));
      const fallback = { columns, rows, frameCounts: new Array<number>(rows).fill(columns) };

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) { resolve(fallback); return; }

      try {
        ctx.drawImage(image, 0, 0, width, height);
        const cellW = width / columns;
        const cellH = height / rows;
        const frameCounts: number[] = [];
        for (let row = 0; row < rows; row += 1) {
          let lastNonEmpty = -1;
          for (let column = 0; column < columns; column += 1) {
            const x = Math.round(column * cellW);
            const y = Math.round(row * cellH);
            const w = Math.max(1, Math.round(cellW));
            const h = Math.max(1, Math.round(cellH));
            let hasContent = false;
            try {
              const { data } = ctx.getImageData(x, y, w, h);
              for (let i = 3; i < data.length; i += 4) {
                if ((data[i] ?? 0) > ALPHA_THRESHOLD) { hasContent = true; break; }
              }
            } catch {
              hasContent = true;
            }
            if (hasContent) lastNonEmpty = column;
          }
          frameCounts.push(lastNonEmpty >= 0 ? lastNonEmpty + 1 : columns);
        }
        resolve({ columns, rows, frameCounts });
      } catch {
        resolve(fallback);
      }
    };
    image.onerror = () => resolve({ columns: 8, rows: 9, frameCounts: new Array(9).fill(8) });
    image.src = spriteUrl;
  });
}

/**
 * TanStack Query already gives every consumer of the same spriteUrl automatic deduplication and
 * caching — no reason to hand-roll a second cache alongside it. `staleTime: Infinity` because a
 * given spritesheet's real frame layout never changes once decoded.
 */
function useCompanionAtlas(spriteUrl: string): DetectedAtlas | null {
  const { data } = useQuery({
    queryKey: ["companion-atlas", spriteUrl],
    queryFn: () => detectAtlas(spriteUrl),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 1,
  });
  return data ?? null;
}

/**
 * Rotates a card through all 9 canonical states entirely on its own clock — starting the moment
 * *this* card's own atlas resolves, paced by *this* card's own real per-state frame durations.
 * No shared timer, no dependency on any other card's load time or position in a rotation.
 */
function useAutoCyclingState(atlas: DetectedAtlas | null): PetdexState {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!atlas) return;
    const state = STATE_ORDER[index] ?? "idle";
    const row = Math.min(STATE_ROWS[state] ?? 0, atlas.rows - 1);
    const frames = Math.max(atlas.frameCounts[row] ?? atlas.columns, 1);
    const durationMs = Math.max(frames * 140, 400);
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % STATE_ORDER.length), durationMs);
    return () => window.clearTimeout(timer);
  }, [atlas, index]);
  return STATE_ORDER[index] ?? "idle";
}

// ─── Sub-components ────────────────────────────────────────────────────────────

/** Renders one real Petdex atlas cell sequence without loading a second widget runtime. */
function CompanionSprite({
  companion, state = "idle", animated = true, className = "",
}: {
  companion: CatalogCompanion | ImportedCompanion;
  state?: PreviewState;
  animated?: boolean;
  className?: string;
}) {
  const spriteRef = useRef<HTMLSpanElement>(null);
  const spriteUrl = getSpriteUrl(companion);
  const atlas = useCompanionAtlas(spriteUrl);

  const columns = atlas?.columns ?? 8;
  const rows = atlas?.rows ?? 9;
  const row = Math.min(STATE_ROWS[state] ?? 0, rows - 1);
  const frames = Math.max(atlas?.frameCounts[row] ?? columns, 1);
  const durationMs = Math.max(frames * 140, 400);

  const yPercent = (row / Math.max(rows - 1, 1)) * 100;
  const colDenom = Math.max(columns - 1, 1);
  const endXPercent = (frames / colDenom) * 100;

  useEffect(() => {
    const el = spriteRef.current;
    if (!el) return;

    // No atlas yet (image still decoding) — hold on the first cell rather than animating with
    // guessed dimensions; the moment `atlas` resolves this effect reruns and starts playing.
    if (!atlas || !animated || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.backgroundPosition = `0% ${yPercent}%`;
      return;
    }

    // A real WAAPI animation per card: runs on the compositor thread (no JS ticking, no shared
    // clock to sync against), and starts immediately from this card's own frame 0 the instant
    // its own image finishes decoding — independent of when any other card loaded.
    const animation = el.animate(
      [
        { backgroundPosition: `0% ${yPercent}%` },
        { backgroundPosition: `${endXPercent}% ${yPercent}%` },
      ],
      {
        duration: durationMs,
        iterations: Infinity,
        easing: `steps(${frames}, end)`,
      }
    );

    return () => animation.cancel();
  }, [animated, atlas, durationMs, endXPercent, frames, yPercent]);

  return (
    <span
      ref={spriteRef}
      className={`pet-sprite ${className}`}
      role="img"
      aria-label={`${companion.displayName} animation`}
      style={{
        backgroundImage: `url(${spriteUrl})`,
        backgroundSize: `${columns * 100}% ${rows * 100}%`,
        backgroundPosition: `0% ${yPercent}%`,
        aspectRatio: `${CELL_WIDTH} / ${CELL_HEIGHT}`,
      }}
    />
  );
}


function CatalogCharacter({ companion }: { companion: CatalogCompanion }) {
  const atlas = useCompanionAtlas(getSpriteUrl(companion));
  const state = useAutoCyclingState(atlas);
  return <CompanionSprite companion={companion} state={state} className="catalog-sprite" />;
}

function CompanionSkeleton() {
  return (
    <article className="companion-card companion-skeleton" aria-hidden="true">
      <div className="skeleton-sprite" />
      <div className="skeleton-kind" />
      <div className="skeleton-name" />
    </article>
  );
}

function CharacterPreview({
  character,
  companion,
  overrideState,
  installationId,
  brandName,
}: {
  character: Character;
  companion: ImportedCompanion;
  overrideState?: PetdexState;
  installationId?: string;
  brandName?: string;
}) {
  const visitorId = useMemo(() => {
    if (typeof window === "undefined") return "preview-visitor";
    const key = `cradle_studio_visitor_${installationId || "default"}`;
    let id = sessionStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(key, id);
    }
    return id;
  }, [installationId]);

  const [state, setState] = useState<PreviewState>("idle");
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    if (!installationId) return;
    const runtimeUrl = RUNTIME_URL;
    console.log(`[Studio Preview] Fetching initial greeting for installationId: ${installationId}, visitorId: ${visitorId}`);
    fetch(`${runtimeUrl}/api/chat/init`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-cradle-installation-id": installationId,
        "x-cradle-visitor-id": visitorId,
      },
      body: JSON.stringify({ installationId, visitorId }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        console.log(`[Studio Preview] Greeting received:`, data);
        if (data?.greeting) {
          setMessages([{ role: "assistant", content: data.greeting }]);
        } else if (data?.isReturning) {
          setMessages([{ role: "assistant", content: `Welcome back! 👋 How can I help you today?` }]);
        } else {
          setMessages([{ role: "assistant", content: `Hi there! 👋 Ask me anything about ${brandName || "our site"}.` }]);
        }
      })
      .catch((err) => {
        console.warn(`[Studio Preview] Greeting fetch failed:`, err);
        setMessages([{ role: "assistant", content: `Hi there! 👋 Ask me anything about ${brandName || "our site"}.` }]);
      });
  }, [installationId, visitorId, brandName]);

  const activeState = overrideState ?? state;
  const theme = character.theme ?? "neobrutalist";

  function togglePreview() {
    setOpen((current) => {
      const next = !current;
      setState(next ? "waving" : "idle");
      return next;
    });
  }

  async function sendMessage(e: FormEvent) {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    const text = input.trim();
    setInput("");

    console.log(`[Studio Preview] Sending user message: "${text}"`);
    const newMessages = [...messages, { role: "user" as const, content: text }];
    setMessages([...newMessages, { role: "assistant" as const, content: "…" }]);
    setIsStreaming(true);

    try {
    const runtimeUrl = RUNTIME_URL;
      const response = await fetch(`${runtimeUrl}/api/chat`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(installationId ? { "x-cradle-installation-id": installationId } : {}),
          "x-cradle-visitor-id": visitorId,
        },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            id: crypto.randomUUID(),
            role: m.role,
            content: m.content,
            parts: [{ type: "text", text: m.content }],
          })),
          installationId,
          visitorId,
        }),
      });

      if (!response.ok || !response.body) {
        console.error(`[Studio Preview] Chat response failed HTTP ${response.status}`);
        setMessages([...newMessages, { role: "assistant", content: "Something went wrong. Please try again." }]);
        setIsStreaming(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        setMessages([...newMessages, { role: "assistant", content: assistantText || "…" }]);
      }

      console.log(`[Studio Preview] Stream finished. Total content length: ${assistantText.length} chars`);
      setIsStreaming(false);
    } catch (err) {
      console.error(`[Studio Preview] sendMessage error:`, err);
      setMessages([...newMessages, { role: "assistant", content: "Something went wrong. Please try again." }]);
      setIsStreaming(false);
    }
  }

  const isNeobrutalist = theme === "neobrutalist";
  const isModern = theme === "modern";
  const isCyberpunk = theme === "cyberpunk";
  const isTerminal = theme === "terminal";
  const isMinimal = theme === "minimal";
  const isSynthwave = theme === "synthwave";
  const isPaper = theme === "paper";

  return (
    <div className={`studio-install-preview theme-${theme}`} style={{ position: "fixed", bottom: 22, right: 22, zIndex: 2147483647, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
      {open && (
        <section
          aria-label="Installed character preview"
          style={{
            width: 320,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            background: "transparent",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: "calc(100vh - 160px)", overflowY: "auto", padding: "8px 4px", scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {messages.map((m, idx) => {
              const isUser = m.role === "user";
              return (
                <div
                  key={idx}
                  style={{
                    alignSelf: isUser ? "flex-end" : "flex-start",
                    maxWidth: "85%",
                    padding: "10px 14px",
                    fontSize: ".84rem",
                    lineHeight: 1.45,
                    background: isUser
                      ? (isSynthwave ? "#ec4899" : isPaper ? "#2c2825" : isCyberpunk ? "#a855f7" : isTerminal ? "#15803d" : isModern ? "#4f46e5" : isMinimal ? "#0f172a" : "#09090b")
                      : (isSynthwave ? "#1e1b4b" : isPaper ? "#fdfbf7" : isCyberpunk ? "#090d16" : isTerminal ? "#000000" : isModern ? "rgba(15,23,42,0.88)" : isMinimal ? "#f8fafc" : "#ffffff"),
                    color: isUser
                      ? (isSynthwave ? "#ffffff" : isPaper ? "#fdfbf7" : isCyberpunk ? "#090d16" : "#ffffff")
                      : (isSynthwave ? "#fde047" : isPaper ? "#2c2825" : isCyberpunk ? "#22d3ee" : isTerminal ? "#22c55e" : isModern ? "#f8fafc" : "#0f172a"),
                    border: isNeobrutalist
                      ? "2.5px solid #09090b"
                      : isSynthwave
                      ? (isUser ? "2px solid #fde047" : "2px solid #ec4899")
                      : isPaper
                      ? (isUser ? "1px solid #736b63" : "1px solid #d6cebf")
                      : isCyberpunk
                      ? (isUser ? "2px solid #22d3ee" : "2px solid #ec4899")
                      : isTerminal
                      ? "1.5px solid #22c55e"
                      : isModern
                      ? "1.5px solid rgba(99,102,241,0.5)"
                      : "1px solid #cbd5e1",
                    boxShadow: isNeobrutalist
                      ? "3px 3px 0px #09090b"
                      : isSynthwave
                      ? "0 0 16px rgba(236,72,153,0.5)"
                      : isPaper
                      ? "0 2px 8px rgba(0,0,0,0.05)"
                      : isCyberpunk
                      ? "0 0 16px rgba(236,72,153,0.5)"
                      : isTerminal
                      ? "0 0 12px rgba(34,197,94,0.3)"
                      : isModern
                      ? "0 8px 24px rgba(15,23,42,0.3)"
                      : "0 4px 12px rgba(0,0,0,0.05)",
                    backdropFilter: isModern ? "blur(16px)" : "none",
                    fontFamily: isPaper ? "Georgia, serif" : isTerminal ? "monospace" : "inherit",
                    borderRadius: isTerminal ? 4 : (isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px"),
                  }}
                >
                  {m.content}
                </div>
              );
            })}
          </div>

          <form
            onSubmit={sendMessage}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 6px 6px 16px",
              borderRadius: isTerminal ? 4 : isPaper ? 12 : 9999,
              background: isSynthwave ? "#1e1b4b" : isPaper ? "#fdfbf7" : isCyberpunk ? "#090d16" : isTerminal ? "#000000" : isModern ? "rgba(15,23,42,0.9)" : isMinimal ? "#ffffff" : "#ffffff",
              border: isNeobrutalist
                ? "2.5px solid #09090b"
                : isSynthwave
                ? "2px solid #fde047"
                : isPaper
                ? "1px solid #d6cebf"
                : isCyberpunk
                ? "2px solid #ec4899"
                : isTerminal
                ? "1.5px solid #22c55e"
                : isModern
                ? "1.5px solid rgba(99,102,241,0.5)"
                : "1px solid #cbd5e1",
              boxShadow: isNeobrutalist
                ? "3.5px 3.5px 0px #09090b"
                : isSynthwave
                ? "0 0 18px rgba(253,224,71,0.4)"
                : isPaper
                ? "0 2px 10px rgba(0,0,0,0.05)"
                : isCyberpunk
                ? "0 0 18px rgba(236,72,153,0.6)"
                : isTerminal
                ? "0 0 14px rgba(34,197,94,0.4)"
                : isModern
                ? "0 10px 28px rgba(0,0,0,0.25)"
                : "0 2px 10px rgba(0,0,0,0.05)",
              backdropFilter: isModern ? "blur(16px)" : "none",
            }}
          >
            <input
              type="text"
              placeholder="Ask something…"
              value={input}
              onChange={(e) => {
                const val = e.target.value;
                setInput(val);
                if (!isStreaming && val.trim() && state === "idle") {
                  setState("waiting");
                } else if (!isStreaming && !val.trim() && state === "waiting") {
                  setState("idle");
                }
              }}
              style={{
                flex: 1,
                border: 0,
                outline: "none",
                background: "transparent",
                fontSize: ".84rem",
                color: isSynthwave ? "#fde047" : isPaper ? "#2c2825" : isCyberpunk ? "#22d3ee" : isTerminal ? "#22c55e" : isModern ? "#f8fafc" : "#0f172a",
                fontFamily: isPaper ? "Georgia, serif" : isTerminal ? "monospace" : "inherit",
              }}
            />
            <button
              type="submit"
              disabled={isStreaming}
              style={{
                border: 0,
                background: isNeobrutalist ? "#09090b" : isSynthwave ? "#ec4899" : isPaper ? "#2c2825" : isCyberpunk ? "#ec4899" : isTerminal ? "#22c55e" : isModern ? "#6366f1" : "transparent",
                color: isNeobrutalist ? "#ffffff" : isSynthwave ? "#ffffff" : isPaper ? "#fdfbf7" : isCyberpunk ? "#090d16" : isTerminal ? "#000000" : isModern ? "#ffffff" : "#0f172a",
                borderRadius: isTerminal ? 2 : isPaper ? 8 : (isNeobrutalist || isCyberpunk || isSynthwave || isModern ? 9999 : 0),
                padding: isNeobrutalist || isCyberpunk || isSynthwave || isModern ? "6px 16px" : "6px 10px",
                fontWeight: 800,
                fontSize: ".8rem",
                cursor: isStreaming ? "wait" : "pointer",
                fontFamily: isPaper ? "Georgia, serif" : isTerminal ? "monospace" : "inherit",
              }}
            >
              {isStreaming ? "…" : "Send"}
            </button>
          </form>
        </section>
      )}
      <button
        className="install-preview-trigger"
        type="button"
        onClick={togglePreview}
        aria-label={open ? "Close installed character preview" : "Open installed character preview"}
        aria-expanded={open}
      >
        <span className="preview-drag-handle" aria-hidden="true">⠿</span>
        <CompanionSprite companion={companion} state={activeState} className="trigger-sprite" />
      </button>
    </div>
  );
}


/** Every entry previews a real spritesheet row and ships the accurate JS call for it — all 9
 *  canonical Petdex states, so nothing the widget can actually do is left untestable here. */
const PLAYGROUND_ACTIONS: { previewState: PetdexState; label: string; icon: string; snippet: string }[] = [
  { previewState: "idle", label: "Idle", icon: "🟢", snippet: 'window.Cradle?.setState("idle");' },
  { previewState: "waving", label: "Waving", icon: "👋", snippet: 'window.Cradle?.setState("waving");' },
  { previewState: "waiting", label: "Waiting", icon: "💤", snippet: 'window.Cradle?.setState("waiting");' },
  { previewState: "review", label: "Review", icon: "🔍", snippet: 'window.Cradle?.setState("review");' },
  { previewState: "running", label: "Running", icon: "⚡", snippet: 'window.Cradle?.setState("running");' },
  { previewState: "running-right", label: "Run Right", icon: "➡️", snippet: 'window.Cradle?.setState("running-right");' },
  { previewState: "running-left", label: "Run Left", icon: "⬅️", snippet: 'window.Cradle?.setState("running-left");' },
  { previewState: "jumping", label: "Resolved", icon: "🎉", snippet: 'window.Cradle?.resolveAction(true);' },
  { previewState: "failed", label: "Failed", icon: "❌", snippet: 'window.Cradle?.resolveAction(false);' },
];


function CharacterStatePlayground({ onTestState }: { onTestState(state: PetdexState): void }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [copiedState, setCopiedState] = useState(false);

  const current = PLAYGROUND_ACTIONS[activeIndex] ?? PLAYGROUND_ACTIONS[0]!;


  const testState = (index: number) => {
    setActiveIndex(index);
    onTestState(PLAYGROUND_ACTIONS[index]!.previewState);
  };

  const copySnippet = async () => {
    await navigator.clipboard.writeText(current.snippet);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
  };

  return (
    <div style={{ marginTop: 22, paddingTop: 18, borderTop: "2px dashed var(--soft)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <strong style={{ fontSize: ".85rem", fontWeight: 780, color: "#111" }}>
            Character State Playground
          </strong>
          <p style={{ margin: "2px 0 0", fontSize: ".72rem", color: "var(--muted)", fontFamily: "var(--mono)" }}>
            Test your companion&apos;s animations live & copy the JS call to drive it from your app.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
        {PLAYGROUND_ACTIONS.map((action, index) => (
          <button
            key={action.previewState + action.label}
            type="button"
            className={`button${activeIndex === index ? " primary" : ""}`}
            onClick={() => testState(index)}
            style={{ fontSize: ".68rem", padding: "5px 9px", gap: 5 }}
          >
            <span>{action.icon}</span>
            <span>{action.label}</span>
          </button>
        ))}
      </div>

      <div style={{ marginTop: 12, background: "var(--ink)", padding: "10px 12px", border: "2px solid #111", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <code style={{ fontFamily: "var(--mono)", fontSize: ".7rem", color: "var(--yellow)" }}>
          {current.snippet}
        </code>
        <button
          type="button"
          onClick={() => void copySnippet()}
          style={{
            background: "none",
            border: "1px solid var(--yellow)",
            color: "var(--yellow)",
            fontFamily: "var(--mono)",
            fontSize: ".64rem",
            padding: "3px 8px",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          {copiedState ? "Copied!" : "Copy JS call"}
        </button>
      </div>
    </div>
  );
}

function InstallCode({ installationId, copied, onCopy, onTestState }: { installationId: string; copied: boolean; onCopy(v: string): Promise<void>; onTestState(state: PetdexState): void }) {
  const [tab, setTab] = useState<"script" | "npm">("script");
  const runtime = RUNTIME_URL;

  const scriptSnippet = `<script src="${runtime}/widget.js" data-site-id="${installationId}"></script>`;

  const npmSnippet = `# 1. Install package\npnpm add @maranga/cradle\n\n# 2. Import & render in React / Next.js / HTML\nimport "@maranga/cradle";\n\n<cradle-character\n  site-id="${installationId}"\n  api-base="${runtime}"\n/>`;

  const activeSnippet = tab === "script" ? scriptSnippet : npmSnippet;

  return (
    <section className="install-code">
      <div className="section-copy">
        <span className="eyebrow">Embed</span>
        <h2>Add your character to the site.</h2>
        <p>Choose your preferred integration method below.</p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <button
          type="button"
          className={`button${tab === "script" ? " primary" : ""}`}
          onClick={() => setTab("script")}
          style={{ fontSize: ".75rem", padding: "6px 12px" }}
        >
          HTML Script Tag
        </button>
        <button
          type="button"
          className={`button${tab === "npm" ? " primary" : ""}`}
          onClick={() => setTab("npm")}
          style={{ fontSize: ".75rem", padding: "6px 12px" }}
        >
          NPM Package (@maranga/cradle)
        </button>
      </div>

      <pre><code>{activeSnippet}</code></pre>
      <button className="button primary" style={{ marginTop: 14 }} onClick={() => void onCopy(activeSnippet)}>
        {copied ? "Copied to clipboard" : `Copy ${tab === "script" ? "script tag" : "NPM snippet"}`}
      </button>

      <CharacterStatePlayground onTestState={onTestState} />
    </section>
  );
}



function LiveIntegrationSection({ installationId, copied, onCopy, onTestState }: { installationId: string; copied: boolean; onCopy(v: string): Promise<void>; onTestState(state: PetdexState): void }) {
  return (
    <div className="live-integration-wrapper">
      <div className="live-dual-grid">
        {/* Left Column: Embed Code */}
        <div className="live-col left-col">
          <InstallCode installationId={installationId} copied={copied} onCopy={onCopy} onTestState={onTestState} />

          <div className="connector-node node-left" title="Cradle Widget Connection">
            <span className="node-dot" />
          </div>
        </div>

        {/* Center Connecting 3D String / Cable */}
        <div className="string-connector-container" aria-hidden="true">
          <svg className="string-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="stringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3559ff" />
                <stop offset="50%" stopColor="#ff8bd4" />
                <stop offset="100%" stopColor="#e7ff36" />
              </linearGradient>
              <filter id="stringGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Cable shadow */}
            <path
              d="M 0 50 C 40 25, 60 75, 100 50"
              fill="none"
              stroke="#111111"
              strokeWidth="7"
              strokeLinecap="round"
            />
            {/* Glowing gradient cable */}
            <path
              d="M 0 50 C 40 25, 60 75, 100 50"
              fill="none"
              stroke="url(#stringGrad)"
              strokeWidth="4"
              filter="url(#stringGlowFilter)"
              strokeLinecap="round"
            />
            {/* Animated data pulses */}
            <path
              className="pulse-path"
              d="M 0 50 C 40 25, 60 75, 100 50"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeDasharray="8 16"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Right Column: Qualra Memory Showcase Card */}
        <div className="live-col right-col">
          <div className="connector-node node-right" title="Qualra Memory Connection">
            <span className="node-dot" />
          </div>

          <article className="qualra-card">
            <div>
              <span className="qualra-eyebrow">Customer Memory Layer</span>
              <div className="qualra-header">
                <h2>Meet <em>Qualra.</em></h2>
              </div>
              <p className="qualra-desc">
                Qualra remembers every customer conversation, turning raw interactions into clear evidence your product team can act on. Never start from zero.
              </p>

              <ul className="qualra-features">
                <li>
                  <span className="feature-icon">🧠</span>
                  <div>
                    <strong>Persistent Context</strong>
                    <small>Remembers goals, feedback & past visits so customers never repeat themselves.</small>
                  </div>
                </li>
                <li>
                  <span className="feature-icon">🗺️</span>
                  <div>
                    <strong>Turn Conversations into Roadmaps</strong>
                    <small>Converts continuous customer touchpoints into clear roadmap insights.</small>
                  </div>
                </li>
                <li>
                  <span className="feature-icon">🤝</span>
                  <div>
                    <strong>Continuous Relationships</strong>
                    <small>Pick up right where you left off. Qualra handles remembering, your team builds.</small>
                  </div>
                </li>
              </ul>
            </div>

            <a
              href="https://www.qualra.xyz"
              target="_blank"
              rel="noreferrer"
              className="button primary qualra-cta"
            >
              Explore Qualra →
            </a>
          </article>
        </div>
      </div>
    </div>
  );
}




function KindTabs({ active, onChange }: { active: KindFilter; onChange(k: KindFilter): void }) {
  return (
    <div className="kind-tabs" role="tablist" aria-label="Filter companions by kind">
      {(["all", "character", "creature", "object"] as KindFilter[]).map((kind) => (
        <button
          key={kind}
          role="tab"
          aria-selected={active === kind}
          className={`kind-tab${active === kind ? " active" : ""}`}
          onClick={() => onChange(kind)}
        >
          {KIND_LABELS[kind]}
        </button>
      ))}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function StudioHome() {
  const { data: authSession } = authClient.useSession();
  const queryClient = useQueryClient();

  // Workflow state
  const [screen, setScreen]               = useState<Screen>("connect");
  const [siteUrl, setSiteUrl]             = useState("");
  const [session, setSession]             = useState<StudioSession | null>(null);
  const [playgroundState, setPlaygroundState] = useState<PetdexState | undefined>(undefined);

  const [pickerDismissed, setPickerDismissed] = useState(false);
  const [includedUrls, setIncludedUrls]   = useState<Set<string>>(new Set());
  const [character, setCharacter]         = useState<Character | null>(null);
  const [companion, setCompanion]         = useState<ImportedCompanion | null>(null);

  // Catalog UI state
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogKind, setCatalogKind]     = useState<KindFilter>("all");
  const [catalogPage, setCatalogPage]     = useState(1);

  // Transient UI state
  const [busy, setBusy]   = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);

  // ── Derived booleans ─────────────────────────────────────────────────────────
  const reviewed   = (session?.knowledge.version ?? 0) > 1;
  const canShape   = Boolean(session && reviewed);
  const canGoLive  = Boolean(session && reviewed && companion);
  const hasPreview = Boolean(character && companion && (screen === "shape" || screen === "live"));

  // ── Server state (TanStack Query) ─────────────────────────────────────────────

  /** One-shot health probe — runs on mount, surfaces down dependencies as a banner. */
  const { data: health } = useQuery({
    queryKey: ["health"],
    queryFn: fetchHealth,
    staleTime: Infinity,   // don't refetch — just one read on load
    retry: false,
  });

  const systemNotice = useMemo(() => {
    if (!health || health.ok) return "";
    const down = Object.entries(health.services).filter(([, s]) => !s.ok).map(([name]) => name);
    return `Heads up — ${down.join(" and ")} ${down.length === 1 ? "is" : "are"} currently unreachable. Some actions may fail.`;
  }, [health]);

  /**
   * Owned installations — fetched once when the user is signed in and hasn't started a project.
   * Disabled when there's no auth session, an active project session, or the picker is dismissed.
   */
  const {
    data: ownedInstallations = [],
    isFetching: ownedLoading,
  } = useQuery({
    queryKey: ["owned-installations", authSession?.user.id],
    queryFn: fetchOwnedInstallations,
    enabled: Boolean(authSession) && !session && !pickerDismissed,
    staleTime: 30_000,
    retry: false,
  });

  /**
   * Monthly usage metrics (99 conversations / 30 days).
   */
  /**
   * Monthly usage metrics (99 conversations / 30 days).
   */
  const { data: usageData } = useQuery({
    queryKey: ["installation-usage", session?.installation.id],
    queryFn: () => runtimeFetch<{ installationId: string; periodStart: string; conversationCount: number; messageCount: number; limit: number }>(`/installations/${session!.installation.id}/usage`),
    enabled: Boolean(session?.installation.id),
    refetchInterval: 15_000,
  });

  /**
   * Paginated Petdex catalog — server-side filtering & pagination (24 per page).
   */
  const {
    data: catalogData,
    isFetching: catalogLoading,
  } = useQuery({
    queryKey: ["petdex-catalog", catalogPage, catalogKind, catalogSearch],
    queryFn: () => fetchCatalog(catalogPage, catalogKind, catalogSearch),
    enabled: canShape,
    staleTime: 5 * 60_000,
    retry: 1,
  });

  const catalog = catalogData?.companions ?? [];
  const catalogTotal = catalogData?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(catalogTotal / 24));

  // ── Timer effects (legitimate useEffects — setInterval side effects) ──────────

  /** Auto-dismiss success notices after 4s. */
  useEffect(() => {
    if (!notice) return;
    const id = window.setTimeout(() => setNotice(""), 4_000);
    return () => window.clearTimeout(id);
  }, [notice]);

  // ── Mutations (plain async functions called from event handlers) ──────────────

  function persist(next: StudioSession) {
    setSession(next);
    setCharacter(next.character);
  }

  function begin(label: string) { setBusy(label); setError(""); setNotice(""); }
  function finish(message?: string) { setBusy(null); if (message) setNotice(message); }

  async function removeInstallation(e: React.MouseEvent, id: string, name: string) {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;
    begin("Deleting site…");
    try {
      await runtimeFetch(`/installations/${id}`, { method: "DELETE" });
      await queryClient.invalidateQueries({ queryKey: ["owned-installations"] });
      finish(`Deleted "${name}".`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete this site.");
      finish();
    }
  }

  async function resumeInstallation(installationId: string) {
    begin("Loading your project…");
    try {
      const [kp, cp] = await Promise.all([
        runtimeFetch<{ installation: Installation; knowledge: Knowledge; character: Character; brandProfile: BrandProfile | null }>(`/installations/${installationId}/knowledge`),
        runtimeFetch<{ companion: ImportedCompanion | null }>(`/installations/${installationId}/companion`),
      ]);
      persist({ installation: kp.installation, knowledge: kp.knowledge, character: kp.character, brandProfile: kp.brandProfile });
      setIncludedUrls(new Set((kp.knowledge.pages as Page[]).map((p) => p.url)));
      setCompanion(cp.companion ?? null);
      setPickerDismissed(true);
      setScreen(kp.knowledge.version > 1 ? "shape" : "review");
      finish();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load this project.");
      finish();
    }
  }

  async function connect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    begin("Reading your public site…");
    try {
      const payload = await runtimeFetch<{ installation: Installation; knowledge: Knowledge; brandProfile: BrandProfile | null }>("/onboarding", {
        method: "POST",
        body: JSON.stringify({ url: siteUrl }),
      });
      persist({ installation: payload.installation, knowledge: payload.knowledge, character: makeCharacter(payload.installation.name), brandProfile: payload.brandProfile ?? null });
      setIncludedUrls(new Set((payload.knowledge.pages as Page[]).map((p: Page) => p.url)));
      setCompanion(null);
      setScreen("review");
      finish("Your source bundle is ready for review.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Cradle could not prepare this site.");
      finish();
    }
  }

  function togglePage(url: string) {
    setIncludedUrls((current) => {
      const next = new Set(current);
      if (next.has(url)) next.delete(url); else next.add(url);
      return next;
    });
  }

  async function saveKnowledge() {
    if (!session) return;
    begin("Saving approved knowledge…");
    try {
      const payload = await runtimeFetch<{ knowledge: Knowledge }>(`/installations/${session.installation.id}/knowledge`, {
        method: "PATCH",
        body: JSON.stringify({ includedUrls: [...includedUrls] }),
      });
      persist({ ...session, knowledge: payload.knowledge });
      setCompanion(null);
      setScreen("shape");
      finish("Approved knowledge is now the runtime's source of truth.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Cradle could not save this source bundle.");
      finish();
    }
  }

  async function saveCharacter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session || !character) return;
    begin("Saving your character…");
    try {
      const payload = await runtimeFetch<{ installation: Installation; character: Character }>(`/installations/${session.installation.id}/settings`, {
        method: "PATCH",
        body: JSON.stringify({ character }),
      });
      persist({ ...session, installation: { ...session.installation, name: payload.installation.name }, character: payload.character });
      finish("Character settings saved.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Cradle could not save this character.");
      finish();
    }
  }

  async function chooseCompanion(slug: string) {
    if (!session) return;
    begin("Pinning this companion…");
    try {
      const payload = await runtimeFetch<{ companion: ImportedCompanion }>(`/installations/${session.installation.id}/companion`, {
        method: "PUT",
        body: JSON.stringify({ provider: "petdex", slug }),
      });
      setCompanion(payload.companion);
      finish(`${payload.companion.displayName} is now pinned to this project.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Cradle could not import this companion.");
      finish();
    }
  }

  async function copySnippet(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setNotice("Install snippet copied to your clipboard.");
    } catch {
      setError("Could not copy the snippet. Select it manually instead.");
    }
  }

  function reset() {
    setSession(null);
    setCharacter(null);
    setCompanion(null);
    setIncludedUrls(new Set());
    setCatalogSearch("");
    setCatalogKind("all");
    setScreen("connect");
    setSiteUrl("");
    setNotice("");
    setError("");
    setPickerDismissed(false);
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <main className={`studio-shell${hasPreview ? " has-preview" : ""}`}>
      <header className="studio-topbar">
        <Link className="brand" href="/"><span aria-hidden="true">C</span> Cradle</Link>
        <span className="topbar-actions">
          <a
            href="https://github.com/marangaa/cradle"
            target="_blank"
            rel="noreferrer"
            className="button secondary"
            style={{
              height: 32,
              minHeight: 32,
              padding: "0 10px",
              fontSize: ".68rem",
              gap: 6,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            <span>GitHub</span>
          </a>
          {session && <button className="quiet-button" onClick={reset}>New project</button>}
          {authSession && (
            <button className="quiet-button" onClick={() => void authClient.signOut()}>
              Sign out
            </button>
          )}
        </span>
      </header>

      {systemNotice && <p className="system-notice" role="alert">{systemNotice}</p>}

      {!session ? (
        <AccountGate>
          {/* Returning user — show owned sites picker */}
          {!pickerDismissed && (ownedLoading || ownedInstallations.length > 0) ? (
            <section className="connect-screen">
              <div className="connect-copy">
                <span className="eyebrow">Welcome back</span>
                <h1>Pick up where you left off.</h1>
                <p>{ownedLoading ? "Checking for your existing sites…" : "These sites are already set up on this account."}</p>
                <div className="principles">
                  <span>01. Map your site</span>
                  <span>02. Pick a Petdex body</span>
                  <span>03. Paste 1 script tag</span>
                  <a
                    href="https://github.com/marangaa/cradle"
                    target="_blank"
                    rel="noreferrer"
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <span>⭐ Open Source on GitHub</span>
                  </a>
                </div>
              </div>
              <div className="connect-card">
                <span className="eyebrow">Your sites</span>
                {ownedLoading && (
                  <p style={{ margin: "16px 0 14px", fontFamily: "var(--mono)", fontSize: ".7rem", color: "var(--muted)" }}>
                    Loading your sites…
                  </p>
                )}
                <div className="site-list" style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 16 }}>
                  {ownedInstallations.map((inst, index) => {
                    const isLatest = index === 0;
                    const hostname = inst.origin ? new URL(inst.origin).hostname : inst.name;
                    const showHostname = hostname !== inst.name;
                    const customCharacter = inst.character?.displayName && inst.character.displayName !== inst.name ? inst.character.displayName : null;
                    const isApproved = (inst.knowledgeVersion ?? 0) > 1;
                    const formattedDate = inst.updatedAt
                      ? new Date(inst.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                      : null;

                    return (
                      <div
                        key={inst.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 16,
                          padding: "12px 14px",
                          borderBottom: index < ownedInstallations.length - 1 ? "1px solid #e8e7df" : "none",
                          background: "transparent",
                        }}
                      >
                        <button
                          type="button"
                          disabled={Boolean(busy)}
                          onClick={() => void resumeInstallation(inst.id)}
                          style={{
                            flex: 1,
                            background: "none",
                            border: "none",
                            padding: 0,
                            textAlign: "left",
                            cursor: "pointer",
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <strong style={{ fontSize: ".95rem", fontWeight: 780, color: "#111", letterSpacing: "-.02em" }}>
                              {inst.name}
                            </strong>

                            {isLatest && (
                              <span style={{ background: "#e7ff36", border: "1.5px solid #111", padding: "1px 5px", fontFamily: "var(--mono)", fontSize: ".56rem", fontWeight: 800, textTransform: "uppercase" }}>
                                Latest
                              </span>
                            )}

                            <span style={{
                              background: isApproved ? "#dcfce7" : "#fef9c3",
                              color: isApproved ? "#15803d" : "#854d0e",
                              border: "1px solid #111",
                              padding: "1px 5px",
                              fontFamily: "var(--mono)",
                              fontSize: ".58rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                            }}>
                              {isApproved ? "Active" : "Draft"}
                            </span>

                            {customCharacter && (
                              <span style={{ background: "#f3f4f6", border: "1px solid #d1d5db", padding: "1px 5px", fontFamily: "var(--mono)", fontSize: ".6rem", color: "#374151" }}>
                                🤖 {customCharacter}
                              </span>
                            )}
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: ".7rem", color: "#6b7280", fontFamily: "var(--mono)" }}>
                            {showHostname && <span>🌐 {hostname}</span>}
                            {formattedDate && <span>Updated {formattedDate}</span>}
                          </div>
                        </button>

                        <button
                          type="button"
                          disabled={Boolean(busy)}
                          onClick={(e) => void removeInstallation(e, inst.id, inst.name)}
                          style={{
                            background: "none",
                            color: "#9ca3af",
                            border: "none",
                            padding: "4px 8px",
                            fontFamily: "var(--mono)",
                            fontSize: ".72rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            flexShrink: 0,
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = "#dc2626"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = "#9ca3af"; }}
                          title={`Delete ${inst.name}`}
                          aria-label={`Delete ${inst.name}`}
                        >
                          Delete ✕
                        </button>
                      </div>
                    );
                  })}
                </div>



                <button className="quiet-button" type="button" onClick={() => setPickerDismissed(true)}>
                  Map a new site instead
                </button>
              </div>
            </section>
          ) : (
            /* New user — show connect form */
            <section className="connect-screen">
              <div className="connect-copy">
                <h1>Give your website a <em>character.</em></h1>
                <p>An animated companion for your site. Connect your pages, pick a body from the catalog, and bring your site to life with one script tag.</p>
              </div>
              <div className="connect-card">
                <span className="eyebrow">Start here / 01</span>
                <h2>Bring your site in.</h2>
                <p>We map its public pages. You decide what the character should know about your company.</p>
                <form onSubmit={connect}>
                  <label htmlFor="site-url">Website URL</label>
                  <div className="url-row">
                    <input
                      id="site-url"
                      type="url"
                      required
                      value={siteUrl}
                      onChange={(e) => setSiteUrl(e.target.value)}
                      placeholder="https://yourcompany.com"
                    />
                    <button className="button primary" disabled={Boolean(busy)}>{busy ?? "Map site"}</button>
                  </div>
                </form>
              </div>
            </section>
          )}
        </AccountGate>
      ) : (
        <>
          {/* Project bar */}
          <section className="project-bar">
            <div><span className="eyebrow">Project</span><strong>{session.installation.name}</strong></div>
            <nav aria-label="Studio steps">
              <button className={screen === "review" ? "active" : ""} onClick={() => setScreen("review")}>01 <span>Map</span></button>
              <button className={screen === "shape"  ? "active" : ""} disabled={!canShape}  onClick={() => setScreen("shape")}>02 <span>Body</span></button>
              <button className={screen === "live"   ? "active" : ""} disabled={!canGoLive} onClick={() => setScreen("live")}>03 <span>Wire up</span></button>
            </nav>
          </section>

          {/* Toast notifications */}
          {notice && <p className="status"  role="status">{notice}</p>}
          {error  && <p className="error"   role="alert">{error}</p>}
          {busy   && <p className="status"  role="status">{busy}</p>}

          {/* ── Screen: Review ── */}
          {screen === "review" && (
            <section className="workflow-screen review-screen" key="review">
              <div className="workflow-heading">
                <span className="eyebrow">Your website</span>
                <h1>Choose what it should know.</h1>
                <p>Pick the public pages that best explain your company. You can change these later.</p>
              </div>
              <div className="review-layout">
                <aside className="review-summary">
                  <strong>{includedUrls.size}</strong>
                  <span>selected pages</span>
                  <p>{session.knowledge.pages.length} public pages found on {new URL(session.knowledge.sourceUrl).hostname}.</p>
                  {session.brandProfile && (
                    <div className="brand-profile" aria-label="Detected brand reference">
                      <span>Brand reference</span>
                      <strong>{session.brandProfile.name}</strong>
                      <div>{session.brandProfile.colors.slice(0, 5).map((c) => <i key={c.hex} style={{ background: c.hex }} title={c.hex} />)}</div>
                      <small>{session.brandProfile.logos.length} logo{session.brandProfile.logos.length === 1 ? "" : "s"} · {session.brandProfile.backdrops.length} image{session.brandProfile.backdrops.length === 1 ? "" : "s"}</small>
                    </div>
                  )}
                  <button className="button primary" disabled={Boolean(busy) || includedUrls.size === 0} onClick={() => void saveKnowledge()}>
                    {busy ?? "Lock the source"}
                  </button>
                </aside>
                <div className="page-grid">
                  {session.knowledge.pages.map((page) => (
                    <label className="page-card" key={page.url}>
                      <input type="checkbox" checked={includedUrls.has(page.url)} onChange={() => togglePage(page.url)} />
                      <span className="checkbox" />
                      <span className="page-path">{new URL(page.url).pathname || "/"}</span>
                      <strong>{page.title || "Untitled page"}</strong>
                      <small>{page.markdown.slice(0, 180)}{page.markdown.length > 180 ? "…" : ""}</small>
                    </label>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── Screen: Shape ── */}
          {screen === "shape" && character && (
            <section className="workflow-screen shape-screen" key="shape">
              <div className="workflow-heading">
                <span className="eyebrow">Make it yours</span>
                <h1>Set it up for your site.</h1>
                <p>Give your character a name and select a visual theme for your site.</p>
              </div>
              <div className="shape-layout">
                {/* ── Monthly Conversations Meter ── */}
                <div className="usage-meter-card" style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  padding: "16px 20px",
                  border: "2px solid var(--ink)",
                  background: "var(--white)",
                  boxShadow: "3.5px 3.5px 0px var(--ink)",
                  marginBottom: 16,
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: "1.1rem" }}>⚡</span>
                      <strong style={{ fontSize: ".85rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".04em", fontFamily: "var(--mono)" }}>
                        Monthly Conversations
                      </strong>
                    </div>
                    <span style={{ fontFamily: "var(--mono)", fontSize: ".88rem", fontWeight: 800 }}>
                      {usageData?.conversationCount ?? 0} / {usageData?.limit ?? 99} used
                    </span>
                  </div>

                  <div style={{ height: 12, width: "100%", background: "#f4f4f0", border: "2px solid var(--ink)", overflow: "hidden", position: "relative" }}>
                    <div style={{
                      height: "100%",
                      width: `${Math.min(((usageData?.conversationCount ?? 0) / (usageData?.limit ?? 99)) * 100, 100)}%`,
                      background: (usageData?.conversationCount ?? 0) >= (usageData?.limit ?? 99) ? "#ef4444" : (usageData?.conversationCount ?? 0) > 80 ? "#f59e0b" : "var(--yellow)",
                      transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    }} />
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: ".72rem", color: "var(--muted)", fontWeight: 600 }}>
                    <span>Resets automatically every 30 days</span>
                    <span style={{ fontFamily: "var(--mono)", fontWeight: 700, color: (usageData?.conversationCount ?? 0) >= 99 ? "#ef4444" : "var(--ink)" }}>
                      {Math.max((usageData?.limit ?? 99) - (usageData?.conversationCount ?? 0), 0)} conversations remaining
                    </span>
                  </div>
                </div>

                <form className="character-form" onSubmit={saveCharacter}>
                  <div className="theme-grid-container">
                    <span className="grid-label">Character Name</span>
                    <input
                      className="theme-grid-input"
                      value={character.displayName}
                      maxLength={48}
                      onChange={(e) => setCharacter({ ...character, displayName: e.target.value })}
                    />

                    <span className="grid-label">Widget Theme</span>
                    <div className="theme-grid">
                      {[
                        { id: "neobrutalist", label: "⬛ Neobrutalist", desc: "Bold pop shadows" },
                        { id: "modern", label: "💎 Modern Glass", desc: "Backdrop blur & smooth text" },
                        { id: "cyberpunk", label: "🌌 Cyberpunk", desc: "Neon glow & high contrast" },
                        { id: "terminal", label: "📟 Retro Terminal", desc: "Phosphor monospace" },
                        { id: "minimal", label: "▫️ Swiss Minimal", desc: "Clean typography" },
                        { id: "synthwave", label: "🌆 80s Synthwave", desc: "Hot pink & neon sunset" },
                        { id: "paper", label: "📜 E-Ink Paper", desc: "Warm parchment & serif" },
                      ].map((t) => {
                        const isSelected = (character.theme ?? "neobrutalist") === t.id;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            className={`theme-tile ${isSelected ? "is-selected" : ""}`}
                            onClick={() => setCharacter({ ...character, theme: t.id as any })}
                          >
                            <span className="theme-tile-name">{t.label}</span>
                            <span className="theme-tile-desc">{t.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button className="button primary" disabled={Boolean(busy)}>{busy ?? "Save changes"}</button>
                </form>
              </div>

              <section className="companion-section">
                <div className="section-copy">
                  <span className="eyebrow">Characters</span>
                  <h2>Choose a character.</h2>
                  <p>Pick the one that feels right for your company.</p>
                </div>

                {/* Search + kind filter toolbar */}
                <div className="catalog-toolbar">
                  <div className="catalog-search-wrap">
                    <svg className="search-icon" aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <circle cx="8.5" cy="8.5" r="5.5" /><path d="M13.5 13.5 18 18" strokeLinecap="round" />
                    </svg>
                    <input
                      className="catalog-search"
                      type="search"
                      placeholder="Search by name, kind, or creator…"
                      value={catalogSearch}
                      onChange={(e) => { setCatalogSearch(e.target.value); setCatalogPage(1); }}
                      aria-label="Search companions"
                    />
                  </div>
                  <KindTabs active={catalogKind} onChange={(k) => { setCatalogKind(k); setCatalogSearch(""); setCatalogPage(1); }} />
                </div>

                {/* Loading skeletons */}
                {catalogLoading && (
                  <div className="companion-grid" aria-busy="true" aria-label="Loading companions">
                    {Array.from({ length: 24 }, (_, i) => <CompanionSkeleton key={i} />)}
                  </div>
                )}

                {/* Catalog grid */}
                {!catalogLoading && catalog.length > 0 && (
                  <>
                    <div className="companion-grid">
                      {catalog.map((item) => (
                        <article className={companion?.slug === item.slug ? "companion-card selected" : "companion-card"} key={item.slug}>
                          <button
                            className="sprite-preview"
                            type="button"
                            disabled={Boolean(busy)}
                            onClick={() => void chooseCompanion(item.slug)}
                            aria-pressed={companion?.slug === item.slug}
                            aria-label={`${companion?.slug === item.slug ? "Selected " : "Choose "}${item.displayName}`}
                          >
                            <CatalogCharacter companion={item} />
                          </button>
                          <span className={`kind-badge kind-badge-${item.kind}`}>{item.kind}</span>
                          <h3>{item.displayName}</h3>
                        </article>
                      ))}
                    </div>

                    {/* Pagination Bar */}
                    {totalPages > 1 && (
                      <nav style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 28 }} aria-label="Catalog pagination">
                        <button
                          className="button"
                          disabled={catalogPage <= 1 || catalogLoading}
                          onClick={() => setCatalogPage((p) => Math.max(1, p - 1))}
                        >
                          ← Previous
                        </button>
                        <span style={{ fontFamily: "monospace", fontSize: ".8rem", fontWeight: 700 }}>
                          Page {catalogPage} of {totalPages} ({catalogTotal} items)
                        </span>
                        <button
                          className="button"
                          disabled={catalogPage >= totalPages || catalogLoading}
                          onClick={() => setCatalogPage((p) => Math.min(totalPages, p + 1))}
                        >
                          Next →
                        </button>
                      </nav>
                    )}
                  </>
                )}

                {/* Empty search state */}
                {!catalogLoading && catalog.length === 0 && (
                  <p className="catalog-empty">
                    No companions match &ldquo;{catalogSearch}&rdquo;{catalogKind !== "all" ? ` in ${KIND_LABELS[catalogKind]}` : ""}.
                  </p>
                )}
              </section>
            </section>
          )}

          {/* ── Screen: Live ── */}
          {screen === "live" && companion && character && (
            <section className="workflow-screen live-screen" key="live">
              <div className="workflow-heading">
                <span className="eyebrow">Ready to add</span>
                <h1>Put it on your site.</h1>
                <p>{companion.displayName} is ready to meet people on your website.</p>
              </div>
              <LiveIntegrationSection
                installationId={session.installation.id}
                copied={copied}
                onCopy={copySnippet}
                onTestState={(st) => setPlaygroundState(st)}
              />
            </section>
          )}

          {/* Floating character preview */}
          {hasPreview && character && companion && (
            <CharacterPreview
              character={character}
              companion={companion}
              overrideState={playgroundState}
              installationId={session?.installation.id}
              brandName={session?.brandProfile?.name || session?.installation.name}
            />
          )}

        </>
      )}
    </main>
  );
}
