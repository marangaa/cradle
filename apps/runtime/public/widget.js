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
    placement = "floating";
    theme = "neobrutalist";
    pageContext = {};
    dragStart = null;
    dragged = false;
    ignoreNextClick = false;
    stateTimer = null;
    cycleTimer = null;
    cycling = false;
    autoCycle = true;
    explicitState = false;
    cycleStep = 0;
    currentState = "idle";
    localMessages = [];
    isBusy = false;
    characterName = "Assistant";
    connectedCallback() {
      this.siteId = this.getAttribute("site-id") ?? this.getAttribute("installation-id") ?? "";
      this.apiBase = this.getAttribute("api-base") ?? INFERRED_API_BASE ?? "";
      this.autoCycle = !this.hasAttribute("no-cycle");
      this.placement = this.getAttribute("placement") ?? "floating";
      this.theme = this.getAttribute("theme") ?? "neobrutalist";
      if (!this.siteId || !this.apiBase) {
        throw new Error(
          "CradleCharacter requires a site-id attribute, and an api-base attribute unless the widget was loaded via a <script src> tag."
        );
      }
      this.visitorId = this.getOrCreateVisitorId();
      this.loadStoredMessages();
      this.render();
      this.setupChatListeners();
      void this.loadManifest();
    }
    disconnectedCallback() {
      this.petAnimations.forEach((animation) => animation.cancel());
      this.petAnimations = [];
      this.stopCycle();
    }
    getOrCreateVisitorId() {
      try {
        const existing = localStorage.getItem("cradle_visitor_id");
        if (existing) return existing;
        const id = crypto.randomUUID();
        localStorage.setItem("cradle_visitor_id", id);
        return id;
      } catch {
        return crypto.randomUUID();
      }
    }
    loadStoredMessages() {
      try {
        const stored = localStorage.getItem(`cradle_chat_${this.siteId}`);
        if (stored) {
          this.localMessages = JSON.parse(stored);
        }
      } catch {
        this.localMessages = [];
      }
    }
    saveStoredMessages() {
      try {
        localStorage.setItem(`cradle_chat_${this.siteId}`, JSON.stringify(this.localMessages));
      } catch {
      }
    }
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
    releaseToCycle() {
      this.explicitState = false;
      this.setVisualState("idle");
      this.scheduleNextCycleFrame();
    }
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
    setVisualState(state) {
      this.currentState = state;
      const atlas = this.atlas;
      if (!atlas) return MIN_STATE_DURATION_MS;
      const row = atlas.stateRows[state] ?? atlas.stateRows.idle ?? 0;
      const duration = this.animateCompanions(atlas, row);
      this.emit("cradle:state", { ...this.eventContext(), state });
      return duration;
    }
    setContext(context) {
      this.pageContext = { ...this.pageContext, ...context };
      this.emit("cradle:context", this.eventContext());
    }
    render() {
      const accentColor = this.getAttribute("accent-color") || this.getAttribute("primary-color");
      const bgColor = this.getAttribute("bg-color");
      const textColor = this.getAttribute("text-color");
      const customVars = [
        accentColor ? `--cradle-accent:${accentColor};` : "",
        bgColor ? `--cradle-bg:${bgColor};` : "",
        textColor ? `--cradle-text:${textColor};` : ""
      ].join("");
      this.shadow.innerHTML = [
        "<style>",
        `:host{all:initial;position:fixed;right:0;bottom:0;width:0;height:0;z-index:2147483647;pointer-events:none;color:var(--cradle-text,#09090b);font-family:Inter,ui-sans-serif,system-ui,sans-serif;font-size:16px;line-height:1.4;${customVars}}`,
        ".shell{position:fixed;right:22px;bottom:22px;z-index:2147483647;pointer-events:auto}",
        '.shell[data-placement="inline"]{position:relative;right:auto;bottom:auto;width:100%;max-width:330px}',
        ".panel{position:absolute;bottom:100%;right:12px;margin-bottom:12px;width:min(380px,calc(100vw - 32px));max-height:calc(100vh - 140px);overflow:visible;box-sizing:border-box;display:flex;flex-direction:column;align-items:flex-end;gap:8px;background:transparent;box-shadow:none;border:0;padding:0}",
        ".panel[hidden]{display:none}",
        ".panel ::slotted(*){align-self:stretch;width:100%;box-sizing:border-box}",
        /* Default Built-in Chat Surface (Slot Fallback) */
        ".built-in-chat{width:100%;box-sizing:border-box;display:flex;flex-direction:column;background:var(--cradle-bg,#ffffff);color:var(--cradle-text,#09090b);overflow:hidden;transition:all 0.2s ease}",
        /* Theme: Neobrutalist (Default) */
        '.shell[data-theme="neobrutalist"] .built-in-chat{border:2.5px solid #09090b;border-radius:20px 20px 4px 20px;box-shadow:4px 4px 0px #09090b,0 10px 25px rgba(0,0,0,0.12)}',
        /* Theme: Modern / Glass */
        '.shell[data-theme="modern"] .built-in-chat,.shell[data-theme="glass"] .built-in-chat{background:rgba(255,255,255,0.9);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.6);border-radius:24px 24px 6px 24px;box-shadow:0 12px 32px rgba(0,0,0,0.12),0 2px 6px rgba(0,0,0,0.04)}',
        /* Theme: Minimal */
        '.shell[data-theme="minimal"] .built-in-chat{border:1px solid #e4e4e7;border-radius:16px;box-shadow:0 4px 16px rgba(0,0,0,0.06)}',
        /* Header */
        ".chat-header{display:flex;align-items:center;justify-space-between;padding:12px 16px;border-bottom:1px solid rgba(0,0,0,0.08)}",
        ".chat-title-group{display:flex;align-items:center;gap:8px}",
        ".chat-title{font-weight:800;font-size:0.92rem;letter-spacing:-0.02em}",
        ".status-dot{width:8px;height:8px;background:#22c55e;border-radius:50%;display:inline-block}",
        ".reset-btn{background:transparent;border:0;cursor:pointer;opacity:0.4;padding:4px;font-size:0.75rem;font-weight:600;transition:opacity 0.15s}",
        ".reset-btn:hover{opacity:0.9}",
        /* Messages List */
        ".chat-messages{display:flex;flex-direction:column;gap:10px;padding:14px;max-height:calc(100vh - 240px);min-height:120px;overflow-y:auto;scrollbar-width:thin}",
        ".msg{max-width:85%;padding:10px 14px;font-size:0.85rem;line-height:1.45;word-break:break-word;white-space:pre-wrap}",
        ".msg.user-msg{align-self:flex-end;background:var(--cradle-accent,#09090b);color:#ffffff;border-radius:16px 16px 2px 16px}",
        '.shell[data-theme="neobrutalist"] .msg.user-msg{border:2px solid #09090b;box-shadow:2px 2px 0px #09090b}',
        ".msg.assistant-msg{align-self:flex-start;background:#f4f4f5;color:#09090b;border-radius:16px 16px 16px 2px;border:1px solid rgba(0,0,0,0.06)}",
        '.shell[data-theme="neobrutalist"] .msg.assistant-msg{background:#ffffff;border:2px solid #09090b;box-shadow:2px 2px 0px #09090b}',
        /* Form */
        ".chat-form{display:flex;align-items:center;gap:8px;padding:10px 12px;border-top:1px solid rgba(0,0,0,0.08);background:rgba(0,0,0,0.015)}",
        ".chat-input{flex:1;border:1px solid rgba(0,0,0,0.15);border-radius:20px;padding:8px 14px;font-size:0.84rem;outline:none;background:#ffffff;color:#09090b}",
        '.shell[data-theme="neobrutalist"] .chat-input{border:2px solid #09090b;border-radius:12px}',
        ".chat-input:focus{border-color:#09090b}",
        ".send-btn{display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;border:0;background:var(--cradle-accent,#09090b);color:#ffffff;cursor:pointer;transition:transform 0.1s}",
        '.shell[data-theme="neobrutalist"] .send-btn{border-radius:8px;border:2px solid #09090b;box-shadow:2px 2px 0px #09090b}',
        ".send-btn:active{transform:scale(0.92)}",
        ".send-btn:disabled{opacity:0.3;cursor:not-allowed}",
        /* Trigger */
        ".trigger{display:grid;width:94px;height:102px;place-items:center;border:0;background:transparent;box-shadow:none;cursor:grab;touch-action:none}",
        ".trigger:active{cursor:grabbing}",
        ".trigger:focus-visible{outline:3px solid #a5b4fc;outline-offset:3px}",
        ".trigger .companion{width:88px;height:96px;background-repeat:no-repeat;background-size:800% 900%}",
        "@media (prefers-reduced-motion:reduce){.companion{animation:none!important}}",
        "</style>",
        `<div class="shell" data-theme="${this.theme}"><section class="panel" hidden aria-label="Website character"><slot><div class="built-in-chat"><div class="chat-header"><div class="chat-title-group"><span class="chat-title">${this.characterName}</span><span class="status-dot"></span></div><button type="button" class="reset-btn" title="Clear chat history">Clear</button></div><div class="chat-messages" tabindex="0"><div class="msg assistant-msg greeting-msg"><p class="greeting" style="margin:0">Hi there! \u{1F44B} Ask me anything about our business.</p></div></div><form class="chat-form"><input type="text" class="chat-input" placeholder="Ask something..." aria-label="Ask a question" /><button type="submit" class="send-btn" aria-label="Send message"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg></button></form></div></slot></section><button class="trigger" type="button" aria-label="Open website character" aria-expanded="false"><span class="companion" aria-hidden="true"></span></button></div>`
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
      this.renderStoredMessages();
    }
    setupChatListeners() {
      const form = this.shadow.querySelector(".chat-form");
      const resetBtn = this.shadow.querySelector(".reset-btn");
      if (form) {
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          const input = form.querySelector(".chat-input");
          if (!input) return;
          const text = input.value.trim();
          if (!text || this.isBusy) return;
          input.value = "";
          void this.sendChatMessage(text);
        });
      }
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          this.localMessages = [];
          this.saveStoredMessages();
          this.renderStoredMessages();
        });
      }
    }
    renderStoredMessages() {
      const msgContainer = this.shadow.querySelector(".chat-messages");
      if (!msgContainer) return;
      if (this.localMessages.length === 0) {
        msgContainer.innerHTML = [
          '<div class="msg assistant-msg greeting-msg">',
          '<p class="greeting" style="margin:0">Hi there! \u{1F44B} Ask me anything about our business.</p>',
          "</div>"
        ].join("");
        return;
      }
      msgContainer.innerHTML = this.localMessages.map((m) => `
      <div class="msg ${m.role === "user" ? "user-msg" : "assistant-msg"}">
        ${m.content}
      </div>
    `).join("");
      msgContainer.scrollTop = msgContainer.scrollHeight;
    }
    async sendChatMessage(text) {
      this.isBusy = true;
      const sendBtn = this.shadow.querySelector(".send-btn");
      if (sendBtn) sendBtn.disabled = true;
      const userMsg = { id: crypto.randomUUID(), role: "user", content: text };
      this.localMessages.push(userMsg);
      this.renderStoredMessages();
      const assistantMsgId = crypto.randomUUID();
      const assistantMsg = { id: assistantMsgId, role: "assistant", content: "\u2026" };
      this.localMessages.push(assistantMsg);
      this.renderStoredMessages();
      this.explicitState = true;
      this.setVisualState("review");
      try {
        const baseUrl = (this.apiBase || "").replace(/\/$/, "");
        const res = await fetch(`${baseUrl}/api/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-cradle-installation-id": this.siteId,
            "x-cradle-visitor-id": this.visitorId
          },
          body: JSON.stringify({
            messages: this.localMessages.slice(0, -1).map((m) => ({ role: m.role, content: m.content })),
            installationId: this.siteId,
            visitorId: this.visitorId
          })
        });
        if (!res.ok) {
          let errText = "Failed to communicate with AI chat service.";
          try {
            const json = await res.json();
            if (json.message || json.error) errText = json.message || json.error;
          } catch {
          }
          throw new Error(errText);
        }
        if (!res.body) throw new Error("No response body received.");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let streamedContent = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          streamedContent += chunk;
          const target = this.localMessages.find((m) => m.id === assistantMsgId);
          if (target) {
            target.content = streamedContent;
            this.renderStoredMessages();
          }
        }
        this.saveStoredMessages();
        this.resolveAction(true);
      } catch (err) {
        const target = this.localMessages.find((m) => m.id === assistantMsgId);
        if (target) {
          target.content = err?.message || "Sorry, something went wrong. Please try again.";
          this.renderStoredMessages();
        }
        this.resolveAction(false);
      } finally {
        this.isBusy = false;
        if (sendBtn) sendBtn.disabled = false;
      }
    }
    async loadManifest() {
      try {
        const baseUrl = (this.apiBase || "").replace(/\/$/, "");
        const response = await fetch(baseUrl + "/api/installations/" + this.siteId);
        if (!response.ok) throw new Error("The character manifest could not be loaded.");
        const manifest = await response.json();
        const shell = this.shadow.querySelector(".shell");
        const greeting = this.shadow.querySelector(".greeting");
        const titleEl = this.shadow.querySelector(".chat-title");
        shell.dataset.placement = this.placement;
        this.characterName = manifest.character.displayName || "Assistant";
        if (titleEl) titleEl.textContent = this.characterName;
        if (greeting) greeting.textContent = manifest.character.greeting;
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
      event.currentTarget.releasePointerCapture(event.pointerId);
      if (this.dragged) {
        this.ignoreNextClick = true;
      }
      this.dragStart = null;
      this.dragged = false;
    }
    eventContext() {
      return {
        siteId: this.siteId,
        visitorId: this.visitorId,
        state: this.currentState,
        open: this.open,
        context: { ...this.pageContext }
      };
    }
    emit(name, detail) {
      this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
    }
  };
  if (typeof customElements !== "undefined" && !customElements.get("cradle-character")) {
    customElements.define("cradle-character", CradleCharacter);
  }
})();
