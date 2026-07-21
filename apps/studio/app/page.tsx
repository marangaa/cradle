"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

type Page = { url: string; title: string; markdown: string };
type Presence = {
  displayName: string;
  greeting: string;
  tone: string;
  surface: "floating" | "inline";
  suggestions: string[];
};
type Installation = { id: string; name: string; managementKey: string };
type Knowledge = { pages: Page[]; sourceUrl: string; version: number };
type StudioSession = { installation: Installation; knowledge: Knowledge; presence: Presence };
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

function makePresence(name: string): Presence {
  return {
    displayName: name,
    greeting: "Hi — I can help you explore " + name + ". What would you like to know?",
    tone: "Clear, warm, and grounded in the reviewed website.",
    surface: "floating",
    suggestions: ["What do you do?", "Who is this for?", "Where should I start?"],
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
  className = "",
}: {
  companion: CatalogCompanion | ImportedCompanion;
  state?: PreviewState;
  animated?: boolean;
  className?: string;
}) {
  const [frame, setFrame] = useState(0);
  const motion = previewStates[state];
  const columns = "columns" in companion ? companion.columns : 8;
  const rows = "rows" in companion ? companion.rows : 9;

  useEffect(() => {
    setFrame(0);
    if (!animated) return;
    const delay = Math.max(90, Math.floor(motion.durationMs / motion.frames));
    const timer = window.setInterval(() => setFrame((current) => (current + 1) % motion.frames), delay);
    return () => window.clearInterval(timer);
  }, [animated, motion.durationMs, motion.frames, state]);

  return <span
    className={"pet-sprite " + className}
    role="img"
    aria-label={companion.displayName + " in " + motion.label.toLowerCase() + " state"}
    style={{
      backgroundImage: "url(" + getSpriteUrl(companion) + ")",
      backgroundSize: columns * 100 + "% " + rows * 100 + "%",
      backgroundPosition: (frame / Math.max(columns - 1, 1)) * 100 + "% " + (motion.row / Math.max(rows - 1, 1)) * 100 + "%",
    }}
  />;
}

/** Displays the exact companion atlas and lifecycle states that the installed element receives. */
function PresencePreview({
  presence,
  companion,
}: {
  presence: Presence;
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

  return <div className="studio-install-preview" data-surface={presence.surface}>
    {open && <section className="install-preview-copy" aria-label="Installed presence preview">
      <strong>{presence.displayName}</strong>
      <p>{presence.greeting}</p>
      <div className="install-preview-actions">
        {presence.suggestions.map((action) => <button key={action} type="button" onClick={() => setState("listening")}>{action}</button>)}
      </div>
    </section>}
    <button className="install-preview-trigger" type="button" onClick={togglePreview} aria-label={open ? "Close installed presence preview" : "Open installed presence preview"} aria-expanded={open}>
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
  const snippet = '<script src="' + runtime + '/widget.js"></script>\n<cradle-presence site-id="' + installationId + '" api-base="' + runtime + '"></cradle-presence>';

  return <section className="install-code">
    <div className="section-copy">
      <span className="eyebrow">Embed</span>
      <h2>Add the presence to your site.</h2>
      <p>Paste this before <code>&lt;/body&gt;</code>. The element is the body; your site owns the brain.</p>
    </div>
    <pre><code>{snippet}</code></pre>
    <button className="button primary" onClick={() => void onCopy(snippet)}>
      {copied ? "Copied to clipboard" : "Copy install snippet"}
    </button>
  </section>;
}

/* React Flow workspace experiment retained temporarily for reference.
function ComposerNode({ data }: NodeProps<Node<ComposerNodeData, "composer">>) {
  return <article className="composer-node">
    <Handle type="target" position={Position.Left} />
    <button type="button" onClick={data.onOpen}>
      <span className="composer-node-eyebrow">{data.eyebrow}</span>
      {data.visual && <span className="composer-node-visual">{data.visual}</span>}
      <strong>{data.title}</strong>
      <small>{data.detail}</small>
      <span className="composer-node-status">{data.status}</span>
    </button>
    <Handle type="source" position={Position.Right} />
  </article>;
}

const composerNodeTypes = { composer: ComposerNode };

 * Keeps Cradle's configuration beside the thing the operator is creating.
function PresenceComposer({
  session,
  presence,
  companion,
  catalog,
  includedUrls,
  screen,
  busy,
  copied,
  onScreenChange,
  onPresenceChange,
  onTogglePage,
  onSaveKnowledge,
  onSavePresence,
  onChooseCompanion,
  onCopy,
  onReset,
}: {
  session: StudioSession;
  presence: Presence;
  companion: ImportedCompanion | null;
  catalog: CatalogCompanion[];
  includedUrls: Set<string>;
  screen: Screen;
  busy: string | null;
  copied: boolean;
  onScreenChange: (screen: Screen) => void;
  onPresenceChange: (presence: Presence) => void;
  onTogglePage: (url: string) => void;
  onSaveKnowledge: () => Promise<void>;
  onSavePresence: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onChooseCompanion: (slug: string) => Promise<void>;
  onCopy: (value: string) => Promise<void>;
  onReset: () => void;
}) {
  const reviewed = session.knowledge.version > 1;
  const nodes = useMemo<Node<ComposerNodeData, "composer">[]>(() => [
    {
      id: "site",
      type: "composer",
      position: { x: 18, y: 170 },
      data: {
        eyebrow: "Your website",
        title: new URL(session.knowledge.sourceUrl).hostname,
        detail: reviewed ? "Source locked for this project" : session.knowledge.pages.length + " pages waiting for review",
        status: reviewed ? "Ready" : "Review pages",
        onOpen: () => onScreenChange("review"),
      },
    },
    {
      id: "companion",
      type: "composer",
      position: { x: 335, y: 55 },
      data: {
        eyebrow: "The character",
        title: companion?.displayName ?? "Choose a character",
        detail: companion ? "Pinned to this project" : "Pick one from the local library",
        status: companion ? "Attached" : "Needs a choice",
        visual: companion ? <CompanionSprite companion={companion} state="greeting" className="composer-sprite" /> : <span className="composer-seed">?</span>,
        onOpen: () => onScreenChange("shape"),
      },
    },
    {
      id: "surface",
      type: "composer",
      position: { x: 650, y: 170 },
      data: {
        eyebrow: "Your product",
        title: "Where it shows up",
        detail: presence.surface === "floating" ? "Floating in the corner" : "Placed inside the page",
        status: companion ? "Preview ready" : "Waiting for a character",
        onOpen: () => onScreenChange("shape"),
      },
    },
    {
      id: "events",
      type: "composer",
      position: { x: 340, y: 400 },
      data: {
        eyebrow: "Your code",
        title: "Interaction hooks",
        detail: "Open, action, state, and context events",
        status: "Programmable",
        onOpen: () => onScreenChange("live"),
      },
    },
  ], [companion, onScreenChange, presence.surface, reviewed, session.knowledge.pages.length, session.knowledge.sourceUrl]);

  const edges = useMemo<Edge[]>(() => [
    { id: "site-companion", source: "site", target: "companion", animated: reviewed, style: { strokeWidth: 2 } },
    { id: "companion-surface", source: "companion", target: "surface", animated: Boolean(companion), style: { strokeWidth: 2 } },
    { id: "companion-events", source: "companion", target: "events", animated: Boolean(companion), style: { strokeWidth: 2 } },
  ], [companion, reviewed]);
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(nodes);

  useEffect(() => {
    setFlowNodes(nodes);
  }, [nodes, setFlowNodes]);

  return <main className="composer-shell">
    <header className="composer-topbar">
      <a className="brand" href="/"><span aria-hidden="true">C</span> Cradle</a>
      <p>{session.installation.name}</p>
      <span className="composer-topbar-state">{reviewed && companion ? "Ready to install" : "In progress"}</span>
      <button className="quiet-button" onClick={onReset}>Start over</button>
    </header>

    <section className="composer-stage" aria-label="Cradle project workspace">
      <div className="composer-title">
        <span>CRADLE / {reviewed ? "ASSEMBLING" : "GETTING STARTED"}</span>
        <h1>{companion ? companion.displayName + " is taking shape." : "Start with the site. Then make it yours."}</h1>
      </div>
      <ReactFlow nodes={flowNodes} edges={edges} onNodesChange={onNodesChange} nodeTypes={composerNodeTypes} fitView fitViewOptions={{ padding: .22 }} minZoom={.7} maxZoom={1.25} nodesDraggable nodesConnectable={false} elementsSelectable={false} proOptions={{ hideAttribution: true }}>
        <Background gap={26} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>
      {companion && <PresencePreview presence={presence} companion={companion} />}
    </section>

    <AnimatePresence mode="wait">
      <motion.aside className="composer-inspector" key={screen} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: .22, ease: "easeOut" }}>
        {screen === "review" && <>
          <div className="inspector-intro"><span>Website source</span><h2>Choose what goes in.</h2><p>This is the public material Cradle carries into the project. Nothing is included until you lock it.</p></div>
          <div className="source-list">
            {session.knowledge.pages.map((page) => <label key={page.url} className="source-row">
              <input type="checkbox" checked={includedUrls.has(page.url)} onChange={() => onTogglePage(page.url)} />
              <span>{new URL(page.url).pathname || "/"}</span>
              <strong>{page.title || "Untitled page"}</strong>
            </label>)}
          </div>
          <button className="button primary" disabled={Boolean(busy) || includedUrls.size === 0} onClick={() => void onSaveKnowledge()}>{busy ?? "Lock selected pages"}</button>
        </>}

        {screen === "shape" && <>
          <div className="inspector-intro"><span>Character and surface</span><h2>Make it feel at home.</h2><p>Give it a name, set its first message, choose where it lives, then pick the character.</p></div>
          <form className="composer-form" onSubmit={(event) => void onSavePresence(event)}>
            <label>Name<input value={presence.displayName} maxLength={48} onChange={(event) => onPresenceChange({ ...presence, displayName: event.target.value })} /></label>
            <label>First message<textarea value={presence.greeting} maxLength={320} onChange={(event) => onPresenceChange({ ...presence, greeting: event.target.value })} /></label>
            <label>Placement<select value={presence.surface} onChange={(event) => onPresenceChange({ ...presence, surface: event.target.value as Presence["surface"] })}><option value="floating">Corner of the page</option><option value="inline">Inside the page</option></select></label>
            <button className="button primary" disabled={Boolean(busy)}>{busy ?? "Save changes"}</button>
          </form>
          <div className="composer-library">
            <span>Character library</span>
            {catalog.length === 0 ? <p>Load a reviewed site first.</p> : <div>{catalog.map((item) => <button className={companion?.slug === item.slug ? "library-character selected" : "library-character"} type="button" key={item.slug} onClick={() => void onChooseCompanion(item.slug)}><CompanionSprite companion={item} animated={false} className="library-sprite" /><strong>{item.displayName}</strong></button>)}</div>}
          </div>
        </>}

        {screen === "live" && <>
          <div className="inspector-intro"><span>Install it</span><h2>Put it in the product.</h2><p>One element creates the surface. Your application decides what happens after an interaction.</p></div>
          {companion ? <InstallCode installationId={session.installation.id} copied={copied} onCopy={onCopy} /> : <p className="inspector-empty">Choose a character first. The install snippet will appear here.</p>}
        </>}
      </motion.aside>
    </AnimatePresence>
  </main>;
}
*/

export default function StudioHome() {
  const [screen, setScreen] = useState<Screen>("connect");
  const [siteUrl, setSiteUrl] = useState("");
  const [session, setSession] = useState<StudioSession | null>(null);
  const [includedUrls, setIncludedUrls] = useState<Set<string>>(new Set());
  const [presence, setPresence] = useState<Presence | null>(null);
  const [catalog, setCatalog] = useState<CatalogCompanion[]>([]);
  const [companion, setCompanion] = useState<ImportedCompanion | null>(null);
  const [resumeInstallationId, setResumeInstallationId] = useState("");
  const [resumeOperatorKey, setResumeOperatorKey] = useState("");
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
      setPresence(restored.presence);
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
    void fetch(runtime + "/api/companions/petdex")
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Could not load the companion catalog.");
        if (!cancelled) setCatalog(payload.companions);
      })
      .catch((cause: unknown) => {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "Could not load the companion catalog.");
      });
    return () => { cancelled = true; };
  }, [reviewed, session]);

  function persist(next: StudioSession) {
    setSession(next);
    setPresence(next.presence);
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
        presence: makePresence(payload.installation.name),
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

  async function restore(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    begin("Restoring your operator session…");
    try {
      const response = await fetch(runtime + "/api/installations/" + resumeInstallationId + "/knowledge", {
        headers: { "x-cradle-installation-key": resumeOperatorKey },
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Cradle could not restore this project.");
      const next: StudioSession = {
        installation: { ...payload.installation, managementKey: resumeOperatorKey },
        knowledge: payload.knowledge,
        presence: payload.presence ?? makePresence(payload.installation.name),
      };
      const companionResponse = await fetch(runtime + "/api/installations/" + resumeInstallationId + "/companion", {
        headers: { "x-cradle-installation-key": resumeOperatorKey },
      });
      if (companionResponse.ok) {
        const companionPayload = await companionResponse.json();
        setCompanion(companionPayload.companion);
      }
      persist(next);
      setIncludedUrls(new Set(payload.knowledge.pages.map((page: Page) => page.url)));
      setScreen(payload.knowledge.version > 1 ? "shape" : "review");
      finish("Project restored in this browser session.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Cradle could not restore this project.");
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

  async function savePresence(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session || !presence) return;
    if (presence.suggestions.length === 0) {
      setError("Add at least one starter action before saving the presence.");
      return;
    }
    begin("Saving your presence…");
    try {
      const response = await fetch(runtime + "/api/installations/" + session.installation.id, {
        method: "PATCH",
        headers: { "content-type": "application/json", ...operatorHeaders },
        body: JSON.stringify({ presence }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Cradle could not save this presence.");
      persist({
        ...session,
        installation: { ...session.installation, name: payload.installation.name },
        presence: payload.presence,
      });
      finish("Presence settings saved.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Cradle could not save this presence.");
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
    setPresence(null);
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
      <a className="brand" href="/"><span aria-hidden="true">C</span> Cradle</a>
      <p>Self-hosted presence kit</p>
      {session && <button className="quiet-button" onClick={reset}>New project</button>}
    </header>

    {!session ? <section className="connect-screen">
      <div className="connect-copy">
        <span className="eyebrow">Give your site a body</span>
        <h1>Make your website feel <em>alive.</em></h1>
        <p>Cradle turns your public site into a visual presence you can program yourself.</p>
        <div className="principles"><span>01. Map the site</span><span>02. Pick a body</span><span>03. Wire the behaviour</span></div>
      </div>
      <div className="connect-card">
        <span className="eyebrow">Start here / 01</span>
        <h2>Bring your site in.</h2>
        <p>We map its public pages. You decide what the presence gets to know.</p>
        <form onSubmit={connect}>
          <label htmlFor="site-url">Website URL</label>
          <div className="url-row">
            <input id="site-url" type="url" required value={siteUrl} onChange={(event) => setSiteUrl(event.target.value)} placeholder="https://yourcompany.com" />
            <button className="button primary" disabled={Boolean(busy)}>{busy ?? "Map site"}</button>
          </div>
        </form>
        <details className="restore">
          <summary>Open an existing project</summary>
          <form onSubmit={restore}>
            <label htmlFor="restore-id">Project ID</label>
            <input id="restore-id" required value={resumeInstallationId} onChange={(event) => setResumeInstallationId(event.target.value)} placeholder="Project ID" />
            <label htmlFor="restore-key">Operator key</label>
            <input id="restore-key" required value={resumeOperatorKey} onChange={(event) => setResumeOperatorKey(event.target.value)} placeholder="Operator key" />
            <button className="button secondary" disabled={Boolean(busy)}>{busy ?? "Open project"}</button>
          </form>
        </details>
      </div>
    </section> : <>
      <section className="project-bar">
        <div><span className="eyebrow">Project</span><strong>{session.installation.name}</strong><small>{new URL(session.knowledge.sourceUrl).hostname}</small></div>
        <nav aria-label="Studio steps">
          <button className={screen === "review" ? "active" : ""} onClick={() => setScreen("review")}>01 <span>Map</span></button>
          <button className={screen === "shape" ? "active" : ""} disabled={!canShape} onClick={() => setScreen("shape")}>02 <span>Body</span></button>
          <button className={screen === "live" ? "active" : ""} disabled={!canGoLive} onClick={() => setScreen("live")}>03 <span>Wire up</span></button>
        </nav>
      </section>

      {screen === "review" && <section className="workflow-screen review-screen">
        <div className="workflow-heading">
          <span className="eyebrow">01 / map the mind</span>
          <h1>What should it know?</h1>
          <p>This is the source material packaged with your presence. Keep what helps; leave the rest out.</p>
        </div>
        <div className="review-layout">
          <aside className="review-summary">
            <strong>{includedUrls.size}</strong>
            <span>selected pages</span>
            <p>{session.knowledge.pages.length} public pages found on {new URL(session.knowledge.sourceUrl).hostname}.</p>
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

      {screen === "shape" && presence && <section className="workflow-screen shape-screen">
        <div className="workflow-heading">
          <span className="eyebrow">02 / give it a body</span>
          <h1>Pick its form. Set its first move.</h1>
          <p>Cradle supplies the visual state machine. You decide what it does when people interact.</p>
        </div>
        <div className="shape-layout">
          <form className="presence-form" onSubmit={savePresence}>
            <label>Call it<input value={presence.displayName} maxLength={48} onChange={(event) => setPresence({ ...presence, displayName: event.target.value })} /></label>
            <label>First words<textarea value={presence.greeting} maxLength={320} onChange={(event) => setPresence({ ...presence, greeting: event.target.value })} /></label>
            <label>It lives<select value={presence.surface} onChange={(event) => setPresence({ ...presence, surface: event.target.value as Presence["surface"] })}><option value="floating">In the corner</option><option value="inline">Inside the page</option></select></label>
            <details className="advanced-settings">
              <summary>Host behaviour</summary>
              <div>
                <label>Voice<textarea value={presence.tone} maxLength={160} onChange={(event) => setPresence({ ...presence, tone: event.target.value })} /></label>
                <label>Starter actions<input value={presence.suggestions.join(" | ")} onChange={(event) => setPresence({ ...presence, suggestions: event.target.value.split("|").map((item) => item.trim()).filter(Boolean).slice(0, 4) })} /></label>
                <small>These emit <code>cradle:action</code>. Connect them to anything you like.</small>
              </div>
            </details>
            <button className="button primary" disabled={Boolean(busy)}>{busy ?? "Save the body"}</button>
          </form>
        </div>
        <section className="companion-section">
          <div className="section-copy">
            <span className="eyebrow">The body library</span>
            <h2>Choose the one people will remember.</h2>
            <p>It is pinned to your deployment. No remote gallery. No surprise changes in production.</p>
          </div>
          {catalog.length === 0 ? <p className="loading-copy">Loading the curated companion catalog…</p> : <div className="companion-grid">
            {catalog.map((item) => <article className={companion?.slug === item.slug ? "companion-card selected" : "companion-card"} key={item.slug}>
              <div className="sprite-preview"><CompanionSprite companion={item} animated={false} className="catalog-sprite" /></div>
              <span>{item.kind}</span>
              <h3>{item.displayName}</h3>
              <p>{item.description}</p>
              <small>Curated Petdex · {item.submittedBy}</small>
              <button className="button secondary" disabled={Boolean(busy)} onClick={() => void chooseCompanion(item.slug)}>{companion?.slug === item.slug ? "Pinned to project" : "Choose companion"}</button>
            </article>)}
          </div>}
        </section>
      </section>}

      {screen === "live" && session && companion && presence && <section className="workflow-screen live-screen">
        <div className="workflow-heading">
          <span className="eyebrow">03 / wire it up</span>
          <h1>Put it on your site.</h1>
          <p>{companion.displayName} is packed with the source you approved. The embed gives your site a new interaction surface—not a generic chat bubble.</p>
        </div>
        <div className="live-grid">
          <InstallCode installationId={session.installation.id} copied={copied} onCopy={copySnippet} />
        </div>
        <aside className="runtime-note">
          <span className="eyebrow">Browser contract</span>
          <h3>You own the behaviour.</h3>
          <p>Listen for visual lifecycle events and connect them to your own product guidance, support, onboarding, or anything else.</p>
          <code>cradle:ready<br />cradle:open<br />cradle:action<br />cradle:state</code>
        </aside>
        <p className="qualra-link">Need verified identity and relationship memory? <a href="https://www.qualra.xyz" target="_blank" rel="noreferrer">Explore Qualra</a>.</p>
      </section>}
    </>}

    {presence && companion && (screen === "shape" || screen === "live") && <PresencePreview presence={presence} companion={companion} />}
    {(busy || notice) && <p className="status" role="status">{busy ?? notice}</p>}
    {error && <p className="error" role="alert">{error}</p>}
  </main>;
}
