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

### Architecture Update: The Hierarchical Watchdog & Agent Loop (Closing the Circuit)
* **The Question Evaluated**: Should we constantly stream raw browser events directly to the primary LLM (Collins) or use a subagent/watchdog?
* **Research Verdict & Mathematical Rationale**:
  * **Do NOT stream raw browser events directly to Collins**:
    * **Quadratic Token Explosion ($O(S^2)$)**: In multi-step agent loops (AI SDK `ToolLoopAgent`), all intermediate steps resubmit the growing context. 200 raw clickstream events per 2-minute session generates 15,000–30,000 redundant tokens per turn.
    * **Latency Penalties**: Ingesting huge JSON trees adds 2–4s to Time-To-First-Token (TTFT).
    * **Cognitive Backlash**: Human-Computer Interaction research (Horvitz CHI '99, Iqbal & Bailey 2005/2011, Ju & Leifer 2008) proves unprompted interruptions during fine subtasks cause 90%+ dismissal rates.
* **The 4-Tier Graduated Intervention Pipeline Built**:
  1. **Tier 0: Client Watchdog (in `telemetry.ts`)**:
     * Zero-LLM-cost, deterministic heuristic running inside `TelemetryBuffer`.
     * Calculates real-time **Friction Score** ($S \in [0, 100]$):
       * `$rageclick`: $+40$ (Euclidean radius $\le 30$px, $\ge 3$ clicks in $\le 1$s, excluding text-selection and steppers).
       * `$dead_click`: $+25$ (MutationObserver confirms 0 DOM mutations, 0 scroll, 0 navigation in 2.5s).
       * `$exception` / network failure: $+35$.
  2. **Tier 1: Ambient Peripheral Indication (Calm Computing)**:
     * When $S \ge 40$, Cradle mascot shifts state (`idle` $\rightarrow$ `waiting`), indicating situational readiness without intrusive screen popups.
  3. **Tier 2: Triage Subagent / Product Memory Lookup**:
     * When the user engages or severe blockage occurs ($S \ge 75$), client passes a condensed 10-event slice.
     * `resolve_current_screen` matches current URL against `ProductScreen` embeddings and `ProductRecipe` graph from Qualra's autonomous explorer.
  4. **Tier 3: Collins Conversational Guidance & Hands Execution**:
     * Collins receives a 100-token pre-digested summary: *"User hit 3 dead clicks on '#export-btn' on /reports. Verified recipe 'Export CSV' available."*
     * Collins greets user with natural situational empathy and invokes `widget_guide` to trigger on-screen spotlights directly on the target elements.

