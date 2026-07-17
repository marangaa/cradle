# Cradle

Open infrastructure for adding a website representative to any public site. Cradle turns a company's public website into reviewable knowledge, ships one portable custom element, and streams grounded conversations through a provider-neutral runtime.

Qualra Cloud runs the same contract as managed infrastructure and can forward verified conversations into Qualra's relationship intelligence. Cradle itself does not prescribe a sales, support, or research workflow.

## Why Cradle

Companies currently stitch together a static chat widget, a separate knowledge base, and an internal relationship system. Cradle provides the shared interaction layer: an embeddable resident with a stable visitor and conversation identity, an explicit knowledge snapshot, and a runtime contract that works the same way when self-hosted or operated by Qualra.

This is intentionally infrastructure, not another fixed "sales bot" or "support bot." Teams choose their instructions, tools, data stores, and workflow. Qualra Cloud is the managed path: it operates the runtime and can turn verified Cradle conversations into relationship memory and analysis.

## What works today

- Submit a public URL through Studio and run a bounded, same-origin Firecrawl crawl.
- Persist a reviewable knowledge snapshot for the running process.
- Generate an installation ID and embed the Shadow-DOM `cradle-resident` widget with one script tag.
- Maintain anonymous visitor and conversation IDs in the visitor's first-party browser storage.
- Reject chat requests whose browser origin does not match the installation's configured origin.
- Stream grounded answers through AI SDK and OpenAI (`CRADLE_MODEL_ID` defaults to `gpt-5.6-sol`).

## Quick start

```sh
pnpm install
cp .env.example .env
pnpm --filter runtime dev
pnpm --filter studio dev
```

Set `OPENAI_API_KEY` and `FIRECRAWL_API_KEY` in `.env`. Open Studio at `http://localhost:3000`, submit a public URL, then paste the generated snippet after reviewing the returned page snapshot.

```html
<script src="https://runtime.example/widget.js"></script>
<cradle-resident installation-id="YOUR_INSTALLATION" api-base="https://runtime.example"></cradle-resident>
```

The widget runs in a Shadow DOM, preserves a first-party anonymous visitor and conversation ID, and only the configured installation origin can use its chat endpoint.

## Deploy a smoke test

For a short-lived Qualra test, deploy `apps/runtime` to Render from the repository Dockerfile and deploy `apps/studio` to Vercel. Set Vercel's `NEXT_PUBLIC_CRADLE_RUNTIME_URL` to the public Render runtime URL **before building Studio**. Set these Render runtime environment variables:

```text
OPENAI_API_KEY=...
FIRECRAWL_API_KEY=...
CRADLE_MODEL_ID=gpt-5.6-sol
```

Then open Studio, enter the exact public Qualra origin (for example, `https://qualra.example`), and paste the generated snippet into that site. The installation origin must exactly match the browser origin: `www` and non-`www` are different origins.

This is suitable for testing the integration and demoing the flow only. A Render restart or deploy clears the current installations, snapshots, and conversations because the store is in memory.

## Repository

- `apps/studio` — URL onboarding and installation snippet.
- `apps/runtime` — crawl onboarding, installation, streaming, and widget delivery.
- `apps/site` — integration target for local verification.
- `packages/widget` — framework-free `cradle-resident` custom element.
- `packages/crawler` — bounded, same-origin Firecrawl ingestion.
- `packages/core` — Zod contracts shared by every deployment.
- `packages/db` — store contract and development-only memory store.

## Operations

`docker compose up --build` starts the local stack, including Postgres, Redis, and MinIO for the forthcoming durable adapters. The runtime currently uses the development `MemoryStore`; restarting it clears installations, knowledge, and conversations. That makes this repository safe to evaluate and extend, **not yet a production-ready self-host deployment**. Do not put customer traffic on it until the Postgres/object-store adapter, encrypted configuration, per-installation credentials, rate limiting, and review/publish workflow are completed.

The crawler is deliberately public, same-domain, bounded (20 pages by default), and leaves Firecrawl's robots behavior enabled. Content is returned as a snapshot for review; the remaining review/publish screen is the next product slice.

## Development

```sh
pnpm lint
pnpm check-types
pnpm --filter runtime build
```

Use `pnpm` for all package operations. See `CONTRIBUTING.md` for contribution and release guidance, `SECURITY.md` for vulnerability reporting, and `LICENSE` for Apache-2.0 terms.
