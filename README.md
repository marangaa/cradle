# Cradle

Open infrastructure for animated, programmable web characters. Cradle turns a site crawl and a Petdex spritesheet into a `<cradle-character>` custom element that lives on any website.

It is not a chatbot platform or a support widget. It gives your product a character. You decide what that character does.

## The product

Cradle Studio walks you through four steps:

1. **Connect a site** — Cradle crawls the public pages and pulls brand signals through OpenBrand.
2. **Review what it found** — you pick which pages describe the product.
3. **Pick a character** — choose an animated companion from the Petdex catalog and set its name and greeting.
4. **Go live** — paste one snippet into your site.

The result is a visual state machine. It transitions through idle, listening, thinking, responding, resolved, and error states based on browser events:

```js
window.addEventListener("cradle:ready", (event) => console.log(event.detail));
window.addEventListener("cradle:state", (event) => console.log(event.detail.state));
window.addEventListener("cradle:action", (event) => console.log(event.detail.action));
```

You can control it from the host page:

```js
window.Cradle?.open();
window.Cradle?.setState("thinking");
window.Cradle?.trigger({ type: "open-pricing" });
window.Cradle?.setContext({ experiment: "homepage-v2" });
```

## Quick start

Requires Node.js 22+, PostgreSQL, a Gemini API key, and a Firecrawl API key.

```sh
pnpm install
cp apps/runtime/.env.example apps/runtime/.env.local
cp apps/studio/.env.example apps/studio/.env.local
docker compose up postgres -d
pnpm db:migrate
pnpm dev
```

Studio needs a database and Better Auth config in `apps/studio/.env.local`:

```text
DATABASE_URL=postgres://cradle:cradle@localhost:5432/cradle
BETTER_AUTH_SECRET=replace_with_a_random_32_byte_secret
BETTER_AUTH_URL=http://localhost:3000
```

Run Better Auth's table migration separately:

```sh
pnpm --dir apps/studio dlx auth@latest migrate
```

Set these in `apps/runtime/.env.local`:

```text
GOOGLE_GENERATIVE_AI_API_KEY=...
FIRECRAWL_API_KEY=...
DATABASE_URL=postgres://cradle:cradle@localhost:5432/cradle
CRADLE_WIDGET_TOKEN_SECRET=replace_with_a_random_32_byte_secret
CRADLE_STUDIO_ORIGIN=http://localhost:3000
CRADLE_MODEL_ID=gemini-2.5-flash
```

Open Studio at `http://localhost:3000`. The dev command starts Studio, Runtime, and the widget build watcher together.

## Install on a site

Studio generates this snippet after you finish setup:

```html
<script src="https://runtime.example/widget.js"></script>
<cradle-character
  site-id="YOUR_PROJECT_ID"
  api-base="https://runtime.example"
></cradle-character>
```

Drop `placement="inline"` to embed it in the page layout instead of floating:

```html
<aside class="product-guide">
  <cradle-character
    site-id="YOUR_PROJECT_ID"
    api-base="https://runtime.example"
    placement="inline"
  ></cradle-character>
</aside>
```

The site ID is public and safe to embed. The management key never reaches the browser.

The widget stores an anonymous visitor ID and conversation ID in first-party localStorage and includes both in browser events. Your application decides whether to persist or authenticate them.

## Repository

- `apps/studio` — the authenticated four-screen character workflow (Next.js 16).
- `apps/runtime` — onboarding API, knowledge management, character manifests, widget delivery.
- `packages/widget` — the `<cradle-character>` custom element and browser controller (`@maranga/cradle`).
- `packages/core` — Zod schemas shared across the monorepo.
- `packages/crawler` — bounded Firecrawl ingestion.
- `packages/db` — Drizzle schema, migrations, PostgreSQL store.
- `packages/pet` — Petdex sprite atlas validation and animation metadata.
- `apps/video` — Remotion launch film (42s, optional ElevenLabs narration).
- `deploy/` — Dockerfiles for Studio and Runtime.

## How Codex and GPT-5.6 were used

This project was built mostly in Codex with GPT-5.6. Here is where it mattered most:

**The Studio UI and widget were generated in early Codex sessions.** The four-screen flow, the character preview, and the custom element all started as single-file Codex outputs. We iterated on them in the chat, adding state management and API calls as we went.

**The Remotion video was also written with Codex.** The five scenes, the character orb animation, the timing — all generated and tweaked through prompts. The ElevenLabs voiceover was generated separately and stitched in afterward.

**The sprite atlas validation and compositing logic** (`packages/pet`) was written by describing the Petdex format to Codex and having it produce the Sharp pipeline, chroma-key removal, and cell dimension checks. The thresholds and validation rules came from testing against actual Petdex spritesheets.

**Parts we wrote by hand.** The runtime security layer (HMAC widget tokens, management key hashing, CORS validation), the database store abstractions, and the asset path traversal protection. Those needed more care than we trusted the model to get right on the first pass.

**What the model struggled with.** Multi-file refactoring. The monorepo structure had to be reorganized manually a few times. The sprite validation needed several rounds of testing against real data before the pixel-level checks were reliable. And the video timing (matching narration audio to scene cuts) had to be adjusted by hand.

## Deployment

Deploy Studio and Runtime as separate Node.js services. Runtime needs PostgreSQL and the environment variables above.

```sh
pnpm --filter @cradle/db db:migrate
```

For a local full stack: `pnpm dev:docker`. This starts PostgreSQL, runs migrations, and boots Studio and Runtime.

Sprite assets are served directly from Petdex. You do not need an S3 bucket or file system for character animations.

## Development

```sh
pnpm check-types
pnpm test
pnpm build
```

Use pnpm for all dependency operations. See CONTRIBUTING.md, SECURITY.md, CODE_OF_CONDUCT.md, NOTICE, and LICENSE for contribution and security policy details.
