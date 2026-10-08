/**
 * The spotlight ("widget_guide") data part contract. Pure parsing, no DOM, so it is unit-tested.
 *
 * Expected stream part (AI SDK UI message stream data part):
 *
 *   { "type": "data-widget_guide",            // "data-guide" is accepted as an alias
 *     "transient": true,                      // recommended: ephemeral, not stored in history
 *     "data": { "steps": [ {
 *         "label": "Export CSV",              // the element's VISIBLE label/text (required)
 *         "title": "Export your data",        // popover title (required)
 *         "description": "Click here ...",    // popover body (required)
 *         "role": "button",                   // optional hint: button | link | input | tab |
 *                                             //   checkbox | menuitem | heading | any
 *         "side": "bottom",                   // optional: top | right | bottom | left
 *         "align": "center"                   // optional: start | center | end
 *     } ] } }
 *
 * Steps never carry CSS selectors: the widget finds the element by what a person can see
 * (visible text, aria-label, label, placeholder, title). `element` is accepted as a legacy
 * alias of `label`.
 */

export type GuideRole =
  | "button"
  | "link"
  | "input"
  | "tab"
  | "checkbox"
  | "menuitem"
  | "heading"
  | "any";

export type GuideStep = {
  label: string;
  title: string;
  description: string;
  role?: GuideRole;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
};

export const GUIDE_PART_TYPES = ["data-widget_guide", "data-guide"] as const;
export const MAX_GUIDE_STEPS = 8;

const ROLES: ReadonlySet<string> = new Set([
  "button",
  "link",
  "input",
  "tab",
  "checkbox",
  "menuitem",
  "heading",
  "any",
]);
const SIDES: ReadonlySet<string> = new Set(["top", "right", "bottom", "left"]);
const ALIGNS: ReadonlySet<string> = new Set(["start", "center", "end"]);

function str(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : undefined;
}

export function isGuidePartType(type: string): boolean {
  return (GUIDE_PART_TYPES as readonly string[]).includes(type);
}

/** Validates untrusted stream data into safe steps; invalid steps are dropped. */
export function parseGuideSteps(data: unknown): GuideStep[] {
  const raw = (data as { steps?: unknown } | null | undefined)?.steps;
  if (!Array.isArray(raw)) return [];
  const steps: GuideStep[] = [];
  for (const item of raw.slice(0, MAX_GUIDE_STEPS)) {
    if (!item || typeof item !== "object") continue;
    const s = item as Record<string, unknown>;
    const label = str(s.label, 200) ?? str(s.element, 200);
    const title = str(s.title, 120);
    const description = str(s.description, 400);
    if (!label || !title || !description) continue;
    const role = typeof s.role === "string" && ROLES.has(s.role) ? (s.role as GuideRole) : undefined;
    const side = typeof s.side === "string" && SIDES.has(s.side) ? (s.side as GuideStep["side"]) : undefined;
    const align = typeof s.align === "string" && ALIGNS.has(s.align) ? (s.align as GuideStep["align"]) : undefined;
    steps.push({
      label,
      title,
      description,
      ...(role ? { role } : {}),
      ...(side ? { side } : {}),
      ...(align ? { align } : {}),
    });
  }
  return steps;
}
