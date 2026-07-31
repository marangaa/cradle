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
    isLoaded = false;
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
      if (!this.isLoaded) return;
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
        ".shell{position:fixed;right:22px;bottom:22px;z-index:2147483647;pointer-events:auto;opacity:0.2;transition:opacity 0.3s ease}",
        ".shell.is-ready{opacity:1}",
        '.shell[data-placement="inline"]{position:relative;right:auto;bottom:auto;width:100%;max-width:380px}',
        ".panel{position:absolute;bottom:100%;right:0;margin-bottom:12px;width:min(380px,calc(100vw - 32px));max-height:calc(100vh - 140px);overflow:visible;box-sizing:border-box;display:flex;flex-direction:column;align-items:flex-end;gap:10px;background:transparent;box-shadow:none;border:0;padding:0}",
        ".panel[hidden]{display:none}",
        ".panel ::slotted(*){align-self:stretch;width:100%;box-sizing:border-box}",
        /* Floating Unbound Chat Surface */
        ".built-in-chat{width:100%;box-sizing:border-box;display:flex;flex-direction:column;gap:10px;background:transparent;overflow:visible}",
        /* Messages Stream */
        ".chat-messages{display:flex;flex-direction:column;gap:10px;padding:8px 4px;max-height:calc(100vh - 160px);min-height:40px;overflow-y:auto;scrollbar-width:none;-ms-overflow-style:none}",
        ".chat-messages::-webkit-scrollbar{display:none}",
        ".msg{max-width:85%;padding:10px 14px;font-size:0.86rem;line-height:1.45;word-break:break-word;white-space:pre-wrap;box-sizing:border-box}",
        /* User Message Bubble */
        ".msg.user-msg{align-self:flex-end;background:var(--cradle-accent,#09090b);color:#ffffff}",
        '.shell[data-theme="neobrutalist"] .msg.user-msg{border:2px solid #09090b;box-shadow:3px 3px 0px #09090b;border-radius:18px 18px 4px 18px}',
        '.shell[data-theme="modern"] .msg.user-msg,.shell[data-theme="glass"] .msg.user-msg{border-radius:20px 20px 4px 20px;box-shadow:0 8px 24px rgba(0,0,0,0.1)}',
        '.shell[data-theme="cyberpunk"] .msg.user-msg{background:#a855f7;color:#0f172a;border:2px solid #06b6d4;box-shadow:0 0 12px rgba(6,182,212,0.5);border-radius:16px 16px 2px 16px;font-weight:700}',
        '.shell[data-theme="terminal"] .msg.user-msg{background:#15803d;color:#ffffff;border:1px solid #22c55e;font-family:monospace;border-radius:4px}',
        '.shell[data-theme="minimal"] .msg.user-msg{border-radius:16px 16px 2px 16px;border:1px solid #09090b}',
        /* Assistant Message Bubble */
        ".msg.assistant-msg{align-self:flex-start;background:var(--cradle-bg,#ffffff);color:var(--cradle-text,#09090b)}",
        '.shell[data-theme="neobrutalist"] .msg.assistant-msg{border:2px solid #09090b;box-shadow:3px 3px 0px #09090b;border-radius:18px 18px 18px 4px}',
        '.shell[data-theme="modern"] .msg.assistant-msg,.shell[data-theme="glass"] .msg.assistant-msg{background:rgba(255,255,255,0.92);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.6);box-shadow:0 8px 24px rgba(0,0,0,0.08);border-radius:20px 20px 20px 4px}',
        '.shell[data-theme="cyberpunk"] .msg.assistant-msg{background:#0f172a;color:#38bdf8;border:2px solid #a855f7;box-shadow:0 0 14px rgba(168,85,247,0.5);border-radius:16px 16px 16px 2px;font-weight:600}',
        '.shell[data-theme="terminal"] .msg.assistant-msg{background:#09090b;color:#22c55e;border:1px solid #22c55e;font-family:monospace;border-radius:4px;box-shadow:0 0 10px rgba(34,197,94,0.2)}',
        '.shell[data-theme="minimal"] .msg.assistant-msg{border-radius:16px 16px 16px 2px;border:1px solid #e4e4e7;background:#ffffff;box-shadow:0 2px 8px rgba(0,0,0,0.04)}',
        /* Floating Input Pill Bar */
        ".chat-form{display:flex;align-items:center;gap:8px;width:100%;box-sizing:border-box;padding:6px 6px 6px 16px;background:var(--cradle-bg,#ffffff);border-radius:9999px;transition:all 0.15s ease}",
        '.shell[data-theme="neobrutalist"] .chat-form{border:2.5px solid #09090b;box-shadow:3.5px 3.5px 0px #09090b}',
        '.shell[data-theme="modern"] .chat-form,.shell[data-theme="glass"] .chat-form{background:rgba(255,255,255,0.92);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.7);box-shadow:0 10px 28px rgba(0,0,0,0.1)}',
        '.shell[data-theme="cyberpunk"] .chat-form{background:#0f172a;border:2px solid #a855f7;box-shadow:0 0 16px rgba(168,85,247,0.6);border-radius:16px}',
        '.shell[data-theme="terminal"] .chat-form{background:#09090b;border:1.5px solid #22c55e;box-shadow:0 0 12px rgba(34,197,94,0.3);border-radius:4px;font-family:monospace}',
        '.shell[data-theme="minimal"] .chat-form{border:1px solid #e4e4e7;box-shadow:0 2px 10px rgba(0,0,0,0.05)}',
        ".chat-input{flex:1;border:0;outline:none;background:transparent;font-size:0.86rem;color:var(--cradle-text,#09090b);padding:4px 0}",
        '.shell[data-theme="cyberpunk"] .chat-input{color:#38bdf8}',
        '.shell[data-theme="cyberpunk"] .chat-input::placeholder{color:rgba(56,189,248,0.5)}',
        '.shell[data-theme="terminal"] .chat-input{color:#22c55e;font-family:monospace}',
        '.shell[data-theme="terminal"] .chat-input::placeholder{color:rgba(34,197,94,0.5)}',
        ".chat-input::placeholder{color:rgba(9,9,11,0.4)}",
        ".send-btn{display:flex;align-items:center;justify-content:center;padding:6px 14px;border:0;background:transparent;color:var(--cradle-accent,#09090b);font-weight:800;font-size:0.84rem;cursor:pointer;transition:transform 0.1s, opacity 0.15s}",
        '.shell[data-theme="neobrutalist"] .send-btn{background:#09090b;color:#ffffff;border-radius:9999px;padding:6px 16px;font-size:0.78rem}',
        '.shell[data-theme="cyberpunk"] .send-btn{background:#a855f7;color:#0f172a;border-radius:10px;padding:6px 14px;font-weight:900}',
        '.shell[data-theme="terminal"] .send-btn{background:#22c55e;color:#09090b;font-family:monospace;border-radius:2px;padding:4px 10px;font-weight:800}',
        ".send-btn:active{transform:scale(0.94)}",
        ".send-btn:disabled{opacity:0.3;cursor:not-allowed}",
        /* Trigger Companion */
        ".trigger{display:grid;width:94px;height:102px;place-items:center;border:0;background:transparent;box-shadow:none;cursor:grab;touch-action:none;margin-left:auto}",
        ".trigger:active{cursor:grabbing}",
        ".trigger:focus-visible{outline:3px solid #a5b4fc;outline-offset:3px}",
        ".trigger .companion{width:88px;height:96px;background-repeat:no-repeat;background-size:800% 900%}",
        "@media (prefers-reduced-motion:reduce){.companion{animation:none!important}}",
        "</style>",
        `<div class="shell" data-theme="${this.theme}"><section class="panel" hidden aria-label="Website character"><slot><div class="built-in-chat"><div class="chat-messages" tabindex="0"><div class="msg assistant-msg greeting-msg"><p class="greeting" style="margin:0">Hi there! \u{1F44B} Ask me anything.</p></div></div><form class="chat-form"><input type="text" class="chat-input" placeholder="Ask something..." aria-label="Ask a question" /><button type="submit" class="send-btn" aria-label="Send message">Send</button></form></div></slot></section><button class="trigger" type="button" aria-label="Open website character" aria-expanded="false"><span class="companion" aria-hidden="true"></span></button></div>`
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
    }
    renderStoredMessages() {
      const msgContainer = this.shadow.querySelector(".chat-messages");
      if (!msgContainer) return;
      if (this.localMessages.length === 0) {
        msgContainer.innerHTML = [
          '<div class="msg assistant-msg greeting-msg">',
          '<p class="greeting" style="margin:0">Hi there! \u{1F44B} Ask me anything.</p>',
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
    async fetchInitialGreeting(baseUrl) {
      console.log(`[CradleWidget] Fetching initial greeting from ${baseUrl}/api/chat/init`);
      try {
        const res = await fetch(`${baseUrl}/api/chat/init`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-cradle-installation-id": this.siteId,
            "x-cradle-visitor-id": this.visitorId
          },
          body: JSON.stringify({ installationId: this.siteId, visitorId: this.visitorId })
        });
        if (res.ok) {
          const data = await res.json();
          console.log(`[CradleWidget] Initial greeting response:`, data);
          if (data.greeting) {
            const greetingEl = this.shadow.querySelector(".greeting");
            if (greetingEl) greetingEl.textContent = data.greeting;
          }
        } else {
          console.warn(`[CradleWidget] Initial greeting fetch failed status: ${res.status}`);
        }
      } catch (err) {
        console.warn(`[CradleWidget] Initial greeting fetch error:`, err);
      }
    }
    async sendChatMessage(text) {
      console.log(`[CradleWidget] Sending chat message: "${text}"`);
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
            messages: this.localMessages.slice(0, -1).map((m) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              parts: [{ type: "text", text: m.content }]
            })),
            installationId: this.siteId,
            visitorId: this.visitorId
          })
        });
        if (!res.ok) {
          let errText = `Chat request failed with status ${res.status}`;
          try {
            const json = await res.json();
            if (json.message || json.error) errText = json.message || json.error;
          } catch {
          }
          console.error(`[CradleWidget] HTTP ${res.status} error:`, errText);
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
            target.content = streamedContent || "\u2026";
            this.renderStoredMessages();
          }
        }
        console.log(`[CradleWidget] Stream finished cleanly. Total length: ${streamedContent.length} chars`);
        this.saveStoredMessages();
        this.resolveAction(true);
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "Sorry, something went wrong. Please try again.";
        console.error(`[CradleWidget] sendChatMessage caught error:`, errMsg);
        const target = this.localMessages.find((m) => m.id === assistantMsgId);
        if (target) {
          target.content = errMsg;
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
        shell.dataset.placement = this.placement;
        this.characterName = manifest.character.displayName || "Assistant";
        const resolvedTheme = this.getAttribute("theme") || manifest.character.theme || "neobrutalist";
        this.theme = resolvedTheme;
        shell.dataset.theme = resolvedTheme;
        if (greeting && manifest.character.greeting) {
          greeting.textContent = manifest.character.greeting;
        }
        if (this.localMessages.length === 0) {
          void this.fetchInitialGreeting(baseUrl);
        }
        if (manifest.assets?.atlas) {
          await this.configureAtlas(manifest.assets.atlas);
          this.startCycle();
        } else {
          this.isLoaded = true;
          shell.classList.add("is-ready");
          this.emit("cradle:ready", { ...this.eventContext(), character: manifest.character });
          return;
        }
        this.isLoaded = true;
        shell.classList.add("is-ready");
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
