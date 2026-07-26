"use client";

import { useState, useEffect, useMemo, type FormEvent } from "react";
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

type Page = { url: string; title: string; markdown: string };
type Character = { displayName: string; greeting: string };
type Installation = { id: string; name: string };
type OwnedInstallation = {
  id: string;
  name: string;
  origin: string;
  knowledgeVersion: number;
  updatedAt?: string;
  character?: { displayName: string; greeting: string } | null;
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
  columns: 8;
  rows: number;
  cellWidth: 192;
  cellHeight: 208;
};
type HealthPayload = { ok: boolean; services: Record<string, { ok: boolean }> };
type Screen = "connect" | "review" | "shape" | "live";
type PreviewState = "idle" | "greeting" | "listening" | "thinking" | "responding" | "resolved" | "error";
type KindFilter = "all" | "character" | "creature" | "object";

// ─── Constants ─────────────────────────────────────────────────────────────────

const runtime = process.env.NEXT_PUBLIC_CRADLE_RUNTIME_URL || "http://localhost:3002";

const PREVIEW_STATES: Record<PreviewState, { label: string; row: number; frames: number; durationMs: number }> = {
  idle:       { label: "Idle",       row: 0, frames: 6, durationMs: 1_100 },
  greeting:   { label: "Greeting",   row: 3, frames: 4, durationMs:   700 },
  listening:  { label: "Listening",  row: 8, frames: 6, durationMs: 1_030 },
  thinking:   { label: "Thinking",   row: 7, frames: 6, durationMs:   820 },
  responding: { label: "Responding", row: 3, frames: 4, durationMs:   700 },
  resolved:   { label: "Resolved",   row: 4, frames: 5, durationMs:   840 },
  error:      { label: "Error",      row: 5, frames: 8, durationMs: 1_220 },
};

const CATALOG_CYCLE: PreviewState[] = ["idle", "greeting", "thinking", "resolved"];

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
  return "sourceUrl" in companion && companion.sourceUrl ? companion.sourceUrl : companion.spritesheetUrl;
}

// ─── Sub-components ────────────────────────────────────────────────────────────

/** Renders one real Petdex atlas cell sequence without loading a second widget runtime. */
function CompanionSprite({
  companion, state = "idle", animated = true, frame: controlledFrame, className = "",
}: {
  companion: CatalogCompanion | ImportedCompanion;
  state?: PreviewState;
  animated?: boolean;
  frame?: number;
  className?: string;
}) {
  const [frame, setFrame] = useState(0);
  const motion = PREVIEW_STATES[state];
  const columns = "columns" in companion ? companion.columns : 8;
  const rows    = "rows"    in companion ? companion.rows    : 9;

  // Timer-driven frame advancement — useEffect is correct here (it manages a setInterval side-effect).
  useEffect(() => {
    setFrame(0);
    if (!animated || controlledFrame !== undefined) return;
    const delay = Math.max(90, Math.floor(motion.durationMs / motion.frames));
    const id = window.setInterval(() => setFrame((f) => (f + 1) % motion.frames), delay);
    return () => window.clearInterval(id);
  }, [animated, controlledFrame, motion.durationMs, motion.frames, state]);

  const activeFrame = controlledFrame === undefined ? frame : controlledFrame % motion.frames;

  return (
    <span
      className={`pet-sprite ${className}`}
      role="img"
      aria-label={`${companion.displayName} in ${motion.label.toLowerCase()} state`}
      style={{
        backgroundImage: `url(${getSpriteUrl(companion)})`,
        backgroundSize: `${columns * 100}% ${rows * 100}%`,
        backgroundPosition: `${(activeFrame / Math.max(columns - 1, 1)) * 100}% ${(motion.row / Math.max(rows - 1, 1)) * 100}%`,
      }}
    />
  );
}

function CatalogCharacter({ companion, state, frame }: { companion: CatalogCompanion; state: PreviewState; frame: number }) {
  return <CompanionSprite companion={companion} state={state} frame={frame} animated={false} className="catalog-sprite" />;
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

function CharacterPreview({ character, companion }: { character: Character; companion: ImportedCompanion }) {
  const [state, setState] = useState<PreviewState>("idle");
  const [open, setOpen] = useState(false);

  function togglePreview() {
    setOpen((current) => {
      const next = !current;
      setState(next ? "greeting" : "idle");
      return next;
    });
  }

  return (
    <div className="studio-install-preview">
      {open && (
        <section className="install-preview-copy" aria-label="Installed character preview">
          <strong>{character.displayName}</strong>
          <p>{character.greeting}</p>
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
        <CompanionSprite companion={companion} state={state} className="trigger-sprite" />
      </button>
    </div>
  );
}

function InstallCode({ installationId, copied, onCopy }: { installationId: string; copied: boolean; onCopy(v: string): Promise<void> }) {
  const snippet = `<script src="${runtime}/widget.js"></script>\n<cradle-character site-id="${installationId}" api-base="${runtime}"></cradle-character>`;
  return (
    <section className="install-code">
      <div className="section-copy">
        <span className="eyebrow">Embed</span>
        <h2>Add your character to the site.</h2>
        <p>Send this to whoever manages your website. They choose where the character belongs in the page.</p>
      </div>
      <pre><code>{snippet}</code></pre>
      <button className="button primary" onClick={() => void onCopy(snippet)}>
        {copied ? "Copied to clipboard" : "Copy install snippet"}
      </button>
    </section>
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
  const [pickerDismissed, setPickerDismissed] = useState(false);
  const [includedUrls, setIncludedUrls]   = useState<Set<string>>(new Set());
  const [character, setCharacter]         = useState<Character | null>(null);
  const [companion, setCompanion]         = useState<ImportedCompanion | null>(null);

  // Catalog UI state
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogKind, setCatalogKind]     = useState<KindFilter>("all");
  const [catalogPage, setCatalogPage]     = useState(1);
  const [catalogCycleIdx, setCatalogCycleIdx] = useState(0);
  const [catalogFrame, setCatalogFrame]   = useState(0);

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

  /** Cycle animation state across catalog cards. */
  useEffect(() => {
    if (screen !== "shape" || catalog.length === 0) return;
    const id = window.setInterval(() => setCatalogCycleIdx((i) => (i + 1) % CATALOG_CYCLE.length), 2_400);
    return () => window.clearInterval(id);
  }, [catalog.length, screen]);

  /** Advance the shared catalog frame counter (~8fps). */
  useEffect(() => {
    if (screen !== "shape" || catalog.length === 0) return;
    const id = window.setInterval(() => setCatalogFrame((f) => f + 1), 120);
    return () => window.clearInterval(id);
  }, [catalog.length, screen]);

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
                <div className="site-list" style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
                  {ownedInstallations.map((inst, index) => {
                    const isLatest = index === 0;
                    const hostname = inst.origin ? new URL(inst.origin).hostname : inst.name;
                    const showHostname = hostname !== inst.name;
                    const customCharacter = inst.character?.displayName && inst.character.displayName !== inst.name ? inst.character.displayName : null;
                    const isApproved = inst.knowledgeVersion > 1;
                    const formattedDate = inst.updatedAt
                      ? new Date(inst.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                      : null;

                    return (
                      <article
                        key={inst.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 16,
                          padding: "16px 18px",
                          background: "#fff",
                          border: "3px solid #111",
                          boxShadow: isLatest ? "5px 5px 0 #e7ff36, 5px 5px 0 3px #111" : "4px 4px 0 #111",
                          position: "relative",
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
                            gap: 6,
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <strong style={{ fontSize: "1.05rem", fontWeight: 820, color: "#111", letterSpacing: "-.02em" }}>
                              {inst.name}
                            </strong>

                            {isLatest && (
                              <span style={{ background: "#e7ff36", border: "2px solid #111", padding: "2px 6px", fontFamily: "var(--mono)", fontSize: ".6rem", fontWeight: 800, textTransform: "uppercase" }}>
                                Latest
                              </span>
                            )}

                            <span style={{
                              background: isApproved ? "#dcfce7" : "#fef9c3",
                              color: isApproved ? "#15803d" : "#854d0e",
                              border: "1.5px solid #111",
                              padding: "1px 6px",
                              fontFamily: "var(--mono)",
                              fontSize: ".62rem",
                              fontWeight: 800,
                              textTransform: "uppercase",
                            }}>
                              {isApproved ? "Active" : "Draft"}
                            </span>

                            {customCharacter && (
                              <span style={{ background: "#f3f4f6", border: "1.5px solid #111", padding: "1px 6px", fontFamily: "var(--mono)", fontSize: ".65rem" }}>
                                🤖 {customCharacter}
                              </span>
                            )}
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: ".72rem", color: "#54544f", fontFamily: "var(--mono)" }}>
                            {showHostname && <span>🌐 {hostname}</span>}
                            {formattedDate && <span>Updated {formattedDate}</span>}
                          </div>
                        </button>

                        <button
                          type="button"
                          disabled={Boolean(busy)}
                          onClick={(e) => void removeInstallation(e, inst.id, inst.name)}
                          style={{
                            background: "#fee2e2",
                            color: "#991b1b",
                            border: "2px solid #111",
                            boxShadow: "2px 2px 0 #111",
                            padding: "8px 12px",
                            fontFamily: "var(--mono)",
                            fontSize: ".7rem",
                            fontWeight: 800,
                            cursor: "pointer",
                            borderRadius: 0,
                            flexShrink: 0,
                          }}
                          title={`Delete ${inst.name}`}
                          aria-label={`Delete ${inst.name}`}
                        >
                          Delete ✕
                        </button>
                      </article>
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
                <p>Give your character a name, a welcome message, and a place to appear.</p>
              </div>
              <div className="shape-layout">
                <form className="character-form" onSubmit={saveCharacter}>
                  <label>Name<input value={character.displayName} maxLength={48} onChange={(e) => setCharacter({ ...character, displayName: e.target.value })} /></label>
                  <label>Welcome message<textarea value={character.greeting} maxLength={320} onChange={(e) => setCharacter({ ...character, greeting: e.target.value })} /></label>
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
                            <CatalogCharacter companion={item} state={CATALOG_CYCLE[catalogCycleIdx] ?? "idle"} frame={catalogFrame} />
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
              <div className="live-grid">
                <InstallCode installationId={session.installation.id} copied={copied} onCopy={copySnippet} />
              </div>
              <aside className="runtime-note">
                <span className="eyebrow">Want it to remember people?</span>
                <h3>Meet Qualra.</h3>
                <p>Qualra helps teams build ongoing customer relationships, so every conversation can pick up where the last one left off.</p>
              </aside>
              <p className="qualra-link"><a href="https://www.qualra.xyz" target="_blank" rel="noreferrer">Explore Qualra</a></p>
            </section>
          )}

          {/* Floating character preview */}
          {hasPreview && character && companion && (
            <CharacterPreview character={character} companion={companion} />
          )}
        </>
      )}
    </main>
  );
}
