const VISITOR_KEY_PREFIX = "cradle:visitor:";

type PetAtlas = {
  url: string;
  columns: number;
  rows: number;
  states: Record<string, { row: number; frames: number; durationMs: number }>;
};

type Character = {
  displayName: string;
  greeting: string;
};

type WebState = "idle" | "greeting" | "listening" | "thinking" | "responding" | "resolved" | "error";

type CradleAction = string | { type: string; value?: string; [key: string]: unknown };

type CradleController = {
  open(siteId?: string): void;
  close(siteId?: string): void;
  toggle(siteId?: string): void;
  trigger(action: CradleAction, siteId?: string): void;
  setState(state: WebState, siteId?: string): void;
  setContext(context: Record<string, unknown>, siteId?: string): void;
};

declare global {
  interface Window {
    Cradle?: CradleController;
  }
}

const stateRows: Record<WebState, string> = {
  idle: "idle",
  greeting: "waving",
  listening: "review",
  thinking: "running",
  responding: "waving",
  resolved: "jumping",
  error: "failed",
};

/** Framework-free custom element for an animated, programmable website character. */
class CradleCharacter extends HTMLElement {
  private readonly shadow = this.attachShadow({ mode: "open" });
  private petAnimations: Animation[] = [];
  private atlas: PetAtlas | null = null;
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
    this.apiBase = this.getAttribute("api-base") ?? "";
    if (!this.siteId || !this.apiBase) {
      throw new Error("CradleCharacter requires site-id and api-base attributes.");
    }
    this.visitorId = this.getVisitorId(this.siteId);
    this.conversationId = this.getConversationId(this.siteId);
    this.render();
    if (this.placement === "floating") this.restorePosition();
    void this.loadManifest();
  }

  disconnectedCallback() {
    this.petAnimations.forEach((animation) => animation.cancel());
    this.petAnimations = [];
  }

  /** Opens the character and emits an activation event for the host experience. */
  openPanel() {
    this.open = true;
    const panel = this.shadow.querySelector(".panel") as HTMLElement | null;
    const trigger = this.shadow.querySelector(".trigger") as HTMLButtonElement | null;
    if (panel) panel.hidden = false;
    trigger?.setAttribute("aria-expanded", "true");
    this.setVisualState("greeting");
    this.emit("cradle:open", this.eventContext());
  }

  /** Closes the character without discarding the host-owned visitor context. */
  closePanel() {
    this.open = false;
    const panel = this.shadow.querySelector(".panel") as HTMLElement | null;
    const trigger = this.shadow.querySelector(".trigger") as HTMLButtonElement | null;
    if (panel) panel.hidden = true;
    trigger?.setAttribute("aria-expanded", "false");
    this.setVisualState("idle");
    this.emit("cradle:close", this.eventContext());
  }

  togglePanel() {
    if (this.open) this.closePanel(); else this.openPanel();
  }

  /** Emits an intent for the host site to handle in its own interface or runtime. */
  trigger(action: CradleAction) {
    const normalized = typeof action === "string" ? { type: "action", value: action } : action;
    this.setVisualState("listening");
    this.emit("cradle:action", { ...this.eventContext(), action: normalized });
  }

  /** Updates the companion animation without coupling it to a particular workflow. */
  setVisualState(state: WebState) {
    const sprite = this.atlas?.states[stateRows[state]] ?? this.atlas?.states.idle;
    if (sprite && this.atlas) this.animateCompanions(this.atlas, sprite);
    this.emit("cradle:state", { ...this.eventContext(), state });
  }

  /** Supplies non-sensitive page context that host code can associate with character events. */
  setContext(context: Record<string, unknown>) {
    this.pageContext = { ...this.pageContext, ...context };
    this.emit("cradle:context", this.eventContext());
  }

  private render() {
    this.shadow.innerHTML = [
      '<style>',
      ':host{all:initial;contain:layout style;display:block;color:#f6f7fb;font-family:Inter,ui-sans-serif,system-ui,sans-serif;font-size:16px;line-height:1.4}',
      '*,*:before,*:after{box-sizing:border-box}.shell{position:fixed;right:22px;bottom:22px;z-index:2147483647}.shell[data-placement="inline"]{position:relative;right:auto;bottom:auto;width:100%;max-width:330px}',
      '.panel{width:min(310px,calc(100vw - 28px));margin-bottom:8px;padding:0;background:transparent}.panel[hidden]{display:none}.copy{padding:0 5px 9px;text-align:right;text-shadow:0 2px 14px rgba(8,8,15,.72)}.title{display:block;color:#f8fafc;font-size:.93rem;font-weight:760;letter-spacing:-.035em}.greeting{margin:5px 0 0;color:#d6dae5;font-size:.74rem;line-height:1.48}',
      '.trigger{display:grid;width:94px;height:102px;place-items:center;border:0;background:transparent;box-shadow:none;cursor:grab;touch-action:none}.trigger:active{cursor:grabbing}.trigger:focus-visible{outline:3px solid #a5b4fc;outline-offset:3px}.trigger .companion{width:88px;height:96px;background-size:800% 900%}@media (prefers-reduced-motion:reduce){.companion{animation:none!important}}',
      '</style>',
      '<div class="shell"><section class="panel" hidden aria-label="Website character"><div class="copy"><strong class="title">Loading</strong><p class="greeting"></p></div></section><button class="trigger" type="button" aria-label="Open website character" aria-expanded="false"><span class="companion" aria-hidden="true"></span></button></div>',
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
      const response = await fetch(this.apiBase + "/api/installations/" + this.siteId);
      if (!response.ok) throw new Error("The character manifest could not be loaded.");
      const manifest = await response.json() as { character: Character; assets: { atlas: PetAtlas } | null };
      const shell = this.shadow.querySelector(".shell") as HTMLElement;
      const title = this.shadow.querySelector(".title") as HTMLElement;
      const greeting = this.shadow.querySelector(".greeting") as HTMLElement;
      shell.dataset.placement = this.placement;
      title.textContent = manifest.character.displayName;
      greeting.textContent = manifest.character.greeting;
      if (manifest.assets?.atlas) this.configureAtlas(manifest.assets.atlas);
      this.setVisualState("idle");
      this.emit("cradle:ready", { ...this.eventContext(), character: manifest.character });
    } catch (error) {
      this.setVisualState("error");
      this.emit("cradle:error", { ...this.eventContext(), error: error instanceof Error ? error.message : "Manifest loading failed" });
    }
  }

  private configureAtlas(atlas: PetAtlas) {
    this.atlas = { ...atlas, url: this.apiBase + atlas.url };
    this.shadow.querySelectorAll<HTMLElement>(".companion").forEach((companion) => {
      companion.style.backgroundImage = "url(" + this.atlas?.url + ")";
      companion.style.backgroundSize = (this.atlas?.columns ?? 8) * 100 + "% " + (this.atlas?.rows ?? 9) * 100 + "%";
    });
  }

  private animateCompanions(atlas: PetAtlas, sprite: { row: number; frames: number; durationMs: number }) {
    const yPosition = (sprite.row / Math.max(atlas.rows - 1, 1)) * 100;
    const xPosition = (Math.max(sprite.frames - 1, 0) / Math.max(atlas.columns - 1, 1)) * 100;
    this.petAnimations.forEach((animation) => animation.cancel());
    this.petAnimations = [];
    this.shadow.querySelectorAll<HTMLElement>(".companion").forEach((companion) => {
      companion.style.backgroundPosition = "0% " + yPosition + "%";
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      this.petAnimations.push(companion.animate(
        [{ backgroundPosition: "0% " + yPosition + "%" }, { backgroundPosition: xPosition + "% " + yPosition + "%" }],
        { duration: sprite.durationMs, iterations: Infinity, easing: "steps(" + sprite.frames + ", end)" },
      ));
    });
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
      localStorage.setItem(this.positionKey(), JSON.stringify({ left: shell.offsetLeft, top: shell.offsetTop }));
      this.emit("cradle:move", { ...this.eventContext(), position: { left: shell.offsetLeft, top: shell.offsetTop } });
    }
    this.dragStart = null;
  }

  private restorePosition() {
    try {
      const saved = JSON.parse(localStorage.getItem(this.positionKey()) ?? "null") as { left?: unknown; top?: unknown } | null;
      if (!saved || typeof saved.left !== "number" || typeof saved.top !== "number") return;
      const shell = this.shadow.querySelector(".shell") as HTMLElement;
      shell.style.left = Math.min(Math.max(0, saved.left), window.innerWidth - shell.offsetWidth) + "px";
      shell.style.top = Math.min(Math.max(0, saved.top), window.innerHeight - shell.offsetHeight) + "px";
      shell.style.right = "auto";
      shell.style.bottom = "auto";
    } catch {
      localStorage.removeItem(this.positionKey());
    }
  }

  private positionKey() {
    return "cradle:position:" + this.siteId;
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

  private getVisitorId(siteId: string) {
    const key = VISITOR_KEY_PREFIX + siteId;
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const created = crypto.randomUUID();
    localStorage.setItem(key, created);
    return created;
  }

  private getConversationId(siteId: string) {
    const key = "cradle:conversation:" + siteId;
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const created = crypto.randomUUID();
    localStorage.setItem(key, created);
    return created;
  }
}

function getCharacter(siteId?: string) {
  if (siteId) {
    const selector = 'cradle-character[site-id="' + CSS.escape(siteId) + '"]';
    return document.querySelector(selector) as CradleCharacter | null;
  }
  return document.querySelector("cradle-character") as CradleCharacter | null;
}

if (!customElements.get("cradle-character")) customElements.define("cradle-character", CradleCharacter);

window.Cradle = {
  open: (siteId) => getCharacter(siteId)?.openPanel(),
  close: (siteId) => getCharacter(siteId)?.closePanel(),
  toggle: (siteId) => getCharacter(siteId)?.togglePanel(),
  trigger: (action, siteId) => getCharacter(siteId)?.trigger(action),
  setState: (state, siteId) => getCharacter(siteId)?.setVisualState(state),
  setContext: (context, siteId) => getCharacter(siteId)?.setContext(context),
};
