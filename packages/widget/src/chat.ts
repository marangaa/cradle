import {
  AbstractChat,
  DefaultChatTransport,
  type ChatStatus,
  type ChatState,
  type DataUIPart,
  type UIMessage,
} from "ai";

/**
 * Chat engine for the widget, built on the AI SDK's framework-agnostic chat core instead of
 * hand-parsing the stream.
 *
 * - `AbstractChat` is the base class the official framework packages (`@ai-sdk/react`'s `useChat`,
 *   `@ai-sdk/svelte`'s `Chat`, ...) are built on. It owns the request lifecycle, status, abort,
 *   error handling and assembling streamed chunks into `UIMessage`s. It only needs a `ChatState`
 *   (where messages live) from the host framework; a custom element has no reactive framework, so
 *   `CradleChatState` below is a tiny plain-object implementation that calls `onChange`.
 * - `DefaultChatTransport` is the documented HTTP transport: it POSTs the UI messages and parses
 *   the UI message stream (SSE) the backend sends (`createUIMessageStreamResponse` /
 *   `result.toUIMessageStreamResponse()`).
 * - `onData` receives every `data-*` part (including transient ones, which are NOT added to
 *   `message.parts`). That is how `data-emote` and the `data-widget_guide` spotlight arrive.
 *
 * Docs: https://ai-sdk.dev/docs/ai-sdk-ui/transport and
 * https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat (`onData`, `transport`); types in
 * node_modules/ai/dist/index.d.ts (`AbstractChat`, `ChatState`, `DefaultChatTransport`).
 */

export type CradleMessage = UIMessage;
export type CradleDataPart = DataUIPart<Record<string, unknown>>;

class CradleChatState implements ChatState<CradleMessage> {
  private _status: ChatStatus = "ready";
  private _error: Error | undefined;
  private _messages: CradleMessage[];

  constructor(initial: CradleMessage[], private readonly onChange: () => void) {
    this._messages = initial;
  }

  get status() {
    return this._status;
  }
  set status(value: ChatStatus) {
    this._status = value;
    this.onChange();
  }
  get error() {
    return this._error;
  }
  set error(value: Error | undefined) {
    this._error = value;
    this.onChange();
  }
  get messages() {
    return this._messages;
  }
  set messages(value: CradleMessage[]) {
    this._messages = value;
    this.onChange();
  }

  pushMessage = (message: CradleMessage) => {
    this._messages = [...this._messages, message];
    this.onChange();
  };
  popMessage = () => {
    this._messages = this._messages.slice(0, -1);
    this.onChange();
  };
  replaceMessage = (index: number, message: CradleMessage) => {
    this._messages = this._messages.map((m, i) => (i === index ? message : m));
    this.onChange();
  };
  // The SDK hands us live objects it keeps mutating while streaming; a JSON round trip is the
  // same deep copy the official integrations use for frameworks without built-in snapshots.
  snapshot = <T>(thing: T): T => JSON.parse(JSON.stringify(thing)) as T;
}

export type CradleChatOptions = {
  /** Full URL of the chat endpoint, e.g. `https://app.qualra.xyz/api/chat?key=...`. */
  api: string;
  /** Resolved on every request, so identity can change without rebuilding the chat. */
  headers: () => Record<string, string>;
  /** Resolved on every request: extra body fields (ids, client context). */
  body: () => Record<string, unknown>;
  initialMessages: CradleMessage[];
  onChange: () => void;
  onData: (part: CradleDataPart) => void;
  onError?: (error: Error) => void;
  /** Injected in tests. */
  fetch?: typeof fetch;
};

export class CradleChat extends AbstractChat<CradleMessage> {
  constructor(options: CradleChatOptions) {
    super({
      state: new CradleChatState(options.initialMessages, options.onChange),
      transport: new DefaultChatTransport<CradleMessage>({
        api: options.api,
        headers: options.headers,
        body: options.body,
        ...(options.fetch ? { fetch: options.fetch } : {}),
      }),
      onData: (part) => options.onData(part as unknown as CradleDataPart),
      ...(options.onError ? { onError: options.onError } : {}),
    });
  }
}

/** Visible text of a message: text parts only, with legacy in-band emote tags removed. */
export function messageText(message: CradleMessage): string {
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("")
    .replace(/\[cradle:emote:[a-z-]+\]/gi, "");
}

/**
 * Persisted history format: text-only UI messages. Accepts the pre-0.2 shape
 * (`{ id, role, content }`) so returning visitors keep their thread.
 */
export function parseStoredMessages(raw: string | null): CradleMessage[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const out: CradleMessage[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== "object") continue;
      const m = item as { id?: unknown; role?: unknown; content?: unknown; parts?: unknown };
      if (typeof m.id !== "string" || (m.role !== "user" && m.role !== "assistant")) continue;
      if (Array.isArray(m.parts)) {
        const text = (m.parts as Array<{ type?: string; text?: string }>)
          .filter((p) => p.type === "text" && typeof p.text === "string")
          .map((p) => p.text as string)
          .join("");
        if (text) out.push({ id: m.id, role: m.role, parts: [{ type: "text", text }] });
      } else if (typeof m.content === "string" && m.content && m.content !== "…") {
        out.push({ id: m.id, role: m.role, parts: [{ type: "text", text: m.content }] });
      }
    }
    return out;
  } catch {
    return [];
  }
}

export function serializeMessages(messages: CradleMessage[]): string {
  const slim = messages
    .map((m) => ({
      id: m.id,
      role: m.role,
      parts: [{ type: "text" as const, text: messageText(m) }],
    }))
    .filter((m) => (m.parts[0]?.text ?? "").trim().length > 0)
    .slice(-100);
  return JSON.stringify(slim);
}
