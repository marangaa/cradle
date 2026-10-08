import { driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import type { GuideStep } from "./guide.js";
import { bestLabelMatch, type LabelCandidate } from "./match.js";

export type SpotlightStep = GuideStep;

const CANDIDATE_SELECTOR = [
  "a",
  "button",
  "input",
  "select",
  "textarea",
  "summary",
  "label",
  "h1,h2,h3,h4,h5,h6",
  "[role='button']",
  "[role='link']",
  "[role='tab']",
  "[role='checkbox']",
  "[role='menuitem']",
  "[aria-label]",
  "[title]",
].join(",");

function roleBucket(el: Element): string {
  const explicit = el.getAttribute("role");
  if (explicit) return explicit;
  const tag = el.tagName.toLowerCase();
  if (tag === "a") return "link";
  if (tag === "button" || tag === "summary") return "button";
  if (tag === "input") {
    const type = (el as HTMLInputElement).type;
    if (type === "button" || type === "submit" || type === "reset") return "button";
    if (type === "checkbox" || type === "radio") return "checkbox";
    return "input";
  }
  if (tag === "select" || tag === "textarea") return "input";
  if (/^h[1-6]$/.test(tag)) return "heading";
  return "other";
}

function isVisible(el: Element): boolean {
  if (el.closest("cradle-character")) return false;
  if (el.closest("[aria-hidden='true'],[hidden]")) return false;
  const rects = (el as HTMLElement).getClientRects();
  if (rects.length === 0) return false;
  const style = getComputedStyle(el);
  return style.visibility !== "hidden" && style.display !== "none";
}

function accessibleName(el: Element): string {
  const aria = el.getAttribute("aria-label");
  if (aria) return aria;
  const labelledBy = el.getAttribute("aria-labelledby");
  if (labelledBy) {
    const text = labelledBy
      .split(/s+/)
      .map((id) => document.getElementById(id)?.textContent ?? "")
      .join(" ")
      .trim();
    if (text) return text;
  }
  if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
    const labelText = Array.from(el.labels ?? [])
      .map((l) => l.textContent ?? "")
      .join(" ")
      .trim();
    if (labelText) return labelText;
    if (el instanceof HTMLInputElement && (el.type === "button" || el.type === "submit" || el.type === "reset") && el.value) {
      return el.value;
    }
    if (el.getAttribute("placeholder")) return el.getAttribute("placeholder") as string;
  }
  const text = (el.textContent ?? "").trim();
  if (text) return text;
  return el.getAttribute("title") ?? el.getAttribute("alt") ?? "";
}

/**
 * Finds the visible element a step points at by its label (what a person can read), optionally
 * narrowed by a role hint. Never evaluates the label as a selector or XPath, so model output
 * cannot be used to probe or inject into the host page.
 */
export function resolveElementByLabel(label: string, roleHint?: string): Element | null {
  if (!label || typeof document === "undefined") return null;
  const elements = Array.from(document.querySelectorAll(CANDIDATE_SELECTOR)).filter(isVisible);
  const candidates: LabelCandidate[] = elements.map((el) => ({
    name: accessibleName(el),
    role: roleBucket(el),
  }));
  const index = bestLabelMatch(candidates, label, roleHint);
  return index >= 0 ? (elements[index] ?? null) : null;
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
		const resolved = resolveElementByLabel(s.label, s.role);
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
			console.warn(`[cradle-spotlight] No visible element labelled "${s.label}"`);
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
