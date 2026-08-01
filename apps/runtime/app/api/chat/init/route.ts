import { generateText } from "ai";
import { CRADLE_MODEL_ID, google } from "../../../lib/google";
import { store } from "../../../lib/store";

export const maxDuration = 30;

/** See apps/runtime/app/api/chat/route.ts for why the preflight can't be origin-scoped here —
 *  same structural reason applies (installationId isn't visible to an OPTIONS preflight). */
const PREFLIGHT_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-cradle-installation-id, x-cradle-visitor-id",
};

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

    const body = await req.json().catch(() => ({}));
    const {
      installationId: bodyInstallationId,
      visitorId: bodyVisitorId,
    } = body as { installationId?: string; visitorId?: string };

    const installationId = headerInstallationId || bodyInstallationId || url.searchParams.get("installationId");
    const visitorId = headerVisitorId || bodyVisitorId || url.searchParams.get("visitorId");

    console.log(`[Chat Init API] POST request received -> installationId: ${installationId}, visitorId: ${visitorId}`);

    if (!installationId) {
      console.warn("[Chat Init API] Missing installationId");
      return new Response(
        JSON.stringify({ error: "Missing installationId" }),
        { status: 400, headers: { ...buildCorsHeaders(), "Content-Type": "application/json" } }
      );
    }

    const installation = await store.getInstallation(installationId);
    if (!installation) {
      console.warn(`[Chat Init API] Installation not found: ${installationId}`);
      return new Response(
        JSON.stringify({ error: "Installation not found" }),
        { status: 404, headers: { ...buildCorsHeaders(), "Content-Type": "application/json" } }
      );
    }

    const CORS_HEADERS = buildCorsHeaders();

    const brandName = installation.brandProfile?.name || installation.name || "our business";
    const memories = visitorId ? await store.getVisitorMemories(visitorId) : [];
    const conversation = visitorId ? await store.getConversation(visitorId) : null;

    if (conversation?.messages && (conversation.messages as any[]).length > 0) {
      console.log(`[Chat Init API] Returning visitor with previous thread (${(conversation.messages as any[]).length} messages)`);
      return new Response(
        JSON.stringify({ greeting: null, isReturning: true }),
        { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const memoriesContext = memories.length > 0
      ? memories.map((m) => `- ${m.key}: ${m.value}`).join("\n")
      : "First time visiting.";

    console.log(`[Chat Init API] Generating greeting for brand: ${brandName}`);

    const { text } = await generateText({
      model: google(CRADLE_MODEL_ID),
      system: `You are the official representative for ${brandName}.
Generate a single, warm, personalized 1-sentence greeting for a website visitor.
Do not use generic template text. Be energetic, natural, and welcoming.

Owner directives:
${installation.instructions || "Be helpful, clear, and energetic."}

Visitor Context:
${memoriesContext}`,
      prompt: "Generate the initial greeting text now (keep it under 140 characters, friendly and engaging).",
    });

    const greeting = text.trim() || `Hi there! 👋 Welcome to ${brandName}. Ask me anything!`;
    console.log(`[Chat Init API] Generated greeting: "${greeting}"`);

    return new Response(
      JSON.stringify({ greeting }),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[Chat Init API] Error in /api/chat/init route:", error);
    return new Response(
      JSON.stringify({ greeting: "Hi there! 👋 Welcome to our site. Ask me anything!" }),
      { status: 200, headers: { ...buildCorsHeaders(), "Content-Type": "application/json" } }
    );
  }
}
