"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Page = { url: string; title: string; markdown: string };
type Onboarding = {
  installation: { id: string; name: string; managementKey: string };
  knowledge: { pages: Page[]; sourceUrl: string; version?: number };
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
  contentType: "image/webp";
  columns: 8;
  rows: number;
  cellWidth: 192;
  cellHeight: 208;
  createdAt: string;
};

const runtime = process.env.NEXT_PUBLIC_CRADLE_RUNTIME_URL ?? "http://localhost:3002";

function InstallSnippet({ installationId, copied, onCopy }: { installationId: string; copied: boolean; onCopy: (value: string) => Promise<void> }) {
  const snippet = `<script src="${runtime}/widget.js"></script>\n<cradle-resident installation-id="${installationId}" api-base="${runtime}"></cradle-resident>`;
  return <section className="install" id="install">
    <p className="kicker">03 / Install</p>
    <h2>Ship the bundle.</h2>
    <p>Paste this before your site’s closing <code>&lt;/body&gt;</code> tag. It works on static sites, React, Next.js, and any page that can load a script.</p>
    <pre><code>{snippet}</code></pre>
    <button onClick={() => void onCopy(snippet)}>{copied ? "Install snippet copied" : "Copy install snippet"}</button>
  </section>;
}

export default function StudioHome() {
  const [url, setUrl] = useState("");
  const [resumeInstallationId, setResumeInstallationId] = useState("");
  const [resumeManagementKey, setResumeManagementKey] = useState("");
  const [result, setResult] = useState<Onboarding | null>(null);
  const [includedUrls, setIncludedUrls] = useState<Set<string>>(new Set());
  const [knowledgeReviewed, setKnowledgeReviewed] = useState(false);
  const [catalog, setCatalog] = useState<CatalogCompanion[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [companion, setCompanion] = useState<ImportedCompanion | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const busy = busyAction !== null;
  const managementHeaders = useMemo<Record<string, string>>(() => result ? { "x-cradle-installation-key": result.installation.managementKey } : ({} as Record<string, string>), [result]);

  useEffect(() => {
    if (!result || !knowledgeReviewed) return;
    let cancelled = false;
    void fetch(`${runtime}/api/companions/petdex`)
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Could not load the companion catalog.");
        if (!cancelled) setCatalog(payload.companions);
      })
      .catch((cause: unknown) => {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "Could not load the companion catalog.");
      });
    return () => { cancelled = true; };
  }, [knowledgeReviewed, result]);

  function begin(action: string) {
    setBusyAction(action);
    setError("");
    setNotice(action);
  }

  function togglePage(urlToToggle: string) {
    setKnowledgeReviewed(false);
    setCompanion(null);
    setSelectedSlug("");
    setIncludedUrls((current) => {
      const next = new Set(current);
      if (next.has(urlToToggle)) next.delete(urlToToggle); else next.add(urlToToggle);
      return next;
    });
  }

  async function discover(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    begin("Reading the public website…");
    try {
      const response = await fetch(`${runtime}/api/onboarding`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Cradle could not prepare this site.");
      setResult(payload);
      setIncludedUrls(new Set(payload.knowledge.pages.map((page: Page) => page.url)));
      setKnowledgeReviewed(false);
      setCatalog([]);
      setSelectedSlug("");
      setCompanion(null);
      setNotice("Website ready for source review.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Cradle Studio could not reach the runtime.");
    } finally { setBusyAction(null); }
  }

  async function resume(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    begin("Restoring the installation…");
    try {
      const headers = { "x-cradle-installation-key": resumeManagementKey };
      const [knowledgeResponse, companionResponse] = await Promise.all([
        fetch(`${runtime}/api/installations/${resumeInstallationId}/knowledge`, { headers }),
        fetch(`${runtime}/api/installations/${resumeInstallationId}/companion`, { headers }),
      ]);
      const knowledgePayload = await knowledgeResponse.json();
      const companionPayload = await companionResponse.json();
      if (!knowledgeResponse.ok) throw new Error(knowledgePayload.error ?? "Could not restore this installation.");
      if (!companionResponse.ok) throw new Error(companionPayload.error ?? "Could not restore this installation.");
      setResult({ installation: { ...knowledgePayload.installation, managementKey: resumeManagementKey }, knowledge: knowledgePayload.knowledge });
      setIncludedUrls(new Set(knowledgePayload.knowledge.pages.map((page: Page) => page.url)));
      setKnowledgeReviewed(knowledgePayload.knowledge.version > 1);
      setCompanion(companionPayload.companion);
      setSelectedSlug(companionPayload.companion?.slug ?? "");
      setNotice("Installation restored.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not restore this installation.");
    } finally { setBusyAction(null); }
  }

  async function saveKnowledgeReview() {
    if (!result) return;
    begin("Saving reviewed sources…");
    try {
      const response = await fetch(`${runtime}/api/installations/${result.installation.id}/knowledge`, { method: "PATCH", headers: { "content-type": "application/json", ...managementHeaders }, body: JSON.stringify({ includedUrls: [...includedUrls] }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Could not save the reviewed sources.");
      setResult((current) => current ? { ...current, knowledge: payload.knowledge } : current);
      setKnowledgeReviewed(true);
      setNotice("Source bundle saved. Choose its companion.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save the reviewed sources.");
    } finally { setBusyAction(null); }
  }

  async function selectCompanion(slug: string) {
    if (!result) return;
    begin("Importing and validating the companion…");
    try {
      const response = await fetch(`${runtime}/api/installations/${result.installation.id}/companion`, { method: "PUT", headers: { "content-type": "application/json", ...managementHeaders }, body: JSON.stringify({ provider: "petdex", slug }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Could not import this companion.");
      setCompanion(payload.companion);
      setSelectedSlug(slug);
      setNotice("Companion imported and pinned to this installation.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not import this companion.");
    } finally { setBusyAction(null); }
  }

  async function copyInstallSnippet(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setNotice("Install snippet copied to your clipboard.");
    } catch { setError("Could not copy the install snippet. Select it manually instead."); }
  }

  const currentStep = companion ? 3 : knowledgeReviewed ? 2 : result ? 1 : 0;
  return <main className="studio">
    <header className="topbar">
      <Link className="wordmark" href="/"><span className="wordmark-mark" aria-hidden="true">◒</span>Cradle</Link>
      <span className="topbar-context">Site companion studio</span>
      <p className="step-count"><span>0{currentStep + 1}</span> / 03</p>
    </header>
    <section className={`hero ${result ? "hero-compact" : ""}`}>
      <div className="hero-copy">
        <p className="kicker">Website context + companion package</p>
        <h1>{result ? <>Bundle <i>{result.installation.name}</i> for the web.</> : <>Give your website<br />a <i>living surface.</i></>}</h1>
        <p className="intro">Cradle turns reviewed public website knowledge and an animated companion into one installable runtime. No custom art pipeline required.</p>
      </div>
      <aside className="hero-note"><span className="note-index">The contract</span><p>One source snapshot. One pinned companion. One script tag.</p><span className="note-line" /><small>Characters are imported from Petdex’s curated collection and stored with the installation.</small></aside>
    </section>
    {!result ? <>
      <form className="discovery" onSubmit={discover}>
        <div className="form-heading"><span className="form-index">01</span><label htmlFor="website-url">Public website URL</label></div>
        <div><input id="website-url" type="url" required value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://yourcompany.com" /><button disabled={busy}>{busy ? busyAction : "Read website"}</button></div>
        <small>Cradle performs a bounded, same-domain crawl. You approve every page before it becomes runtime context.</small>
      </form>
      <form className="resume" onSubmit={resume}>
        <div className="resume-heading"><span className="form-index">Return</span><label>Resume an installation</label></div>
        <input required value={resumeInstallationId} onChange={(event) => setResumeInstallationId(event.target.value)} placeholder="Installation ID" />
        <input required value={resumeManagementKey} onChange={(event) => setResumeManagementKey(event.target.value)} placeholder="Owner credential" />
        <button disabled={busy}>{busy ? busyAction : "Continue"}</button>
      </form>
    </> : <div className="workspace-shell">
      <aside className="workflow-rail" aria-label="Installation workflow">
        <div className="workflow-context"><span className="workflow-dot" aria-hidden="true" /><span>{result.installation.name}</span></div>
        <p>Build progress</p><nav><a className="workflow-stage" href="#source"><span>01</span> Source</a><a className="workflow-stage" href="#companion"><span>02</span> Companion</a><a className="workflow-stage" href="#install"><span>03</span> Install</a></nav>
        <div className="rail-status"><strong>{companion ? "Ready" : knowledgeReviewed ? "Selecting" : "Draft"}</strong><span>{busyAction ?? notice ?? "Changes save to this installation."}</span></div>
      </aside>
      <div className="workspace-main">
        <section className="owner-key"><p className="kicker">Owner credential</p><strong>Save this key before you continue.</strong><code>{result.installation.managementKey}</code><p>Cradle stores only a hash. The embed never receives this credential.</p></section>
        <section className="section-head" id="source"><p className="kicker">01 / Source snapshot</p><div><h2>Review what it can know.</h2><p>Choose the public pages this installation may use. This is the knowledge bundle paired with the companion.</p></div></section>
        <section className="knowledge"><div className="knowledge-summary"><strong>{includedUrls.size}</strong><span>pages included</span><p>{new URL(result.knowledge.sourceUrl).hostname}</p><button onClick={saveKnowledgeReview} disabled={busy || includedUrls.size === 0}>{busyAction === "Saving reviewed sources…" ? busyAction : "Save source bundle"}</button>{!knowledgeReviewed && <p className="selection-note">Approve this selection to continue.</p>}</div><div className="page-list">{result.knowledge.pages.map((page) => <article key={page.url}><label className="page-toggle"><input type="checkbox" checked={includedUrls.has(page.url)} onChange={() => togglePage(page.url)} disabled={busy} /><span>{new URL(page.url).pathname || "/"}</span></label><strong>{page.title || "Untitled page"}</strong><p>{page.markdown.slice(0, 140)}…</p></article>)}</div></section>
        <section className="section-head" id="companion"><p className="kicker">02 / Companion</p><div><h2>Choose a living surface.</h2><p>Every option is a verified 8 × 9 animation package from Petdex’s curated collection. Cradle imports and pins your selection.</p></div></section>
        {!knowledgeReviewed ? <p className="intro">Save the source bundle to unlock the curated companion collection.</p> : <section className="companion-grid" aria-label="Curated Petdex companions">{catalog.map((pet) => <article className={`companion-card ${selectedSlug === pet.slug ? "selected" : ""}`} key={pet.slug}><div className="companion-preview"><img src={pet.spritesheetUrl} alt={`${pet.displayName} animation sheet`} /></div><div><span>{pet.kind}</span><h3>{pet.displayName}</h3><p>{pet.description}</p><small>Petdex curated · {pet.submittedBy}</small></div><button onClick={() => void selectCompanion(pet.slug)} disabled={busy} aria-pressed={selectedSlug === pet.slug}>{selectedSlug === pet.slug ? "Selected" : "Choose companion"}</button></article>)}</section>}
        {knowledgeReviewed && catalog.length === 0 && <p className="intro">Loading the curated catalog…</p>}
        {companion && <section className="bundle-ready"><p className="kicker">Bundle ready</p><h2>{companion.displayName} is pinned to this installation.</h2><p>Cradle stored an immutable copy of the sprite sheet with its Petdex source details. The widget can now render it alongside this website’s reviewed context.</p><dl><div><dt>Source</dt><dd>Petdex · {companion.slug}</dd></div><div><dt>Format</dt><dd>{companion.columns} × {companion.rows} frames</dd></div><div><dt>Checksum</dt><dd>{companion.checksum.slice(0, 12)}…</dd></div></dl></section>}
        {companion && <InstallSnippet installationId={result.installation.id} copied={copied} onCopy={copyInstallSnippet} />}
      </div>
    </div>}
    {(notice || busyAction) && <p className="status" role="status" aria-live="polite">{busyAction ?? notice}</p>}
    {error && <p className="error" role="alert">{error}</p>}
  </main>;
}
