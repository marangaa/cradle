import { crawlPublicSite } from "@cradle/crawler";
import { crawlRequestSchema, installationSchema } from "@cradle/core";
import { store } from "../../lib/store";

const onboardingSchema = crawlRequestSchema.extend({
  name: installationSchema.shape.name.optional(),
  instructions: installationSchema.shape.instructions.optional(),
  runtime: installationSchema.shape.runtime.default("cradle"),
});

function studioCorsHeaders(request: Request) {
  const origin = request.headers.get("origin");
  const configuredOrigin = process.env.CRADLE_STUDIO_ORIGIN;
  if (!origin || !configuredOrigin || origin !== configuredOrigin) return null;
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    vary: "Origin",
  };
}

export function OPTIONS(request: Request) {
  const headers = studioCorsHeaders(request);
  return headers ? new Response(null, { status: 204, headers }) : new Response(null, { status: 403 });
}

/** Creates a reviewable, bounded knowledge snapshot and installation. */
export async function POST(request: Request) {
  const headers = studioCorsHeaders(request);
  if (!headers) return Response.json({ error: "Studio origin is not authorized." }, { status: 403 });
  const input = onboardingSchema.parse(await request.json());
  const origin = new URL(input.url).origin;
  const installation = installationSchema.parse({
    id: crypto.randomUUID(), publicKey: crypto.randomUUID().replaceAll("-", ""), origin,
    name: input.name ?? new URL(input.url).hostname,
    instructions: input.instructions ?? "Be helpful, accurate, and concise.",
    knowledgeVersion: 1, runtime: input.runtime,
  });
  const knowledge = await crawlPublicSite(input, installation.id);
  if (knowledge.pages.length === 0) return Response.json({ error: "No usable public pages were found." }, { status: 422, headers });
  await Promise.all([store.saveInstallation(installation), store.saveKnowledge(knowledge)]);
  return Response.json({ installation, knowledge }, { status: 201, headers });
}
