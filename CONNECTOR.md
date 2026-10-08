# Connecting a backend to the Cradle widget

Cradle's widget (`@maranga/cradle`, 0.2.0) talks to any backend that speaks the **AI SDK UI message stream**. Cradle's own runtime and [Qualra](https://www.qualra.xyz) are two such backends. This page is the contract.

## 1. Endpoints

| Call | Purpose |
|---|---|
| `GET {api-base}/api/installations/{site-id}` | Manifest: character, greeting, **disclosure**, sprite atlas |
| `POST {chat-endpoint}` (default `{api-base}/api/chat`) | One chat turn, streamed |

`chat-endpoint` is optional; set it (attribute `chat-endpoint`, or `data-chat-endpoint` on the script tag) when your chat URL carries extra query parameters, for example Qualra's `/api/chat?key=<key>`. The `/api/chat/init` call used by 0.1.x is gone: greeting and disclosure come from the manifest.

### Manifest

```json
{
  "character": { "displayName": "Ada", "greeting": "Hi! Ask me anything.", "theme": "minimal" },
  "disclosure": "You're chatting with Ada, an AI assistant for the Acme team. Conversations are shared with the team to improve the product.",
  "assets": { "atlas": { "url": "/sprites/ada.png", "columns": 8, "rows": 9, "stateRows": {} } }
}
```

`disclosure` is shown in the panel at all times. If absent, the widget shows "You're chatting with an AI assistant, not a person." There is no way to hide it.

## 2. Request

The widget uses the AI SDK's `DefaultChatTransport` (built on `AbstractChat`), so the request is the standard one: `POST`, JSON body `{ id, messages, trigger, messageId, ... }` where `messages` are `UIMessage`s (`parts: [{ type: "text", text }]`), plus Cradle's extra body fields:

```json
{ "installationId": "<site-id>", "visitorId": "<anonymous id>",
  "clientContext": { "telemetry": [], "frictionReport": {}, "posthogSessionId": "", "sessionReplayUrl": "", "currentUrl": "" } }
```

Your backend may use only the last message and keep history itself (Qualra does).

### Identity headers

| Header | Meaning |
|---|---|
| `x-cradle-installation-id` | The site id (public embed key) |
| `x-cradle-visitor` | Random anonymous id from the visitor's localStorage. Canonical name |
| `x-cradle-visitor-id` | Same value; legacy spelling still sent for 0.1.x backends |
| `x-cradle-user-id` | Host-asserted user id (only when the host sets `user-id`) |
| `x-cradle-user-hash` | Host-computed signature of the user id |
| `x-cradle-user-email`, `x-cradle-user-name` | Optional, host-asserted. The hash proves the user id, not the mailbox: a backend should treat the email as an unconfirmed claim (Qualra emails it a confirmation link before any consent) |

User header values are percent-encoded UTF-8 (`encodeURIComponent`); decode them. If your backend is cross-origin, list all of these in `Access-Control-Allow-Headers`.

### Verified users (backend responsibility)

The widget cannot verify identity. The host's **server** computes

```
user-hash = hex( HMAC-SHA256( workspaceSecret, userId ) )
```

and renders `user-id` and `user-hash` into the page. The backend recomputes the HMAC and compares in constant time. **An unverified `user-id` must be ignored** (fall back to the anonymous visitor id). Never put the secret in the browser. Qualra generates and rotates the secret in dashboard settings.

Attributes (or `data-*` on the script tag): `user-id`, `user-hash`, `user-email`, `user-name`. At runtime: `window.Cradle.setUser({ id, hash, email, name })` or `setUser(null)`. Chat history in localStorage is keyed per user.

## 3. Response: UI message stream

Standard `text-*` chunks render as the assistant message. Two **data parts** drive the character and the page:

### `data-emote`

```json
{ "type": "data-emote", "data": { "emote": "waving" }, "transient": true }
```

`emote` is one of the nine states: `idle, running-right, running-left, waving, jumping, failed, waiting, running, review`.

### `data-widget_guide` (spotlight)

The widget highlights page elements with driver.js. Steps identify elements by **what a person can see**, not by CSS selector. Alias type: `data-guide`.

```json
{ "type": "data-widget_guide", "transient": true,
  "data": { "steps": [ {
    "label": "Export CSV",
    "title": "Export your data",
    "description": "Click here to download everything as CSV.",
    "role": "button",
    "side": "bottom",
    "align": "center"
  } ] } }
```

- `label` (required): the element's visible text or accessible name (text content, `aria-label`, `<label>`, placeholder, button value, `title`). Matching ignores case and whitespace, prefers exact over prefix over substring, and only considers visible elements. The label is never evaluated as a selector or XPath.
- `title`, `description` (required): popover copy.
- `role` (optional): `button | link | input | tab | checkbox | menuitem | heading | any`.
- `side`, `align` (optional).
- `element` is accepted as a legacy alias of `label`. Max 8 steps. Steps whose element is not found are skipped.

A tool part named `tool-widget_guide` whose `input` has the same `{ steps }` shape is also honored (each call runs once). Transient data parts are delivered through the SDK's `onData` and are not stored in message history.

## 4. Embedding

```html
<script src="https://unpkg.com/@maranga/cradle@0.2.0/dist/widget.iife.js"
        data-site-id="<key>" data-api-base="https://your-backend"
        data-chat-endpoint="https://your-backend/api/chat?key=<key>"
        data-user-id="42" data-user-hash="<server-computed>"
        async defer></script>
```

Every attribute in the README table can be set as `data-*` on the script tag. Note: `api-base` can no longer be inferred when the script is served from a CDN, so set `data-api-base`.

## 5. Local development build

```
pnpm --filter @maranga/cradle build      # outputs packages/widget/dist/widget.iife.js
npx serve packages/widget/dist -l 4173   # any static server, CORS enabled
```

In Qualra set `NEXT_PUBLIC_CRADLE_WIDGET_URL=http://localhost:4173/widget.iife.js`. 0.2.0 is not published; publish it (`npm publish` in `packages/widget`) before deploying Qualra with the pinned `0.2.0` CDN URL.
