export interface RawUserEvent {
	type: "click" | "input" | "navigation" | "error";
	timestamp: number;
	url: string;
	target?: string;
	text?: string;
	metadata?: Record<string, unknown>;
}

/**
 * Bounded in-memory event journal.
 * Captures and stores raw user interactions chronologically without classification.
 */
export class UserEventJournal {
	private events: (RawUserEvent | null)[];
	private capacity: number;
	private pointer = 0;
	private count = 0;

	constructor(capacity = 50) {
		this.capacity = capacity;
		this.events = new Array(capacity).fill(null);
	}

	public record(event: RawUserEvent): void {
		this.events[this.pointer] = event;
		this.pointer = (this.pointer + 1) % this.capacity;
		if (this.count < this.capacity) {
			this.count++;
		}
	}

	public getEvents(): RawUserEvent[] {
		if (this.count === 0) return [];
		const result: RawUserEvent[] = [];
		const startIndex = this.count < this.capacity ? 0 : this.pointer;

		for (let i = 0; i < this.count; i++) {
			const idx = (startIndex + i) % this.capacity;
			const item = this.events[idx];
			if (item) result.push(item);
		}
		return result;
	}

	public toTimeline(): string {
		const list = this.getEvents();
		if (list.length === 0) return "No recorded user actions on this page.";

		const now = Date.now();
		return list
			.map((e) => {
				const elapsedSec = Math.max(0, Math.round((now - e.timestamp) / 1000));
				const timeLabel = elapsedSec === 0 ? "just now" : `${elapsedSec}s ago`;

				switch (e.type) {
					case "click":
						return `• [${timeLabel}] Clicked ${e.target || "element"} (${e.text ? '"' + e.text + '"' : ""}) on ${e.url}`;
					case "input":
						return `• [${timeLabel}] Input on ${e.target || "input"} on ${e.url}`;
					case "navigation":
						return `• [${timeLabel}] Navigated to ${e.url}`;
					case "error":
						return `• [${timeLabel}] Error on ${e.url}: ${e.text || "unknown"}`;
				}
			})
			.join("\n");
	}

	public clear(): void {
		this.events.fill(null);
		this.pointer = 0;
		this.count = 0;
	}
}

/**
 * Telemetry capture engine.
 * Pure recording of user interactions: clicks, form inputs, route changes, errors.
 * No opinionated heuristics, no rage click classification, no external cloud dependencies.
 */
export class WidgetTelemetry {
	private journal = new UserEventJournal(50);
	private cleanupFns: Array<() => void> = [];
	private isRunning = false;

	public init(): void {
		if (this.isRunning || typeof window === "undefined") return;
		this.isRunning = true;

		// 1. Capture clicks
		const handleClick = (e: MouseEvent) => {
			const el = e.target as HTMLElement | null;
			if (!el || el.closest("cradle-character") || el.closest("[data-cradle-widget]")) {
				return;
			}

			const targetSelector = this.getElementSelector(el);
			const label = (el.innerText || el.getAttribute("aria-label") || el.getAttribute("title") || "").slice(0, 50).trim();

			this.journal.record({
				type: "click",
				timestamp: Date.now(),
				url: window.location.pathname + window.location.search,
				target: targetSelector,
				text: label || undefined,
			});
		};

		window.addEventListener("click", handleClick, true);
		this.cleanupFns.push(() => window.removeEventListener("click", handleClick, true));

		// 2. Capture form input changes
		const handleInput = (e: Event) => {
			const el = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
			if (!el || el.closest("cradle-character") || el.closest("[data-cradle-widget]")) {
				return;
			}

			const isPassword = el.getAttribute("type") === "password";
			const targetSelector = this.getElementSelector(el);

			this.journal.record({
				type: "input",
				timestamp: Date.now(),
				url: window.location.pathname + window.location.search,
				target: targetSelector,
				text: isPassword ? "[masked]" : undefined,
			});
		};

		window.addEventListener("change", handleInput, true);
		this.cleanupFns.push(() => window.removeEventListener("change", handleInput, true));

		// 3. Capture navigation / route changes
		const handleNav = () => {
			this.journal.record({
				type: "navigation",
				timestamp: Date.now(),
				url: window.location.pathname + window.location.search,
			});
		};

		window.addEventListener("popstate", handleNav);
		window.addEventListener("hashchange", handleNav);
		this.cleanupFns.push(() => {
			window.removeEventListener("popstate", handleNav);
			window.removeEventListener("hashchange", handleNav);
		});

		// 4. Capture runtime errors
		const handleError = (e: ErrorEvent) => {
			this.journal.record({
				type: "error",
				timestamp: Date.now(),
				url: window.location.pathname + window.location.search,
				text: (e.message || "Script error").slice(0, 100),
			});
		};

		window.addEventListener("error", handleError);
		this.cleanupFns.push(() => window.removeEventListener("error", handleError));
	}

	public getTimeline(): string {
		return this.journal.toTimeline();
	}

	public getEvents(): RawUserEvent[] {
		return this.journal.getEvents();
	}

	public destroy(): void {
		for (const fn of this.cleanupFns) fn();
		this.cleanupFns = [];
		this.journal.clear();
		this.isRunning = false;
	}

	private getElementSelector(el: HTMLElement): string {
		if (el.id) return `#${el.id}`;
		const testId = el.getAttribute("data-testid") || el.getAttribute("data-cy");
		if (testId) return `[data-testid="${testId}"]`;

		const tag = el.tagName.toLowerCase();
		const role = el.getAttribute("role");
		if (role) return `${tag}[role="${role}"]`;

		const name = el.getAttribute("name");
		if (name) return `${tag}[name="${name}"]`;

		const firstClass = Array.from(el.classList).find(
			(c) => !c.startsWith("cradle") && !c.includes(":") && c.length < 30
		);
		return firstClass ? `${tag}.${firstClass}` : tag;
	}
}

export const globalTelemetry = new WidgetTelemetry();
