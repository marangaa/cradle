# Cradle

Open infrastructure for adding a persistent website representative to any public site. Cradle crawls reviewed public content, produces one portable custom element, and streams grounded conversations through a provider-neutral runtime.

Qualra Cloud runs the same contract as managed infrastructure and can forward verified conversations into Qualra's relationship intelligence. Cradle itself does not prescribe a sales, support, or research workflow.

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

## Repository

- `apps/studio` — URL onboarding and installation snippet.
- `apps/runtime` — crawl onboarding, installation, streaming, and widget delivery.
- `apps/site` — integration target for local verification.
- `packages/widget` — framework-free `cradle-resident` custom element.
- `packages/crawler` — bounded, same-origin Firecrawl ingestion.
- `packages/core` — Zod contracts shared by every deployment.
- `packages/db` — store contract and development-only memory store.

## Operations

`docker compose up --build` starts the local stack, including Postgres, Redis, and MinIO for the forthcoming durable adapters. The runtime currently uses the development `MemoryStore`; restarting it clears installations, knowledge, and conversations. That makes this repository safe to evaluate and extend, **not yet a production-ready self-host deployment**. Do not put customer traffic on it until the Postgres/object-store adapter and credential management are completed.

The crawler is deliberately public, same-domain, bounded (20 pages by default), and leaves Firecrawl's robots behavior enabled. Content is returned as a snapshot for review; the remaining review/publish screen is the next product slice.

## Development

```sh
pnpm lint
pnpm check-types
pnpm --filter runtime build
```

Use `pnpm` for all package operations. See `CONTRIBUTING.md` for contribution and release guidance, `SECURITY.md` for vulnerability reporting, and `LICENSE` for Apache-2.0 terms.
