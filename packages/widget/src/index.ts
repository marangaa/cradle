import { globalTelemetry } from "./telemetry.js";
import { startSpotlightGuide, dismissSpotlight } from "./spotlight.js";
import {
  CradleChat,
  messageText,
  parseStoredMessages,
  serializeMessages,
  type CradleDataPart,
  type CradleMessage,
} from "./chat.js";
import { isGuidePartType, parseGuideSteps } from "./guide.js";
import { buildIdentityHeaders, DEFAULT_DISCLOSURE, readHostUser, type HostUser } from "./identity.js";

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
  greeting?: string;
  theme?: string;
};

type Manifest = {
  character: Character;
  /** AI disclosure text. The widget always shows it; a built-in default is used if absent. */
  disclosure?: string;
  assets: { atlas: PetAtlas | null } | null;
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
  setSprite(url: string, siteId?: string): void;
  /**
   * Set or clear the signed-in user. The `hash` MUST be computed by your backend; see
   * CONNECTOR.md. Passing null returns to anonymous visitor identity.
   */
  setUser(user: HostUser | null, siteId?: string): void;
};

export type { PetdexState, PetAtlas, Character, CradleAction, CradleController, HostUser };

declare global {
  interface Window {
    Cradle?: CradleController;
  }
}

/**
 * Captured synchronously at module-execution time, while `document.currentScript` still points
 * at this widget's own <script src="..."> tag. Since the widget is always fetched *from* the
 * runtime it talks to, the script's own origin already tells us the API base — no reason to
 * make every embedder retype it.
 */
const INFERRED_API_BASE = typeof document === "undefined" ? null : (() => {
  try {
    const src = (document.currentScript as HTMLScriptElement | null)?.src;
    return src ? new URL(src).origin : null;
  } catch {
    return null;
  }
})();

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
        hasContent = true;
      }
      if (hasContent) lastNonEmptyColumn = column;
    }
    counts[row] = lastNonEmptyColumn >= 0 ? lastNonEmptyColumn + 1 : columns;
  }
  return counts;
}

const HTMLElementBase: typeof HTMLElement =
  typeof HTMLElement !== "undefined" ? HTMLElement : (class {} as unknown as typeof HTMLElement);

/** Framework-free custom element for an animated, programmable website character with built-in persistent AI chat. */
/** Shown to visitors for any chat failure; details are only logged to the console. */
const CHAT_ERROR_MESSAGE = "Sorry, something went wrong. Please try again.";

class CradleCharacter extends HTMLElementBase {
  private readonly shadow = this.attachShadow({ mode: "open" });
  private petAnimations: Animation[] = [];
  private atlas: PetAtlas | null = null;
  private rowFrameCounts: number[] = [];
  private open = false;
  private apiBase = "";
  private siteId = "";
  private visitorId = "";
  private placement = "floating";
  private theme = "neobrutalist";
  private pageContext: Record<string, unknown> = {};
  private dragStart: { pointerId: number; x: number; y: number; left: number; top: number } | null = null;
  private dragged = false;
  private ignoreNextClick = false;

  private stateTimer: ReturnType<typeof setTimeout> | null = null;
  private cycleTimer: ReturnType<typeof setTimeout> | null = null;
  private cycling = false;
  private autoCycle = true;
  private explicitState = false;
  private cycleStep = 0;
  private currentState: PetdexState = "idle";
  private chat: CradleChat | null = null;
  private hostUser: HostUser | null = null;
  private chatEndpoint = "";
  private disclosure = DEFAULT_DISCLOSURE;
  private lastStatus = "ready";
  private chatError: string | null = null;
  private renderQueued = false;
  private handledGuides = new Set<string>();
  private handledEmoteTags = new Set<string>();
  private isBusy = false;
  private characterName = "Assistant";
  private isLoaded = false;

  static get observedAttributes() {
    return ["sprite-url", "preview-url", "theme", "user-id", "user-hash", "user-email", "user-name"];
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (oldValue === newValue) return;
    if ((name === "sprite-url" || name === "preview-url") && newValue) {
      void this.setSpriteUrl(newValue);
    } else if (name.startsWith("user-")) {
      // Read lazily on every request, so a host that signs in later just updates attributes.
      this.hostUser = readHostUser((n) => this.getAttribute(n));
    } else if (name === "theme" && newValue) {
      this.theme = newValue;
      const shell = this.shadow?.querySelector(".shell") as HTMLElement | null;
      if (shell) shell.dataset.theme = newValue;
    }
  }

  async setSpriteUrl(url: string) {
    if (!url) return;
    await this.configureAtlas({
      url,
      columns: 8,
      rows: 9,
      stateRows: STATE_ROWS,
    });
    this.startCycle();
  }

  connectedCallback() {
    this.siteId = this.getAttribute("site-id") ?? this.getAttribute("installation-id") ?? "";
    this.apiBase = this.getAttribute("api-base") ?? INFERRED_API_BASE ?? "";
    this.autoCycle = !this.hasAttribute("no-cycle");
    this.placement = this.getAttribute("placement") ?? "floating";
    this.theme = this.getAttribute("theme") ?? "neobrutalist";

    if (!this.siteId || !this.apiBase) {
      throw new Error(
        "CradleCharacter requires a site-id attribute, and an api-base attribute unless the widget " +
        "was loaded via a <script src> tag."
      );
    }

    this.hostUser = readHostUser((n) => this.getAttribute(n));
    this.chatEndpoint =
      this.getAttribute("chat-endpoint") || `${this.apiBase.replace(/\/$/, "")}/api/chat`;
    this.visitorId = this.getOrCreateVisitorId();
    this.chat = this.createChat();

    // Start PostHog-native telemetry + Client Watchdog
    const posthogKey = this.getAttribute("posthog-key") || undefined;
    const posthogHost = this.getAttribute("posthog-host") || undefined;

    globalTelemetry.init({
      posthogApiKey: posthogKey,
      posthogHost: posthogHost,
      onFrustration: (report) => {
        console.log("[CradleWidget] Watchdog friction signal:", report.summary);
        // Tier 1 Ambient Notification (Calm Computing):
        // Shift mascot state to 'waiting' without popping an intrusive dialog
        this.setVisualState("waiting");
      },
    });

    this.render();
    this.setupChatListeners();
    void this.loadManifest();
  }

  disconnectedCallback() {
    this.petAnimations.forEach((animation) => animation.cancel());
    this.petAnimations = [];
    this.stopCycle();
    globalTelemetry.destroy();
    dismissSpotlight();
    // Abort any in-flight chat request so a removed widget does not keep streaming.
    void this.chat?.stop();
  }

  private getOrCreateVisitorId(): string {
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

  /** History is cached per site and per signed-in user, so shared browsers never mix threads. */
  private storageKey(): string {
    return `cradle_chat_${this.siteId}${this.hostUser ? `:${this.hostUser.id}` : ""}`;
  }

  private loadStoredMessages(): CradleMessage[] {
    try {
      return parseStoredMessages(localStorage.getItem(this.storageKey()));
    } catch {
      return [];
    }
  }

  private saveStoredMessages() {
    try {
      localStorage.setItem(this.storageKey(), serializeMessages(this.chat?.messages ?? []));
    } catch {
      // Ignore localStorage errors
    }
  }

  /**
   * Chat on the AI SDK's framework-agnostic core (see chat.ts). The backend contract is the
   * standard UI message stream; identity rides headers, resolved fresh on every request.
   */
  private createChat(): CradleChat {
    return new CradleChat({
      api: this.chatEndpoint,
      initialMessages: this.loadStoredMessages(),
      headers: () =>
        buildIdentityHeaders({ siteId: this.siteId, visitorId: this.visitorId, user: this.hostUser }),
      body: () => ({
        installationId: this.siteId,
        visitorId: this.visitorId,
        clientContext: {
          telemetry: globalTelemetry.buffer.recent(20),
          frictionReport: globalTelemetry.getFrictionReport(),
          posthogSessionId: globalTelemetry.sessionId(),
          sessionReplayUrl: globalTelemetry.sessionReplayUrl(),
          currentUrl: typeof window !== "undefined" ? window.location.href : undefined,
        },
      }),
      onData: (part) => this.handleDataPart(part),
      onChange: () => this.onChatChange(),
      onError: (error) => {
        // Visitors get a fixed friendly message; the real error (which can carry
        // server details) goes to the console for the host developer only.
        console.error("[cradle] chat error:", error);
        this.chatError = CHAT_ERROR_MESSAGE;
      },
    });
  }

  /** `data-emote` and the spotlight guide arrive as AI SDK data parts (transient or not). */
  private handleDataPart(part: CradleDataPart) {
    // A throw here would abort the stream mid-response, so a DOM/spotlight
    // problem must never escape (https://ai-sdk.dev/docs/ai-sdk-ui/chatbot).
    try {
      this.applyDataPart(part);
    } catch (error) {
      console.error("[cradle] failed to handle data part:", part.type, error);
    }
  }

  private applyDataPart(part: CradleDataPart) {
    if (part.type === "data-emote") {
      const emote = (part.data as { emote?: unknown } | undefined)?.emote;
      if (typeof emote === "string" && STATE_ORDER.includes(emote as PetdexState)) {
        this.explicitState = true;
        this.setVisualState(emote as PetdexState);
      }
    } else if (isGuidePartType(part.type)) {
      const steps = parseGuideSteps(part.data);
      if (steps.length > 0) startSpotlightGuide(steps);
    }
  }

  private onChatChange() {
    const chat = this.chat;
    if (!chat) return;
    const status = chat.status;
    const previous = this.lastStatus;
    this.lastStatus = status;
    this.isBusy = status === "submitted" || status === "streaming";
    if (status === "submitted") this.chatError = null;

    // Guides can also arrive as a `widget_guide` tool part; run each call once.
    const last = chat.messages.at(-1);
    if (last?.role === "assistant") {
      for (const part of last.parts) {
        if (part.type === "tool-widget_guide") {
          const tool = part as { toolCallId?: string; state?: string; input?: unknown };
          if (!tool.toolCallId || this.handledGuides.has(tool.toolCallId)) continue;
          if (tool.state !== "input-available" && tool.state !== "output-available") continue;
          this.handledGuides.add(tool.toolCallId);
          const steps = parseGuideSteps(tool.input);
          if (steps.length > 0) startSpotlightGuide(steps);
        } else if (part.type === "text") {
          // Legacy in-band tag from backends that predate data parts.
          const tag = part.text.match(/\[cradle:emote:([a-z-]+)\]/i)?.[1];
          const key = `${last.id}:${tag}`;
          if (tag && STATE_ORDER.includes(tag as PetdexState) && !this.handledEmoteTags.has(key)) {
            this.handledEmoteTags.add(key);
            this.explicitState = true;
            this.setVisualState(tag as PetdexState);
          }
        }
      }
    }

    if (previous !== status && (previous === "submitted" || previous === "streaming")) {
      if (status === "ready") {
        this.saveStoredMessages();
        this.resolveAction(true);
      } else if (status === "error") {
        this.saveStoredMessages();
        this.resolveAction(false);
      }
    }
    this.queueRender();
  }

  private queueRender() {
    if (this.renderQueued) return;
    this.renderQueued = true;
    const run = () => {
      this.renderQueued = false;
      this.renderMessages();
    };
    if (typeof requestAnimationFrame === "function") requestAnimationFrame(run);
    else setTimeout(run, 16);
  }

  /** Replaces the signed-in user (null = anonymous). Takes effect on the next message. */
  setUser(user: HostUser | null) {
    this.hostUser = user;
    for (const name of ["user-id", "user-hash", "user-email", "user-name"]) this.removeAttribute(name);
    this.emit("cradle:user", this.eventContext());
  }

  /** Opens the character and emits an activation event for the host experience. */
  openPanel() {
    if (!this.isLoaded) return;
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

  private releaseToCycle() {
    this.explicitState = false;
    this.setVisualState("idle");
    this.scheduleNextCycleFrame();
  }

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
    const ambientSequence: PetdexState[] = ["idle", "waving", "idle", "jumping", "idle", "running-right", "idle", "running-left", "idle"];
    const state = ambientSequence[this.cycleStep % ambientSequence.length] ?? "idle";
    this.cycleStep += 1;
    const durationMs = this.setVisualState(state);
    const pauseMs = state === "idle" ? 3500 : Math.max(durationMs, 2000);
    this.cycleTimer = setTimeout(() => this.scheduleNextCycleFrame(), pauseMs);
  }

  setVisualState(state: PetdexState): number {
    this.currentState = state;
    const atlas = this.atlas;
    if (!atlas) return MIN_STATE_DURATION_MS;
    const stateRowMap = atlas.stateRows ?? STATE_ROWS;
    const row = stateRowMap[state] ?? STATE_ROWS[state] ?? 0;
    const duration = this.animateCompanions(atlas, row);
    this.emit("cradle:state", { ...this.eventContext(), state });
    return duration;
  }

  setContext(context: Record<string, unknown>) {
    this.pageContext = { ...this.pageContext, ...context };
    this.emit("cradle:context", this.eventContext());
  }

  private render() {
    const accentColor = this.getAttribute("accent-color") || this.getAttribute("primary-color");
    const bgColor = this.getAttribute("bg-color");
    const textColor = this.getAttribute("text-color");

    const customVars = [
      accentColor ? `--cradle-accent:${accentColor};` : "",
      bgColor ? `--cradle-bg:${bgColor};` : "",
      textColor ? `--cradle-text:${textColor};` : "",
    ].join("");

    this.shadow.innerHTML = [
      '<style>',
      `:host{all:initial;position:fixed;right:0;bottom:0;width:0;height:0;z-index:2147483647;pointer-events:none;color:var(--cradle-text,#09090b);font-family:Inter,ui-sans-serif,system-ui,sans-serif;font-size:16px;line-height:1.4;${customVars}}`,
      '.shell{position:fixed;right:22px;bottom:22px;z-index:2147483647;pointer-events:auto;opacity:0.2;transition:opacity 0.3s ease}',
      '.shell.is-ready{opacity:1}',
      '.shell[data-placement="inline"]{position:relative;right:auto;bottom:auto;width:100%;max-width:380px}',
      '.panel{position:absolute;bottom:100%;right:0;margin-bottom:12px;width:min(380px,calc(100vw - 32px));max-height:calc(100vh - 140px);overflow:visible;box-sizing:border-box;display:flex;flex-direction:column;align-items:flex-end;gap:10px;background:transparent;box-shadow:none;border:0;padding:0}',
      '.panel[hidden]{display:none}',
      '.panel ::slotted(*){align-self:stretch;width:100%;box-sizing:border-box}',

      /* Floating Unbound Chat Surface */
      '.built-in-chat{width:100%;box-sizing:border-box;display:flex;flex-direction:column;gap:10px;background:transparent;overflow:visible}',

      /* Messages Stream */
      '.disclosure{margin:0;padding:6px 10px;font-size:0.72rem;line-height:1.35;background:var(--cradle-bg,#ffffff);color:var(--cradle-text,#09090b);border-radius:10px;border:1px solid rgba(9,9,11,0.2);align-self:stretch;box-sizing:border-box}',
      '.chat-messages{display:flex;flex-direction:column;gap:10px;padding:8px 4px;max-height:calc(100vh - 160px);min-height:40px;overflow-y:auto;scrollbar-width:none;-ms-overflow-style:none}',
      '.chat-messages::-webkit-scrollbar{display:none}',
      '.msg{max-width:85%;padding:10px 14px;font-size:0.86rem;line-height:1.45;word-break:break-word;white-space:pre-wrap;box-sizing:border-box}',
      
      /* User Message Bubble */
      '.msg.user-msg{align-self:flex-end;background:var(--cradle-accent,#09090b);color:#ffffff}',
      '.shell[data-theme="neobrutalist"] .msg.user-msg{border:2px solid #09090b;box-shadow:3px 3px 0px #09090b;border-radius:18px 18px 4px 18px}',
      '.shell[data-theme="modern"] .msg.user-msg,.shell[data-theme="glass"] .msg.user-msg{border-radius:20px 20px 4px 20px;box-shadow:0 8px 24px rgba(0,0,0,0.1)}',
      '.shell[data-theme="cyberpunk"] .msg.user-msg{background:#a855f7;color:#0f172a;border:2px solid #06b6d4;box-shadow:0 0 12px rgba(6,182,212,0.5);border-radius:16px 16px 2px 16px;font-weight:700}',
      '.shell[data-theme="terminal"] .msg.user-msg{background:#15803d;color:#ffffff;border:1px solid #22c55e;font-family:monospace;border-radius:4px}',
      '.shell[data-theme="minimal"] .msg.user-msg{border-radius:16px 16px 2px 16px;border:1px solid #09090b}',
      '.shell[data-theme="synthwave"] .msg.user-msg{background:#ec4899;color:#ffffff;border:2px solid #fde047;box-shadow:0 0 14px rgba(236,72,153,0.6);border-radius:16px 16px 2px 16px;font-weight:700}',
      '.shell[data-theme="paper"] .msg.user-msg{background:#2c2825;color:#fdfbf7;border:1px solid #736b63;border-radius:14px 14px 2px 14px;font-family:Georgia,serif}',

      /* Assistant Message Bubble */
      '.msg.assistant-msg{align-self:flex-start;background:var(--cradle-bg,#ffffff);color:var(--cradle-text,#09090b)}',
      '.shell[data-theme="neobrutalist"] .msg.assistant-msg{border:2px solid #09090b;box-shadow:3px 3px 0px #09090b;border-radius:18px 18px 18px 4px}',
      '.shell[data-theme="modern"] .msg.assistant-msg,.shell[data-theme="glass"] .msg.assistant-msg{background:rgba(255,255,255,0.92);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.6);box-shadow:0 8px 24px rgba(0,0,0,0.08);border-radius:20px 20px 20px 4px}',
      '.shell[data-theme="cyberpunk"] .msg.assistant-msg{background:#0f172a;color:#38bdf8;border:2px solid #a855f7;box-shadow:0 0 14px rgba(168,85,247,0.5);border-radius:16px 16px 16px 2px;font-weight:600}',
      '.shell[data-theme="terminal"] .msg.assistant-msg{background:#09090b;color:#22c55e;border:1px solid #22c55e;font-family:monospace;border-radius:4px;box-shadow:0 0 10px rgba(34,197,94,0.2)}',
      '.shell[data-theme="minimal"] .msg.assistant-msg{border-radius:16px 16px 16px 2px;border:1px solid #e4e4e7;background:#ffffff;box-shadow:0 2px 8px rgba(0,0,0,0.04)}',
      '.shell[data-theme="synthwave"] .msg.assistant-msg{background:#1e1b4b;color:#fde047;border:2px solid #ec4899;box-shadow:0 0 16px rgba(236,72,153,0.5);border-radius:16px 16px 16px 2px}',
      '.shell[data-theme="paper"] .msg.assistant-msg{background:#fdfbf7;color:#2c2825;border:1px solid #d6cebf;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-radius:14px 14px 14px 2px;font-family:Georgia,serif}',

      /* Floating Input Pill Bar */
      '.chat-form{display:flex;align-items:center;gap:8px;width:100%;box-sizing:border-box;padding:6px 6px 6px 16px;background:var(--cradle-bg,#ffffff);border-radius:9999px;transition:all 0.15s ease}',
      '.shell[data-theme="neobrutalist"] .chat-form{border:2.5px solid #09090b;box-shadow:3.5px 3.5px 0px #09090b}',
      '.shell[data-theme="modern"] .chat-form,.shell[data-theme="glass"] .chat-form{background:rgba(255,255,255,0.92);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.7);box-shadow:0 10px 28px rgba(0,0,0,0.1)}',
      '.shell[data-theme="cyberpunk"] .chat-form{background:#0f172a;border:2px solid #a855f7;box-shadow:0 0 16px rgba(168,85,247,0.6);border-radius:16px}',
      '.shell[data-theme="terminal"] .chat-form{background:#09090b;border:1.5px solid #22c55e;box-shadow:0 0 12px rgba(34,197,94,0.3);border-radius:4px;font-family:monospace}',
      '.shell[data-theme="minimal"] .chat-form{border:1px solid #e4e4e7;box-shadow:0 2px 10px rgba(0,0,0,0.05)}',
      '.shell[data-theme="synthwave"] .chat-form{background:#1e1b4b;border:2px solid #fde047;box-shadow:0 0 18px rgba(253,224,71,0.4);border-radius:16px}',
      '.shell[data-theme="paper"] .chat-form{background:#fdfbf7;border:1px solid #d6cebf;box-shadow:0 2px 10px rgba(0,0,0,0.05);border-radius:12px;font-family:Georgia,serif}',

      '.chat-input{flex:1;border:0;outline:none;background:transparent;font-size:0.86rem;color:var(--cradle-text,#09090b);padding:4px 0}',
      '.shell[data-theme="cyberpunk"] .chat-input{color:#38bdf8}',
      '.shell[data-theme="cyberpunk"] .chat-input::placeholder{color:rgba(56,189,248,0.5)}',
      '.shell[data-theme="terminal"] .chat-input{color:#22c55e;font-family:monospace}',
      '.shell[data-theme="terminal"] .chat-input::placeholder{color:rgba(34,197,94,0.5)}',
      '.shell[data-theme="synthwave"] .chat-input{color:#fde047}',
      '.shell[data-theme="synthwave"] .chat-input::placeholder{color:rgba(253,224,71,0.5)}',
      '.shell[data-theme="paper"] .chat-input{color:#2c2825;font-family:Georgia,serif}',
      '.shell[data-theme="paper"] .chat-input::placeholder{color:rgba(44,40,37,0.5)}',
      '.chat-input::placeholder{color:rgba(9,9,11,0.4)}',
      
      '.send-btn{display:flex;align-items:center;justify-content:center;padding:6px 14px;border:0;background:transparent;color:var(--cradle-accent,#09090b);font-weight:800;font-size:0.84rem;cursor:pointer;transition:transform 0.1s, opacity 0.15s}',
      '.shell[data-theme="neobrutalist"] .send-btn{background:#09090b;color:#ffffff;border-radius:9999px;padding:6px 16px;font-size:0.78rem}',
      '.shell[data-theme="cyberpunk"] .send-btn{background:#a855f7;color:#0f172a;border-radius:10px;padding:6px 14px;font-weight:900}',
      '.shell[data-theme="terminal"] .send-btn{background:#22c55e;color:#09090b;font-family:monospace;border-radius:2px;padding:4px 10px;font-weight:800}',
      '.shell[data-theme="synthwave"] .send-btn{background:#ec4899;color:#ffffff;border-radius:10px;padding:6px 14px;font-weight:900}',
      '.shell[data-theme="paper"] .send-btn{background:#2c2825;color:#fdfbf7;border-radius:8px;padding:6px 12px;font-family:Georgia,serif;font-weight:700}',
      '.send-btn:active{transform:scale(0.94)}',
      '.send-btn:disabled{opacity:0.3;cursor:not-allowed}',

      /* Trigger Companion */
      '.trigger{display:grid;width:94px;height:102px;place-items:center;border:0;background:transparent;box-shadow:none;cursor:grab;touch-action:none;margin-left:auto}',
      '.trigger:active{cursor:grabbing}',
      '.trigger:focus-visible{outline:3px solid #a5b4fc;outline-offset:3px}',
      '.trigger .companion{width:88px;height:96px;background-repeat:no-repeat;background-size:800% 900%}',
      '@media (prefers-reduced-motion:reduce){.companion{animation:none!important}}',
      '</style>',
      `<div class="shell" data-theme="${this.theme}">` +
        '<section class="panel" hidden aria-label="Website character">' +
          '<slot>' +
            '<div class="built-in-chat">' +
              '<p class="disclosure" role="note"></p>' +
                '<div class="chat-messages" tabindex="0" role="log" aria-live="polite">' +
                '<div class="msg assistant-msg greeting-msg">' +
                  '<p class="greeting" style="margin:0">Hi there! 👋 Ask me anything.</p>' +
                '</div>' +
              '</div>' +
              '<form class="chat-form">' +
                '<input type="text" class="chat-input" placeholder="Ask something..." aria-label="Ask a question" />' +
                '<button type="submit" class="send-btn" aria-label="Send message">Send</button>' +
              '</form>' +
            '</div>' +
          '</slot>' +
        '</section>' +
        '<button class="trigger" type="button" aria-label="Open website character" aria-expanded="false">' +
          '<span class="companion" aria-hidden="true"></span>' +
        '</button>' +
      '</div>',
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

    this.renderDisclosure();
    this.renderMessages();
  }

  private setupChatListeners() {
    const form = this.shadow.querySelector(".chat-form") as HTMLFormElement | null;
    if (form) {
      const input = form.querySelector(".chat-input") as HTMLInputElement | null;
      if (input) {
        input.addEventListener("input", () => {
          if (!this.isBusy && input.value.trim() && this.currentState === "idle") {
            this.setVisualState("waiting");
          } else if (!this.isBusy && !input.value.trim() && this.currentState === "waiting") {
            this.setVisualState("idle");
          }
        });
      }

      form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!input) return;
        const text = input.value.trim();
        if (!text || this.isBusy) return;
        input.value = "";
        void this.sendChatMessage(text);
      });
    }
  }

  private renderDisclosure() {
    const el = this.shadow.querySelector(".disclosure") as HTMLElement | null;
    if (el) el.textContent = this.disclosure;
  }

  private renderMessages() {
    const msgContainer = this.shadow.querySelector(".chat-messages") as HTMLElement | null;
    if (!msgContainer) return;
    const messages = this.chat?.messages ?? [];
    const nearBottom = msgContainer.scrollHeight - msgContainer.scrollTop - msgContainer.clientHeight < 40;

    msgContainer.innerHTML = "";
    if (this.greetingText && messages.length === 0) {
      const greeting = document.createElement("div");
      greeting.className = "msg assistant-msg greeting-msg";
      const p = document.createElement("p");
      p.className = "greeting";
      p.style.margin = "0";
      p.textContent = this.greetingText;
      greeting.appendChild(p);
      msgContainer.appendChild(greeting);
    }

    for (const m of messages) {
      const text = visibleText(m);
      if (!text) continue;
      const bubble = document.createElement("div");
      bubble.className = `msg ${m.role === "user" ? "user-msg" : "assistant-msg"}`;
      bubble.textContent = text;
      msgContainer.appendChild(bubble);
    }

    const last = messages.at(-1);
    if (this.isBusy && !(last?.role === "assistant" && visibleText(last))) {
      const typing = document.createElement("div");
      typing.className = "msg assistant-msg";
      typing.textContent = "\u2026";
      msgContainer.appendChild(typing);
    }
    if (this.chatError) {
      const err = document.createElement("div");
      err.className = "msg assistant-msg";
      err.setAttribute("role", "alert");
      err.textContent = this.chatError;
      msgContainer.appendChild(err);
    }

    const sendBtn = this.shadow.querySelector(".send-btn") as HTMLButtonElement | null;
    if (sendBtn) sendBtn.disabled = this.isBusy;
    if (nearBottom || this.isBusy) msgContainer.scrollTop = msgContainer.scrollHeight;
  }

  private greetingText = "Hi there! 👋 Ask me anything.";

  private async sendChatMessage(text: string) {
    const chat = this.chat;
    if (!chat) return;
    this.explicitState = true;
    this.setVisualState("review");
    // Status, streaming, abort and error handling all live in AbstractChat; this component only
    // reacts through onChatChange(). sendMessage resolves after the stream ends or fails.
    await chat.sendMessage({ text });
  }

  private async loadManifest() {
    try {
      const baseUrl = (this.apiBase || "").replace(/\/$/, "");
      const response = await fetch(baseUrl + "/api/installations/" + this.siteId);
      if (!response.ok) throw new Error("The character manifest could not be loaded.");
      const manifest = await response.json() as Manifest;
      const shell = this.shadow.querySelector(".shell") as HTMLElement;

      shell.dataset.placement = this.placement;
      this.characterName = manifest.character.displayName || "Assistant";
      const resolvedTheme = this.getAttribute("theme") || manifest.character.theme || "neobrutalist";
      this.theme = resolvedTheme;
      shell.dataset.theme = resolvedTheme;

      this.greetingText = manifest.character.greeting || "Hi there! \u{1F44B} Ask me anything.";
      this.disclosure = manifest.disclosure?.trim() || DEFAULT_DISCLOSURE;
      this.renderDisclosure();
      this.renderMessages();

      const overrideUrl = this.getAttribute("sprite-url") || this.getAttribute("preview-url");
      if (overrideUrl) {
        await this.setSpriteUrl(overrideUrl);
      } else if (manifest.assets?.atlas) {
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
      // Fall back
    }

    this.shadow.querySelectorAll<HTMLElement>(".companion").forEach((companion) => {
      companion.style.backgroundImage = 'url("' + imageUrl + '")';
      companion.style.backgroundSize = (this.atlas?.columns ?? 8) * 100 + "% " + (this.atlas?.rows ?? 9) * 100 + "%";
    });

    this.rowFrameCounts = await this.detectFrameCounts(imageUrl, blobForDetection, atlas.columns, atlas.rows);
  }

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
    (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
    if (this.dragged) {
      this.ignoreNextClick = true;
    }
    this.dragStart = null;
    this.dragged = false;
  }

  private eventContext() {
    return {
      siteId: this.siteId,
      visitorId: this.visitorId,
      state: this.currentState,
      open: this.open,
      context: { ...this.pageContext },
    };
  }

  private emit(name: string, detail: Record<string, unknown>) {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }
}

if (typeof customElements !== "undefined" && !customElements.get("cradle-character")) {
  customElements.define("cradle-character", CradleCharacter);
}

/** Attributes the single-tag embed copies from `data-*` on the script onto the element. */
const SCRIPT_ATTRIBUTES = [
  "api-base",
  "chat-endpoint",
  "placement",
  "theme",
  "no-cycle",
  "accent-color",
  "primary-color",
  "bg-color",
  "text-color",
  "posthog-key",
  "posthog-host",
  "user-id",
  "user-hash",
  "user-email",
  "user-name",
] as const;

function visibleText(message: CradleMessage): string {
  return messageText(message).trim();
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
      // Every documented attribute can be set as a data-* attribute on the script tag.
      for (const name of SCRIPT_ATTRIBUTES) {
        const value = script?.getAttribute(`data-${name}`);
        if (value) element.setAttribute(name, value);
      }
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
    setSprite: (url, siteId) => getCharacter(siteId)?.setSpriteUrl(url),
    setUser: (user, siteId) => getCharacter(siteId)?.setUser(user),
  };
}

type CradleCharacterElementProps = {
  "site-id"?: string;
  "api-base"?: string;
  placement?: "floating" | "inline";
  /** Boolean attribute. Present = skip the idle showcase; use when driving real state yourself. */
  "no-cycle"?: boolean | "";
  theme?: "neobrutalist" | "modern" | "cyberpunk" | "terminal" | "minimal" | "synthwave" | "paper";
  "chat-endpoint"?: string;
  "user-id"?: string;
  "user-hash"?: string;
  "user-email"?: string;
  "user-name"?: string;
  "sprite-url"?: string;
  "preview-url"?: string;
  "accent-color"?: string;
  "primary-color"?: string;
  "bg-color"?: string;
  "text-color"?: string;
  children?: unknown;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "cradle-character": CradleCharacterElementProps & Record<string, unknown>;
    }
  }
  namespace React.JSX {
    interface IntrinsicElements {
      "cradle-character": CradleCharacterElementProps & Record<string, unknown>;
    }
  }
}
