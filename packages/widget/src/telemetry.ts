/**
 * Cradle Telemetry
 *
 * Thin wrapper around posthog-js. We initialise PostHog, let it observe the
 * host page, and store every raw CaptureResult in a ring buffer. Nothing is
 * classified or interpreted here — that is the caller's job.
 *
 * Session replays (how they work):
 *   PostHog bundles rrweb, which serialises the full DOM into a snapshot then
 *   streams incremental mutations, mouse moves, scrolls, inputs, and network
 *   requests as compressed binary frames. Those frames are streamed to
 *   PostHog's ingest API and can be played back frame-by-frame in the PostHog
 *   web app (app.posthog.com → Session Replay). If no api_host / project token
 *   is provided we set disable_session_recording: true so nothing leaves the
 *   device. If the site owner supplies their own PostHog project token we flip
 *   that off and they can watch full replays in their PostHog account.
 *
 * Cloud vs. local:
 *   - No posthogApiKey supplied → before_send returns null → zero network
 *     egress. All events stay in this ring buffer only.
 *   - posthogApiKey supplied → events flow to PostHog cloud (or a self-hosted
 *     instance if posthogHost is set). Session replays are viewable there.
 */

import { posthog, type PostHog, type CaptureResult } from "posthog-js";

// ─── Ring buffer ─────────────────────────────────────────────────────────────

/**
 * Fixed-capacity ring buffer that keeps the N most recent raw PostHog
 * CaptureResult objects. No interpretation — raw data in, raw data out.
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
}

// ─── Main class ──────────────────────────────────────────────────────────────

export class WidgetTelemetry {
	readonly buffer: TelemetryBuffer;
	private ph: PostHog | null = null;
	private started = false;

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
					// Turn everything on. PostHog handles the actual detection logic;
					// we just store what it finds.
					autocapture: true,
					rageclick: true,
					capture_dead_clicks: true,
					capture_pageview: "history_change",
					capture_exceptions: true,

					// ── Session replay ────────────────────────────────────────────
					// Only enable if the site owner provided a real project token.
					// Without a key, replays would be recorded for nothing and
					// there'd be nowhere to view them.
					disable_session_recording: !cloudEnabled,

					// ── Lifecycle hook ────────────────────────────────────────────
					// Every assembled event passes through here. We push it into the
					// ring buffer and call the optional onEvent callback.
					// Returning null when cloudEnabled=false stops any network call.
					before_send: (event: CaptureResult | null) => {
						if (event) {
							this.buffer.push(event);
							config.onEvent?.(event);
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

	/** Stop and fully reset. Mostly useful in tests. */
	destroy(): void {
		this.clearBuffer();
		this.started = false;
		this.ph = null;
	}
}

// ─── Singleton ───────────────────────────────────────────────────────────────

export const globalTelemetry = new WidgetTelemetry();
