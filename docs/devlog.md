# Cradle Engineering Devlog

## Date: 2026-09-03

### Architectural Audit: Native PostHog Telemetry & AI Observability
* **The "Roll-Your-Own" Anti-Pattern Diagnosed**:
  * In early telemetry prototypes, `posthog-js` was imported, but its event engine was bypassed in favor of raw `window.addEventListener('click')`, custom Euclidean distance calculations for rage clicks (`(c1.x - c0.x)^2 <= 900`), manual popstate/error handlers, and custom DOM string sanitizers.
  * This was an anti-pattern: it created duplicate event listeners, brittle element selector regexes, and reinvented algorithms that PostHog has battle-tested across millions of production websites.
* **The "Sanitization" Misconception**:
  * *Why did we sanitize?* The manual string slicing and tag/class filtering were conceived to prevent massive raw DOM dumps from bloating the LLM prompt context.
  * *Why was rolling our own weird?* PostHog **already natively sanitizes and masks** all autocaptured events at the source:
    * `mask_all_text: true` and `mask_all_element_attributes: true` for strict privacy.
    * Out-of-the-box exclusion of password fields, sensitive inputs (`[data-sensitive]`, `[data-ph-no-autocapture]`), and text selection surfaces (`rageclick.ignore_text_selection: true`).
    * Structured, compact `$elements` hierarchy representation, already optimized and stripped of DOM bloat.
* **PostHog's Native Lifecycle & Core Primitives**:
  * **Event Capture Engines**:
    * `autocapture: true`: Captures clicks, inputs, changes, and form submissions on interactive tags (`a`, `button`, `form`, `input`, etc.) with clean `$elements` paths.
    * `capture_dead_clicks: true`: Natively detects clicks that produce no DOM mutations or navigation.
    * `rageclick: true`: Natively detects user frustration using configurable thresholds (`threshold_px: 30`, `click_count: 3`, `timeout_ms: 1000`, `content_ignorelist: ['next', 'prev', ...]`).
    * `capture_pageview: 'history_change'`: Natively observes SPA pushState/replaceState/popstate.
    * `capture_exceptions: true`: Natively hooks window.onerror and unhandled rejections.
  * **Lifecycle Hook (`before_send`)**:
    * PostHog provides `before_send: (event: CaptureResult | null) => CaptureResult | null`.
    * This is the exact, canonical choke-point where every single event (`$autocapture`, `$rageclick`, `$dead_click`, `$pageview`, `$exception`) is already assembled, sanitized, timestamped, and attributed with `$current_url` and `$session_id`.
    * Tapping into `before_send` lets us populate our in-memory prompt context buffer with zero extra DOM listeners and zero custom math.
  * **AI Observability & Session Linking**:
    * PostHog's AI Observability links frontend browser sessions (`$session_id`) to backend LLM conversations (`$ai_session_id`) via `tracing_headers: ['api.qualra.xyz']` (which injects `X-POSTHOG-DISTINCT-ID` and `X-POSTHOG-SESSION-ID`).
    * Captures `$ai_generation` traces (inputs, completions, tokens, latency, cost).
    * Enables `posthog.captureTraceFeedback(traceId, feedback)` and `posthog.get_session_replay_url()`, allowing PMs and agents to watch the exact session replay where a user struggled.
