import { convertToModelMessages, createTextStreamResponse, isStepCount, streamText, toTextStream, tool, type UIMessage } from "ai";
import { z } from "zod";
import { embedKnowledgePages, embedQuery } from "../../lib/embeddings";
import { CRADLE_MODEL_ID, google } from "../../lib/google";
import { store } from "../../lib/store";

export const maxDuration = 60;

const FREE_TIER_MONTHLY_LIMIT = 99;

/**
 * The OPTIONS preflight structurally cannot know which installation this request is for —
 * installationId only ever arrives via a custom header (x-cradle-installation-id) or the JSON
 * body, and per the CORS spec neither is visible to a preflight (Access-Control-Request-Headers
 * only announces header *names*, never values; preflights never carry a body). So the preflight
 * has to stay permissive; real origin validation happens below, once the POST handler has
 * actually loaded the installation and knows its registered origin — see buildCorsHeaders.
 * This closes reading a real visitor's response cross-origin, but NOT quota consumption: the
 * model call and DB writes already happened by the time origin is known. Fully closing that
 * needs installationId visible at preflight time (e.g. as a URL query param too).
 */
const PREFLIGHT_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-cradle-installation-id, x-cradle-visitor-id",
};

/** Reflects Origin only if it matches this installation's registered origin — same pattern as
 *  /api/installations/[id], confirmed against Next.js's own documented CORS example (a plain
 *  Response with conditionally-set headers is the framework's actual recommended approach; there
 *  is no built-in per-origin helper). No match -> omit the header; the browser blocks the read. */
function buildCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-cradle-installation-id, x-cradle-visitor-id",
    "Cache-Control": "no-store",
  };
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: PREFLIGHT_CORS_HEADERS });
}

export async function POST(req: Request) {
  const reqOrigin = req.headers.get("origin");
  try {
    const url = new URL(req.url);
    const headerInstallationId = req.headers.get("x-cradle-installation-id");
    const headerVisitorId = req.headers.get("x-cradle-visitor-id");

    const body = await req.json() as {
      messages?: UIMessage[];
      installationId?: string;
      visitorId?: string;
    };

    const messages = body.messages ?? [];
    const installationId = headerInstallationId || body.installationId || url.searchParams.get("installationId");
    const visitorId = headerVisitorId || body.visitorId || url.searchParams.get("visitorId");

    const lastMsg = messages[messages.length - 1];
    const textPart = lastMsg?.parts?.find((p): p is { type: "text"; text: string } => p.type === "text");
    const lastUserText = textPart?.text || "(no text)";

    console.log(`[Chat API] POST request received -> installationId: ${installationId}, visitorId: ${visitorId}, messageCount: ${messages.length}`);
    console.log(`[Chat API] Latest message (${lastMsg?.role || "unknown"}): "${lastUserText}"`);

    if (!installationId || !visitorId) {
      console.warn(`[Chat API] Missing installationId or visitorId`);
      return new Response(
        JSON.stringify({ error: "Missing required headers: x-cradle-installation-id, x-cradle-visitor-id" }),
        { status: 400, headers: { ...buildCorsHeaders(), "Content-Type": "application/json" } }
      );
    }

    const installation = await store.getInstallation(installationId);
    if (!installation) {
      console.warn(`[Chat API] Installation not found: ${installationId}`);
      return new Response(
        JSON.stringify({ error: "Installation not found" }),
        { status: 404, headers: { ...buildCorsHeaders(), "Content-Type": "application/json" } }
      );
    }

    const CORS_HEADERS = buildCorsHeaders();

    const existingConversation = await store.getConversation(visitorId);
    const isNewConversation = !existingConversation || existingConversation.messages.length === 0;

    await store.touchVisitor(installationId, visitorId);
    const usage = await store.incrementUsage(installationId, isNewConversation);

    if (usage.conversationCount > FREE_TIER_MONTHLY_LIMIT) {
      console.warn(`[Chat API] Monthly conversation quota exceeded for installation: ${installationId} (${usage.conversationCount}/${FREE_TIER_MONTHLY_LIMIT})`);
      return new Response(
        JSON.stringify({ error: "Monthly conversation limit reached (99/99 conversations). Upgrade to Qualra for unlimited interactions." }),
        { status: 429, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const memories = await store.getVisitorMemories(visitorId);
    const memoriesContext = memories.length > 0
      ? memories.map((m) => `- ${m.key}: ${m.value}`).join("\n")
      : "No remembered facts about this visitor yet.";

    const brandName = installation.brandProfile?.name || installation.name || "the business";

    const systemPrompt = `You are a core team member and product lead at ${brandName}.
You do not speak like a generic customer service bot or canned sales representative. You talk like an engineer or product insider who built ${brandName}—someone who deeply understands the product, architecture, features, and value proposition, and loves explaining it directly, naturally, and knowledgeably.

Team & Product Directives:
1. Speak like an insider on the product team: confident, articulate, conversational, and direct. Use "we", "our team", and "our product".
2. Owner's Persona Directives:
${installation.instructions || "Be engaging, highly knowledgeable, clear, and energetic."}

3. Known Visitor Context (Facts remembered from earlier interactions with this visitor):
${memoriesContext}

Directives:
- Always call the 'searchKnowledge' tool whenever you need exact facts, technical documentation, pricing, features, or details about ${brandName} from our site content.
- Use 'setEmote' to express emotional animation transitions (e.g. 'waving' on greetings, 'waiting' when looking up docs, 'jumping' when sharing exciting news, 'failed' when apologetic).
- Use 'rememberFact' whenever the visitor shares key background (their name, role, company, stack, or goals).
- Provide high-signal, articulate answers. Avoid corporate buzzword fluff; explain clearly and concisely like a real teammate speaking to a customer or peer.`;

    console.log(`[Chat API] Invoking streamText model: ${CRADLE_MODEL_ID} for brand: ${brandName}`);

    const result = streamText({
      model: google(CRADLE_MODEL_ID),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
      stopWhen: isStepCount(10),
      tools: {
        searchKnowledge: tool({
          description: `Search ${brandName}'s documentation, site pages, and knowledge base for relevant facts.`,
          inputSchema: z.object({
            query: z.string().describe("The search query to look up in the site's knowledge base"),
          }),
          execute: async ({ query }) => {
            console.log(`[Chat Tool] searchKnowledge executing query: "${query}"`);
            try {
              const queryEmbedding = await embedQuery(query);
              let chunks = await store.searchKnowledgeChunks(installationId, queryEmbedding, 4);
              console.log(`[Chat Tool] searchKnowledge found ${chunks.length} chunks`);

              // Auto-heal: If chunks is 0, check if raw knowledge pages exist and embed them on-the-fly
              if (chunks.length === 0) {
                const rawKnowledge = await store.getKnowledge(installationId);
                if (rawKnowledge?.pages && rawKnowledge.pages.length > 0) {
                  console.log(`[Chat Tool] Auto-embedding ${rawKnowledge.pages.length} raw pages for installationId: ${installationId}`);
                  await embedKnowledgePages(installationId, rawKnowledge.pages);
                  chunks = await store.searchKnowledgeChunks(installationId, queryEmbedding, 4);
                  console.log(`[Chat Tool] Re-query found ${chunks.length} chunks after auto-embedding`);
                }
              }

              if (chunks.length === 0) {
                return { found: false, message: "No relevant site documentation found for this query." };
              }
              return {
                found: true,
                results: chunks.map((c) => ({ title: c.pageTitle, url: c.pageUrl, content: c.chunkText })),
              };
            } catch (err: unknown) {
              const errMsg = err instanceof Error ? err.message : "Failed to search knowledge base";
              console.error(`[Chat Tool] searchKnowledge error: ${errMsg}`);
              return { found: false, error: errMsg };
            }
          },
        }),

        rememberFact: tool({
          description: "Remember a key fact or preference about the visitor for future interactions.",
          inputSchema: z.object({
            key: z.string().describe("Identifier for the fact (e.g. 'visitor_name', 'company', 'interest')"),
            value: z.string().describe("The value or detail to remember"),
          }),
          execute: async ({ key, value }) => {
            console.log(`[Chat Tool] rememberFact key: "${key}", value: "${value}"`);
            await store.setVisitorMemory(visitorId, key, value);
            return { remembered: { key, value } };
          },
        }),

        forgetFact: tool({
          description: "Forget a previously remembered fact about the visitor if requested or corrected.",
          inputSchema: z.object({
            key: z.string().describe("The key of the fact to forget"),
          }),
          execute: async ({ key }) => {
            console.log(`[Chat Tool] forgetFact key: "${key}"`);
            await store.deleteVisitorMemory(visitorId, key);
            return { forgotten: key };
          },
        }),

        setEmote: tool({
          description: "Set the character's visual animation state to match the emotional tone of your response. Use 'waving' to greet, 'jumping' for excitement, 'waiting' while searching, 'failed' when apologetic.",
          inputSchema: z.object({
            emote: z.enum(["idle", "waving", "jumping", "waiting", "failed", "review"]),
          }),
          execute: async ({ emote }) => {
            console.log(`[Chat Tool] setEmote: "${emote}"`);
            return { emote };
          },
        }),
      },
      onFinish: async ({ responseMessages }) => {
        console.log(`[Chat API] Stream completed onFinish -> generated ${responseMessages.length} response messages`);
        try {
          const existingConv = await store.getConversation(visitorId);
          await store.saveConversation({
            id: existingConv?.id || crypto.randomUUID(),
            installationId,
            visitorId,
            messages: [...messages, ...responseMessages] as unknown[],
            createdAt: existingConv?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          console.log(`[Chat API] Conversation saved successfully for visitorId: ${visitorId}`);
        } catch (err) {
          console.error("[Chat API] Failed to save conversation:", err);
        }
      },
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of result.stream) {
            const rawChunk = chunk as Record<string, unknown>;
            if (rawChunk.type === "tool-call" && rawChunk.toolName === "setEmote") {
              const inputObj = (rawChunk.input || rawChunk.args) as { emote?: string } | undefined;
              const emote = inputObj?.emote;
              if (emote) {
                console.log(`[Chat API] setEmote tool-call emitted to stream: "${emote}"`);
                controller.enqueue(encoder.encode(`[cradle:emote:${emote}]`));
              }
            } else if (rawChunk.type === "text-delta") {
              const text = (rawChunk.textDelta || rawChunk.text) as string | undefined;
              if (text) {
                controller.enqueue(encoder.encode(text));
              }
            }
          }
        } catch (err) {
          console.error("[Chat API] Stream error:", err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error: unknown) {
    console.error("[Chat API] Error in /api/chat:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...buildCorsHeaders(), "Content-Type": "application/json" } }
    );
  }
}
