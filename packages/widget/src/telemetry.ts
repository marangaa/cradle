import { posthog, type PostHog, type CaptureResult } from "posthog-js";

export interface TelemetryEventSummary {
	event: string;
	timestamp: number;
	url: string;
	target?: string;
	text?: string;
}

export class TelemetryRingBuffer {
	private buffer: (TelemetryEventSummary | null)[];
	private capacity: number;
	private pointer = 0;
	private count = 0;

	constructor(capacity = 25) {
		this.capacity = capacity;
		this.buffer = new Array(capacity).fill(null);
	}

	public push(event: TelemetryEventSummary): void {
		this.buffer[this.pointer] = event;
		this.pointer = (this.pointer + 1) % this.capacity;
		if (this.count < this.capacity) {
			this.count++;
		}
	}

	public getRecentEvents(): TelemetryEventSummary[] {
		if (this.count === 0) return [];
		const result: TelemetryEventSummary[] = [];
		const startIndex = this.count < this.capacity ? 0 : this.pointer;

		for (let i = 0; i < this.count; i++) {
			const idx = (startIndex + i) % this.capacity;
			const item = this.buffer[idx];
			if (item) result.push(item);
		}
		return result;
	}

	public toPromptContext(): string {
		const events = this.getRecentEvents();
		if (events.length === 0) return "No prior user actions recorded on this page.";

		const now = Date.now();
		const lines = events.map((e) => {
			const elapsedSec = Math.max(0, Math.round((now - e.timestamp) / 1000));
			const timeLabel = elapsedSec === 0 ? "just now" : `${elapsedSec}s ago`;

			if (e.event === "$rageclick") {
				return `• [${timeLabel}] RAGE CLICK on ${e.target ?? "element"} (${e.text ? '"' + e.text + '"' : ""}) at ${e.url}`;
			}
			if (e.event === "$dead_click") {
				return `• [${timeLabel}] DEAD CLICK on ${e.target ?? "element"} (${e.text ? '"' + e.text + '"' : ""})`;
			}
			if (e.event === "$pageview") {
				return `• [${timeLabel}] Navigated to ${e.url}`;
			}
			if (e.event === "$exception") {
				return `• [${timeLabel}] Client error: ${e.text ?? "unknown"}`;
			}
			return `• [${timeLabel}] Action ${e.event} on ${e.target ?? "element"} (${e.text ? '"' + e.text + '"' : ""})`;
		});

		return lines.join("\n");
	}

	public clear(): void {
		this.buffer.fill(null);
		this.pointer = 0;
		this.count = 0;
	}
}

export interface TelemetryConfig {
	posthogApiKey?: string;
	posthogHost?: string;
	onRageClick?: (event: TelemetryEventSummary) => void;
}

export class WidgetTelemetry {
	private ringBuffer: TelemetryRingBuffer;
	private posthogInstance: PostHog | null = null;
	private isListening = false;

	constructor(capacity = 25) {
		this.ringBuffer = new TelemetryRingBuffer(capacity);
	}

	public init(config: TelemetryConfig = {}): void {
		if (this.isListening || typeof window === "undefined") return;
		this.isListening = true;

		// PostHog Native Engine: handles autocapture, rageclicks, dead clicks,
		// SPA pageviews, exceptions, and DOM sanitization out-of-the-box.
		const projectToken = config.posthogApiKey || "cradle_local_telemetry";
		const apiHost = config.posthogHost || "https://us.i.posthog.com";

		try {
			this.posthogInstance = posthog.init(
				projectToken,
				{
					api_host: apiHost,
					defaults: "2026-05-30",
					persistence: "memory",
					autocapture: {
						css_selector_ignorelist: [
							"cradle-character",
							"[data-cradle-widget]",
							".ph-no-autocapture",
							"[data-ph-no-autocapture]",
						],
					},
					rageclick: {
						threshold_px: 30,
						click_count: 3,
						timeout_ms: 1000,
						content_ignorelist: true,
						ignore_text_selection: true,
						css_selector_ignorelist: ["cradle-character", "[data-cradle-widget]"],
					},
					capture_dead_clicks: true,
					capture_pageview: "history_change",
					capture_exceptions: true,
					disable_session_recording: true,
					// The canonical lifecycle hook: every sanitized event passes here!
					before_send: (event: CaptureResult | null) => {
						if (event) {
							this.handleCapturedEvent(event, config);
						}
						// If no external PostHog key was provided, prevent network egress
						if (!config.posthogApiKey) {
							return null;
						}
						return event;
					},
				},
				"cradle_widget",
			);
		} catch (e) {
			console.warn("[cradle-telemetry] PostHog native initialization error:", e);
		}
	}

	private handleCapturedEvent(event: CaptureResult, config: TelemetryConfig): void {
		const props = (event.properties as Record<string, unknown>) || {};
		const elements = (props.$elements as Array<Record<string, unknown>>) || [];
		const primaryElement = elements[0];

		const target =
			(primaryElement?.tag_name as string) ||
			(props.$el_text as string) ||
			"interactive element";

		const text =
			(props.$el_text as string) ||
			(primaryElement?.text as string) ||
			undefined;

		const url =
			(props.$current_url as string) ||
			(typeof window !== "undefined"
				? window.location.pathname + window.location.search
				: "/");

		const summary: TelemetryEventSummary = {
			event: event.event,
			timestamp: event.timestamp ? new Date(event.timestamp).getTime() : Date.now(),
			url,
			target,
			text: text ? String(text).slice(0, 40).trim() : undefined,
		};

		this.ringBuffer.push(summary);

		if (event.event === "$rageclick") {
			config.onRageClick?.(summary);
		}
	}

	public getPromptContext(): string {
		return this.ringBuffer.toPromptContext();
	}

	public getSessionId(): string | undefined {
		return this.posthogInstance?.get_session_id();
	}

	public getSessionReplayUrl(): string | undefined {
		return this.posthogInstance?.get_session_replay_url?.();
	}

	public destroy(): void {
		this.ringBuffer.clear();
		this.isListening = false;
	}
}

export const globalTelemetry = new WidgetTelemetry();
