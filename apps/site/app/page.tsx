import Script from "next/script";
import { createElement } from "react";

export default function Site() { return <main style={{ fontFamily: "Georgia, serif", padding: "10vw", background: "#f2e8d8", minHeight: "100vh" }}><p>FIELD NOTES</p><h1 style={{ fontSize: "clamp(3rem,9vw,9rem)", lineHeight: .85, margin: "1rem 0" }}>Make room<br />for wonder.</h1><p style={{ fontSize: "1.25rem", maxWidth: 560 }}>A production fixture for testing Cradle on a real, independently-deployed site.</p><Script src="http://localhost:3002/widget.js" strategy="afterInteractive" />{createElement("cradle-resident", { "installation-id": "00000000-0000-4000-8000-000000000001", "api-base": "http://localhost:3002" })}</main>; }
