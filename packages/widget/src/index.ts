/**
 * Canonical Petdex row -> state map. Confirmed against Petdex's own "State viewer" UI copy
 * (idle, running-right, running-left, waving, jumping, failed, waiting, running, review), so
 * this is Petdex's documented convention, not something Cradle invented. Duplicated here
 * (rather than imported from @cradle/core) because this package ships standalone to npm/unpkg
 * as a zero-dependency embed script.
 */
const STATE_ROWS = {
  idle: 0,
  "running-right": 1,
  "running-left": 2,
  waving: 3,
  jumping: 4,
  failed: 5,
  waiting: 6,
  running: 7,
  review: 8,
} as const;

/** The only visual states that exist — one per real spritesheet row, nothing invented. */
type PetdexState = keyof typeof STATE_ROWS;

const STATE_ORDER = Object.keys(STATE_ROWS) as PetdexState[];

/** Presentation-only timing: Petdex declares no per-frame duration anywhere, so this is ours. */
const MS_PER_FRAME = 140;
const MIN_STATE_DURATION_MS = 400;

/** Below this alpha value (0-255) a pixel counts as empty when detecting real frame counts. */
const ALPHA_THRESHOLD = 12;

type PetAtlas = {
  url: string;
  columns: number;
  rows: number;
  stateRows: Record<string, number>;
};

type Character = {
  displayName: string;
  greeting: string;
};

type CradleAction = string | { type: string; value?: string; [key: string]: unknown };

type CradleController = {
  open(siteId?: string): void;
  close(siteId?: string): void;
  toggle(siteId?: string): void;
  trigger(action: CradleAction, siteId?: string): void;
  resolveAction(success?: boolean, siteId?: string): void;
  /** Accepts only the 9 real spritesheet states — there is nothing else to set. */
  setState(state: PetdexState, siteId?: string): void;
  setContext(context: Record<string, unknown>, siteId?: string): void;
};

export type { PetdexState, PetAtlas, Character, CradleAction, CradleController };

declare global {
  interface Window {
    Cradle?: CradleController;
  }
}

/**
 * Captured synchronously at module-execution time, while `document.currentScript` still points
 * at this widget's own <script src="..."> tag. Since the widget is always fetched *from* the
 * runtime it talks to, the script's own origin already tells us the API base — no reason to
 * make every embedder retype it. Only null for non-script-tag usage (e.g. bundled via npm),
 * where there's no script element to read an origin from and `api-base` must be passed explicitly.
 * Guarded because this module can be *imported* (not just executed in a browser) from a Next.js
 * Server Component's module graph — `document` genuinely doesn't exist there.
 */
const INFERRED_API_BASE = typeof document === "undefined" ? null : (() => {
  try {
    const src = (document.currentScript as HTMLScriptElement | null)?.src;
    return src ? new URL(src).origin : null;
  } catch {
    return null;
  }
})();

/**
 * Inspects a loaded spritesheet's alpha channel to find how many columns of each row actually
 * have drawn content, scanning from the last column inward. Petdex never declares frame counts
 * anywhere (not the manifest, not pet.json), so this is the only reliable source of truth for
 * how many frames a given state's row really has.
 */
function detectRowFrameCounts(image: HTMLImageElement, columns: number, rows: number): number[] {
  const counts = new Array<number>(rows).fill(columns);
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx || canvas.width === 0 || canvas.height === 0) return counts;

  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  const cellWidth = canvas.width / columns;
  const cellHeight = canvas.height / rows;

  for (let row = 0; row < rows; row += 1) {
    let lastNonEmptyColumn = -1;
    for (let column = 0; column < columns; column += 1) {
      const x = Math.round(column * cellWidth);
      const y = Math.round(row * cellHeight);
      const w = Math.max(1, Math.round(cellWidth));
      const h = Math.max(1, Math.round(cellHeight));
      let hasContent = false;
      try {
        const { data } = ctx.getImageData(x, y, w, h);
        for (let i = 3; i < data.length; i += 4) {
          if ((data[i] ?? 0) > ALPHA_THRESHOLD) {
            hasContent = true;
            break;
          }
        }
      } catch {
        // Cross-origin canvas taint or similar - keep the full-row default for this row.
        hasContent = true;
      }
      if (hasContent) lastNonEmptyColumn = column;
    }
    // A fully blank row means this pet never drew that state - fall back to a full row rather
    // than a zero/one-frame animation that would look frozen.
    counts[row] = lastNonEmptyColumn >= 0 ? lastNonEmptyColumn + 1 : columns;
  }
  return counts;
}

/**
 * Standing in for HTMLElement when this module is evaluated outside a browser (e.g. a Next.js
 * Server Component's module graph, or any Node-based SSR/build-time import). `class X extends
 * HTMLElement` throws immediately at *definition* time — not just when instantiated — if
 * HTMLElement is undefined, so the class needs a harmless real constructor to extend in that
 * case. Nothing ever instantiates CradleCharacter server-side (customElements.define is guarded
 * below), so the stand-in is never actually exercised — it only needs to exist.
 */
const HTMLElementBase: typeof HTMLElement =
  typeof HTMLElement !== "undefined" ? HTMLElement : (class {} as unknown as typeof HTMLElement);

/** Framework-free custom element for an animated, programmable website character. */
class CradleCharacter extends HTMLElementBase {
  private readonly shadow = this.attachShadow({ mode: "open" });
  private petAnimations: Animation[] = [];
  private atlas: PetAtlas | null = null;
  private rowFrameCounts: number[] = [];
  private open = false;
  private apiBase = "";
  private siteId = "";
  private visitorId = "";
  private conversationId = "";
  private pageContext: Record<string, unknown> = {};
  private dragStart: { pointerId: number; x: number; y: number; left: number; top: number } | null = null;
  private dragged = false;
  private ignoreNextClick = false;

  connectedCallback() {
    this.siteId = this.getAttribute("site-id") ?? this.getAttribute("installation-id") ?? "";
    this.apiBase = this.getAttribute("api-base") ?? INFERRED_API_BASE ?? "";
    this.autoCycle = !this.hasAttribute("no-cycle");
    if (!this.siteId || !this.apiBase) {
      throw new Error(
        "CradleCharacter requires a site-id attribute, and an api-base attribute unless the widget " +
        "was loaded via a <script src> tag (its origin is inferred automatically in that case)."
      );
    }
    this.visitorId = crypto.randomUUID();
    this.conversationId = crypto.randomUUID();
    this.render();
    void this.loadManifest();
  }

  disconnectedCallback() {
    this.petAnimations.forEach((animation) => animation.cancel());
    this.petAnimations = [];
    this.stopCycle();
  }

  private stateTimer: ReturnType<typeof setTimeout> | null = null;
  private cycleTimer: ReturnType<typeof setTimeout> | null = null;
  private cycling = false;
  /** True unless the host opts out via the `no-cycle` attribute (see startCycle). */
  private autoCycle = true;
  private explicitState = false;
  private cycleStep = 0;
  private currentState: PetdexState = "idle";

  /** Opens the character and emits an activation event for the host experience. */
  openPanel() {
    this.open = true;
    const panel = this.shadow.querySelector(".panel") as HTMLElement | null;
    const trigger = this.shadow.querySelector(".trigger") as HTMLButtonElement | null;
    if (panel) panel.hidden = false;
    trigger?.setAttribute("aria-expanded", "true");
    this.explicitState = true;
    this.setVisualState("waving");
    this.emit("cradle:open", this.eventContext());

    if (this.stateTimer) clearTimeout(this.stateTimer);
    this.stateTimer = setTimeout(() => {
      if (this.open && this.currentState === "waving") {
        this.releaseToCycle();
      }
    }, 2500);
  }

  /** Closes the character without discarding the host-owned visitor context. */
  closePanel() {
    this.open = false;
    if (this.stateTimer) clearTimeout(this.stateTimer);
    const panel = this.shadow.querySelector(".panel") as HTMLElement | null;
    const trigger = this.shadow.querySelector(".trigger") as HTMLButtonElement | null;
    if (panel) panel.hidden = true;
    trigger?.setAttribute("aria-expanded", "false");
    this.releaseToCycle();
    this.emit("cradle:close", this.eventContext());
  }

  togglePanel() {
    if (this.open) this.closePanel(); else this.openPanel();
  }

  /** Emits an intent for the host site to handle in its own interface or runtime. */
  trigger(action: CradleAction) {
    const normalized = typeof action === "string" ? { type: "action", value: action } : action;
    this.explicitState = true;
    this.setVisualState("review");
    this.emit("cradle:action", { ...this.eventContext(), action: normalized });

    if (this.stateTimer) clearTimeout(this.stateTimer);
    this.stateTimer = setTimeout(() => {
      if (this.currentState === "review") {
        this.setVisualState("running");
      }
    }, 1000);
  }

  /** Finishes an ongoing action with a celebration jump or error fallback. */
  resolveAction(success = true) {
    this.explicitState = true;
    this.setVisualState(success ? "jumping" : "failed");
    if (this.stateTimer) clearTimeout(this.stateTimer);
    this.stateTimer = setTimeout(() => {
      this.releaseToCycle();
    }, 2200);
  }

  /**
   * Hands control back from an explicit, real-event-driven animation (open/trigger/resolve) to
   * the idle showcase cycle - resuming from "idle" rather than freezing on whatever state the
   * explicit sequence last set.
   */
  private releaseToCycle() {
    this.explicitState = false;
    this.setVisualState("idle");
    this.scheduleNextCycleFrame();
  }

  /**
   * Starts the default idle showcase, cycling through every declared state in turn. Skipped
   * entirely when the host sets `no-cycle` — for embeds that already drive real state changes
   * (e.g. wired to an actual chat), decorative cycling would fight with and mask the real signal.
   */
  private startCycle() {
    if (this.cycling || !this.autoCycle) return;
    this.cycling = true;
    this.scheduleNextCycleFrame();
  }

  private stopCycle() {
    this.cycling = false;
    if (this.cycleTimer) clearTimeout(this.cycleTimer);
    this.cycleTimer = null;
  }

  private scheduleNextCycleFrame() {
    if (this.cycleTimer) clearTimeout(this.cycleTimer);
    if (!this.cycling || this.explicitState || !this.atlas) return;
    const state = STATE_ORDER[this.cycleStep % STATE_ORDER.length] ?? "idle";
    this.cycleStep += 1;
    const durationMs = this.setVisualState(state);
    this.cycleTimer = setTimeout(() => this.scheduleNextCycleFrame(), Math.max(durationMs, MIN_STATE_DURATION_MS));
  }

  /** Updates the companion animation dynamically from the atlas, returning the duration used. */
  setVisualState(state: PetdexState): number {
    this.currentState = state;
    const atlas = this.atlas;
    if (!atlas) return MIN_STATE_DURATION_MS;
    const row = atlas.stateRows[state] ?? atlas.stateRows.idle ?? 0;
    const duration = this.animateCompanions(atlas, row);
    this.emit("cradle:state", { ...this.eventContext(), state });
    return duration;
  }

  /** Supplies non-sensitive page context that host code can associate with character events. */
  setContext(context: Record<string, unknown>) {
    this.pageContext = { ...this.pageContext, ...context };
    this.emit("cradle:context", this.eventContext());
  }


  private render() {
    this.shadow.innerHTML = [
      '<style>',
      ':host{all:initial;position:fixed;right:0;bottom:0;width:0;height:0;z-index:2147483647;pointer-events:none;color:#09090b;font-family:Inter,ui-sans-serif,system-ui,sans-serif;font-size:16px;line-height:1.4}',
      '.shell{position:fixed;right:22px;bottom:22px;z-index:2147483647;pointer-events:auto}.shell[data-placement="inline"]{position:relative;right:auto;bottom:auto;width:100%;max-width:330px}',
      '.panel{position:absolute;bottom:100%;right:12px;margin-bottom:12px;width:min(380px,calc(100vw - 32px));max-height:calc(100vh - 140px);overflow:visible;box-sizing:border-box;display:flex;flex-direction:column;align-items:flex-end;gap:8px;background:transparent;box-shadow:none;border:0;padding:0}.panel[hidden]{display:none}.panel ::slotted(*){align-self:stretch;width:100%;box-sizing:border-box}',
      '.greeting-bubble{position:relative;width:100%;box-sizing:border-box;word-break:break-word;overflow-wrap:anywhere;padding:14px 18px;background:#ffffff;color:#09090b;border:2.5px solid #09090b;border-radius:20px 20px 4px 20px;box-shadow:4px 4px 0px #09090b,0 10px 25px rgba(0,0,0,0.12)}.greeting-bubble::after{content:"";position:absolute;bottom:-8px;right:20px;width:14px;height:14px;background:#ffffff;border-right:2.5px solid #09090b;border-bottom:2.5px solid #09090b;transform:rotate(45deg)}.greeting{margin:0;color:#09090b;font-size:.88rem;line-height:1.55;font-weight:600;white-space:pre-wrap}',
      '.trigger{display:grid;width:94px;height:102px;place-items:center;border:0;background:transparent;box-shadow:none;cursor:grab;touch-action:none}.trigger:active{cursor:grabbing}.trigger:focus-visible{outline:3px solid #a5b4fc;outline-offset:3px}.trigger .companion{width:88px;height:96px;background-repeat:no-repeat;background-size:800% 900%}@media (prefers-reduced-motion:reduce){.companion{animation:none!important}}',
      '</style>',
      '<div class="shell"><section class="panel" hidden aria-label="Website character"><slot><div class="greeting-bubble"><p class="greeting">Hi there! \uD83D\uDC4B Ask me anything or click to interact.</p></div></slot></section><button class="trigger" type="button" aria-label="Open website character" aria-expanded="false"><span class="companion" aria-hidden="true"></span></button></div>',
    ].join("");
    const trigger = this.shadow.querySelector(".trigger") as HTMLButtonElement;
    trigger.addEventListener("click", (event) => {
      if (this.ignoreNextClick) {
        event.preventDefault();
        this.ignoreNextClick = false;
        return;
      }
      this.togglePanel();
    });
    trigger.addEventListener("pointerdown", (event) => this.startDrag(event));
    trigger.addEventListener("pointermove", (event) => this.moveDrag(event));
    trigger.addEventListener("pointerup", (event) => this.endDrag(event));
    trigger.addEventListener("pointercancel", () => {
      this.dragStart = null;
      this.dragged = false;
    });
  }

  private async loadManifest() {
    try {
      const baseUrl = (this.apiBase || "").replace(/\/$/, "");
      const response = await fetch(baseUrl + "/api/installations/" + this.siteId);
      if (!response.ok) throw new Error("The character manifest could not be loaded.");
      const manifest = await response.json() as { character: Character; assets: { atlas: PetAtlas | null } | null };
      const shell = this.shadow.querySelector(".shell") as HTMLElement;
      const greeting = this.shadow.querySelector(".greeting") as HTMLElement;
      shell.dataset.placement = this.placement;
      greeting.textContent = manifest.character.greeting;
      if (manifest.assets?.atlas) {
        await this.configureAtlas(manifest.assets.atlas);
        this.startCycle();
      } else {
        this.emit("cradle:ready", { ...this.eventContext(), character: manifest.character });
        return;
      }
      this.emit("cradle:ready", { ...this.eventContext(), character: manifest.character });
    } catch (error) {
      this.setVisualState("failed");
      this.emit("cradle:error", { ...this.eventContext(), error: error instanceof Error ? error.message : "Manifest loading failed" });
    }
  }

  private async configureAtlas(atlas: PetAtlas) {
    const baseUrl = (this.apiBase || "").replace(/\/$/, "");
    const url = (atlas.url.startsWith("http://") || atlas.url.startsWith("https://"))
      ? atlas.url
      : baseUrl + atlas.url;

    this.atlas = { ...atlas, url };

    let imageUrl = url;
    let blobForDetection: Blob | null = null;
    try {
      const res = await fetch(url, { referrerPolicy: "no-referrer" });
      if (res.ok) {
        const blob = await res.blob();
        blobForDetection = blob;
        imageUrl = URL.createObjectURL(blob);
      }
    } catch {
      // Fall back to original url if blob creation fails
    }

    this.shadow.querySelectorAll<HTMLElement>(".companion").forEach((companion) => {
      companion.style.backgroundImage = 'url("' + imageUrl + '")';
      companion.style.backgroundSize = (this.atlas?.columns ?? 8) * 100 + "% " + (this.atlas?.rows ?? 9) * 100 + "%";
    });

    this.rowFrameCounts = await this.detectFrameCounts(imageUrl, blobForDetection, atlas.columns, atlas.rows);
  }

  /** Loads the spritesheet into an offscreen image and detects each row's real frame count. */
  private async detectFrameCounts(imageUrl: string, blob: Blob | null, columns: number, rows: number): Promise<number[]> {
    try {
      const image = new Image();
      if (!blob) image.crossOrigin = "anonymous";
      const decoded = await new Promise<HTMLImageElement>((resolve, reject) => {
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Spritesheet failed to decode."));
        image.src = imageUrl;
      });
      return detectRowFrameCounts(decoded, columns, rows);
    } catch {
      return new Array<number>(rows).fill(columns);
    }
  }

  private animateCompanions(atlas: PetAtlas, row: number): number {
    const yPosition = (row / Math.max(atlas.rows - 1, 1)) * 100;
    const detected = this.rowFrameCounts[row];
    const numFrames = Math.max(detected ?? atlas.columns, 1);
    const colDenom = Math.max(atlas.columns - 1, 1);
    const endXPosition = (numFrames / colDenom) * 100;
    const durationMs = Math.max(numFrames * MS_PER_FRAME, MIN_STATE_DURATION_MS);

    this.petAnimations.forEach((animation) => animation.cancel());
    this.petAnimations = [];
    this.shadow.querySelectorAll<HTMLElement>(".companion").forEach((companion) => {
      companion.style.backgroundPosition = "0% " + yPosition + "%";
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      this.petAnimations.push(companion.animate(
        [{ backgroundPosition: "0% " + yPosition + "%" }, { backgroundPosition: endXPosition + "% " + yPosition + "%" }],
        { duration: durationMs, iterations: Infinity, easing: "steps(" + numFrames + ", end)" },
      ));
    });
    return durationMs;
  }



  private startDrag(event: PointerEvent) {
    if (event.button !== 0 || this.placement === "inline") return;
    const shell = this.shadow.querySelector(".shell") as HTMLElement;
    const bounds = shell.getBoundingClientRect();
    this.dragStart = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, left: bounds.left, top: bounds.top };
    this.dragged = false;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  private moveDrag(event: PointerEvent) {
    if (!this.dragStart || event.pointerId !== this.dragStart.pointerId) return;
    const deltaX = event.clientX - this.dragStart.x;
    const deltaY = event.clientY - this.dragStart.y;
    if (!this.dragged && Math.hypot(deltaX, deltaY) < 6) return;
    this.dragged = true;
    event.preventDefault();
    const shell = this.shadow.querySelector(".shell") as HTMLElement;
    const left = Math.min(Math.max(0, this.dragStart.left + deltaX), window.innerWidth - shell.offsetWidth);
    const top = Math.min(Math.max(0, this.dragStart.top + deltaY), window.innerHeight - shell.offsetHeight);
    shell.style.left = left + "px";
    shell.style.top = top + "px";
    shell.style.right = "auto";
    shell.style.bottom = "auto";
  }

  private endDrag(event: PointerEvent) {
    if (!this.dragStart || event.pointerId !== this.dragStart.pointerId) return;
    if (this.dragged) {
      this.ignoreNextClick = true;
      const shell = this.shadow.querySelector(".shell") as HTMLElement;
      this.emit("cradle:move", { ...this.eventContext(), position: { left: shell.offsetLeft, top: shell.offsetTop } });
    }
    this.dragStart = null;
  }

  private get placement() {
    return this.getAttribute("placement") === "inline" ? "inline" : "floating";
  }

  private eventContext() {
    return {
      siteId: this.siteId,
      visitorId: this.visitorId,
      conversationId: this.conversationId,
      context: this.pageContext,
    };
  }

  private emit(type: string, detail: Record<string, unknown>) {
    const event = new CustomEvent(type, { detail, bubbles: true, composed: true });
    this.dispatchEvent(event);
    window.dispatchEvent(new CustomEvent(type, { detail }));
  }

}

function getCharacter(siteId?: string) {
  if (typeof document === "undefined") return null;
  if (siteId) {
    const selector = 'cradle-character[site-id="' + CSS.escape(siteId) + '"]';
    return document.querySelector(selector) as CradleCharacter | null;
  }
  return document.querySelector("cradle-character") as CradleCharacter | null;
}

/**
 * Live-bound named export so `import { Cradle } from "@maranga/cradle"` works for bundler/npm
 * consumers, not just the `window.Cradle` global the <script> tag path relies on. `undefined`
 * anywhere this module is evaluated outside a browser (SSR, a Server Component's module graph) —
 * callers should optional-chain (`Cradle?.setState(...)`), same as the window.Cradle convention
 * used throughout this file and its README.
 */
export let Cradle: CradleController | undefined;

/**
 * Everything below touches a real browser global (customElements, document, window) at the top
 * level, so it's guarded as a block — this module needs to be *importable* (even if inert) from
 * a Next.js Server Component's module graph, not just executable in an actual browser.
 */
if (typeof window !== "undefined" && typeof customElements !== "undefined") {
  if (!customElements.get("cradle-character")) customElements.define("cradle-character", CradleCharacter);

  /**
   * Matches the standard single-tag embed pattern (Intercom, Crisp, and similar all work this
   * way): <script src="https://runtime.example.com/widget.js" data-site-id="..."></script> and
   * nothing else. If the loading <script> tag carries a data-site-id, auto-create the element
   * instead of requiring the developer to also hand-write a <cradle-character> tag. Explicit
   * <cradle-character> tags (used by the npm/React path, or for multiple companions on one page)
   * still work exactly as before and take priority — this only fills in when nothing was written
   * by hand.
   */
  const script = document.currentScript as HTMLScriptElement | null;
  const siteId = script?.dataset.siteId;
  if (siteId && !document.querySelector("cradle-character")) {
    const mount = () => {
      if (document.querySelector("cradle-character")) return;
      const element = document.createElement("cradle-character");
      element.setAttribute("site-id", siteId);
      if (script?.dataset.placement) element.setAttribute("placement", script.dataset.placement);
      document.body.appendChild(element);
    };

    if (document.body) mount();
    else document.addEventListener("DOMContentLoaded", mount, { once: true });
  }

  Cradle = window.Cradle = {
    open: (siteId) => getCharacter(siteId)?.openPanel(),
    close: (siteId) => getCharacter(siteId)?.closePanel(),
    toggle: (siteId) => getCharacter(siteId)?.togglePanel(),
    trigger: (action, siteId) => getCharacter(siteId)?.trigger(action),
    resolveAction: (success, siteId) => getCharacter(siteId)?.resolveAction(success),
    setState: (state, siteId) => getCharacter(siteId)?.setVisualState(state),
    setContext: (context, siteId) => getCharacter(siteId)?.setContext(context),
  };
}

type CradleCharacterElementProps = {
  "site-id"?: string;
  "api-base"?: string;
  placement?: "floating" | "inline";
  /** Boolean attribute. Present = skip the idle showcase; use when driving real state yourself. */
  "no-cycle"?: boolean | "";
  children?: unknown;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "cradle-character": CradleCharacterElementProps & Record<string, unknown>;
    }
  }
}

