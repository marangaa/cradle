import { companionPackageSchema } from "@cradle/core";
import { createAssetStoreFromEnv } from "@cradle/media";
import { validatePetAtlas } from "@cradle/pet";
import { z } from "zod";
import { isInstallationManager } from "../../../../lib/management";
import { getPetdexCompanion } from "../../../../lib/petdex";
import { store } from "../../../../lib/store";

const assetStore = createAssetStoreFromEnv();
const selectionSchema = z.object({ provider: z.literal("petdex"), slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) });
const maxSpriteBytes = 12 * 1024 * 1024;

function studioCorsHeaders(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== process.env.CRADLE_STUDIO_ORIGIN) return null;
  return { "access-control-allow-origin": origin, "access-control-allow-methods": "GET, PUT, OPTIONS", "access-control-allow-headers": "content-type, x-cradle-installation-key", "cache-control": "no-store", vary: "Origin" };
}

export function OPTIONS(request: Request) {
  const headers = studioCorsHeaders(request);
  return headers ? new Response(null, { status: 204, headers }) : new Response(null, { status: 403 });
}

/** Returns the imported companion package for Studio's install review. */
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const headers = studioCorsHeaders(request);
  if (!headers) return Response.json({ error: "Studio origin is not authorized." }, { status: 403 });
  const { id } = await context.params;
  if (!await isInstallationManager(request, id)) return Response.json({ error: "Installation management key is invalid." }, { status: 401, headers });
  return Response.json({ companion: await store.getCompanionPackage(id) }, { headers });
}

/** Downloads, validates, and pins one curated Petdex spritesheet to an installation. */
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const headers = studioCorsHeaders(request);
  if (!headers) return Response.json({ error: "Studio origin is not authorized." }, { status: 403 });
  const { id: installationId } = await context.params;
  if (!await isInstallationManager(request, installationId)) return Response.json({ error: "Installation management key is invalid." }, { status: 401, headers });
  const installation = await store.getInstallation(installationId);
  const knowledge = await store.getKnowledge(installationId);
  if (!installation || !knowledge) return Response.json({ error: "Unknown installation." }, { status: 404, headers });
  if (knowledge.version < 2) return Response.json({ error: "Save the reviewed website sources before choosing a companion." }, { status: 409, headers });

  const selection = selectionSchema.parse(await request.json());
  const upstream = await getPetdexCompanion(selection.slug);
  if (!upstream) return Response.json({ error: "That Petdex companion is not in Cradle's curated catalog." }, { status: 422, headers });
  const spriteResponse = await fetch(upstream.spritesheetUrl, { signal: AbortSignal.timeout(20_000) });
  if (!spriteResponse.ok) return Response.json({ error: "Could not download the selected Petdex spritesheet." }, { status: 502, headers });
  const contentLength = Number(spriteResponse.headers.get("content-length") ?? 0);
  if (contentLength > maxSpriteBytes) return Response.json({ error: "The selected Petdex spritesheet is too large to import." }, { status: 422, headers });
  const sprite = new Uint8Array(await spriteResponse.arrayBuffer());
  if (sprite.byteLength === 0 || sprite.byteLength > maxSpriteBytes) return Response.json({ error: "The selected Petdex spritesheet is invalid or too large." }, { status: 422, headers });
  let atlas: Awaited<ReturnType<typeof validatePetAtlas>>;
  try {
    atlas = await validatePetAtlas(sprite);
  } catch (cause) {
    return Response.json({ error: cause instanceof Error ? cause.message : "The selected Petdex spritesheet is not compatible with Cradle." }, { status: 422, headers });
  }
  const stored = await assetStore.put({ key: `installations/${installationId}/companions/petdex/${upstream.slug}/${crypto.randomUUID()}.webp`, body: sprite, contentType: "image/webp", visibility: "published" });
  const companion = companionPackageSchema.parse({
    id: crypto.randomUUID(),
    installationId,
    provider: "petdex",
    slug: upstream.slug,
    displayName: upstream.displayName,
    description: upstream.description,
    kind: upstream.kind,
    submittedBy: upstream.submittedBy,
    sourceUrl: upstream.spritesheetUrl,
    petJsonUrl: upstream.petJsonUrl,
    objectKey: stored.key,
    checksum: stored.checksum,
    contentType: "image/webp",
    ...atlas,
    createdAt: new Date().toISOString(),
  });
  await store.saveCompanionPackage(companion);
  return Response.json({ companion }, { headers });
}
