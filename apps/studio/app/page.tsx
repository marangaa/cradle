"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type Page = { url: string; title: string; markdown: string };
type Direction = {
  id: string;
  name: string;
  archetype: "wayfinder" | "witness" | "keeper";
  role: string;
  traits: string[];
  motif: string;
  greeting: string;
  rationale: string;
  evidence: Array<{ sourceUrl: string; reason: string }>;
  palette: string[];
};
type Revision = {
  id: string;
  status: "queued" | "generating" | "ready" | "selected" | "failed";
  identity?: {
    summary: string;
    audience: string;
    voice: string[];
    visualLanguage: string;
    directions: Direction[];
  };
  selectedDirectionId?: string;
  error?: string;
};
type Onboarding = {
  installation: { id: string; name: string; managementKey: string };
  knowledge: { pages: Page[]; sourceUrl: string };
};
type Asset = {
  id: string;
  state: string;
  status: "draft" | "published" | "failed";
};

const runtime =
  process.env.NEXT_PUBLIC_CRADLE_RUNTIME_URL ?? "http://localhost:3002";
const pending = new Set<Revision["status"]>(["queued", "generating"]);
const states = [
  "canonical",
  "idle",
  "welcome",
  "listening",
  "thinking",
  "resolved",
  "away",
];

function AssetPackPreview({
  assets,
  previewUrls,
}: {
  assets: Asset[];
  previewUrls: Record<string, string>;
}) {
  return (
    <div className="asset-pack" aria-label="Generated state pack">
      {assets
        .filter((asset) => asset.status !== "failed")
        .map((asset) => (
          <figure key={asset.id}>
            <div>
              {previewUrls[asset.id] ? (
                <Image
                  src={previewUrls[asset.id] ?? ""}
                  alt={`Generated ${asset.state} state`}
                  width={400}
                  height={400}
                  unoptimized
                />
              ) : (
                <span className="asset-placeholder">Preparing</span>
              )}
            </div>
            <figcaption>{asset.state}</figcaption>
          </figure>
        ))}
    </div>
  );
}

function InstallSnippet({
  installationId,
  onCopy,
  copied,
}: {
  installationId: string;
  onCopy: (value: string, label: string) => Promise<void>;
  copied: boolean;
}) {
  const snippet = `<script src="${runtime}/widget.js"></script>\n<cradle-resident installation-id="${installationId}" api-base="${runtime}"></cradle-resident>`;
  return (
    <section className="install">
      <p className="kicker">04 / Install</p>
      <h2>Connect the runtime.</h2>
      <p>
        Add one script tag before your closing <code>&lt;/body&gt;</code> tag.
        The Cradle surface works on any website, not only Next.js.
      </p>
      <pre>
        <code>{snippet}</code>
      </pre>
      <button onClick={() => void onCopy(snippet, "Install snippet")}>
        {copied ? "Install snippet copied" : "Copy install snippet"}
      </button>
    </section>
  );
}

export default function StudioHome() {
  const [url, setUrl] = useState("");
  const [resumeInstallationId, setResumeInstallationId] = useState("");
  const [resumeManagementKey, setResumeManagementKey] = useState("");
  const [result, setResult] = useState<Onboarding | null>(null);
  const [revision, setRevision] = useState<Revision | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [includedUrls, setIncludedUrls] = useState<Set<string>>(new Set());
  const [knowledgeReviewed, setKnowledgeReviewed] = useState(false);
  const [error, setError] = useState("");
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [copiedLabel, setCopiedLabel] = useState("");
  const busy = busyAction !== null;
  const managementHeaders = useMemo<Record<string, string>>(() => {
    const key = result?.installation.managementKey;
    return key
      ? { "x-cradle-installation-key": key }
      : ({} as Record<string, string>);
  }, [result?.installation.managementKey]);

  useEffect(() => {
    if (!result || !revision || !pending.has(revision.status)) return;
    const interval = window.setInterval(async () => {
      const response = await fetch(
        `${runtime}/api/installations/${result.installation.id}/identity`,
        { headers: managementHeaders },
      );
      const payload = await response.json();
      if (response.ok) setRevision(payload.revision);
    }, 2_000);
    return () => window.clearInterval(interval);
  }, [managementHeaders, result, revision]);

  useEffect(() => {
    if (!result || revision?.status !== "selected") return;
    const refresh = async () => {
      const response = await fetch(
        `${runtime}/api/installations/${result.installation.id}/assets`,
        { headers: managementHeaders },
      );
      const payload = await response.json();
      if (response.ok)
        setAssets((current) =>
          JSON.stringify(current) === JSON.stringify(payload.assets)
            ? current
            : payload.assets,
        );
    };
    void refresh();
    const interval = window.setInterval(refresh, 2_000);
    return () => window.clearInterval(interval);
  }, [managementHeaders, result, revision?.status]);

  useEffect(() => {
    if (!result || assets.length === 0) return;
    let cancelled = false;
    const controller = new AbortController();
    void Promise.all(
      assets
        .filter((asset) => asset.status !== "failed")
        .map(async (asset) => {
          const response = await fetch(
            `${runtime}/api/installations/${result.installation.id}/assets/${asset.id}`,
            { headers: managementHeaders, signal: controller.signal },
          );
          if (!response.ok)
            throw new Error(`Could not load the ${asset.state} preview.`);
          return [
            asset.id,
            URL.createObjectURL(await response.blob()),
          ] as const;
        }),
    )
      .then((entries) => {
        if (cancelled) {
          entries.forEach(([, previewUrl]) => URL.revokeObjectURL(previewUrl));
          return;
        }
        setPreviewUrls((current) => ({
          ...current,
          ...Object.fromEntries(entries),
        }));
      })
      .catch((cause: unknown) => {
        if (
          !cancelled &&
          !(cause instanceof DOMException && cause.name === "AbortError")
        )
          setError(
            cause instanceof Error
              ? cause.message
              : "Could not load generated asset previews.",
          );
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [assets, managementHeaders, result]);

  useEffect(
    () => () => {
      Object.values(previewUrls).forEach((previewUrl) =>
        URL.revokeObjectURL(previewUrl),
      );
    },
    [previewUrls],
  );

  function begin(action: string) {
    setBusyAction(action);
    setError("");
    setNotice(action);
  }

  async function copyToClipboard(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedLabel(label);
      setNotice(`${label} copied to your clipboard.`);
    } catch {
      setError(
        `Could not copy the ${label.toLowerCase()}. Select it manually instead.`,
      );
    }
  }

  async function discover(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    begin("Reading the public website…");
    try {
      const response = await fetch(`${runtime}/api/onboarding`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const payload = await response.json();
      if (!response.ok)
        throw new Error(payload.error ?? "Cradle could not prepare this site.");
      setResult(payload);
      setRevision(null);
      setAssets([]);
      setPreviewUrls({});
      setIncludedUrls(
        new Set(payload.knowledge.pages.map((page: Page) => page.url)),
      );
      setKnowledgeReviewed(false);
      setNotice("Website ready for source review.");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Cradle Studio could not reach the runtime.",
      );
    } finally {
      setBusyAction(null);
    }
  }

  async function resume(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    begin("Restoring the installation…");
    try {
      const headers = { "x-cradle-installation-key": resumeManagementKey };
      const [knowledgeResponse, identityResponse] = await Promise.all([
        fetch(
          `${runtime}/api/installations/${resumeInstallationId}/knowledge`,
          { headers },
        ),
        fetch(`${runtime}/api/installations/${resumeInstallationId}/identity`, {
          headers,
        }),
      ]);
      const knowledgePayload = await knowledgeResponse.json();
      const identityPayload = await identityResponse.json();
      if (!knowledgeResponse.ok)
        throw new Error(
          knowledgePayload.error ?? "Could not restore this installation.",
        );
      if (!identityResponse.ok)
        throw new Error(
          identityPayload.error ?? "Could not restore this installation.",
        );
      setResult({
        installation: {
          ...knowledgePayload.installation,
          managementKey: resumeManagementKey,
        },
        knowledge: knowledgePayload.knowledge,
      });
      setRevision(identityPayload.revision);
      setAssets([]);
      setPreviewUrls({});
      setIncludedUrls(
        new Set(knowledgePayload.knowledge.pages.map((page: Page) => page.url)),
      );
      setKnowledgeReviewed(knowledgePayload.knowledge.version > 1);
      setNotice("Installation restored.");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not restore this installation.",
      );
    } finally {
      setBusyAction(null);
    }
  }

  async function saveKnowledgeReview() {
    if (!result) return;
    begin("Saving reviewed sources…");
    try {
      const response = await fetch(
        `${runtime}/api/installations/${result.installation.id}/knowledge`,
        {
          method: "PATCH",
          headers: { "content-type": "application/json", ...managementHeaders },
          body: JSON.stringify({ includedUrls: [...includedUrls] }),
        },
      );
      const payload = await response.json();
      if (!response.ok)
        throw new Error(
          payload.error ?? "Could not save the reviewed sources.",
        );
      setResult((current) =>
        current ? { ...current, knowledge: payload.knowledge } : current,
      );
      setKnowledgeReviewed(true);
      setNotice("Reviewed sources saved. You can generate directions.");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not save the reviewed sources.",
      );
    } finally {
      setBusyAction(null);
    }
  }

  function togglePage(urlToToggle: string) {
    setKnowledgeReviewed(false);
    setNotice(
      "Source selection changed. Save it before generating directions.",
    );
    setIncludedUrls((current) => {
      const next = new Set(current);
      if (next.has(urlToToggle)) next.delete(urlToToggle);
      else next.add(urlToToggle);
      return next;
    });
  }

  async function generateIdentity() {
    if (!result) return;
    begin("Generating identity directions…");
    try {
      const response = await fetch(
        `${runtime}/api/installations/${result.installation.id}/identity`,
        { method: "POST", headers: managementHeaders },
      );
      const payload = await response.json();
      if (!response.ok)
        throw new Error(
          payload.error ?? "Cradle could not queue an identity revision.",
        );
      setRevision(payload.revision);
      setNotice("Directions are being generated from the reviewed sources.");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not queue identity generation.",
      );
    } finally {
      setBusyAction(null);
    }
  }

  async function rotateManagementKey() {
    if (!result) return;
    begin("Rotating the owner credential…");
    try {
      const response = await fetch(
        `${runtime}/api/installations/${result.installation.id}/management-key`,
        { method: "PATCH", headers: managementHeaders },
      );
      const payload = await response.json();
      if (!response.ok)
        throw new Error(payload.error ?? "Could not rotate the owner key.");
      setResult((current) =>
        current
          ? {
              ...current,
              installation: {
                ...current.installation,
                managementKey: payload.managementKey,
              },
            }
          : current,
      );
      setNotice(
        "New owner credential created. Copy it before leaving this page.",
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not rotate the owner key.",
      );
    } finally {
      setBusyAction(null);
    }
  }

  async function selectDirection(directionId: string) {
    if (!result || !revision) return;
    begin("Selecting direction and preparing assets…");
    try {
      const response = await fetch(
        `${runtime}/api/installations/${result.installation.id}/identity`,
        {
          method: "PATCH",
          headers: { "content-type": "application/json", ...managementHeaders },
          body: JSON.stringify({
            id: revision.id,
            selectedDirectionId: directionId,
          }),
        },
      );
      const payload = await response.json();
      if (!response.ok)
        throw new Error(payload.error ?? "Could not select this direction.");
      setRevision(payload.revision);
      setAssets([]);
      setPreviewUrls({});
      setNotice("Direction selected. Cradle is preparing the state pack.");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not select this direction.",
      );
    } finally {
      setBusyAction(null);
    }
  }

  async function publishAssets() {
    if (!result) return;
    begin("Publishing the state pack…");
    try {
      const response = await fetch(
        `${runtime}/api/installations/${result.installation.id}/assets`,
        { method: "POST", headers: managementHeaders },
      );
      const payload = await response.json();
      if (!response.ok)
        throw new Error(
          payload.error ?? "Cradle could not publish this asset pack.",
        );
      setAssets(payload.assets);
      setNotice("State pack published. Your install snippet is ready.");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not publish the asset pack.",
      );
    } finally {
      setBusyAction(null);
    }
  }

  const draftStates = new Set(
    assets
      .filter((asset) => asset.status === "draft")
      .map((asset) => asset.state),
  );
  const packReady = states.every((state) => draftStates.has(state));
  const published =
    assets.length > 0 && assets.every((asset) => asset.status === "published");

  return (
    <main className="studio">
      <header className="topbar">
        <Link className="wordmark" href="/">
          <span className="wordmark-mark" aria-hidden="true">
            ◒
          </span>
          Cradle
        </Link>
        <span className="topbar-context">Cradle Studio</span>
        <p className="step-count">
          <span>0{result ? 2 : 1}</span> / 04
        </p>
      </header>
      <section className="hero">
        <div className="hero-copy">
          <p className="kicker">Cradle Studio · identity + runtime</p>
          <h1>
            Build the living layer
            <br />
            <em>for your website.</em>
          </h1>
          <p className="intro">
            Cradle turns your public site into a portable presence: review the
            source, shape the identity, publish its states, and install the
            runtime wherever your website lives.
          </p>
        </div>
        <aside className="hero-note">
          <span className="note-index">01</span>
          <p>Start with the source your company already owns.</p>
          <span className="note-line" aria-hidden="true" />
          <small>Infrastructure, not a prewritten chatbot</small>
        </aside>
      </section>
      {!result ? (
        <>
          <form className="discovery" onSubmit={discover}>
            <div className="form-heading">
              <span className="form-index">01</span>
              <label htmlFor="site">Create a Cradle installation</label>
            </div>
            <div>
              <input
                id="site"
                type="url"
                required
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://yourcompany.com"
              />
              <button disabled={busy}>
                <span>{busy ? busyAction : "Read this site"}</span>
                <span aria-hidden="true">↗</span>
              </button>
            </div>
            <small>
              Public, same-domain crawl. Review and approve the source snapshot
              before Cradle creates anything from it.
            </small>
          </form>
          <form className="resume" onSubmit={resume}>
            <div className="resume-heading">
              <span className="form-index">↳</span>
              <label htmlFor="installation">Continue a Cradle installation</label>
            </div>
            <input
              id="installation"
              required
              value={resumeInstallationId}
              onChange={(event) => setResumeInstallationId(event.target.value)}
              placeholder="Installation ID"
            />
            <input
              required
              value={resumeManagementKey}
              onChange={(event) => setResumeManagementKey(event.target.value)}
              placeholder="Owner credential"
            />
            <button disabled={busy}>
              {busy ? busyAction : "Continue"}
            </button>
          </form>
        </>
      ) : (
        <>
          <section className="owner-key">
            <p className="kicker">Owner credential</p>
            <strong>Save this key before you continue.</strong>
            <code>{result.installation.managementKey}</code>
            <div>
              <button
                onClick={() =>
                  void copyToClipboard(
                    result.installation.managementKey,
                    "Owner credential",
                  )
                }
              >
                {copiedLabel === "Owner credential" ? "Key copied" : "Copy key"}
              </button>
              <button onClick={rotateManagementKey} disabled={busy}>
                {busyAction === "Rotating the owner credential…"
                  ? busyAction
                  : "Rotate key"}
              </button>
            </div>
            <p>Cradle stores only its hash. The embed never receives it.</p>
          </section>
          <section className="section-head">
            <p className="kicker">01 / Source snapshot</p>
            <h2>Review the foundation.</h2>
            <p>Choose the public pages Cradle is allowed to use. Nothing is generated until you approve this snapshot.</p>
          </section>
          <section className="knowledge">
            <div className="knowledge-summary">
              <strong>{includedUrls.size}</strong>
              <span>pages included</span>
              <p>{new URL(result.knowledge.sourceUrl).hostname}</p>
              <button
                onClick={saveKnowledgeReview}
                disabled={busy || includedUrls.size === 0}
              >
                {busyAction === "Saving reviewed sources…"
                  ? busyAction
                  : "Save reviewed sources"}
              </button>
              {!knowledgeReviewed && (
                <p className="selection-note">
                  Approve this snapshot to continue.
                </p>
              )}
            </div>
            <div className="page-list">
              {result.knowledge.pages.map((page) => (
                <article key={page.url}>
                  <label className="page-toggle">
                    <input
                      type="checkbox"
                      checked={includedUrls.has(page.url)}
                      onChange={() => togglePage(page.url)}
                      disabled={busy}
                    />
                    <span>{new URL(page.url).pathname || "/"}</span>
                  </label>
                  <strong>{page.title || "Untitled page"}</strong>
                  <p>{page.markdown.slice(0, 140)}…</p>
                </article>
              ))}
            </div>
          </section>
          <section className="section-head">
            <p className="kicker">02 / Presence</p>
            <h2>Choose how it should show up.</h2>
            <p>
              Cradle proposes three identity systems from the approved source:
              role, voice, visual language, and the behavior your runtime can
              express.
            </p>
          </section>
          {!revision && (
            <button
              className="primary-action"
              onClick={generateIdentity}
              disabled={busy || includedUrls.size === 0 || !knowledgeReviewed}
            >
              {busyAction === "Generating identity directions…"
                ? busyAction
                : "Create identity directions"}
            </button>
          )}
          {revision && pending.has(revision.status) && (
            <p className="intro">
              Cradle is reading the approved snapshot and preparing the
              directions…
            </p>
          )}
          {revision?.status === "failed" && (
            <p className="error">
              {revision.error ?? "Identity generation failed."}
            </p>
          )}
          {revision?.identity && (
            <>
              <section className="section-head">
                <p className="kicker">Identity brief</p>
                <h2>{revision.identity.summary}</h2>
                <p>
                  For {revision.identity.audience}. Voice:{" "}
                  {revision.identity.voice.join(", ")}.
                </p>
              </section>
              <section className="directions">
                {revision.identity.directions.map((direction) => (
                  <article
                    className={`direction ${revision.selectedDirectionId === direction.id ? "chosen" : ""}`}
                    key={direction.id}
                    style={
                      {
                        "--main": direction.palette[0],
                        "--accent": direction.palette[1],
                        "--wash": direction.palette[2],
                      } as React.CSSProperties
                    }
                  >
                    <div className="being">
                      <span></span>
                      <i></i>
                    </div>
                    <p className="archetype">{direction.archetype}</p>
                    <h3>{direction.name}</h3>
                    <p>{direction.role}</p>
                    <ul>
                      {direction.traits.map((trait) => (
                        <li key={trait}>{trait}</li>
                      ))}
                    </ul>
                    <details>
                      <summary>Why this fits</summary>
                      <p>{direction.rationale}</p>
                      {direction.evidence.map((item) => (
                        <p key={item.sourceUrl}>
                          <a
                            href={item.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Source
                          </a>
                          : {item.reason}
                        </p>
                      ))}
                    </details>
                    <button
                      onClick={() => selectDirection(direction.id)}
                      disabled={busy || revision.status !== "ready"}
                      aria-pressed={
                        revision.selectedDirectionId === direction.id
                      }
                    >
                      {busyAction ===
                      "Selecting direction and preparing assets…"
                        ? busyAction
                        : revision.selectedDirectionId === direction.id
                          ? "Direction selected"
                          : `Select ${direction.name}`}
                    </button>
                  </article>
                ))}
              </section>
              {revision.status === "selected" && (
                <section className="published">
                  <p className="kicker">03 / Runtime states</p>
                  <h2>
                    {published
                      ? "Published."
                      : revision.error
                        ? "Generation needs another try."
                        : packReady
                      ? "Your runtime states are ready."
                          : `Preparing assets (${draftStates.size}/7).`}
                  </h2>
                  <p>
                    {published
                      ? "Your Cradle runtime can now fetch the published state pack."
                      : revision.error
                        ? revision.error
                        : packReady
                          ? "Review every generated state, then publish the complete pack."
                          : "Cradle is deriving each runtime state from one canonical base."}
                  </p>
                  <AssetPackPreview assets={assets} previewUrls={previewUrls} />
                  {revision.error && (
                    <button
                      onClick={() =>
                        selectDirection(revision.selectedDirectionId!)
                      }
                      disabled={busy}
                    >
                      {busyAction ===
                      "Selecting direction and preparing assets…"
                        ? busyAction
                        : "Retry asset generation"}
                    </button>
                  )}
                  {!published && !revision.error && (
                    <button
                      onClick={publishAssets}
                      disabled={busy || !packReady}
                    >
                      {busyAction === "Publishing the state pack…"
                        ? busyAction
                        : "Publish asset pack"}
                    </button>
                  )}
                  {published && (
                    <InstallSnippet
                      installationId={result.installation.id}
                      onCopy={copyToClipboard}
                      copied={copiedLabel === "Install snippet"}
                    />
                  )}
                </section>
              )}
            </>
          )}
        </>
      )}
      {(notice || busyAction) && (
        <p className="status" role="status" aria-live="polite">
          {busyAction ?? notice}
        </p>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </main>
  );
}
