import { google } from "@ai-sdk/google";
import { streamText, tool, type UIMessage } from "ai";
import { z } from "zod";
import { embedQuery } from "../../lib/embeddings";
import { store } from "../../lib/store";

export const maxDuration = 60; // 60s timeout for multi-step tool calls

const FREE_TIER_MONTHLY_LIMIT = 500;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-cradle-installation-id, x-cradle-visitor-id",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const headerInstallationId = req.headers.get("x-cradle-installation-id");
    const headerVisitorId = req.headers.get("x-cradle-visitor-id");

    const body = await req.json();
    const {
      messages = [],
      installationId: bodyInstallationId,
      visitorId: bodyVisitorId,
    } = body as {
      messages?: UIMessage[];
      installationId?: string;
      visitorId?: string;
    };

    const installationId = headerInstallationId || bodyInstallationId || url.searchParams.get("installationId");
    const visitorId = headerVisitorId || bodyVisitorId || url.searchParams.get("visitorId");

    if (!installationId || !visitorId) {
      return new Response(
        JSON.stringify({ error: "Missing required headers or params: x-cradle-installation-id, x-cradle-visitor-id" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const installation = await store.getInstallation(installationId);
    if (!installation) {
      return new Response(
        JSON.stringify({ error: "Installation not found" }),
        { status: 404, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    await store.touchVisitor(installationId, visitorId);
    const usage = await store.incrementUsage(installationId);

    if (usage.messageCount > FREE_TIER_MONTHLY_LIMIT) {
      return new Response(
        JSON.stringify({
          error: "Free monthly quota exceeded for this installation",
          message: "This site has reached its monthly free AI message quota. Upgrade to Qualra for unlimited interactions.",
        }),
        { status: 429, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const memories = await store.getVisitorMemories(visitorId);
    const memoriesContext = memories.length > 0
      ? memories.map((m) => `- ${m.key}: ${m.value}`).join("\n")
      : "No remembered facts about this visitor yet.";

    const brandName = installation.brandProfile?.name || installation.name || "the business";

    const systemPrompt = `You are the official representative and assistant for ${brandName}.
You are not a generic chatbot. You actively represent ${brandName}, help visitors learn about products/services, answer technical or business inquiries accurately, and guide potential clients.

Specific Persona & Business Directives from the Owner:
${installation.instructions || "Be helpful, clear, energetic, and professional."}

Visitor Knowledge (Facts remembered from previous interactions with this visitor):
${memoriesContext}

Directives:
1. Always maintain the persona of ${brandName}. Speak naturally, concisely, and knowledgeably.
2. Use the 'searchKnowledge' tool whenever you need precise facts, docs, pricing, features, or details about ${brandName} from their site content.
3. Use the 'rememberFact' tool whenever the visitor shares meaningful information (e.g. their name, company, email, project goals, tech stack, or specific preferences).
4. If you don't know an answer even after searching site knowledge, admit it politely and invite them to reach out via contact options.`;

    const searchKnowledgeTool = tool({
      description: `Search ${brandName}'s documentation, site pages, and knowledge base for relevant facts.`,
      inputSchema: z.object({
        query: z.string().describe("The search query to look up in the site's knowledge base"),
      }),
      execute: async ({ query }) => {
        try {
          const queryEmbedding = await embedQuery(query);
          const chunks = await store.searchKnowledgeChunks(installationId, queryEmbedding, 4);
          if (chunks.length === 0) {
            return { found: false, message: "No relevant site documentation found for this query." };
          }
          return {
            found: true,
            results: chunks.map((c) => ({
              title: c.pageTitle,
              url: c.pageUrl,
              content: c.chunkText,
            })),
          };
        } catch (err: any) {
          return { found: false, error: err.message || "Failed to search knowledge base" };
        }
      },
    });

    const rememberFactTool = tool({
      description: "Remember a key fact or preference about the visitor for future interactions (e.g., name, company, email, goals).",
      inputSchema: z.object({
        key: z.string().describe("Identifier for the fact (e.g., 'visitor_name', 'company_size', 'interest')"),
        value: z.string().describe("The value or detail to remember"),
      }),
      execute: async ({ key, value }) => {
        await store.setVisitorMemory(visitorId, key, value);
        return { success: true, remembered: { key, value } };
      },
    });

    const forgetFactTool = tool({
      description: "Forget a previously remembered fact about the visitor if requested or corrected.",
      inputSchema: z.object({
        key: z.string().describe("The key of the fact to forget"),
      }),
      execute: async ({ key }) => {
        await store.deleteVisitorMemory(visitorId, key);
        return { success: true, forgottenKey: key };
      },
    });

    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      messages: messages as any,
      tools: {
        searchKnowledge: searchKnowledgeTool,
        rememberFact: rememberFactTool,
        forgetFact: forgetFactTool,
      },
      onFinish: async ({ responseMessages }) => {
        try {
          const updatedMessages = [...messages, ...responseMessages];
          const existingConv = await store.getConversation(visitorId);
          await store.saveConversation({
            id: existingConv?.id || crypto.randomUUID(),
            installationId,
            visitorId,
            messages: updatedMessages as unknown[],
            createdAt: existingConv?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } catch (err) {
          console.error("Failed to save conversation history:", err);
        }
      },
    });

    return result.toTextStreamResponse({ headers: CORS_HEADERS });
  } catch (error: any) {
    console.error("Error in /api/chat route:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
}
