"use strict";
(() => {
  // src/index.ts
  var STATE_ROWS = {
    idle: 0,
    "running-right": 1,
    "running-left": 2,
    waving: 3,
    jumping: 4,
    failed: 5,
    waiting: 6,
    running: 7,
    review: 8
  };
  var STATE_ORDER = Object.keys(STATE_ROWS);
  var MS_PER_FRAME = 140;
  var MIN_STATE_DURATION_MS = 400;
  var ALPHA_THRESHOLD = 12;
  var INFERRED_API_BASE = typeof document === "undefined" ? null : (() => {
    try {
      const src = document.currentScript?.src;
      return src ? new URL(src).origin : null;
    } catch {
      return null;
    }
  })();
  function detectRowFrameCounts(image, columns, rows) {
    const counts = new Array(rows).fill(columns);
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
          hasContent = true;
        }
        if (hasContent) lastNonEmptyColumn = column;
      }
      counts[row] = lastNonEmptyColumn >= 0 ? lastNonEmptyColumn + 1 : columns;
    }
    return counts;
  }
  var HTMLElementBase = typeof HTMLElement !== "undefined" ? HTMLElement : class {
  };
  var CradleCharacter = class extends HTMLElementBase {
    shadow = this.attachShadow({ mode: "open" });
    petAnimations = [];
    atlas = null;
    rowFrameCounts = [];
    open = false;
    apiBase = "";
    siteId = "";
    visitorId = "";
    conversationId = "";
    pageContext = {};
    dragStart = null;
    dragged = false;
    ignoreNextClick = false;
    connectedCallback() {
      this.siteId = this.getAttribute("site-id") ?? this.getAttribute("installation-id") ?? "";
      this.apiBase = this.getAttribute("api-base") ?? INFERRED_API_BASE ?? "";
      this.autoCycle = !this.hasAttribute("no-cycle");
      if (!this.siteId || !this.apiBase) {
        throw new Error(
          "CradleCharacter requires a site-id attribute, and an api-base attribute unless the widget was loaded via a <script src> tag (its origin is inferred automatically in that case)."
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
    stateTimer = null;
    cycleTimer = null;
    cycling = false;
    /** True unless the host opts out via the `no-cycle` attribute (see startCycle). */
    autoCycle = true;
    explicitState = false;
    cycleStep = 0;
    currentState = "idle";
    /** Opens the character and emits an activation event for the host experience. */
    openPanel() {
      this.open = true;
      const panel = this.shadow.querySelector(".panel");
      const trigger = this.shadow.querySelector(".trigger");
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
      const panel = this.shadow.querySelector(".panel");
      const trigger = this.shadow.querySelector(".trigger");
      if (panel) panel.hidden = true;
      trigger?.setAttribute("aria-expanded", "false");
      this.releaseToCycle();
      this.emit("cradle:close", this.eventContext());
    }
    togglePanel() {
      if (this.open) this.closePanel();
      else this.openPanel();
    }
    /** Emits an intent for the host site to handle in its own interface or runtime. */
    trigger(action) {
      const normalized = typeof action === "string" ? { type: "action", value: action } : action;
      this.explicitState = true;
      this.setVisualState("review");
      this.emit("cradle:action", { ...this.eventContext(), action: normalized });
      if (this.stateTimer) clearTimeout(this.stateTimer);
      this.stateTimer = setTimeout(() => {
        if (this.currentState === "review") {
          this.setVisualState("running");
        }
      }, 1e3);
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
    releaseToCycle() {
      this.explicitState = false;
      this.setVisualState("idle");
      this.scheduleNextCycleFrame();
    }
    /**
     * Starts the default idle showcase, cycling through every declared state in turn. Skipped
     * entirely when the host sets `no-cycle` — for embeds that already drive real state changes
     * (e.g. wired to an actual chat), decorative cycling would fight with and mask the real signal.
     */
    startCycle() {
      if (this.cycling || !this.autoCycle) return;
      this.cycling = true;
      this.scheduleNextCycleFrame();
    }
    stopCycle() {
      this.cycling = false;
      if (this.cycleTimer) clearTimeout(this.cycleTimer);
      this.cycleTimer = null;
    }
    scheduleNextCycleFrame() {
      if (this.cycleTimer) clearTimeout(this.cycleTimer);
      if (!this.cycling || this.explicitState || !this.atlas) return;
      const state = STATE_ORDER[this.cycleStep % STATE_ORDER.length] ?? "idle";
      this.cycleStep += 1;
      const durationMs = this.setVisualState(state);
      this.cycleTimer = setTimeout(() => this.scheduleNextCycleFrame(), Math.max(durationMs, MIN_STATE_DURATION_MS));
    }
    /** Updates the companion animation dynamically from the atlas, returning the duration used. */
    setVisualState(state) {
      this.currentState = state;
      const atlas = this.atlas;
      if (!atlas) return MIN_STATE_DURATION_MS;
      const row = atlas.stateRows[state] ?? atlas.stateRows.idle ?? 0;
      const duration = this.animateCompanions(atlas, row);
      this.emit("cradle:state", { ...this.eventContext(), state });
      return duration;
    }
    /** Supplies non-sensitive page context that host code can associate with character events. */
    setContext(context) {
      this.pageContext = { ...this.pageContext, ...context };
      this.emit("cradle:context", this.eventContext());
    }
    render() {
      this.shadow.innerHTML = [
        "<style>",
        ":host{all:initial;position:fixed;right:0;bottom:0;width:0;height:0;z-index:2147483647;pointer-events:none;color:#09090b;font-family:Inter,ui-sans-serif,system-ui,sans-serif;font-size:16px;line-height:1.4}",
        '.shell{position:fixed;right:22px;bottom:22px;z-index:2147483647;pointer-events:auto}.shell[data-placement="inline"]{position:relative;right:auto;bottom:auto;width:100%;max-width:330px}',
        ".panel{position:absolute;bottom:100%;right:12px;margin-bottom:12px;width:min(380px,calc(100vw - 32px));max-height:calc(100vh - 140px);overflow:visible;box-sizing:border-box;display:flex;flex-direction:column;align-items:flex-end;gap:8px;background:transparent;box-shadow:none;border:0;padding:0}.panel[hidden]{display:none}.panel ::slotted(*){align-self:stretch;width:100%;box-sizing:border-box}",
        '.greeting-bubble{position:relative;width:100%;box-sizing:border-box;word-break:break-word;overflow-wrap:anywhere;padding:14px 18px;background:#ffffff;color:#09090b;border:2.5px solid #09090b;border-radius:20px 20px 4px 20px;box-shadow:4px 4px 0px #09090b,0 10px 25px rgba(0,0,0,0.12)}.greeting-bubble::after{content:"";position:absolute;bottom:-8px;right:20px;width:14px;height:14px;background:#ffffff;border-right:2.5px solid #09090b;border-bottom:2.5px solid #09090b;transform:rotate(45deg)}.greeting{margin:0;color:#09090b;font-size:.88rem;line-height:1.55;font-weight:600;white-space:pre-wrap}',
        ".trigger{display:grid;width:94px;height:102px;place-items:center;border:0;background:transparent;box-shadow:none;cursor:grab;touch-action:none}.trigger:active{cursor:grabbing}.trigger:focus-visible{outline:3px solid #a5b4fc;outline-offset:3px}.trigger .companion{width:88px;height:96px;background-repeat:no-repeat;background-size:800% 900%}@media (prefers-reduced-motion:reduce){.companion{animation:none!important}}",
        "</style>",
        '<div class="shell"><section class="panel" hidden aria-label="Website character"><slot><div class="greeting-bubble"><p class="greeting">Hi there! \u{1F44B} Ask me anything or click to interact.</p></div></slot></section><button class="trigger" type="button" aria-label="Open website character" aria-expanded="false"><span class="companion" aria-hidden="true"></span></button></div>'
      ].join("");
      const trigger = this.shadow.querySelector(".trigger");
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
    async loadManifest() {
      try {
        const baseUrl = (this.apiBase || "").replace(/\/$/, "");
        const response = await fetch(baseUrl + "/api/installations/" + this.siteId);
        if (!response.ok) throw new Error("The character manifest could not be loaded.");
        const manifest = await response.json();
        const shell = this.shadow.querySelector(".shell");
        const greeting = this.shadow.querySelector(".greeting");
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
    async configureAtlas(atlas) {
      const baseUrl = (this.apiBase || "").replace(/\/$/, "");
      const url = atlas.url.startsWith("http://") || atlas.url.startsWith("https://") ? atlas.url : baseUrl + atlas.url;
      this.atlas = { ...atlas, url };
      let imageUrl = url;
      let blobForDetection = null;
      try {
        const res = await fetch(url, { referrerPolicy: "no-referrer" });
        if (res.ok) {
          const blob = await res.blob();
          blobForDetection = blob;
          imageUrl = URL.createObjectURL(blob);
        }
      } catch {
      }
      this.shadow.querySelectorAll(".companion").forEach((companion) => {
        companion.style.backgroundImage = 'url("' + imageUrl + '")';
        companion.style.backgroundSize = (this.atlas?.columns ?? 8) * 100 + "% " + (this.atlas?.rows ?? 9) * 100 + "%";
      });
      this.rowFrameCounts = await this.detectFrameCounts(imageUrl, blobForDetection, atlas.columns, atlas.rows);
    }
    /** Loads the spritesheet into an offscreen image and detects each row's real frame count. */
    async detectFrameCounts(imageUrl, blob, columns, rows) {
      try {
        const image = new Image();
        if (!blob) image.crossOrigin = "anonymous";
        const decoded = await new Promise((resolve, reject) => {
          image.onload = () => resolve(image);
          image.onerror = () => reject(new Error("Spritesheet failed to decode."));
          image.src = imageUrl;
        });
        return detectRowFrameCounts(decoded, columns, rows);
      } catch {
        return new Array(rows).fill(columns);
      }
    }
    animateCompanions(atlas, row) {
      const yPosition = row / Math.max(atlas.rows - 1, 1) * 100;
      const detected = this.rowFrameCounts[row];
      const numFrames = Math.max(detected ?? atlas.columns, 1);
      const colDenom = Math.max(atlas.columns - 1, 1);
      const endXPosition = numFrames / colDenom * 100;
      const durationMs = Math.max(numFrames * MS_PER_FRAME, MIN_STATE_DURATION_MS);
      this.petAnimations.forEach((animation) => animation.cancel());
      this.petAnimations = [];
      this.shadow.querySelectorAll(".companion").forEach((companion) => {
        companion.style.backgroundPosition = "0% " + yPosition + "%";
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        this.petAnimations.push(companion.animate(
          [{ backgroundPosition: "0% " + yPosition + "%" }, { backgroundPosition: endXPosition + "% " + yPosition + "%" }],
          { duration: durationMs, iterations: Infinity, easing: "steps(" + numFrames + ", end)" }
        ));
      });
      return durationMs;
    }
    startDrag(event) {
      if (event.button !== 0 || this.placement === "inline") return;
      const shell = this.shadow.querySelector(".shell");
      const bounds = shell.getBoundingClientRect();
      this.dragStart = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, left: bounds.left, top: bounds.top };
      this.dragged = false;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    moveDrag(event) {
      if (!this.dragStart || event.pointerId !== this.dragStart.pointerId) return;
      const deltaX = event.clientX - this.dragStart.x;
      const deltaY = event.clientY - this.dragStart.y;
      if (!this.dragged && Math.hypot(deltaX, deltaY) < 6) return;
      this.dragged = true;
      event.preventDefault();
      const shell = this.shadow.querySelector(".shell");
      const left = Math.min(Math.max(0, this.dragStart.left + deltaX), window.innerWidth - shell.offsetWidth);
      const top = Math.min(Math.max(0, this.dragStart.top + deltaY), window.innerHeight - shell.offsetHeight);
      shell.style.left = left + "px";
      shell.style.top = top + "px";
      shell.style.right = "auto";
      shell.style.bottom = "auto";
    }
    endDrag(event) {
      if (!this.dragStart || event.pointerId !== this.dragStart.pointerId) return;
      if (this.dragged) {
        this.ignoreNextClick = true;
        const shell = this.shadow.querySelector(".shell");
        this.emit("cradle:move", { ...this.eventContext(), position: { left: shell.offsetLeft, top: shell.offsetTop } });
      }
      this.dragStart = null;
    }
    get placement() {
      return this.getAttribute("placement") === "inline" ? "inline" : "floating";
    }
    eventContext() {
      return {
        siteId: this.siteId,
        visitorId: this.visitorId,
        conversationId: this.conversationId,
        context: this.pageContext
      };
    }
    emit(type, detail) {
      const event = new CustomEvent(type, { detail, bubbles: true, composed: true });
      this.dispatchEvent(event);
      window.dispatchEvent(new CustomEvent(type, { detail }));
    }
  };
  function getCharacter(siteId) {
    if (typeof document === "undefined") return null;
    if (siteId) {
      const selector = 'cradle-character[site-id="' + CSS.escape(siteId) + '"]';
      return document.querySelector(selector);
    }
    return document.querySelector("cradle-character");
  }
  var Cradle;
  if (typeof window !== "undefined" && typeof customElements !== "undefined") {
    if (!customElements.get("cradle-character")) customElements.define("cradle-character", CradleCharacter);
    const script = document.currentScript;
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
      open: (siteId2) => getCharacter(siteId2)?.openPanel(),
      close: (siteId2) => getCharacter(siteId2)?.closePanel(),
      toggle: (siteId2) => getCharacter(siteId2)?.togglePanel(),
      trigger: (action, siteId2) => getCharacter(siteId2)?.trigger(action),
      resolveAction: (success, siteId2) => getCharacter(siteId2)?.resolveAction(success),
      setState: (state, siteId2) => getCharacter(siteId2)?.setVisualState(state),
      setContext: (context, siteId2) => getCharacter(siteId2)?.setContext(context)
    };
  }
})();
