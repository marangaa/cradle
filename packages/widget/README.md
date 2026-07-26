# @maranga/cradle

`@maranga/cradle` registers the framework-free `<cradle-character>` custom element for animated, programmable web companions.

## Installation

```sh
pnpm add @maranga/cradle
```

```ts
import "@maranga/cradle"; // Registers <cradle-character> in customElements & window.Cradle
```

Or load the pre-bundled script directly via CDN / Runtime:

```html
<script src="http://localhost:3002/widget.js"></script>
<cradle-character site-id="YOUR_INSTALLATION_ID" api-base="http://localhost:3002"></cradle-character>
```

---

## Developer Animation State Primitives

Drive character visual states dynamically using `window.Cradle.setState(state)`:

| Developer Primitive | State Description | Use Case / Backend Trigger |
|---|---|---|
| `"idle"` | Default standing / waiting state | Default state when inactive |
| `"greeting"` | Welcome wave | Visitor lands on site or opens companion |
| `"listening"` | Attentive / focused state | Visitor is typing input or submitting a query |
| `"thinking"` | Processing / running state | AI engine querying database, tools, or memory |
| `"responding"` | Outputting / speaking state | AI engine streaming response to visitor |
| `"resolved"` | Victory / task complete | Action succeeded or milestone completed |
| `"error"` | Dizzy / error fallback | Failure, timeout, or network exception |

---

## Global Controller API (`window.Cradle`)

Control any connected character from your host application code:

```ts
// Control speech card popover
window.Cradle?.open();               // Open floating speech card & trigger greeting
window.Cradle?.close();              // Close floating speech card & return to idle
window.Cradle?.toggle();             // Toggle open/closed state

// Drive visual state machine
window.Cradle?.setState("thinking");                 // Switch to thinking state
window.Cradle?.setState("responding");               // Switch to responding state
window.Cradle?.trigger({ type: "open-pricing" });    // Emit custom action event to host app
window.Cradle?.setContext({ userPlan: "pro" });       // Attach page metadata context
```

---

## Listening to Events

Listen to character lifecycle events on `window` or the DOM element:

```ts
window.addEventListener("cradle:ready", (e: CustomEvent) => {
  console.log("Character manifest loaded:", e.detail.character);
});

window.addEventListener("cradle:open", (e: CustomEvent) => {
  console.log("Companion clicked by visitor:", e.detail);
});

window.addEventListener("cradle:state", (e: CustomEvent) => {
  console.log("Character state changed to:", e.detail.state);
});

window.addEventListener("cradle:action", (e: CustomEvent) => {
  console.log("Custom action triggered:", e.detail.action);
});
```

---

## React / Next.js Integration Example

```tsx
"use client";

import { useEffect } from "react";
import "@maranga/cradle";

export function CharacterWidget({ siteId }: { siteId: string }) {
  useEffect(() => {
    function onAction(event: CustomEvent) {
      console.log("Custom action triggered:", event.detail.action);
    }

    window.addEventListener("cradle:action", onAction as EventListener);
    return () => window.removeEventListener("cradle:action", onAction as EventListener);
  }, []);

  return (
    <cradle-character
      site-id={siteId}
      api-base="http://localhost:3002"
    />
  );
}
```

---

## Attributes

- `site-id`: (Required) The UUID of your Cradle installation.
- `api-base`: (Required) Base URL of your Cradle Runtime service.
- `placement`: (Optional) `"floating"` (default, bottom-right floating anchor) or `"inline"` (embeds inside normal page flow).

