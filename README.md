# Cradle

Open infrastructure for animated, programmable web characters. Cradle turns a site crawl and a Petdex spritesheet into a `<cradle-character>` custom element that lives on any website.

It is not a chatbot platform or a support widget. It gives your product a character. You decide what that character does.

## The product

Cradle Studio walks you through four steps:

1. **Connect a site** — Cradle crawls the public pages and pulls brand signals through OpenBrand.
2. **Review what it found** — you pick which pages describe the product.
3. **Pick a character** — choose an animated companion from the Petdex catalog (~4000+ sprites) and set its name and greeting.
4. **Go live** — paste one snippet into your site.

The result is a visual state machine. It transitions through `idle`, `greeting`, `listening`, `thinking`, `responding`, `resolved`, and `error` states based on events you send from your own code:

```js
// Listen to widget lifecycle events
window.addEventListener("cradle:ready",   (e) => console.log(e.detail.character));
window.addEventListener("cradle:open",    (e) => console.log("opened", e.detail));
window.addEventListener("cradle:close",   (e) => console.log("closed", e.detail));
window.addEventListener("cradle:state",   (e) => console.log("state →", e.detail.state));
window.addEventListener("cradle:action",  (e) => console.log("action →", e.detail.action));
window.addEventListener("cradle:move",    (e) => console.log("moved to", e.detail.position));
window.addEventListener("cradle:error",   (e) => console.error(e.detail.error));
```

Control it from the host page with the global `window.Cradle` controller:

```js
window.Cradle?.open();                               // open the panel
window.Cradle?.close();                              // close it
window.Cradle?.toggle();                             // toggle
window.Cradle?.setState("thinking");                 // drive the animation state
window.Cradle?.trigger({ type: "open-pricing" });    // emit a typed action event
window.Cradle?.setContext({ experiment: "v2" });     // attach page context to events
```

Each event's `detail` includes `siteId`, `visitorId`, `conversationId`, and `context`. The anonymous IDs live only for the lifetime of the element; the host application owns any persistence and authentication.

## Quick start

Requires Node.js 22+, pnpm, and a Neon (or any Postgres) database.

```sh
pnpm install
```

### Studio environment (`apps/studio/.env`)

```text
NEXT_PUBLIC_CRADLE_RUNTIME_URL=http://localhost:3002
DATABASE_URL=postgres://...
BETTER_AUTH_SECRET=<random 32-byte secret — same value in both apps>
BETTER_AUTH_URL=http://localhost:3000
CRADLE_RUNTIME_URL=http://localhost:3002
```

### Runtime environment (`apps/runtime/.env`)

```text
DATABASE_URL=postgres://...             # same DB as Studio
FIRECRAWL_API_KEY=fc-...
BETTER_AUTH_SECRET=<same value as Studio>
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_RUNTIME_URL=http://localhost:3002
```

### Migrate the database

Drizzle manages both Cradle domain tables and Better Auth tables:

```sh
# Push schema directly to Neon (or your Postgres DB)
pnpm --filter @cradle/db db:push
```

### Start

```sh
pnpm dev
```

Opens Studio at `http://localhost:3000` and Runtime at `http://localhost:3002`. The widget build watcher runs in parallel.

## Install on a site

Studio generates this snippet after you finish setup:

```html
<script src="https://your-runtime.com/widget.js"></script>
<cradle-character
  site-id="YOUR_PROJECT_ID"
  api-base="https://your-runtime.com"
></cradle-character>
```

Drop `placement="inline"` to embed it in the page layout instead of floating:

```html
<aside class="product-guide">
  <cradle-character
    site-id="YOUR_PROJECT_ID"
    api-base="https://your-runtime.com"
    placement="inline"
  ></cradle-character>
</aside>
```

The site ID is public and safe to embed. The manifest is intentionally public to the installation's registered origin; it contains only the character configuration and public sprite asset URLs.

The widget never writes browser storage. Its anonymous `visitorId` and `conversationId` are generated when the element connects and included in browser events for that element's lifetime.

## Repository structure

| Package | Role |
|---|---|
| `apps/studio` | Four-screen character setup workflow (Next.js 16, Better Auth) |
| `apps/runtime` | Onboarding API, knowledge management, manifest delivery, widget serving |
| `apps/video` | Remotion launch film (42s, optional ElevenLabs narration) |
| `packages/widget` | `<cradle-character>` custom element + `window.Cradle` controller (`@maranga/cradle`) |
| `packages/core` | Zod schemas shared across the monorepo |
| `packages/crawler` | Bounded Firecrawl ingestion (`crawlPublicSite`) |
| `packages/db` | Drizzle schema, migrations, `PostgresStore` / `MemoryStore` |
| `packages/pet` | Petdex sprite atlas validation and animation metadata |

## Runtime API reference

Studio uses Next.js Server Actions. They read the Studio Better Auth session cookie and forward it to Runtime; Runtime independently validates it with the shared Better Auth configuration. The browser never calls private Runtime routes or holds a bearer token. The widget manifest route (`GET /api/installations/:id`) is public but origin-scoped.

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/health` | DB + Firecrawl connectivity probe. Returns `{ ok, services }`. |
| `POST` | `/api/onboarding` | Crawl a site, provision an installation, extract brand profile. |
| `GET` | `/api/installations` | List the signed-in account's owned installations. |
| `GET` | `/api/installations/:id` | Public manifest for the embedded widget (origin-scoped). |
| `DELETE` | `/api/installations/:id` | Delete an installation owned by the signed-in account. |
| `PATCH` | `/api/installations/:id/settings` | Update character name, greeting, or brand profile. |
| `GET` | `/api/installations/:id/knowledge` | Fetch the current knowledge snapshot (Studio resume). |
| `PATCH` | `/api/installations/:id/knowledge` | Save the operator-reviewed page subset. |
| `GET` | `/api/installations/:id/companion` | Fetch the pinned companion package. |
| `PUT` | `/api/installations/:id/companion` | Download, validate, and pin a Petdex companion. |
| `GET` | `/api/companions/petdex` | Browse the full Petdex catalog with kind filter and search. |
| `GET` | `/widget.js` | The compiled `<cradle-character>` custom element. |

## Security model

- **Sessions** — Better Auth issues an HttpOnly Studio cookie. Every private Runtime route validates the forwarded cookie against the shared Postgres session table using the same `BETTER_AUTH_SECRET`.
- **Ownership** — every installation is bound to the `ownerId` of the account that created it. All write operations verify ownership before proceeding.
- **Browser boundary** — the Studio browser uses same-origin Server Actions only. The widget manifest route separately allows the installation's registered origin.

## Deployment

Deploy Studio and Runtime as separate Node.js services. Both need the same `DATABASE_URL` and `BETTER_AUTH_SECRET`.

```sh
# Apply schema migrations before starting
pnpm --filter @cradle/db db:migrate
```

Sprite assets are served directly from Petdex CDN. You do not need object storage for character animations.

## Development commands

```sh
pnpm check-types   # TypeScript across all packages
pnpm test          # vitest
pnpm build         # full production build
pnpm lint          # ESLint
```

Use `pnpm` for all dependency operations. See `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `NOTICE`, and `LICENSE` for contribution and security policy.
