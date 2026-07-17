"use client";
import { useState } from "react";

export default function StudioHome() {
  const [url, setUrl] = useState("");
  const [ready, setReady] = useState(false);
  return <main><p className="eyebrow">CRADLE / BY QUALRA</p><h1>Give your website<br />someone to be.</h1><p className="lede">Cradle builds the representative. You decide what it knows, remembers, and does.</p><form onSubmit={(event) => { event.preventDefault(); setReady(true); }}><label htmlFor="site">Website URL</label><div className="row"><input id="site" type="url" required value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://yourcompany.com" /><button>Build resident</button></div></form>{ready && <section className="result"><p>Next: Cradle will crawl public pages, prepare a reviewable knowledge snapshot, and generate your installation.</p><code>{`<script src="https://runtime.example/widget.js"></script>\n<cradle-resident installation-id="YOUR_INSTALLATION" api-base="https://runtime.example"></cradle-resident>`}</code></section>}</main>;
}
