# Cradle

Open infrastructure for creating, hosting, and embedding animated, programmable characters on the web.

Cradle turns a reviewed public source bundle and a portable companion package into a Shadow-DOM custom element. It is open infrastructure: you control the crawler credentials, model provider, database, runtime behaviour, and visitor data in your deployment.

Cradle is **not** a customer-relationship platform and it is not a prebuilt sales or support bot. It gives your product an interaction surface. You decide what that surface can do.

## The product

Cradle Studio has four operator-controlled steps:

1. **Connect site** — run a bounded, same-origin public crawl and extract reviewable brand signals.
2. **Review knowledge** — explicitly approve the public pages that describe the company.
3. **Shape character** — set its name, welcome message, and animation package.
4. **Go live** — install one portable custom element on any website.

The generated widget is a visual state machine, not a static avatar or a chat widget. It moves through `idle`, `listening`, `thinking`, `responding`, `resolved`, and `error` states and exposes browser lifecycle events:

```js
window.addEventListener("cradle:ready", (event) => console.log(event.detail));
window.addEventListener("cradle:state", (event) => console.log(event.detail.state));
window.addEventListener("cradle:action", (event) => console.log(event.detail.action));
```

Use the browser controller to compose Cradle with your own UI:

```js
window.Cradle?.open();
window.Cradle?.setState("thinking");
window.Cradle?.trigger({ type: "open-pricing" });
window.Cradle?.setContext({ experiment: "homepage-v2" });
```

## Quick start

Cradle requires Node.js 22 or newer, PostgreSQL, a Gemini API key, and a Firecrawl API key.

```sh
pnpm install
cp apps/runtime/.env.example apps/runtime/.env.local
cp apps/studio/.env.example apps/studio/.env.local
docker compose up postgres -d
pnpm db:migrate
pnpm dev
```

Studio requires a database connection and Better Auth configuration in `apps/studio/.env.local`:

```text
DATABASE_URL=postgres://cradle:cradle@localhost:5432/cradle
BETTER_AUTH_SECRET=replace_with_a_random_32_byte_secret
BETTER_AUTH_URL=http://localhost:3000
```

Whether you deploy Cradle yourself or fork it, Studio uses the same Better Auth account system. Create Better Auth's required tables with its CLI rather than writing a migration by hand:

```sh
pnpm --dir apps/studio dlx auth@latest migrate
```

Open Studio at `http://localhost:3000`. The standard development command starts Studio, Runtime, and the widget build watcher.

Set the following in `apps/runtime/.env.local`:

```text
GOOGLE_GENERATIVE_AI_API_KEY=...
FIRECRAWL_API_KEY=...
DATABASE_URL=postgres://cradle:cradle@localhost:5432/cradle
CRADLE_WIDGET_TOKEN_SECRET=replace_with_a_random_32_byte_secret
CRADLE_STUDIO_ORIGIN=http://localhost:3000
CRADLE_MODEL_ID=gemini-2.5-flash
```

`CRADLE_DEVELOPMENT_EMBED_ORIGIN` is optional and works only during local development. It lets a local integration target use a source bundle crawled from a public URL.

## Install on a site

Studio generates this snippet after you approve sources and choose a companion:

```html
<script src="https://runtime.example/widget.js"></script>
<cradle-character
  site-id="YOUR_PROJECT_ID"
  api-base="https://runtime.example"
></cradle-character>
```

The host site controls placement. Omit `placement` for a draggable floating character, or render the element where it belongs in the page and set `placement="inline"`:

```html
<aside class="product-guide">
  <cradle-character
    site-id="YOUR_PROJECT_ID"
    api-base="https://runtime.example"
    placement="inline"
  ></cradle-character>
</aside>
```

The public project ID is safe to embed. The management credential is never included in the embed snippet or sent to visitors; the widget never receives it.

`@cradle/widget` is publishable as an Apache-2.0 IIFE package; its public asset is `@cradle/widget/widget.js`. Runtime delivery remains the default because it keeps the widget version aligned with the runtime contract.

The widget stores an anonymous visitor ID and conversation ID in the visitor's first-party browser storage, then includes both in emitted browser events. Your host application decides whether and how to persist or authenticate them.

Characters begin in the browser's bottom-right corner. Visitors can drag the character itself; Cradle stores that local position per installation in first-party browser storage. Its welcome message floats above the character without an enclosing chat window.

## Runtime behaviour

Cradle itself never assumes a sales, support, or chat workflow: compose the visual widget with your own tools, policies, model, and datastore while keeping the visual contract.

Cradle intentionally does not accept a raw customer identity from browser JavaScript. If your custom runtime needs authenticated context, issue and validate a short-lived assertion from your own backend.

## Brand profiles

Studio uses [OpenBrand](https://github.com/tight-studio/openbrand) as a best-effort, self-hostable source of public brand signals: name, colors, logos, and backdrop images. It never replaces the source review. Brand data is stored with the installation so an operator can use it to guide later character design and animation choices.

## Animation packages

Cradle reads the complete public Petdex manifest, lets an operator choose a character, validates its sprite atlas, and pins a deployment copy before publishing it. Studio preserves the character name and submitter attribution; Petdex assets remain owned by their submitters.

Petdex source code is MIT, but companion assets remain owned by their submitters. Self-hosted operators are responsible for selecting assets they are allowed to use; do not assume every community asset has commercial-use permission.

## Qualra

Qualra is a separate product. Cradle can link operators to Qualra when they need verified customer identity, long-term memory, and product learning, but Cradle never forwards conversation data to Qualra and does not require a Qualra account.

## Repository

- `apps/studio` — the authenticated four-screen character workflow.
- `apps/runtime` — crawl onboarding, reviewed knowledge, brand extraction, character manifests, and widget delivery.
- `packages/widget` — framework-free `<cradle-character>` custom element and browser API.
- `packages/core` — Zod contracts shared by Studio, Runtime, and custom deployments.
- `packages/crawler` — bounded Firecrawl ingestion.
- `packages/db` — Drizzle schema, migrations, and durable PostgreSQL store.
- `packages/pet` — sprite atlas validation and animation metadata.

## Deploy

Deploy Studio and Runtime as separate Node.js services, each from the same repository. Runtime needs PostgreSQL, persistent asset storage, and the environment variables above. Run the committed migration before a new Runtime release:

```sh
pnpm --filter @cradle/db db:migrate
```

For a local complete stack, run `pnpm dev:docker`. Docker starts PostgreSQL, migrations, Studio, and Runtime.

## Development

```sh
pnpm check-types
pnpm test
pnpm build
```

Use `pnpm` for all dependency operations. See `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `NOTICE`, and `LICENSE` for OSS contribution and security policy details.
