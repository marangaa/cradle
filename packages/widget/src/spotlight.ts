import { driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";

export interface SpotlightStep {
	element: string; // CSS selector, text, or test ID
	title: string;
	description: string;
	side?: "top" | "right" | "bottom" | "left";
	align?: "start" | "center" | "end";
}

/**
 * 4-Tier Self-Healing DOM Locator:
 * 1. Primary selector (id, class, data-testid)
 * 2. Semantic ARIA attribute locator
 * 3. Text content matching (buttons, links, labels)
 * 4. XPath evaluation
 */
export function resolveElement(selectorOrQuery: string): Element | null {
	if (!selectorOrQuery || typeof document === "undefined") return null;

	// 1. Direct CSS Selector
	try {
		const el = document.querySelector(selectorOrQuery);
		if (el) return el;
	} catch {
		// Invalid selector syntax, fall through to heuristics
	}

	// 2. Data attribute or ID shorthand
	try {
		const byId = document.getElementById(selectorOrQuery.replace(/^#/, ""));
		if (byId) return byId;

		const byTestId = document.querySelector(`[data-testid="${selectorOrQuery}"]`);
		if (byTestId) return byTestId;
	} catch {
		// Fall through
	}

	// 3. Text content matching across interactive elements
	const cleanText = selectorOrQuery.toLowerCase().trim();
	const candidates = Array.from(
		document.querySelectorAll("button, a, input, [role='button'], label, h1, h2, h3, h4"),
	);

	for (const cand of candidates) {
		const text = (cand.textContent || cand.getAttribute("aria-label") || cand.getAttribute("placeholder") || "").toLowerCase().trim();
		if (text === cleanText || (cleanText.length > 3 && text.includes(cleanText))) {
			return cand;
		}
	}

	// 4. XPath Fallback
	try {
		const xpathResult = document.evaluate(
			`.//*[contains(text(), '${selectorOrQuery}')]`,
			document.body,
			null,
			XPathResult.FIRST_ORDERED_NODE_TYPE,
			null,
		);
		if (xpathResult.singleNodeValue instanceof Element) {
			return xpathResult.singleNodeValue;
		}
	} catch {
		// XPath failed
	}

	return null;
}

function ensureSpotlightStyles() {
	if (typeof document === "undefined" || document.getElementById("cradle-spotlight-styles")) return;
	const style = document.createElement("style");
	style.id = "cradle-spotlight-styles";
	style.textContent = `
		.driver-popover.cradle-driver-theme {
			background: #ffffff;
			color: #0f172a;
			border: 2px solid #0f172a;
			border-radius: 12px;
			box-shadow: 5px 5px 0px 0px #0f172a;
			padding: 16px;
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
			max-width: 320px;
			z-index: 2147483647;
		}
		@media (prefers-color-scheme: dark) {
			.driver-popover.cradle-driver-theme {
				background: #0f172a;
				color: #f8fafc;
				border: 2px solid #e2e8f0;
				box-shadow: 5px 5px 0px 0px #e2e8f0;
			}
		}
		.driver-popover.cradle-driver-theme .driver-popover-title {
			font-size: 14px;
			font-weight: 800;
			margin-bottom: 6px;
			letter-spacing: -0.02em;
		}
		.driver-popover.cradle-driver-theme .driver-popover-description {
			font-size: 12px;
			line-height: 1.5;
			color: #475569;
		}
		@media (prefers-color-scheme: dark) {
			.driver-popover.cradle-driver-theme .driver-popover-description {
				color: #94a3b8;
			}
		}
		.driver-popover.cradle-driver-theme .driver-popover-footer {
			margin-top: 14px;
			display: flex;
			gap: 8px;
			justify-content: flex-end;
		}
		.driver-popover.cradle-driver-theme button {
			font-size: 11px;
			font-weight: 700;
			padding: 6px 12px;
			border-radius: 6px;
			cursor: pointer;
			transition: all 0.15s;
		}
		.driver-popover.cradle-driver-theme .driver-popover-next-btn {
			background: #0f172a;
			color: #ffffff;
			border: 1.5px solid #0f172a;
		}
		@media (prefers-color-scheme: dark) {
			.driver-popover.cradle-driver-theme .driver-popover-next-btn {
				background: #f8fafc;
				color: #0f172a;
				border: 1.5px solid #f8fafc;
			}
		}
		.driver-popover.cradle-driver-theme .driver-popover-close-btn {
			color: #64748b;
			border: none;
			background: transparent;
		}
	`;
	document.head.appendChild(style);
}

let activeDriverInstance: ReturnType<typeof driver> | null = null;

export function startSpotlightGuide(
	steps: SpotlightStep[],
	onFinish?: () => void,
): void {
	if (typeof window === "undefined" || !steps.length) return;
	ensureSpotlightStyles();

	if (activeDriverInstance) {
		activeDriverInstance.destroy();
		activeDriverInstance = null;
	}

	const driveSteps: DriveStep[] = [];

	for (const s of steps) {
		const resolved = resolveElement(s.element);
		if (resolved) {
			driveSteps.push({
				element: resolved as HTMLElement,
				popover: {
					title: s.title,
					description: s.description,
					side: s.side || "bottom",
					align: s.align || "center",
					popoverClass: "cradle-driver-theme",
				},
			});
		} else {
			console.warn(`[cradle-spotlight] Element not found: "${s.element}"`);
		}
	}

	if (!driveSteps.length) {
		console.warn("[cradle-spotlight] No valid elements found to spotlight");
		onFinish?.();
		return;
	}

	activeDriverInstance = driver({
		showProgress: driveSteps.length > 1,
		animate: true,
		overlayOpacity: 0.65,
		stagePadding: 6,
		stageRadius: 8,
		popoverClass: "cradle-driver-theme",
		onDestroyStarted: () => {
			activeDriverInstance?.destroy();
			activeDriverInstance = null;
			onFinish?.();
		},
		steps: driveSteps,
	});

	activeDriverInstance.drive();
}

export function dismissSpotlight(): void {
	if (activeDriverInstance) {
		activeDriverInstance.destroy();
		activeDriverInstance = null;
	}
}
