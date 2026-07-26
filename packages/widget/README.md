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
<cradle-character site-id="YOUR_SITE_ID" api-base="http://localhost:3002"></cradle-character>
```

---

## Visual Animation States

Drive character visual states dynamically using `window.Cradle.setState(state)`:

| Visual State | Animation Mapped | Use Case / Trigger |
|---|---|---|
| `"idle"` | `idle` | Default standing / waiting state |
| `"greeting"` | `waving` | Character welcome / panel opened |
| `"listening"` | `review` | Attentive state when user interacts |
| `"thinking"` | `running` | Processing an AI request or fetching data |
| `"responding"` | `waving` | Outputting response to visitor |
| `"resolved"` | `jumping` | Task completion / success milestone |
| `"error"` | `failed` | Failure / network fallback |

---

## Global Controller API (`window.Cradle`)

Control any connected character from your host application code:

```ts
// Control panels
window.Cradle?.open();               // Open character panel & trigger greeting
window.Cradle?.close();              // Close panel & return to idle
window.Cradle?.toggle();             // Toggle open/closed state

// Drive state & context
window.Cradle?.setState("thinking");                 // Switch animation state
window.Cradle?.trigger({ type: "open-pricing" });    // Emit custom action event
window.Cradle?.setContext({ userPlan: "pro" });       // Attach non-sensitive page metadata
```

---

## Listening to Events

Listen to character lifecycle events on `window` or the DOM element:

```ts
window.addEventListener("cradle:ready", (e: CustomEvent) => {
  console.log("Character manifest loaded:", e.detail.character);
});

window.addEventListener("cradle:open", (e: CustomEvent) => {
  console.log("Panel opened for visitor:", e.detail.visitorId);
});

window.addEventListener("cradle:state", (e: CustomEvent) => {
  console.log("Character state changed to:", e.detail.state);
});

window.addEventListener("cradle:action", (e: CustomEvent) => {
  console.log("User triggered action:", e.detail.action);
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
      // Open your AI chat modal, search drawer, or help widget here
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
- `placement`: (Optional) `"floating"` (default, draggable bottom-right) or `"inline"` (embeds inside normal page flow).
