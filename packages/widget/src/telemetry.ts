/**
 * Cradle Telemetry & Client Watchdog
 *
 * Thin wrapper around posthog-js. We initialise PostHog, let it observe the
 * host page, and store every raw CaptureResult in a ring buffer.
 *
 * Architecture (Hierarchical Watchdog):
 *   - PostHog-js acts as the Sensor (capturing $autocapture, $rageclick,
 *     $dead_click, $pageview, $exception).
 *   - The TelemetryBuffer maintains a chronological ring buffer of raw events.
 *   - The Client Watchdog evaluates a real-time Friction Score (0-100) locally
 *     at zero LLM cost. When friction crosses the threshold (>= 40), it triggers
 *     an ambient notification (Tier 1) rather than a disruptive takeover.
 *   - When the user engages, the distilled friction report is sent to the
 *     server triage agent and Collins.
 *
 * Session replays:
 *   - PostHog bundles rrweb. If a posthogApiKey is provided, replays stream
 *     to PostHog and can be watched frame-by-frame with full network waterfalls.
 *   - Without a key, disable_session_recording: true ensures zero network egress.
 */

import { posthog, type PostHog, type CaptureResult } from "posthog-js";

// ─── Friction & Watchdog Types ───────────────────────────────────────────────

export interface FrictionReport {
	score: number; // 0-100 friction score
	isFrustrated: boolean; // score >= 40
	lastFrictionType?: "rageclick" | "dead_click" | "exception" | "error";
	lastTarget?: string;
	recentFrictionCount: number;
	summary: string;
}

// ─── Ring buffer ─────────────────────────────────────────────────────────────

/**
 * Fixed-capacity ring buffer that keeps the N most recent raw PostHog
 * CaptureResult objects, with real-time friction evaluation.
 */
export class TelemetryBuffer {
	private readonly slots: (CaptureResult | null)[];
	private head = 0; // next write position
	private size = 0; // how many slots are filled

	constructor(readonly capacity = 50) {
		this.slots = new Array(capacity).fill(null);
	}

	push(event: CaptureResult): void {
		this.slots[this.head] = event;
		this.head = (this.head + 1) % this.capacity;
		if (this.size < this.capacity) this.size++;
	}

	/**
	 * Returns events in chronological order (oldest first).
	 */
	all(): CaptureResult[] {
		if (this.size === 0) return [];
		const start = this.size < this.capacity ? 0 : this.head;
		const out: CaptureResult[] = [];
		for (let i = 0; i < this.size; i++) {
			const item = this.slots[(start + i) % this.capacity];
			if (item) out.push(item);
		}
		return out;
	}

	/**
	 * Returns the N most recent events (newest first).
	 */
	recent(n = 20): CaptureResult[] {
		return this.all().slice(-n).reverse();
	}

	/**
	 * Evaluates real-time friction over the last `windowMs` (default 15s).
	 * Heuristic weights:
	 *   - $rageclick: +40
	 *   - $dead_click: +25
	 *   - $exception: +35
	 */
	getFrictionReport(windowMs = 15000): FrictionReport {
		const now = Date.now();
		const cutoff = now - windowMs;
		const events = this.all();

		let score = 0;
		let frictionCount = 0;
		let lastFrictionType: FrictionReport["lastFrictionType"] = undefined;
		let lastTarget: string | undefined = undefined;

		for (const ev of events) {
			const ts = ev.timestamp ? new Date(ev.timestamp).getTime() : now;
			if (ts < cutoff) continue;

			const name = ev.event;
			const props = ev.properties as Record<string, any> | undefined;
			const target =
				(props?.$el_text as string) ||
				(props?.$elements?.[0]?.tag_name as string) ||
				(props?.$current_url as string) ||
				undefined;

			if (name === "$rageclick") {
				score += 40;
				frictionCount++;
				lastFrictionType = "rageclick";
				if (target) lastTarget = target;
			} else if (name === "$dead_click") {
				score += 25;
				frictionCount++;
				lastFrictionType = "dead_click";
				if (target) lastTarget = target;
			} else if (name === "$exception") {
				score += 35;
				frictionCount++;
				lastFrictionType = "exception";
			}
		}

		score = Math.min(score, 100);
		const isFrustrated = score >= 40;
		const summary = isFrustrated
			? `Friction detected (score: ${score}/100, type: ${lastFrictionType || "unknown"}${lastTarget ? ` on "${lastTarget}"` : ""})`
			: "Normal interaction";

		return {
			score,
			isFrustrated,
			lastFrictionType,
			lastTarget,
			recentFrictionCount: frictionCount,
			summary,
		};
	}

	clear(): void {
		this.slots.fill(null);
		this.head = 0;
		this.size = 0;
	}
}

// ─── Config ──────────────────────────────────────────────────────────────────

export interface TelemetryConfig {
	/**
	 * Your PostHog project API key. When omitted all events stay local — nothing
	 * is sent to PostHog cloud and session recording is disabled.
	 */
	posthogApiKey?: string;

	/**
	 * Override the PostHog ingest host. Defaults to the PostHog US cloud.
	 * Set to your self-hosted instance URL if needed.
	 */
	posthogHost?: string;

	/**
	 * Called immediately after each event is pushed into the buffer.
	 * Receive the raw CaptureResult and do whatever you want with it.
	 */
	onEvent?: (event: CaptureResult) => void;

	/**
	 * Watchdog callback fired when friction signals exceed the threshold (score >= 40).
	 * Triggers Tier 1 ambient indication in the widget.
	 */
	onFrustration?: (report: FrictionReport) => void;

	/** Minimum time between onFrustration triggers (default 12000ms). */
	frustrationCooldownMs?: number;
}

// ─── Main class ──────────────────────────────────────────────────────────────

export class WidgetTelemetry {
	readonly buffer: TelemetryBuffer;
	private ph: PostHog | null = null;
	private started = false;
	private lastFrustrationTrigger = 0;

	constructor(bufferCapacity = 50) {
		this.buffer = new TelemetryBuffer(bufferCapacity);
	}

	/**
	 * Initialise PostHog and start capturing.
	 * Safe to call multiple times — only runs once.
	 */
	init(config: TelemetryConfig = {}): void {
		if (this.started || typeof window === "undefined") return;
		this.started = true;

		const token = config.posthogApiKey ?? "phc_placeholder_local_only";
		const host = config.posthogHost ?? "https://us.i.posthog.com";
		const cloudEnabled = Boolean(config.posthogApiKey);
		const cooldown = config.frustrationCooldownMs ?? 12000;

		try {
			this.ph = posthog.init(
				token,
				{
					api_host: host,
					defaults: "2026-05-30",

					// Keep identity in memory only — we're an embedded widget on a
					// host page that has its own storage strategy.
					persistence: "memory",

					// ── Capture features ──────────────────────────────────────────
					// PostHog handles the actual detection logic; we store what it finds.
					autocapture: true,
					rageclick: true,
					capture_dead_clicks: true,
					capture_pageview: "history_change",
					capture_exceptions: true,

					// ── Session replay ────────────────────────────────────────────
					// Only enable if the site owner provided a real project token.
					disable_session_recording: !cloudEnabled,

					// ── Lifecycle hook ────────────────────────────────────────────
					before_send: (event: CaptureResult | null) => {
						if (event) {
							this.buffer.push(event);
							config.onEvent?.(event);

							// Client Watchdog: evaluate friction score
							if (config.onFrustration) {
								const report = this.buffer.getFrictionReport();
								const now = Date.now();
								if (report.isFrustrated && now - this.lastFrustrationTrigger > cooldown) {
									this.lastFrustrationTrigger = now;
									config.onFrustration(report);
								}
							}
						}
						return cloudEnabled ? event : null;
					},
				},
				// Unique PostHog instance name so we don't collide with any
				// PostHog the host page may already have initialised.
				"cradle_widget",
			) ?? null;
		} catch (err) {
			console.warn("[cradle] telemetry init failed", err);
		}
	}

	// ─── Accessors ─────────────────────────────────────────────────────────────

	/** The underlying PostHog instance, if initialised. */
	get posthog(): PostHog | null {
		return this.ph;
	}

	/** Current friction summary from the buffer. */
	getFrictionReport(windowMs = 15000): FrictionReport {
		return this.buffer.getFrictionReport(windowMs);
	}

	/**
	 * PostHog session ID for the current session.
	 * Useful for linking this widget session to a backend LLM trace.
	 */
	sessionId(): string | undefined {
		return this.ph?.get_session_id();
	}

	/**
	 * Direct URL to this session's replay in PostHog cloud.
	 * Only meaningful when a real project token was provided.
	 */
	sessionReplayUrl(): string | undefined {
		return this.ph?.get_session_replay_url?.();
	}

	// ─── Lifecycle ─────────────────────────────────────────────────────────────

	/** Clear the event buffer. Does not stop capture. */
	clearBuffer(): void {
		this.buffer.clear();
	}

	/** Stop and fully reset. */
	destroy(): void {
		this.clearBuffer();
		this.started = false;
		this.ph = null;
		this.lastFrustrationTrigger = 0;
	}
}

// ─── Singleton ───────────────────────────────────────────────────────────────

export const globalTelemetry = new WidgetTelemetry();
