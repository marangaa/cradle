"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { AccountGate } from "./components/account-gate";

type Page = { url: string; title: string; markdown: string };
type Character = {
  displayName: string;
  greeting: string;
};
type Installation = { id: string; name: string; managementKey: string };
type Knowledge = { pages: Page[]; sourceUrl: string; version: number };
type BrandProfile = { name: string; colors: Array<{ hex: string; usage?: string }>; logos: Array<{ url: string; alt?: string }>; backdrops: Array<{ url: string; description?: string }>; source: "openbrand" | "manual" };
type StudioSession = { installation: Installation; knowledge: Knowledge; character: Character; brandProfile: BrandProfile | null };
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
type Screen = "connect" | "review" | "shape" | "live";
type PreviewState = "idle" | "greeting" | "listening" | "thinking" | "responding" | "resolved" | "error";

const runtime = process.env.NEXT_PUBLIC_CRADLE_RUNTIME_URL ?? "http://localhost:3002";
const sessionKey = "cradle:studio:operator-session";

const previewStates: Record<PreviewState, { label: string; row: number; frames: number; durationMs: number }> = {
  idle: { label: "Idle", row: 0, frames: 6, durationMs: 1_100 },
  greeting: { label: "Greeting", row: 3, frames: 4, durationMs: 700 },
  listening: { label: "Listening", row: 8, frames: 6, durationMs: 1_030 },
  thinking: { label: "Thinking", row: 7, frames: 6, durationMs: 820 },
  responding: { label: "Responding", row: 3, frames: 4, durationMs: 700 },
  resolved: { label: "Resolved", row: 4, frames: 5, durationMs: 840 },
  error: { label: "Error", row: 5, frames: 8, durationMs: 1_220 },
};
const catalogStates: PreviewState[] = ["idle", "greeting", "thinking", "resolved"];

function makeCharacter(name: string): Character {
  return {
    displayName: name,
    greeting: "Welcome to " + name + ". What can I help you find?",
  };
}

function getSpriteUrl(companion: CatalogCompanion | ImportedCompanion) {
  return "sourceUrl" in companion && companion.sourceUrl ? companion.sourceUrl : companion.spritesheetUrl;
}

/** Renders one real Petdex atlas cell sequence without loading a second widget runtime. */
function CompanionSprite({
  companion,
  state = "idle",
  animated = true,
  frame: controlledFrame,
  className = "",
}: {
  companion: CatalogCompanion | ImportedCompanion;
  state?: PreviewState;
  animated?: boolean;
  frame?: number;
  className?: string;
}) {
  const [frame, setFrame] = useState(0);
  const motion = previewStates[state];
  const columns = "columns" in companion ? companion.columns : 8;
  const rows = "rows" in companion ? companion.rows : 9;

  useEffect(() => {
    setFrame(0);
    if (!animated || controlledFrame !== undefined) return;
    const delay = Math.max(90, Math.floor(motion.durationMs / motion.frames));
    const timer = window.setInterval(() => setFrame((current) => (current + 1) % motion.frames), delay);
    return () => window.clearInterval(timer);
  }, [animated, controlledFrame, motion.durationMs, motion.frames, state]);

  const activeFrame = controlledFrame === undefined ? frame : controlledFrame % motion.frames;

  return <span
    className={"pet-sprite " + className}
    role="img"
    aria-label={companion.displayName + " in " + motion.label.toLowerCase() + " state"}
    style={{
      backgroundImage: "url(" + getSpriteUrl(companion) + ")",
      backgroundSize: columns * 100 + "% " + rows * 100 + "%",
      backgroundPosition: (activeFrame / Math.max(columns - 1, 1)) * 100 + "% " + (motion.row / Math.max(rows - 1, 1)) * 100 + "%",
    }}
  />;
}

/** Renders a catalog character using Studio's shared animation state. */
function CatalogCharacter({ companion, state, frame }: { companion: CatalogCompanion; state: PreviewState; frame: number }) {
  return <CompanionSprite companion={companion} state={state} frame={frame} animated={false} className="catalog-sprite" />;
}

/** Displays the exact companion atlas and lifecycle states that the installed element receives. */
function CharacterPreview({
  character,
  companion,
}: {
  character: Character;
  companion: ImportedCompanion;
}) {
  const [state, setState] = useState<PreviewState>("idle");
  const [open, setOpen] = useState(false);

  function togglePreview() {
    setOpen((current) => {
      const next = !current;
      setState(next ? "greeting" : "idle");
      return next;
    });
  }

  return <div className="studio-install-preview">
    {open && <section className="install-preview-copy" aria-label="Installed character preview">
      <strong>{character.displayName}</strong>
      <p>{character.greeting}</p>
    </section>}
    <button className="install-preview-trigger" type="button" onClick={togglePreview} aria-label={open ? "Close installed character preview" : "Open installed character preview"} aria-expanded={open}>
      <CompanionSprite companion={companion} state={state} className="trigger-sprite" />
    </button>
  </div>;
}

function InstallCode({
  installationId,
  copied,
  onCopy,
}: {
  installationId: string;
  copied: boolean;
  onCopy(value: string): Promise<void>;
}) {
  const snippet = '<script src="' + runtime + '/widget.js"></script>\n<cradle-character site-id="' + installationId + '" api-base="' + runtime + '"></cradle-character>';

  return <section className="install-code">
    <div className="section-copy">
      <span className="eyebrow">Embed</span>
      <h2>Add your character to the site.</h2>
      <p>Send this to whoever manages your website. They choose where the character belongs in the page.</p>
    </div>
    <pre><code>{snippet}</code></pre>
    <button className="button primary" onClick={() => void onCopy(snippet)}>
      {copied ? "Copied to clipboard" : "Copy install snippet"}
    </button>
  </section>;
}

export default function StudioHome() {
  const [screen, setScreen] = useState<Screen>("connect");
  const [siteUrl, setSiteUrl] = useState("");
  const [session, setSession] = useState<StudioSession | null>(null);
  const [includedUrls, setIncludedUrls] = useState<Set<string>>(new Set());
  const [character, setCharacter] = useState<Character | null>(null);
  const [catalog, setCatalog] = useState<CatalogCompanion[]>([]);
  const [catalogPage, setCatalogPage] = useState(1);
  const [catalogHasMore, setCatalogHasMore] = useState(false);
  const [catalogStateIndex, setCatalogStateIndex] = useState(0);
  const [catalogFrame, setCatalogFrame] = useState(0);
  const [companion, setCompanion] = useState<ImportedCompanion | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);

  const reviewed = (session?.knowledge.version ?? 0) > 1;
  const operatorHeaders = useMemo<Record<string, string>>(
    () => session ? { "x-cradle-installation-key": session.installation.managementKey } : ({} as Record<string, string>),
    [session],
  );

  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(sessionKey);
      if (!stored) return;
      const restored = JSON.parse(stored) as StudioSession;
      setSession(restored);
      setCharacter(restored.character);
      setIncludedUrls(new Set(restored.knowledge.pages.map((page) => page.url)));
      setScreen(restored.knowledge.version > 1 ? "shape" : "review");
    } catch {
      window.sessionStorage.removeItem(sessionKey);
    }
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(""), 4_000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    if (!session || !reviewed) return;
    let cancelled = false;
    void fetch(runtime + "/api/companions/petdex?page=1&limit=48")
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Could not load the companion catalog.");
        if (!cancelled) { setCatalog(payload.companions); setCatalogPage(payload.page); setCatalogHasMore(payload.hasMore); }
      })
      .catch((cause: unknown) => {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "Could not load the companion catalog.");
      });
    return () => { cancelled = true; };
  }, [reviewed, session]);

  useEffect(() => {
    if (screen !== "shape" || catalog.length === 0) return;
    const timer = window.setInterval(() => setCatalogStateIndex((current) => (current + 1) % catalogStates.length), 2_400);
    return () => window.clearInterval(timer);
  }, [catalog.length, screen]);

  useEffect(() => {
    if (screen !== "shape" || catalog.length === 0) return;
    const timer = window.setInterval(() => setCatalogFrame((current) => current + 1), 120);
    return () => window.clearInterval(timer);
  }, [catalog.length, screen]);

  function persist(next: StudioSession) {
    setSession(next);
    setCharacter(next.character);
    window.sessionStorage.setItem(sessionKey, JSON.stringify(next));
  }

  function begin(label: string) {
    setBusy(label);
    setError("");
    setNotice("");
  }

  function finish(message?: string) {
    setBusy(null);
    if (message) setNotice(message);
  }

  async function connect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    begin("Reading your public site…");
    try {
      const response = await fetch(runtime + "/api/onboarding", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: siteUrl }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Cradle could not prepare this site.");
      const next: StudioSession = {
        installation: payload.installation,
        knowledge: payload.knowledge,
        character: makeCharacter(payload.installation.name),
        brandProfile: payload.brandProfile ?? null,
      };
      persist(next);
      setIncludedUrls(new Set(payload.knowledge.pages.map((page: Page) => page.url)));
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
      const response = await fetch(runtime + "/api/installations/" + session.installation.id + "/knowledge", {
        method: "PATCH",
        headers: { "content-type": "application/json", ...operatorHeaders },
        body: JSON.stringify({ includedUrls: [...includedUrls] }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Cradle could not save this source bundle.");
      persist({ ...session, knowledge: payload.knowledge });
      setCompanion(null);
      setScreen("shape");
      finish("Approved knowledge is now the runtime’s source of truth.");
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
      const response = await fetch(runtime + "/api/installations/" + session.installation.id, {
        method: "PATCH",
        headers: { "content-type": "application/json", ...operatorHeaders },
        body: JSON.stringify({ character }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Cradle could not save this character.");
      persist({
        ...session,
        installation: { ...session.installation, name: payload.installation.name },
        character: payload.character,
      });
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
      const response = await fetch(runtime + "/api/installations/" + session.installation.id + "/companion", {
        method: "PUT",
        headers: { "content-type": "application/json", ...operatorHeaders },
        body: JSON.stringify({ provider: "petdex", slug }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Cradle could not import this companion.");
      setCompanion(payload.companion);
      finish(payload.companion.displayName + " is now pinned to this project.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Cradle could not import this companion.");
      finish();
    }
  }

  async function loadMoreCharacters() {
    if (busy || !catalogHasMore) return;
    begin("Loading more characters…");
    try {
      const response = await fetch(runtime + "/api/companions/petdex?page=" + (catalogPage + 1) + "&limit=48");
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Could not load more characters.");
      setCatalog((current) => [...current, ...payload.companions]);
      setCatalogPage(payload.page);
      setCatalogHasMore(payload.hasMore);
      finish();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load more characters.");
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
    window.sessionStorage.removeItem(sessionKey);
    setSession(null);
    setCharacter(null);
    setCompanion(null);
    setIncludedUrls(new Set());
    setCatalog([]);
    setScreen("connect");
    setSiteUrl("");
    setNotice("");
    setError("");
  }

  const canShape = Boolean(session && reviewed);
  const canGoLive = Boolean(session && reviewed && companion);

  return <main className="studio-shell">
    <header className="studio-topbar">
      <Link className="brand" href="/"><span aria-hidden="true">C</span> Cradle</Link>
      {session && <button className="quiet-button" onClick={reset}>New project</button>}
    </header>

    {!session ? <AccountGate><section className="connect-screen">
      <div className="connect-copy">
        <span className="eyebrow">Give your site a body</span>
        <h1>Make your website feel <em>alive.</em></h1>
        <p>Cradle helps you create a character for your website—one people can see, recognise, and return to.</p>
        <div className="principles"><span>01. Map the site</span><span>02. Pick a body</span><span>03. Wire the behaviour</span></div>
      </div>
      <div className="connect-card">
        <span className="eyebrow">Start here / 01</span>
        <h2>Bring your site in.</h2>
        <p>We map its public pages. You decide what the character should know about your company.</p>
        <form onSubmit={connect}>
          <label htmlFor="site-url">Website URL</label>
          <div className="url-row">
            <input id="site-url" type="url" required value={siteUrl} onChange={(event) => setSiteUrl(event.target.value)} placeholder="https://yourcompany.com" />
            <button className="button primary" disabled={Boolean(busy)}>{busy ?? "Map site"}</button>
          </div>
        </form>
      </div>
    </section></AccountGate> : <>
      <section className="project-bar">
        <div><span className="eyebrow">Project</span><strong>{session.installation.name}</strong></div>
        <nav aria-label="Studio steps">
          <button className={screen === "review" ? "active" : ""} onClick={() => setScreen("review")}>01 <span>Map</span></button>
          <button className={screen === "shape" ? "active" : ""} disabled={!canShape} onClick={() => setScreen("shape")}>02 <span>Body</span></button>
          <button className={screen === "live" ? "active" : ""} disabled={!canGoLive} onClick={() => setScreen("live")}>03 <span>Wire up</span></button>
        </nav>
      </section>

      {screen === "review" && <section className="workflow-screen review-screen">
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
            {session.brandProfile && <div className="brand-profile" aria-label="Detected brand reference">
              <span>Brand reference</span>
              <strong>{session.brandProfile.name}</strong>
              <div>{session.brandProfile.colors.slice(0, 5).map((color) => <i key={color.hex} style={{ background: color.hex }} title={color.hex} />)}</div>
              <small>{session.brandProfile.logos.length} logo{session.brandProfile.logos.length === 1 ? "" : "s"} · {session.brandProfile.backdrops.length} image{session.brandProfile.backdrops.length === 1 ? "" : "s"}</small>
            </div>}
            <button className="button primary" disabled={Boolean(busy) || includedUrls.size === 0} onClick={() => void saveKnowledge()}>{busy ?? "Lock the source"}</button>
          </aside>
          <div className="page-grid">
            {session.knowledge.pages.map((page) => <label className="page-card" key={page.url}>
              <input type="checkbox" checked={includedUrls.has(page.url)} onChange={() => togglePage(page.url)} />
              <span className="checkbox" />
              <span className="page-path">{new URL(page.url).pathname || "/"}</span>
              <strong>{page.title || "Untitled page"}</strong>
              <small>{page.markdown.slice(0, 180)}{page.markdown.length > 180 ? "…" : ""}</small>
            </label>)}
          </div>
        </div>
      </section>}

      {screen === "shape" && character && <section className="workflow-screen shape-screen">
        <div className="workflow-heading">
          <span className="eyebrow">Make it yours</span>
          <h1>Set it up for your site.</h1>
          <p>Give your character a name, a welcome message, and a place to appear.</p>
        </div>
        <div className="shape-layout">
          <form className="character-form" onSubmit={saveCharacter}>
            <label>Name<input value={character.displayName} maxLength={48} onChange={(event) => setCharacter({ ...character, displayName: event.target.value })} /></label>
            <label>Welcome message<textarea value={character.greeting} maxLength={320} onChange={(event) => setCharacter({ ...character, greeting: event.target.value })} /></label>
            <button className="button primary" disabled={Boolean(busy)}>{busy ?? "Save changes"}</button>
          </form>
        </div>
        <section className="companion-section">
          <div className="section-copy">
            <span className="eyebrow">Characters</span>
            <h2>Choose a character.</h2>
            <p>Pick the one that feels right for your company.</p>
          </div>
          {catalog.length === 0 ? <p className="loading-copy">Loading characters…</p> : <><div className="companion-grid">
            {catalog.map((item) => <article className={companion?.slug === item.slug ? "companion-card selected" : "companion-card"} key={item.slug}>
              <button className="sprite-preview" type="button" disabled={Boolean(busy)} onClick={() => void chooseCompanion(item.slug)} aria-pressed={companion?.slug === item.slug} aria-label={(companion?.slug === item.slug ? "Selected " : "Choose ") + item.displayName}>
                <CatalogCharacter companion={item} state={catalogStates[catalogStateIndex] ?? "idle"} frame={catalogFrame} />
              </button>
              <span>{item.kind}</span>
              <h3>{item.displayName}</h3>
            </article>)}
          </div>{catalogHasMore && <button className="button secondary load-more-characters" disabled={Boolean(busy)} onClick={() => void loadMoreCharacters()}>{busy ?? "Load more characters"}</button>}</>}
        </section>
      </section>}

      {screen === "live" && session && companion && character && <section className="workflow-screen live-screen">
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
      </section>}
    </>}

    {character && companion && (screen === "shape" || screen === "live") && <CharacterPreview character={character} companion={companion} />}
    {(busy || notice) && <p className="status" role="status">{busy ?? notice}</p>}
    {error && <p className="error" role="alert">{error}</p>}
  </main>;
}
