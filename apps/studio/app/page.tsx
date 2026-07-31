"use client";

import { useState, useEffect, useRef, useMemo, type FormEvent } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteOwnedInstallation,
  getInstallationForStudio,
  getPetdexCatalog,
  getRuntimeHealth,
  listOwnedInstallations,
  onboardSite,
  saveInstallationCharacter,
  saveInstallationKnowledge,
  selectInstallationCompanion,
} from "./actions";
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

type Character = { displayName: string; greeting?: string; theme?: "neobrutalist" | "modern" | "cyberpunk" | "terminal" | "minimal" };
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

const runtime = process.env.NEXT_PUBLIC_CRADLE_RUNTIME_URL || "http://localhost:3002";

const KIND_LABELS: Record<KindFilter, string> = {
  all: "All", character: "Characters", creature: "Creatures", object: "Objects",
};

// ─── Fetchers (pure async functions — no hooks) ────────────────────────────────

async function fetchHealth(): Promise<HealthPayload> {
  return getRuntimeHealth();
}

async function fetchOwnedInstallations(): Promise<OwnedInstallation[]> {
  return (await listOwnedInstallations()).installations;
}

type CatalogResponse = {
  companions: CatalogCompanion[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
};

async function fetchCatalog(page: number, kind: KindFilter, query: string): Promise<CatalogResponse> {
  const payload = await getPetdexCatalog({ page, limit: 24, query, kind });
  return {
    companions: payload.companions as CatalogCompanion[],
    page: payload.page,
    limit: payload.limit,
    total: payload.total,
    hasMore: payload.hasMore,
  };
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

function CharacterPreview({ character, companion, overrideState }: { character: Character; companion: ImportedCompanion; overrideState?: PetdexState }) {
  const [state, setState] = useState<PreviewState>("idle");
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    { role: "assistant", content: "Hi there! 👋 Ask me anything about our business." },
  ]);
  const [input, setInput] = useState("");

  const activeState = overrideState ?? state;
  const theme = (character as any).theme || "neobrutalist";

  function togglePreview() {
    setOpen((current) => {
      const next = !current;
      setState(next ? "waving" : "idle");
      return next;
    });
  }

  function sendMessage(e: FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input.trim();
    setInput("");
    setMessages((prev) => [
      ...prev,
      { role: "user", content: text },
      { role: "assistant", content: `I'm ${character.displayName || "your AI companion"}, ready to answer questions about your site!` },
    ]);
  }

  const isNeobrutalist = theme === "neobrutalist";
  const isModern = theme === "modern" || theme === "glass";
  const isCyberpunk = theme === "cyberpunk";
  const isTerminal = theme === "terminal";

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
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 220, overflowY: "auto", padding: 4 }}>
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
                      ? (isCyberpunk ? "#a855f7" : isTerminal ? "#15803d" : "#09090b")
                      : (isCyberpunk ? "#0f172a" : isTerminal ? "#09090b" : isModern ? "rgba(255,255,255,0.92)" : "#ffffff"),
                    color: isUser
                      ? (isCyberpunk ? "#0f172a" : "#ffffff")
                      : (isCyberpunk ? "#38bdf8" : isTerminal ? "#22c55e" : "#09090b"),
                    border: isNeobrutalist
                      ? "2px solid #09090b"
                      : isCyberpunk
                      ? (isUser ? "2px solid #06b6d4" : "2px solid #a855f7")
                      : isTerminal
                      ? "1px solid #22c55e"
                      : isModern
                      ? "1px solid rgba(255,255,255,0.6)"
                      : "1px solid #e4e4e7",
                    boxShadow: isNeobrutalist
                      ? "3px 3px 0px #09090b"
                      : isCyberpunk
                      ? "0 0 12px rgba(168,85,247,0.5)"
                      : isTerminal
                      ? "0 0 8px rgba(34,197,94,0.3)"
                      : isModern
                      ? "0 8px 24px rgba(0,0,0,0.08)"
                      : "0 2px 8px rgba(0,0,0,0.04)",
                    backdropFilter: isModern ? "blur(16px)" : "none",
                    fontFamily: isTerminal ? "monospace" : "inherit",
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
              borderRadius: isTerminal ? 4 : 9999,
              background: isCyberpunk ? "#0f172a" : isTerminal ? "#09090b" : isModern ? "rgba(255,255,255,0.92)" : "#ffffff",
              border: isNeobrutalist
                ? "2.5px solid #09090b"
                : isCyberpunk
                ? "2px solid #a855f7"
                : isTerminal
                ? "1.5px solid #22c55e"
                : isModern
                ? "1px solid rgba(0,0,0,0.1)"
                : "1px solid #e4e4e7",
              boxShadow: isNeobrutalist
                ? "3.5px 3.5px 0px #09090b"
                : isCyberpunk
                ? "0 0 16px rgba(168,85,247,0.6)"
                : isTerminal
                ? "0 0 10px rgba(34,197,94,0.3)"
                : isModern
                ? "0 10px 28px rgba(0,0,0,0.1)"
                : "0 2px 10px rgba(0,0,0,0.05)",
              backdropFilter: isModern ? "blur(16px)" : "none",
            }}
          >
            <input
              type="text"
              placeholder="Ask something…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{
                flex: 1,
                border: 0,
                outline: "none",
                background: "transparent",
                fontSize: ".84rem",
                color: isCyberpunk ? "#38bdf8" : isTerminal ? "#22c55e" : "#09090b",
                fontFamily: isTerminal ? "monospace" : "inherit",
              }}
            />
            <button
              type="submit"
              style={{
                border: 0,
                background: isNeobrutalist ? "#09090b" : isCyberpunk ? "#a855f7" : isTerminal ? "#22c55e" : "transparent",
                color: isNeobrutalist ? "#ffffff" : isCyberpunk ? "#0f172a" : isTerminal ? "#09090b" : "#09090b",
                borderRadius: isTerminal ? 2 : (isNeobrutalist || isCyberpunk ? 9999 : 0),
                padding: isNeobrutalist || isCyberpunk ? "6px 16px" : "6px 10px",
                fontWeight: 800,
                fontSize: ".8rem",
                cursor: "pointer",
                fontFamily: isTerminal ? "monospace" : "inherit",
              }}
            >
              Send
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
  const [tab, setTab] = useState<"script" | "npm" | "types">("script");
  const runtime = process.env.NEXT_PUBLIC_CRADLE_RUNTIME_URL || process.env.NEXT_PUBLIC_RUNTIME_URL || "http://localhost:3002";

  const scriptSnippet = `<script src="${runtime}/widget.js" data-site-id="${installationId}"></script>`;

  const npmSnippet = `# 1. Install package\npnpm add @maranga/cradle\n\n# 2. Import & render in React / Next.js\n# (no <script src> tag here, so the API origin can't be auto-detected — pass it explicitly)\nimport "@maranga/cradle";\n\n<cradle-character\n  site-id="${installationId}"\n  api-base="${runtime}"\n/>`;

  const typesSnippet = `// React 19 / Next.js 15+ Custom Element TypeScript Declaration\n// Add to layout.tsx or global.d.ts if TypeScript flags <cradle-character>:\n\ndeclare module "react" {\n  namespace JSX {\n    interface IntrinsicElements {\n      "cradle-character": React.DetailedHTMLProps<\n        React.HTMLAttributes<HTMLElement> & {\n          "site-id"?: string;\n          "api-base"?: string;\n          placement?: "floating" | "inline";\n        },\n        HTMLElement\n      >;\n    }\n  }\n}`;

  const activeSnippet = tab === "script" ? scriptSnippet : tab === "npm" ? npmSnippet : typesSnippet;

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
        <button
          type="button"
          className={`button${tab === "types" ? " primary" : ""}`}
          onClick={() => setTab("types")}
          style={{ fontSize: ".75rem", padding: "6px 12px" }}
        >
          React 19 / TS Declaration
        </button>
      </div>

      <pre><code>{activeSnippet}</code></pre>
      <button className="button primary" style={{ marginTop: 14 }} onClick={() => void onCopy(activeSnippet)}>
        {copied ? "Copied to clipboard" : `Copy ${tab === "script" ? "script tag" : tab === "npm" ? "NPM snippet" : "TS declaration"}`}
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
      await deleteOwnedInstallation(id);
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
      const payload = await getInstallationForStudio(installationId) as {
        knowledge: { installation: Installation; knowledge: Knowledge; character: Character; brandProfile: BrandProfile | null };
        companion: { companion: ImportedCompanion | null };
      };
      const kp = payload.knowledge;
      const cp = payload.companion;
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
      const payload = await onboardSite(siteUrl) as { installation: Installation; knowledge: Knowledge; brandProfile: BrandProfile | null };
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
      const payload = await saveInstallationKnowledge(session.installation.id, [...includedUrls]) as { knowledge: Knowledge };
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
      const payload = await saveInstallationCharacter(session.installation.id, character) as { installation: Installation; character: Character };
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
      const payload = await selectInstallationCompanion(session.installation.id, slug) as { companion: ImportedCompanion };
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
                <span className="eyebrow">Give your site a body</span>
                <h1>Make your website feel <em>alive.</em></h1>
                <p>Cradle helps you create a character for your website—one people can see, recognise, and return to.</p>
                <div className="principles">
                  <span>01. Map the site</span><span>02. Pick a body</span><span>03. Wire the behaviour</span>
                </div>
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
                <form className="character-form" onSubmit={saveCharacter}>
                  <label>
                    Character Name
                    <input
                      value={character.displayName}
                      maxLength={48}
                      onChange={(e) => setCharacter({ ...character, displayName: e.target.value })}
                    />
                  </label>

                  <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <strong>Widget Theme</strong>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginTop: 4 }}>
                      {[
                        { id: "neobrutalist", label: "⬛ Neobrutalist", desc: "Bold solid 2.5px borders & 4px hard shadow", accent: "#ffffff" },
                        { id: "modern", label: "💎 Modern / Glass", desc: "Translucent frosted blur & smooth pill cards", accent: "rgba(255,255,255,0.9)" },
                        { id: "cyberpunk", label: "🌌 Cyberpunk", desc: "Glowing neon purple/cyan dark synthwave theme", accent: "#0f172a", color: "#38bdf8" },
                        { id: "terminal", label: "📟 Retro Terminal", desc: "Monospaced green CRT matrix terminal theme", accent: "#09090b", color: "#22c55e" },
                        { id: "minimal", label: "▫️ Swiss Minimal", desc: "Ultra-clean 1px border & refined micro-shadow", accent: "#ffffff" },
                      ].map((t) => {
                        const isSelected = ((character as any).theme || "neobrutalist") === t.id;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setCharacter({ ...character, theme: t.id as any })}
                            style={{
                              padding: "14px 16px",
                              textAlign: "left",
                              border: isSelected ? "2.5px solid #09090b" : "1.5px solid #e4e4e7",
                              background: isSelected ? "#e7ff36" : t.accent,
                              color: isSelected ? "#09090b" : (t.color || "#09090b"),
                              borderRadius: 14,
                              cursor: "pointer",
                              boxShadow: isSelected ? "4px 4px 0px #09090b" : "0 2px 8px rgba(0,0,0,0.04)",
                              transform: isSelected ? "translateY(-2px)" : "none",
                              transition: "all 0.15s ease",
                            }}
                          >
                            <strong style={{ display: "block", fontSize: ".9rem", fontWeight: 800, marginBottom: 4 }}>{t.label}</strong>
                            <span style={{ fontSize: ".72rem", opacity: 0.85, lineHeight: 1.35, display: "block" }}>{t.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </label>

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
            <CharacterPreview character={character} companion={companion} overrideState={playgroundState} />
          )}

        </>
      )}
    </main>
  );
}
