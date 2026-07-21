import { crawlPublicSite } from "@cradle/crawler";
import { brandProfileSchema, createDefaultCharacter, crawlRequestSchema, installationSchema } from "@cradle/core";
import { extractBrandAssets } from "openbrand";
import { store } from "../../lib/store";
import { hashManagementKey } from "../../lib/management";

const onboardingSchema = crawlRequestSchema.extend({
  name: installationSchema.shape.name.optional(),
  instructions: installationSchema.shape.instructions.optional(),
});

function resolveInstallationOrigin(sourceUrl: string) {
  const sourceOrigin = new URL(sourceUrl).origin;
  const developmentOrigin = process.env.CRADLE_DEVELOPMENT_EMBED_ORIGIN;
  if (process.env.NODE_ENV !== "development" || !developmentOrigin) return sourceOrigin;
  return new URL(developmentOrigin).origin;
}

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
  const origin = resolveInstallationOrigin(input.url);
  const managementKey = crypto.randomUUID().replaceAll("-", "");
  const name = input.name ?? new URL(input.url).hostname;
  const installationId = crypto.randomUUID();
  const [crawlResult, brandResult] = await Promise.allSettled([
    crawlPublicSite(input, installationId),
    extractBrandAssets(input.url),
  ]);
  if (crawlResult.status === "rejected") throw crawlResult.reason;
  const knowledge = crawlResult.value;
  if (knowledge.pages.length === 0) return Response.json({ error: "No usable public pages were found." }, { status: 422, headers });
  const extractedBrand = brandResult.status === "fulfilled" ? brandResult.value : null;
  const brandProfile = extractedBrand?.ok ? brandProfileSchema.parse({
    name: extractedBrand.data.brand_name || name,
    colors: extractedBrand.data.colors,
    logos: extractedBrand.data.logos.map((logo) => ({ url: logo.url, ...(logo.alt ? { alt: logo.alt } : {}) })),
    backdrops: extractedBrand.data.backdrop_images,
    source: "openbrand",
  }) : undefined;
  const installation = installationSchema.parse({
    id: installationId, managementKeyHash: hashManagementKey(managementKey), origin,
    name,
    instructions: input.instructions ?? "Be helpful, accurate, and concise.",
    knowledgeVersion: 1, runtime: "cradle", character: createDefaultCharacter(name), ...(brandProfile ? { brandProfile } : {}),
  });
  await Promise.all([store.saveInstallation(installation), store.saveKnowledge(knowledge)]);
  return Response.json({ installation: { id: installation.id, name: installation.name, managementKey }, knowledge, brandProfile }, { status: 201, headers });
}
