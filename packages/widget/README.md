# @maranga/cradle

`@maranga/cradle` registers `<cradle-character>` — a framework-free, animated web-companion
custom element with a **working AI chatbot built in by default**: site-knowledge search over
your installation's crawled pages, plus per-visitor memory that persists across visits. Paste
one script tag and it works immediately, no backend of your own required.

It's also fully composable if you don't want that. The character's panel is a real `<slot>` —
put your own chat UI inside it, point it at your own backend entirely, and Cradle just reflects
whatever state you tell it to. Both modes are real and covered below; nothing about one requires
the other.

## Installation

**Script tag (simplest — single line, nothing else):**

```html
<script src="https://your-runtime.example.com/widget.js" data-site-id="YOUR_INSTALLATION_ID"></script>
```

That's the whole embed. The script reads `data-site-id` off itself and auto-mounts the
character, with the default chatbot already wired to that installation's crawled knowledge. The
API origin is inferred from the script's own `src` — you never need to type it out separately.

**npm / bundlers:**

```sh
pnpm add @maranga/cradle
```

```tsx
import "@maranga/cradle"; // registers <cradle-character> and window.Cradle

<cradle-character site-id="YOUR_INSTALLATION_ID" api-base="https://your-runtime.example.com" />
```

`api-base` is required here (and only here) — there's no `<script src>` for the browser to
infer an origin from when the widget arrives via a bundler instead of a script tag.

For calling the controller from your own code (rather than reaching through `window`), there's
also a named export:

```ts
import { Cradle } from "@maranga/cradle";

Cradle?.setState("review");
```

Always optional-chain it. This package is safe to `import` from anywhere — including a Next.js
Server Component's module graph, where it's genuinely never going to run in a browser — and in
that case `Cradle` (and `window.Cradle`) are simply `undefined` rather than throwing. The one
thing that's still on you: mark the file that actually *uses* `Cradle`/`<cradle-character>` with
`"use client"`, same as any other component touching browser-only state.

---

## The default chatbot

With nothing else configured, opening the character gives visitors a real chat interface — an
input, streamed responses, and a greeting personalized from Studio's onboarding crawl. It's
backed by:

- **Site-knowledge search** — vector similarity search over whatever pages you approved during
  Studio's onboarding, so answers are grounded in your actual content, not the model's general
  knowledge of your industry.
- **Per-visitor memory** — the agent can choose to remember specific facts about the visitor
  it's talking to (their name, role, what they asked about) and recall them on a later visit.
  This is real server-side persistence, keyed to that visitor's ID — not the same thing as the
  visible chat transcript (see below).
- **A visitor identity in `localStorage`**, not a cookie — generated client-side the moment the
  element connects. Deliberate: a cookie set by the runtime's response is a third-party cookie
  from the embedding site's perspective (the request is genuinely cross-origin), and Safari's
  ITP blocks third-party cookie storage outright, with Chrome moving the same direction.
  `localStorage` on the embedding site's own origin sidesteps that.
- **The visible transcript is cached in that browser only.** Reopening the character on the same
  browser shows the earlier conversation; a different device starts fresh, even though the
  *structured facts* the agent remembered persist server-side regardless of device. Don't
  describe this to end users as "picks up your conversation anywhere" — it doesn't, on purpose,
  for v1.
- **A free-tier cap** — 99 conversations per installation per rolling 30 days. Past that, the
  chat backend returns 429 until the period rolls over.

7 built-in visual themes ship with it — set via the `theme` attribute, or picked in Studio and
delivered through the manifest automatically:

`neobrutalist` (default) · `modern` · `cyberpunk` · `terminal` · `minimal` · `synthwave` · `paper`

```html
<cradle-character site-id="..." theme="cyberpunk"></cradle-character>
```

Or override individual colors without picking a whole theme:

```html
<cradle-character site-id="..." accent-color="#6366f1" bg-color="#0f172a" text-color="#f8fafc"></cradle-character>
```

---

## The 9 real animation states

There is no invented state vocabulary. Every animation state maps to one actual row of the
character's spritesheet, using Petdex's own canonical convention:

| State | Row purpose |
|---|---|
| `idle` | Neutral breathing / blinking loop |
| `waving` | Greeting or attention gesture |
| `review` | Focused inspecting / thinking loop |
| `running` | Generic in-place run loop |
| `running-right` / `running-left` | Directional locomotion |
| `jumping` | Celebration — anticipation, lift, peak, descent |
| `failed` | Readable error / sad reaction |
| `waiting` | Patient idle variant |

`window.Cradle.setState(state)` and `resolveAction(success)` (a shortcut for
`setState("jumping")` / `setState("failed")`) only ever accept these 9. Nothing else exists to
set — if you're picturing states like "thinking" or "responding," that's just `review` and
`running` under different names; use the real ones.

**Default behavior:** when nothing is being explicitly driven, the character auto-cycles through
all 9 states as an idle showcase — *unless* the default chatbot is active, in which case it's
already driving real state (`review` while sending, `jumping`/`failed` on response) and the
showcase never starts. If you're bringing your own backend instead, add `no-cycle` yourself so
your real signal doesn't compete with decorative cycling:

```html
<cradle-character site-id="..." no-cycle="">...</cradle-character>
```

---

## `window.Cradle` — the global controller

```ts
window.Cradle?.open();                              // open the panel, trigger a wave
window.Cradle?.close();                              // close it
window.Cradle?.toggle();

window.Cradle?.setState("review");                   // switch to one of the 9 real states
window.Cradle?.resolveAction(true);                  // -> jumping (success)
window.Cradle?.resolveAction(false);                 // -> failed

window.Cradle?.trigger({ type: "open-pricing" });    // emit a cradle:action event for your own code to handle
window.Cradle?.setContext({ userPlan: "pro" });      // attach page metadata to future events
```

Every method takes an optional trailing `siteId` if you have more than one `<cradle-character>`
on the page.

---

## Events

```ts
window.addEventListener("cradle:ready", (e: CustomEvent) => { /* e.detail.character */ });
window.addEventListener("cradle:open", (e: CustomEvent) => { /* the avatar was clicked */ });
window.addEventListener("cradle:close", (e: CustomEvent) => { /* … */ });
window.addEventListener("cradle:state", (e: CustomEvent) => { /* e.detail.state */ });
window.addEventListener("cradle:action", (e: CustomEvent) => { /* e.detail.action, from trigger() */ });
window.addEventListener("cradle:error", (e: CustomEvent) => { /* e.detail.error */ });
```

`detail` includes `siteId`, `visitorId`, the current `state`, whether the panel is `open`, and
any `context` you've set. Every event fires both on `window` and on the `<cradle-character>`
element itself (`bubbles: true, composed: true`), so you can listen wherever's convenient.

Note: tool activity from the default chatbot (a knowledge search running, a fact being
remembered) isn't currently surfaced as its own event — the character reflects only the
coarse-grained request lifecycle (`review` while waiting, `jumping`/`failed` on completion), not
per-tool-call detail.

---

## Bringing your own backend instead

Replace the default chatbot entirely by rendering your own content as a child of
`<cradle-character>` — it projects into the character's panel via a native `<slot>`, so Cradle
keeps owning position/open-close/chrome and you own everything inside it:

```tsx
"use client";
import "@maranga/cradle";

function MyChatUI() {
  // your own component: input, message bubbles, whatever you want — this is real JSX
  // rendered as a child of <cradle-character>, not something Cradle knows about, and the
  // default chatbot never runs since the slot isn't empty.
}

export function Companion() {
  return (
    <cradle-character site-id="YOUR_INSTALLATION_ID" no-cycle="">
      <MyChatUI />
    </cradle-character>
  );
}
```

If you render nothing inside `<cradle-character>`, that's exactly what the plain script-tag
embed does — the default chatbot fills the slot instead. Adding children is what opts out of it.

**The pattern for driving state yourself** — called directly from your own code at the moment
each thing actually happens, not from an effect watching status after the fact:

```ts
const { messages, sendMessage } = useChat({
  transport: new DefaultChatTransport({ api: "https://my-api.example.com/chat" }),
  onFinish: () => window.Cradle?.resolveAction(true),
  onError: () => window.Cradle?.resolveAction(false),
});

function handleSubmit(text: string) {
  window.Cradle?.setState("review");
  sendMessage({ text });
}
```

Three lines touch Cradle. Everything else — the endpoint, the messages, the rendering — is
entirely yours, and Cradle never needs to change to support it. Works identically whether your
backend is same-origin, a different domain entirely, or someone else's already-deployed API —
Cradle never makes the request and never sees the response, it only reflects the outcome you
tell it about.

---

## Attributes

| Attribute | Required | Description |
|---|---|---|
| `site-id` | Yes | UUID of your Cradle installation |
| `api-base` | Only without a `<script src>` | Runtime origin; auto-inferred when loaded via script tag |
| `placement` | No | `"floating"` (default) or `"inline"` |
| `no-cycle` | No | Boolean attribute (presence = on). Disables the idle showcase — the default chatbot already sets this implicitly; set it yourself if you're bringing your own backend |
| `theme` | No | One of `neobrutalist` (default) `modern` `cyberpunk` `terminal` `minimal` `synthwave` `paper` — overrides whatever theme was picked in Studio |
| `accent-color` / `primary-color` | No | Overrides the theme's accent color |
| `bg-color` | No | Overrides the theme's background color |
| `text-color` | No | Overrides the theme's text color |
