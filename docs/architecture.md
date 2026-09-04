# Cradle Architecture & Technical Specifications

This document outlines the architecture, components, and telemetry lifecycle of the **Cradle Web Companion & In-App Agent Runtime** (`@maranga/cradle`).

---

## 1. System Overview

Cradle is an embeddable, autonomous in-app web companion designed to observe host-page interactions, detect user struggle in real time, and execute on-screen guidance without interrupting productive user flow.

```mermaid
flowchart TD
    subgraph HostPage ["Host Page DOM (Customer Web App)"]
        User["User Actions (Clicks, Inputs, Navigation)"]
        TargetEl["Interactive Elements (Buttons, Links, Forms)"]
        SpotlightOverlay["Driver.js Spotlight Layer (Hands)"]
    end

    subgraph CradleWidget ["<cradle-character> Custom Element"]
        Mascot["Animated SVG Character (9 States)"]
        ChatPanel["Embedded Conversational Drawer"]
        Sensor["PostHog Sensor (autocapture, dead clicks, rage clicks)"]
        Buffer["TelemetryBuffer (50-item Ring Buffer)"]
        Watchdog["Deterministic Watchdog (Friction Score 0-100)"]
    end

    subgraph BackendAPI ["Qualra Backend (/api/chat)"]
        ChatEndpoint["POST /api/chat"]
        Collins["Collins Orchestrator (ToolLoopAgent)"]
        ProductMemory["ProductScreen & ProductRecipe Knowledge"]
    end

    User --> TargetEl
    TargetEl --> Sensor
    Sensor -->|"before_send hook (sanitized CaptureResult)"| Buffer
    Buffer --> Watchdog
    Watchdog -->|"Friction >= 40 (Tier 1 Ambient Trigger)"| Mascot
    Mascot -->|"Visual state: waiting (Calm Computing)"| Mascot
    
    User -.->|"Click mascot or open drawer"| ChatPanel
    ChatPanel -->|"POST /api/chat with clientContext"| ChatEndpoint
    ChatEndpoint --> Collins
    Collins <--> ProductMemory
    Collins -->>|"widget_guide tool call"| ChatPanel
    ChatPanel -->|"triggerSpotlight(selector, step)"| SpotlightOverlay
    SpotlightOverlay -->|"Spotlight exact element on host DOM"| TargetEl
```

---

## 2. Core Components

### 2.1 The `<cradle-character>` Custom Element (`packages/widget/src/index.ts`)
- Implemented as a standalone Web Component (Custom Element) rendering inside a closed or open Shadow DOM.
- **Attributes**:
  - `site-id`: Tenant / installation identifier.
  - `api-base`: Target backend API origin (e.g. `https://cradle-c2rh.onrender.com` or local dev).
  - `posthog-key` *(optional)*: PostHog project API key for enabling cloud session recording.
  - `posthog-host` *(optional)*: Self-hosted PostHog instance URL (defaults to US Cloud).
  - `placement`: Floating corner or inline.
  - `theme`: Theme styling (e.g. `neobrutalist`).
- **Mascot Animation States (`PetdexState`)**:
  - `idle`, `waving`, `jumping`, `waiting`, `failed`, `review`, `running`, `attention`.

### 2.2 Telemetry Sensor & Local Ring Buffer (`packages/widget/src/telemetry.ts`)
- Wraps `posthog-js` v1.425+ to utilize PostHog's native event capture engines:
  - `autocapture: true` (clicks, inputs, form submits, element hierarchies).
  - `capture_dead_clicks: true` (detects clicks with 0 DOM mutations/navigation in 2.5s).
  - `rageclick: true` ($\ge 3$ clicks in $\le 1$s within 30px, excluding steppers and text selection).
  - `capture_pageview: "history_change"` (SPA route change detection).
  - `capture_exceptions: true` (unhandled promise rejections and JS errors).
- **`TelemetryBuffer`**: Fixed-capacity ring buffer (default 50 slots). Holds chronologically ordered raw `CaptureResult` objects.

### 2.3 The Client Watchdog (`packages/widget/src/telemetry.ts`)
- Runs client-side at zero LLM cost.
- Computes a real-time **Friction Score** ($S \in [0, 100]$):
  - `$rageclick`: $+40$
  - `$dead_click`: $+25$
  - `$exception`: $+35$
- **Ambient Triggering (Calm Computing)**:
  - When $S \ge 40$, fires `onFrustration(report)`.
  - Mascot shifts visual state (`idle` $\rightarrow$ `waiting`).
  - Cooldown timer (default 12s) prevents repeated alerts while the user works on the same element.

### 2.4 Hands Execution Layer (`packages/widget/src/spotlight.ts`)
- Leverages Driver.js / built-in SVG overlay engine.
- Binds to host DOM elements using verified CSS selectors provided by Collins.
- Emits highlight steps (`triggerSpotlight(selector, message)`), next/prev controls, and graceful teardown (`dismissSpotlight()`).

---

## 3. The Communication Bridge: `clientContext`

When a chat turn is dispatched (`POST /api/chat`), Cradle enriches the request body with ambient browser context:

```typescript
{
  messages: [...],
  installationId: "...",
  visitorId: "...",
  clientContext: {
    // Last 20 raw events for situational awareness
    telemetry: [
      { event: "$rageclick", properties: { $el_text: "Export", $current_url: "/reports" }, timestamp: "..." },
      { event: "$dead_click", properties: { ... } }
    ],
    // Distilled friction diagnosis
    frictionReport: {
      score: 65,
      isFrustrated: true,
      lastFrictionType: "dead_click",
      lastTarget: "button#export-btn",
      recentFrictionCount: 2,
      summary: "Friction detected (score: 65/100, type: dead_click on \"button#export-btn\")"
    },
    posthogSessionId: "018e...",
    sessionReplayUrl: "https://app.posthog.com/replay/018e...",
    currentUrl: "https://app.customer.com/reports?tab=recent"
  }
}
```

---

## 4. Privacy & Data Isolation

1. **Zero Default Egress**:
   - In `telemetry.ts`, `before_send` returns `null` unless `posthogApiKey` is explicitly provided.
   - All captured events stay inside the browser's in-memory ring buffer.
2. **Client-Side Masking**:
   - PostHog automatically redacts password inputs, credit cards, and elements tagged with `[data-sensitive]` or `[data-ph-no-capture]`.
3. **No Raw Event Flooding**:
   - The primary LLM is never sent continuous event streams. It receives a small, distilled context slice only when the user interacts or when severe blockage occurs.
