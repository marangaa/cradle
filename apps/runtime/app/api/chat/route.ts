import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { chatEventSchema, chatRequestSchema } from "@cradle/core";
import { store } from "../../lib/store";
import { verifyWidgetToken } from "../../lib/widget-token";

export const runtime = "nodejs";

function corsHeaders(request: Request, origin: string) {
  if (request.headers.get("origin") !== origin) return null;
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type, authorization",
    "cache-control": "no-store",
    vary: "Origin",
  };
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return new Response(null, { status: 400 });
  return new Response(null, { status: 204, headers: {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type, authorization",
    vary: "Origin",
  } });
}

/** Streams a grounded turn for an installed representative. */
export async function POST(request: Request) {
  const input = chatRequestSchema.parse(await request.json());
  const installation = await store.getInstallation(input.installationId);
  const knowledge = await store.getKnowledge(input.installationId);
  if (!installation || !knowledge) return Response.json({ error: "Unknown or unready installation." }, { status: 404 });
  const headers = corsHeaders(request, installation.origin);
  if (!headers) return Response.json({ error: "Origin is not authorized for this installation." }, { status: 403 });
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/, "");
  if (!token || !verifyWidgetToken(token, input.installationId, installation.origin)) return Response.json({ error: "Widget token is invalid or expired." }, { status: 401, headers });
  const priorMessages = await store.listMessages(input.conversationId);
  await store.appendEvent(chatEventSchema.parse({ id: crypto.randomUUID(), installationId: input.installationId, visitorId: input.visitorId, conversationId: input.conversationId, type: "message.created", occurredAt: new Date().toISOString(), payload: { role: "user", content: input.message } }));
  const knowledgeContext = knowledge.pages.map((page) => `# ${page.title}\n${page.markdown}`).join("\n\n").slice(0, 40_000);
  const result = streamText({
    model: openai(process.env.CRADLE_MODEL_ID ?? "gpt-5.6-sol"),
    system: `${installation.instructions}\n\nYou are this company's resident representative. Answer only from the reviewed website knowledge below. If the answer is absent, say so plainly.\n\n${knowledgeContext}`,
    messages: [...priorMessages, { role: "user", content: input.message }],
  });
  return result.toTextStreamResponse({ headers });
}
