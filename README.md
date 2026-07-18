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
- Choose a companion from Cradle's curated Petdex catalog after approving the website source bundle.
- Download, validate, checksum, and pin one Codex-compatible `spritesheet.webp` to the installation rather than hotlinking an upstream asset.
- Persist the companion's Petdex provenance alongside the immutable imported asset on a shared self-hosted volume.
- Maintain anonymous visitor and conversation IDs in the visitor's first-party browser storage.
- Reject chat requests whose browser origin does not match the installation's configured origin.
- Stream grounded answers through AI SDK and OpenAI (`CRADLE_MODEL_ID` defaults to `gpt-5.6-sol`).

## Flow

1. **Discover:** Studio runs a bounded public crawl; the owner saves a selected page subset as the immutable reviewed source version.
2. **Choose:** Studio lists only Petdex-curated companions. The owner chooses one 8×9 spritesheet package.
3. **Bundle:** Runtime downloads, validates, checksums, and pins the selected spritesheet with its Petdex source metadata.
4. **Embed:** The website loads the imported package and maps visitor activity to its animation rows.

Studio management routes require the installation key shown once at onboarding. Cradle stores only its SHA-256 hash; save the original in a password manager and never place it in the embed snippet or client site. Self-hosted operators can rotate a lost key directly in their database today; Cradle Cloud will bind installations to Qualra accounts rather than relying on this bootstrap credential.

## Quick start

```sh
pnpm install
cp apps/runtime/.env.example apps/runtime/.env.local
cp apps/studio/.env.example apps/studio/.env.local
docker compose up postgres -d
pnpm --filter @cradle/db db:migrate
pnpm dev
```

Next.js natively loads `.env.local` from each app directory. Set the OpenAI and Firecrawl keys in `apps/runtime/.env.local`; set Studio's public runtime URL in `apps/studio/.env.local`. The Worker loads the Runtime environment with `dotenv`, so the local backend uses one configuration file. The commands above start the local PostgreSQL service, apply the committed Drizzle migrations, then launch Studio (`3000`), Runtime (`3002`), and Worker. Open Studio at `http://localhost:3000`, approve the returned page snapshot, choose a curated Petdex companion, then paste the install snippet into your site.

Set `CRADLE_WIDGET_TOKEN_SECRET` to a random 32-byte secret in every production Runtime deployment. Runtime mints five-minute, origin-bound bearer tokens from the widget manifest endpoint; chat rejects requests without one.

To test a public crawl on a local website, set `CRADLE_DEVELOPMENT_EMBED_ORIGIN=http://localhost:3004` in Runtime's `.env.local`. It is honored only while Runtime runs in development mode, so production installations always use the crawled site's own origin.

```html
<script src="https://runtime.example/widget.js"></script>
<cradle-resident
  installation-id="YOUR_INSTALLATION"
  api-base="https://runtime.example"
></cradle-resident>
```

The widget runs in a Shadow DOM, preserves a first-party anonymous visitor and conversation ID, and only the configured installation origin can use its chat endpoint. Its public character package is available at `/api/installations/:id/pet` and follows the portable `pet.json` + `spritesheet.webp` convention used by Codex-compatible pets.

## Companion packages

Cradle uses the same practical asset shape as Codex pets: a transparent `1536`-pixel-wide WebP atlas with 192×208 cells and at least nine base rows. Cradle maps website events to the relevant rows (`idle`, `waving`, `review`, `running`, `jumping`, and `failed`) rather than treating the image as a static chatbot avatar. Extended Petdex sheets are preserved and their extra rows remain available for future mappings.

Studio currently uses only Petdex assets hosted under its curated collection. Community-submitted assets are intentionally excluded because each creator retains its own asset rights. Runtime imports the selected WebP into Cradle storage, verifies its 8×9 geometry, and records the source URL, submitter, Petdex metadata URL, and checksum. It does not hotlink the live widget to Petdex.

## Deploy

Deploy `apps/runtime` with a managed PostgreSQL database and deploy `apps/studio` wherever you serve Next.js. Set Studio's `NEXT_PUBLIC_CRADLE_RUNTIME_URL` to the public runtime URL **before building Studio**. Runtime requires:

```text
OPENAI_API_KEY=...
FIRECRAWL_API_KEY=...
CRADLE_MODEL_ID=gpt-5.6-sol
CRADLE_WIDGET_TOKEN_SECRET=replace_with_a_random_32_byte_secret
CRADLE_STUDIO_ORIGIN=https://your-studio.vercel.app
DATABASE_URL=postgres://...
```

Run `pnpm --filter @cradle/db db:migrate` as the release migration command before starting a new runtime version. Then open Studio, enter the exact public Qualra origin (for example, `https://qualra.example`), and paste the generated snippet into that site. The installation origin must exactly match the browser origin: `www` and non-`www` are different origins.

The runtime falls back to memory only when `DATABASE_URL` is intentionally omitted for a throwaway local experiment. Never use that mode for a hosted installation.

## Repository

- `apps/studio` — URL onboarding, source review, curated companion selection, and install handoff.
- `apps/runtime` — crawl onboarding, companion import, installation management, streaming, companion delivery, and widget delivery.
- `apps/worker` — legacy durable identity and custom-atlas generation jobs; Studio no longer invokes this path.
- `packages/widget` — framework-free `cradle-resident` custom element, compiled and served by Runtime at `/widget.js`.
- `packages/crawler` — bounded, same-origin Firecrawl ingestion.
- `packages/core` — Zod contracts shared by every deployment.
- `packages/db` — Drizzle schema, versioned migrations, and durable store adapter.
- `packages/jobs` — Postgres-backed job contracts shared by Runtime and Worker.
- `packages/media` — immutable filesystem and S3-compatible asset stores, plus storage safety tests.
- `packages/pet` — atlas geometry, chroma cleanup, frame validation, composition, and state metadata.

## Operations

For the complete Docker stack, configure `apps/runtime/.env` or `apps/runtime/.env.local`, then run `pnpm dev:docker`. Docker ignores host dependencies and build artifacts, prunes the monorepo to each service's dependency graph, then builds Studio, Runtime, Worker, and migrations independently. Compose loads the existing Runtime configuration directly into Runtime and Worker, applies the committed database migrations, then starts the services. PostgreSQL and generated assets are retained in the `cradle-postgres` and `cradle-assets` volumes; use `pnpm dev:docker:down -v` only when you deliberately want to erase local data. The runtime does not create or alter tables itself.

The core review/import pipeline is now in place, but this is **not yet a production-ready customer deployment**. Do not put customer traffic on it until owner accounts/key recovery, encrypted secrets, rate limiting, automated asset QA, and operational monitoring are complete.

Self-hosted deployments use the shared local `cradle-assets` volume by default. Managed deployments can set `CRADLE_ASSET_STORAGE=s3` and provide S3-compatible credentials; this supports AWS S3, Cloudflare R2, or MinIO without changing the asset contract.

The crawler is deliberately public, same-domain, bounded (20 pages by default), and leaves Firecrawl's robots behavior enabled. Content is returned as a snapshot for review before it becomes part of the installed runtime bundle.

## Development

```sh
pnpm lint
pnpm check-types
pnpm turbo run build --filter=runtime
```

Use `pnpm` for all package operations. See `CONTRIBUTING.md` for contribution and release guidance, `SECURITY.md` for vulnerability reporting, and `LICENSE` for Apache-2.0 terms.
