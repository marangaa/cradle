# @maranga/cradle

`@maranga/cradle` registers `<cradle-character>` — a framework-free, animated web-companion
custom element. It owns exactly one thing: **the character** (sprite animation, the floating
bubble/panel chrome, open/close). It has no opinion about chat, LLMs, or backends — those are
yours to bring, and this doc shows you how to wire them in.

## Installation

**Script tag (simplest — single line, nothing else):**

```html
<script src="https://your-runtime.example.com/widget.js" data-site-id="YOUR_INSTALLATION_ID"></script>
```

That's the whole embed. The script reads `data-site-id` off itself and auto-mounts the
character. The API origin is inferred from the script's own `src` — you never need to
type it out separately.

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

---

## The 9 real states

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

**Default behavior:** when nothing is being explicitly driven, the character auto-cycles
through all 9 states as an idle showcase. Add the `no-cycle` attribute to turn this off for
embeds that drive real state themselves (see "Composing with your own backend" below) — mixing
decorative cycling with a real signal just makes the real signal harder to read.

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

Every event fires both on `window` and on the `<cradle-character>` element itself
(`bubbles: true, composed: true`), so you can listen wherever's convenient.

---

## Composing with your own backend — the actual point of this package

Cradle doesn't know or care what's driving it. That's deliberate: you get to plug in whatever
you already have — a REST endpoint, an LLM route on a completely different domain, a
WebSocket, anything — without Cradle needing to understand any of it.

**The pattern is always the same three touch points**, called directly from your own code, at
the moment each thing actually happens (not from an effect watching state after the fact):

```ts
// 1. Right when a request goes out
window.Cradle?.setState("review");

// 2a. On success (e.g. a fetch/stream onFinish, or an SDK's onFinish callback)
window.Cradle?.resolveAction(true);

// 2b. On failure (onError)
window.Cradle?.resolveAction(false);
```

That's the entire contract. It works identically whether your backend is same-origin, a
different domain entirely, a serverless function, or someone else's already-deployed API —
Cradle never makes the request and never sees the response, it only reflects the outcome you
tell it about.

### Putting your own UI inside the character's panel

`<cradle-character>` projects its light-DOM children into the panel via a native `<slot>` — so
your own chat UI (or anything else) can render *inside* Cradle's floating chrome, with Cradle
owning position/open-close and you owning the content:

```tsx
"use client";
import "@maranga/cradle";

function MyChatUI() {
  // your own component: input, message bubbles, whatever you want — this is real JSX
  // rendered as a child of <cradle-character>, not something Cradle knows about.
}

export function Companion() {
  return (
    <cradle-character site-id="YOUR_INSTALLATION_ID" no-cycle="">
      <MyChatUI />
    </cradle-character>
  );
}
```

If you render nothing inside `<cradle-character>`, the default greeting bubble shows instead —
adding children is fully opt-in and doesn't require anything else to change.

A minimal real example — wiring a chat hook's own lifecycle callbacks directly, no `useEffect`:

```tsx
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
entirely yours, and Cradle never needs to change to support it.

---

## Attributes

| Attribute | Required | Description |
|---|---|---|
| `site-id` | Yes | UUID of your Cradle installation |
| `api-base` | Only without a `<script src>` | Runtime origin; auto-inferred when loaded via script tag |
| `placement` | No | `"floating"` (default) or `"inline"` |
| `no-cycle` | No | Boolean attribute (presence = on). Disables the idle showcase — use whenever you're driving real state via `setState`/`resolveAction` |
