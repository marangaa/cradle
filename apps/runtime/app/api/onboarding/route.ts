import { crawlPublicSite } from "@cradle/crawler";
import { brandProfileSchema, createDefaultCharacter, crawlRequestSchema, installationSchema } from "@cradle/core";
import { auth } from "@cradle/db";
import { extractBrandAssets } from "openbrand";
import { embedKnowledgePages } from "../../lib/embeddings";
import { store } from "../../lib/store";
import { z } from "zod";

const onboardingSchema = crawlRequestSchema.extend({
  name: installationSchema.shape.name.optional(),
  instructions: installationSchema.shape.instructions.optional(),
  additionalContext: z.string().trim().optional(),
});

function resolveInstallationOrigin(sourceUrl: string) {
  const sourceOrigin = new URL(sourceUrl).origin;
  const developmentOrigin = process.env.CRADLE_DEVELOPMENT_EMBED_ORIGIN;
  if (process.env.NODE_ENV !== "development" || !developmentOrigin) return sourceOrigin;
  return new URL(developmentOrigin).origin;
}

/** Creates a reviewable, bounded knowledge snapshot and installation owned by the signed-in account. Called only by Studio's server, never a browser. */
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return Response.json({ error: "Sign in to Studio before mapping a site." }, { status: 401 });

    const rawBody = await request.json().catch(() => ({}));
    const parseResult = onboardingSchema.safeParse(rawBody);
    if (!parseResult.success) {
      console.warn("[Onboarding Zod Validation Error]:", parseResult.error.format());
      const issue = parseResult.error.issues[0]?.message || "Invalid onboarding payload.";
      return Response.json({ error: issue }, { status: 400 });
    }
    const input = parseResult.data;

    let origin: string;
    let name: string;
    try {
      origin = resolveInstallationOrigin(input.url);
      name = input.name ?? new URL(input.url).hostname;
    } catch {
      return Response.json({ error: "Please enter a valid website URL (e.g. https://example.com)." }, { status: 400 });
    }

    const existingInstallations = await store.listInstallationsByOwner(session.user.id);
    const existing = existingInstallations.find((inst) => inst.origin === origin);
    const installationId = existing ? existing.id : crypto.randomUUID();

    const brandPromise = Promise.race([
      extractBrandAssets(input.url).catch(() => null),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 10_000)),
    ]);

    const [crawlResult, brandResult] = await Promise.allSettled([
      crawlPublicSite(input, installationId),
      brandPromise,
    ]);

    if (crawlResult.status === "rejected") {
      const reason = crawlResult.reason;
      const message = reason instanceof Error ? reason.message : String(reason || "Cradle could not read this site.");
      return Response.json({ error: `Could not crawl this site: ${message}` }, { status: 502 });
    }
    const knowledge = crawlResult.value;

    if (input.additionalContext) {
      const customPage = {
        url: `${origin}/#custom-notes`,
        title: `${name} — Extra Notes`,
        markdown: input.additionalContext,
      };
      knowledge.pages.unshift(customPage);
    }

    if (knowledge.pages.length === 0) return Response.json({ error: "No usable public pages were found." }, { status: 422 });

    const extractedBrand = brandResult.status === "fulfilled" ? brandResult.value : null;
    let brandProfile = undefined;
    if (extractedBrand?.ok) {
      const parsedBrand = brandProfileSchema.safeParse({
        name: extractedBrand.data.brand_name || name,
        colors: extractedBrand.data.colors,
        logos: extractedBrand.data.logos.map((logo) => ({ url: logo.url, ...(logo.alt ? { alt: logo.alt } : {}) })),
        backdrops: extractedBrand.data.backdrop_images,
        source: "openbrand",
      });
      if (parsedBrand.success) {
        brandProfile = parsedBrand.data;
      }
    }

    const installation = installationSchema.parse({
      id: installationId,
      ownerId: session.user.id,
      origin,
      name: existing?.name ?? name,
      instructions: input.instructions ?? existing?.instructions ?? "Be helpful, accurate, and concise.",
      knowledgeVersion: 1,
      runtime: "cradle",
      character: existing?.character ?? createDefaultCharacter(name),
      ...(brandProfile ? { brandProfile } : (existing?.brandProfile ? { brandProfile: existing.brandProfile } : {})),
    });

    await Promise.all([
      store.saveInstallation(installation),
      store.saveKnowledge(knowledge),
      embedKnowledgePages(installationId, knowledge.pages),
    ]);

    return Response.json({ installation: { id: installation.id, name: installation.name }, knowledge, brandProfile }, { status: 201 });
  } catch (cause) {
    console.error("[Onboarding API Error]:", cause);
    const message = cause instanceof Error ? cause.message : String(cause || "Internal error");
    return Response.json({ error: `Onboarding failed: ${message}` }, { status: 500 });
  }
}
