"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Page = { url: string; title: string; markdown: string };
type Direction = { id: string; name: string; archetype: "wayfinder" | "witness" | "keeper"; role: string; traits: string[]; motif: string; greeting: string; rationale: string; evidence: Array<{ sourceUrl: string; reason: string }>; palette: [string, string, string] };
type Revision = { id: string; status: "queued" | "generating" | "ready" | "selected" | "failed"; identity?: { summary: string; audience: string; voice: string[]; visualLanguage: string; directions: Direction[] }; selectedDirectionId?: string; error?: string };
type Onboarding = { installation: { id: string; name: string }; knowledge: { pages: Page[]; sourceUrl: string } };
type Asset = { id: string; state: string; status: "draft" | "published" | "failed" };

const runtime = process.env.NEXT_PUBLIC_CRADLE_RUNTIME_URL ?? "http://localhost:3002";
const pending = new Set<Revision["status"]>(["queued", "generating"]);

export default function StudioHome() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<Onboarding | null>(null);
  const [revision, setRevision] = useState<Revision | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!result || !revision || !pending.has(revision.status)) return;
    const interval = window.setInterval(async () => {
      const response = await fetch(`${runtime}/api/installations/${result.installation.id}/identity`);
      const payload = await response.json();
      if (response.ok) setRevision(payload.revision);
    }, 2_000);
    return () => window.clearInterval(interval);
  }, [result, revision]);

  useEffect(() => {
    if (!result || revision?.status !== "selected") return;
    const refresh = async () => {
      const response = await fetch(`${runtime}/api/installations/${result.installation.id}/assets`);
      const payload = await response.json();
      if (response.ok) setAssets(payload.assets);
    };
    void refresh();
    const interval = window.setInterval(refresh, 2_000);
    return () => window.clearInterval(interval);
  }, [result, revision?.status]);

  async function discover(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch(`${runtime}/api/onboarding`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Cradle could not prepare this site.");
      setResult(payload); setRevision(null);
      setAssets([]);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Cradle Studio could not reach the runtime."); }
    finally { setBusy(false); }
  }

  async function generateIdentity() {
    if (!result) return; setBusy(true); setError("");
    try {
      const response = await fetch(`${runtime}/api/installations/${result.installation.id}/identity`, { method: "POST" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Cradle could not queue an identity revision.");
      setRevision(payload.revision);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not queue identity generation."); }
    finally { setBusy(false); }
  }

  async function selectDirection(directionId: string) {
    if (!result || !revision) return; setBusy(true); setError("");
    try {
      const response = await fetch(`${runtime}/api/installations/${result.installation.id}/identity`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: revision.id, selectedDirectionId: directionId }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Could not select this direction.");
      setRevision(payload.revision);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not select this direction."); }
    finally { setBusy(false); }
  }

  async function publishAssets() {
    if (!result) return; setBusy(true); setError("");
    try {
      const response = await fetch(`${runtime}/api/installations/${result.installation.id}/assets`, { method: "POST" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Cradle could not publish this asset pack.");
      setAssets(payload.assets);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not publish the asset pack."); }
    finally { setBusy(false); }
  }

  const draftStates = new Set(assets.filter((asset) => asset.status === "draft").map((asset) => asset.state));
  const packReady = ["canonical", "idle", "welcome", "listening", "thinking", "resolved", "away"].every((state) => draftStates.has(state));
  const published = assets.every((asset) => asset.status === "published") && assets.length > 0;
  return <main className="studio"><header><Link className="wordmark" href="/">CRADLE</Link><span>IDENTITY STUDIO</span><p>0{result ? 2 : 1} / 04</p></header><section className="hero"><p className="kicker">A company deserves more than a chat bubble.</p><h1>Give your website<br /><i>a presence.</i></h1><p className="intro">Cradle turns reviewed public knowledge into a grounded identity. Character assets come only after you approve its direction.</p></section>{!result ? <form className="discovery" onSubmit={discover}><label htmlFor="site">Start with a public website</label><div><input id="site" type="url" required value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://yourcompany.com" /><button disabled={busy}>{busy ? "Reading the site…" : "Discover the shape"}</button></div><small>Public, same-domain crawl. You review the source material before generation.</small></form> : <><section className="section-head"><p className="kicker">01 / Knowledge</p><h2>Here is what Cradle found.</h2><p>These are the reviewed pages the identity is allowed to use.</p></section><section className="knowledge"><div className="knowledge-summary"><strong>{result.knowledge.pages.length}</strong><span>pages collected</span><p>{new URL(result.knowledge.sourceUrl).hostname}</p></div><div className="page-list">{result.knowledge.pages.map((page) => <article key={page.url}><span>{new URL(page.url).pathname || "/"}</span><strong>{page.title || "Untitled page"}</strong><p>{page.markdown.slice(0, 140)}…</p></article>)}</div></section><section className="section-head"><p className="kicker">02 / Identity</p><h2>Derive its direction from evidence.</h2><p>Cradle creates three distinct directions from the reviewed snapshot. It does not publish a widget or generate visual assets yet.</p></section>{!revision && <button className="primary-action" onClick={generateIdentity} disabled={busy}>Generate three directions</button>}{revision && pending.has(revision.status) && <p className="intro">Cradle is reading the approved snapshot and preparing the directions…</p>}{revision?.status === "failed" && <p className="error">{revision.error ?? "Identity generation failed."}</p>}{revision?.identity && <><section className="section-head"><p className="kicker">Brand brief</p><h2>{revision.identity.summary}</h2><p>For {revision.identity.audience}. Voice: {revision.identity.voice.join(", ")}.</p></section><section className="directions">{revision.identity.directions.map((direction) => <article className={`direction ${revision.selectedDirectionId === direction.id ? "chosen" : ""}`} key={direction.id} style={{ "--main": direction.palette[0], "--accent": direction.palette[1], "--wash": direction.palette[2] } as React.CSSProperties}><div className="being"><span></span><i></i></div><p className="archetype">{direction.archetype}</p><h3>{direction.name}</h3><p>{direction.role}</p><ul>{direction.traits.map((trait) => <li key={trait}>{trait}</li>)}</ul><details><summary>Why this fits</summary><p>{direction.rationale}</p>{direction.evidence.map((item) => <p key={item.sourceUrl}><a href={item.sourceUrl} target="_blank">Source</a>: {item.reason}</p>)}</details><button onClick={() => selectDirection(direction.id)} disabled={busy || revision.status !== "ready"}>{revision.selectedDirectionId === direction.id ? "Direction selected" : `Select ${direction.name}`}</button></article>)}</section>{revision.status === "selected" && <section className="published"><p className="kicker">03 / Asset review</p><h2>{published ? "Published." : packReady ? "Your state pack is ready." : `Preparing assets (${draftStates.size}/7).`}</h2><p>{published ? "The widget can now fetch the immutable canonical asset." : packReady ? "Review the generated direction, then publish the complete pack." : "Cradle is deriving each interaction state from one canonical base."}</p>{!published && <button onClick={publishAssets} disabled={busy || !packReady}>Publish asset pack</button>}</section>}</>}</>}{error && <p className="error" role="alert">{error}</p>}</main>;
}
