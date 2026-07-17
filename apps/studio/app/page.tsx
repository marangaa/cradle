"use client";
import { useState } from "react";

export default function StudioHome() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<{ installation: { id: string }; knowledge: { pages: unknown[] } } | null>(null);
  const [error, setError] = useState("");
  async function onboard(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_CRADLE_RUNTIME_URL ?? "http://localhost:3002"}/api/onboarding`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url }) });
      const payload = await response.json();
      if (!response.ok) { setError(payload.error ?? "Cradle could not prepare this site."); return; }
      setResult(payload);
    } catch {
      setError("Cradle Studio could not reach the runtime. Check NEXT_PUBLIC_CRADLE_RUNTIME_URL and the runtime CORS settings.");
    }
  }
  return <main><p className="eyebrow">CRADLE / BY QUALRA</p><h1>Give your website<br />someone to be.</h1><p className="lede">Cradle builds the representative. You decide what it knows, remembers, and does.</p><form onSubmit={onboard}><label htmlFor="site">Website URL</label><div className="row"><input id="site" type="url" required value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://yourcompany.com" /><button>Build resident</button></div></form>{error && <p role="alert">{error}</p>}{result && <section className="result"><p>Prepared {result.knowledge.pages.length} reviewable pages. Install this after reviewing the snapshot.</p><code>{`<script src="${process.env.NEXT_PUBLIC_CRADLE_RUNTIME_URL ?? "http://localhost:3002"}/widget.js"></script>\n<cradle-resident installation-id="${result.installation.id}" api-base="${process.env.NEXT_PUBLIC_CRADLE_RUNTIME_URL ?? "http://localhost:3002"}"></cradle-resident>`}</code></section>}</main>;
}
