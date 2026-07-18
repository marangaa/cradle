# Cradle

Open infrastructure for adding a website representative to any public site. Cradle turns a company's public website into reviewable knowledge, ships one portable custom element, and streams grounded conversations through a provider-neutral runtime.

Qualra Cloud runs the same contract as managed infrastructure and can forward verified conversations into Qualra's relationship intelligence. Cradle itself does not prescribe a sales, support, or research workflow.

## Why Cradle

Companies currently stitch together a static chat widget, a separate knowledge base, and an internal relationship system. Cradle provides the shared interaction layer: an embeddable element with a stable visitor and conversation identity, an explicit knowledge snapshot, and a runtime contract that works the same way when self-hosted or operated by Qualra.

This is intentionally infrastructure, not another fixed "sales bot" or "support bot." Teams choose their instructions, tools, data stores, and workflow. Qualra Cloud is the managed path: it operates the runtime and can turn verified Cradle conversations into relationship memory and analysis.

## What works today

- Submit a public URL through Studio and run a bounded, same-origin Firecrawl crawl.
- Persist installations, knowledge snapshots, and conversation events to PostgreSQL when `DATABASE_URL` is configured.
- Generate an installation ID and embed the Shadow-DOM `cradle-resident` widget with one script tag.
- Maintain anonymous visitor and conversation IDs in the visitor's first-party browser storage.
- Reject chat requests whose browser origin does not match the installation's configured origin.
- Stream grounded answers through AI SDK and OpenAI (`CRADLE_MODEL_ID` defaults to `gpt-5.6-sol`).

## Quick start

```sh
pnpm install
cp apps/runtime/.env.example apps/runtime/.env.local
cp apps/studio/.env.example apps/studio/.env.local
docker compose up postgres -d
pnpm --filter @cradle/db db:migrate
pnpm --filter runtime dev
pnpm --filter studio dev
```

Next.js natively loads `.env.local` from each app directory. Set the OpenAI and Firecrawl keys in `apps/runtime/.env.local`; set Studio's public runtime URL in `apps/studio/.env.local`. The commands above start the local PostgreSQL service and apply the committed Drizzle migrations. Open Studio at `http://localhost:3000`, submit a public URL, then paste the generated snippet after reviewing the returned page snapshot.

To test a public crawl on a local website, set `CRADLE_DEVELOPMENT_EMBED_ORIGIN=http://localhost:3004` in Runtime's `.env.local`. It is honored only while Runtime runs in development mode, so production installations always use the crawled site's own origin.

```html
<script src="https://runtime.example/widget.js"></script>
<cradle-resident installation-id="YOUR_INSTALLATION" api-base="https://runtime.example"></cradle-resident>
```

The widget runs in a Shadow DOM, preserves a first-party anonymous visitor and conversation ID, and only the configured installation origin can use its chat endpoint.

## Deploy

Deploy `apps/runtime` with a managed PostgreSQL database and deploy `apps/studio` wherever you serve Next.js. Set Studio's `NEXT_PUBLIC_CRADLE_RUNTIME_URL` to the public runtime URL **before building Studio**. Runtime requires:

```text
OPENAI_API_KEY=...
FIRECRAWL_API_KEY=...
CRADLE_MODEL_ID=gpt-5.6-sol
CRADLE_STUDIO_ORIGIN=https://your-studio.vercel.app
DATABASE_URL=postgres://...
```

Run `pnpm --filter @cradle/db db:migrate` as the release migration command before starting a new runtime version. Then open Studio, enter the exact public Qualra origin (for example, `https://qualra.example`), and paste the generated snippet into that site. The installation origin must exactly match the browser origin: `www` and non-`www` are different origins.

The runtime falls back to memory only when `DATABASE_URL` is intentionally omitted for a throwaway local experiment. Never use that mode for a hosted installation.

## Repository

- `apps/studio` — URL onboarding and installation snippet.
- `apps/runtime` — crawl onboarding, installation, streaming, and widget delivery.
- `apps/site` — integration target for local verification.
- `packages/widget` — framework-free `cradle-resident` custom element, compiled and served by Runtime at `/widget.js`.
- `packages/crawler` — bounded, same-origin Firecrawl ingestion.
- `packages/core` — Zod contracts shared by every deployment.
- `packages/db` — Drizzle schema, versioned migrations, and durable store adapter.

## Operations

For the Docker path, copy `compose.env.example` to the root `.env` once, then run `docker compose up --build`. Compose loads that file directly into Runtime and Worker, applies the committed database migrations, then starts Studio, Runtime, and the durable identity worker. PostgreSQL and generated assets are retained in the `cradle-postgres` and `cradle-assets` volumes; use `docker compose down -v` only when you deliberately want to erase local data. The runtime does not create or alter tables itself.

PostgreSQL persistence is now in place, but this is **not yet a production-ready customer deployment**. Do not put customer traffic on it until encrypted configuration, per-installation credentials, rate limiting, the asset review/publish workflow, and operational monitoring are complete.

The crawler is deliberately public, same-domain, bounded (20 pages by default), and leaves Firecrawl's robots behavior enabled. Content is returned as a snapshot for review; the remaining review/publish screen is the next product slice.

## Development

```sh
pnpm lint
pnpm check-types
pnpm --filter runtime build
```

Use `pnpm` for all package operations. See `CONTRIBUTING.md` for contribution and release guidance, `SECURITY.md` for vulnerability reporting, and `LICENSE` for Apache-2.0 terms.
