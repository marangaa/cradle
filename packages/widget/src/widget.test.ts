import assert from "node:assert/strict";
import test from "node:test";
import { CradleChat, parseStoredMessages, serializeMessages, type CradleDataPart } from "./chat.js";
import { isGuidePartType, parseGuideSteps } from "./guide.js";
import { buildIdentityHeaders, readHostUser } from "./identity.js";
import { bestLabelMatch } from "./match.js";

// ---------------------------------------------------------------- label matching

test("bestLabelMatch prefers exact over prefix over substring", () => {
  const candidates = [
    { name: "Export CSV and PDF reports", role: "button" },
    { name: "Export CSV file", role: "button" },
    { name: "Export CSV", role: "button" },
  ];
  assert.equal(bestLabelMatch(candidates, "export csv"), 2);
  assert.equal(bestLabelMatch(candidates, "Export CSV f"), 1);
});

test("bestLabelMatch honours role hints and ignores 'any'", () => {
  const candidates = [
    { name: "Billing", role: "link" },
    { name: "Billing", role: "heading" },
  ];
  assert.equal(bestLabelMatch(candidates, "billing", "heading"), 1);
  assert.equal(bestLabelMatch(candidates, "billing", "any"), 0);
  assert.equal(bestLabelMatch(candidates, "billing", "tab"), -1);
});

test("bestLabelMatch refuses tiny substrings and empty labels", () => {
  const candidates = [{ name: "Cookies and more", role: "button" }];
  assert.equal(bestLabelMatch(candidates, "ok"), -1);
  assert.equal(bestLabelMatch(candidates, "   "), -1);
});

test("bestLabelMatch treats a label as text, never as a selector", () => {
  const candidates = [{ name: "Save", role: "button" }];
  assert.equal(bestLabelMatch(candidates, "button#save"), -1);
  assert.equal(bestLabelMatch(candidates, "' or 1=1 or '"), -1);
});

// ---------------------------------------------------------------- guide contract

test("parseGuideSteps accepts the documented shape and the legacy 'element' alias", () => {
  const steps = parseGuideSteps({
    steps: [
      { label: "Export CSV", title: "Export", description: "Click here", role: "button", side: "left" },
      { element: "Settings", title: "Open settings", description: "Then this", role: "bogus", side: "up" },
    ],
  });
  assert.equal(steps.length, 2);
  assert.deepEqual(steps[0], {
    label: "Export CSV",
    title: "Export",
    description: "Click here",
    role: "button",
    side: "left",
  });
  assert.equal(steps[1]?.label, "Settings");
  assert.equal(steps[1]?.role, undefined);
  assert.equal(steps[1]?.side, undefined);
});

test("parseGuideSteps drops malformed steps and caps the count", () => {
  assert.deepEqual(parseGuideSteps(null), []);
  assert.deepEqual(parseGuideSteps({ steps: "nope" }), []);
  assert.deepEqual(parseGuideSteps({ steps: [{ label: "x" }, 5, null] }), []);
  const many = Array.from({ length: 20 }, (_, i) => ({ label: `L${i}`, title: "t", description: "d" }));
  assert.equal(parseGuideSteps({ steps: many }).length, 8);
});

test("guide part types", () => {
  assert.ok(isGuidePartType("data-widget_guide"));
  assert.ok(isGuidePartType("data-guide"));
  assert.ok(!isGuidePartType("data-emote"));
});

// ---------------------------------------------------------------- identity

test("buildIdentityHeaders sends visitor under both spellings and no user when anonymous", () => {
  const h = buildIdentityHeaders({ siteId: "pk_1", visitorId: "v-1" });
  assert.equal(h["x-cradle-visitor"], "v-1");
  assert.equal(h["x-cradle-visitor-id"], "v-1");
  assert.equal(h["x-cradle-installation-id"], "pk_1");
  assert.equal(h["x-cradle-user-id"], undefined);
});

test("buildIdentityHeaders percent-encodes user fields", () => {
  const h = buildIdentityHeaders({
    siteId: "pk_1",
    visitorId: "v-1",
    user: { id: "u/1", hash: "abc", email: "a@b.co", name: "Zoë" },
  });
  assert.equal(h["x-cradle-user-id"], "u%2F1");
  assert.equal(h["x-cradle-user-hash"], "abc");
  assert.equal(h["x-cradle-user-email"], "a%40b.co");
  assert.equal(h["x-cradle-user-name"], "Zo%C3%AB");
});

test("readHostUser requires a user-id", () => {
  const attrs: Record<string, string> = { "user-hash": "abc", "user-name": " Ann " };
  assert.equal(readHostUser((n) => attrs[n] ?? null), null);
  attrs["user-id"] = " 42 ";
  assert.deepEqual(readHostUser((n) => attrs[n] ?? null), { id: "42", hash: "abc", name: "Ann" });
});

// ---------------------------------------------------------------- history storage

test("parseStoredMessages migrates the pre-0.2 shape and drops junk", () => {
  const raw = JSON.stringify([
    { id: "1", role: "user", content: "hello" },
    { id: "2", role: "assistant", content: "…" },
    { id: "3", role: "assistant", parts: [{ type: "text", text: "hi" }] },
    { id: "4", role: "system", content: "x" },
    "junk",
  ]);
  const messages = parseStoredMessages(raw);
  assert.deepEqual(
    messages.map((m) => [m.id, m.role]),
    [
      ["1", "user"],
      ["3", "assistant"],
    ],
  );
  assert.equal(parseStoredMessages("not json").length, 0);
  assert.equal(parseStoredMessages(null).length, 0);
  assert.equal(JSON.parse(serializeMessages(messages)).length, 2);
});

// ---------------------------------------------------------------- the AI SDK chat core

function sseResponse(chunks: unknown[]): Response {
  const body = chunks.map((c) => `data: ${JSON.stringify(c)}\n\n`).join("") + "data: [DONE]\n\n";
  return new Response(body, {
    status: 200,
    headers: { "content-type": "text/event-stream", "x-vercel-ai-ui-message-stream": "v1" },
  });
}

test("CradleChat streams text, surfaces transient data parts via onData, and sends identity headers", async () => {
  const seen: CradleDataPart[] = [];
  const requests: { url: string; headers: Headers; body: Record<string, unknown> }[] = [];
  let changes = 0;

  const chat = new CradleChat({
    api: "https://app.example.com/api/chat?key=pk_1",
    initialMessages: [],
    headers: () => buildIdentityHeaders({ siteId: "pk_1", visitorId: "v-1", user: { id: "u1", hash: "h" } }),
    body: () => ({ installationId: "pk_1", visitorId: "v-1" }),
    onData: (part) => seen.push(part),
    onChange: () => {
      changes += 1;
    },
    fetch: (async (input: RequestInfo | URL, init?: RequestInit) => {
      requests.push({
        url: String(input),
        headers: new Headers(init?.headers),
        body: JSON.parse(String(init?.body)),
      });
      return sseResponse([
        { type: "start", messageId: "m1" },
        { type: "data-emote", data: { emote: "waving" }, transient: true },
        { type: "text-start", id: "t1" },
        { type: "text-delta", id: "t1", delta: "Hello " },
        { type: "text-delta", id: "t1", delta: "there" },
        { type: "text-end", id: "t1" },
        {
          type: "data-widget_guide",
          data: { steps: [{ label: "Export CSV", title: "Export", description: "Click" }] },
          transient: true,
        },
        { type: "finish" },
      ]);
    }) as typeof fetch,
  });

  await chat.sendMessage({ text: "hi" });

  assert.equal(chat.status, "ready");
  assert.equal(chat.messages.length, 2);
  const reply = chat.messages[1];
  assert.equal(reply?.role, "assistant");
  assert.equal(
    reply?.parts.map((p) => (p.type === "text" ? p.text : "")).join(""),
    "Hello there",
  );
  assert.deepEqual(
    seen.map((p) => p.type),
    ["data-emote", "data-widget_guide"],
  );
  assert.ok(changes > 2, "state change notifications fire while streaming");

  const req = requests[0];
  assert.ok(req);
  assert.equal(req.url, "https://app.example.com/api/chat?key=pk_1");
  assert.equal(req.headers.get("x-cradle-visitor"), "v-1");
  assert.equal(req.headers.get("x-cradle-user-id"), "u1");
  assert.equal(req.body.installationId, "pk_1");
  assert.ok(Array.isArray(req.body.messages));
});

test("CradleChat reports HTTP failures through status and onError", async () => {
  let reported: Error | undefined;
  const chat = new CradleChat({
    api: "https://app.example.com/api/chat",
    initialMessages: [],
    headers: () => ({}),
    body: () => ({}),
    onData: () => {},
    onChange: () => {},
    onError: (e) => {
      reported = e;
    },
    fetch: (async () => new Response("Too many requests", { status: 429 })) as typeof fetch,
  });
  await chat.sendMessage({ text: "hi" });
  assert.equal(chat.status, "error");
  assert.ok(reported);
});
