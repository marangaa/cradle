const endpoints = [
  { method: "GET",  path: "/api/installations/:id",          desc: "Serve the manifest for a given installation." },
  { method: "PATCH", path: "/api/installations/:id/settings", desc: "Update character, instructions, or knowledge version." },
  { method: "PATCH", path: "/api/installations/:id/knowledge", desc: "Save the approved knowledge snapshot." },
  { method: "PUT",  path: "/api/installations/:id/companion", desc: "Pin a Petdex companion to an installation." },
  { method: "GET",  path: "/api/companions/petdex",           desc: "Browse the Petdex catalog with filtering and pagination." },
  { method: "POST", path: "/api/onboarding",                  desc: "Crawl a site, provision an installation, extract brand profile." },
  { method: "GET",  path: "/widget.js",                       desc: "The embeddable <cradle-character> custom element." },
];

export default function RuntimeHome() {
  return (

    <main style={{ width: "min(900px, calc(100% - 48px))", margin: "0 auto", padding: "48px 0 96px" }}>
      {/* Header */}
      <header style={{ marginBottom: 48 }}>
        <span style={{ display: "inline-block", background: "#e7ff36", border: "3px solid #111", padding: "5px 9px", fontFamily: "monospace", fontSize: ".6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 16 }}>
          Cradle Runtime
        </span>
        <h1 style={{ margin: "0 0 12px", fontSize: "clamp(2.4rem, 6vw, 4.2rem)", fontWeight: 820, letterSpacing: "-.08em", lineHeight: .84 }}>
          Infrastructure.<br />
          <span style={{ color: "#3559ff" }}>Running.</span>
        </h1>
        <p style={{ margin: 0, maxWidth: 520, color: "#54544f", fontSize: ".9rem", lineHeight: 1.52 }}>
          This is the Cradle runtime — the backend that serves your widget manifest, proxies the Petdex catalog, and manages your installation&apos;s knowledge snapshots.
        </p>
      </header>

      {/* Status indicator */}
      <section style={{ display: "flex", alignItems: "center", gap: 12, border: "3px solid #111", background: "#fff", boxShadow: "5px 5px 0 #111", padding: "16px 20px", marginBottom: 36 }}>
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px rgba(34,197,94,.5)", flexShrink: 0 }} />
        <span style={{ fontFamily: "monospace", fontSize: ".74rem", fontWeight: 700 }}>All systems operational</span>
        <span style={{ marginLeft: "auto", fontFamily: "monospace", fontSize: ".62rem", color: "#54544f" }}>{new Date().toUTCString()}</span>
      </section>

      {/* API reference */}
      <section>
        <h2 style={{ margin: "0 0 18px", fontSize: "1.1rem", fontWeight: 780, letterSpacing: "-.04em" }}>API Endpoints</h2>
        <div style={{ border: "3px solid #111", background: "#fff", boxShadow: "5px 5px 0 #111", overflow: "hidden" }}>
          {endpoints.map(({ method, path, desc }, i) => (
            <div
              key={path}
              style={{
                display: "grid",
                gridTemplateColumns: "56px 1fr auto",
                alignItems: "center",
                gap: 16,
                padding: "13px 18px",
                borderBottom: i < endpoints.length - 1 ? "2px solid #e8e7df" : "none",
              }}
            >
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                height: 22,
                background: method === "GET" ? "#dbeafe" : method === "POST" ? "#dcfce7" : method === "PATCH" ? "#fef9c3" : "#fce7f3",
                color: method === "GET" ? "#1d4ed8" : method === "POST" ? "#15803d" : method === "PATCH" ? "#854d0e" : "#9d174d",
                fontFamily: "monospace",
                fontSize: ".54rem",
                fontWeight: 800,
                borderRadius: 3,
              }}>
                {method}
              </span>
              <span style={{ fontFamily: "monospace", fontSize: ".7rem", color: "#111" }}>{path}</span>
              <span style={{ color: "#54544f", fontSize: ".72rem", textAlign: "right" }}>{desc}</span>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}

