import { createHash } from "node:crypto";
import { companionPackageSchema } from "@cradle/core";
import { auth } from "@cradle/db";
import { validatePetAtlas } from "@cradle/pet";
import { z } from "zod";
import { getPetdexCompanion } from "../../../../lib/petdex";
import { store } from "../../../../lib/store";

const selectionSchema = z.object({ provider: z.literal("petdex"), slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) });
const maxSpriteBytes = 12 * 1024 * 1024;

/** Returns the imported companion package for Studio's install review. Called only by Studio's server. */
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const installation = await store.getInstallation(id);
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session || installation?.ownerId !== session.user.id) return Response.json({ error: "You do not have access to this installation." }, { status: 401 });
  return Response.json({ companion: await store.getCompanionPackage(id) });
}

/** Downloads, validates, and pins one curated Petdex spritesheet to an installation. Called only by Studio's server. */
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id: installationId } = await context.params;
  const installation = await store.getInstallation(installationId);
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session || installation?.ownerId !== session.user.id) return Response.json({ error: "You do not have access to this installation." }, { status: 401 });
  const knowledge = await store.getKnowledge(installationId);
  if (!installation || !knowledge) return Response.json({ error: "Unknown installation." }, { status: 404 });
  if (knowledge.version < 2) return Response.json({ error: "Save the reviewed website sources before choosing a companion." }, { status: 409 });

  const selection = selectionSchema.parse(await request.json());
  const upstream = await getPetdexCompanion(selection.slug);
  if (!upstream) return Response.json({ error: "That Petdex companion is not in Cradle's curated catalog." }, { status: 422 });
  const spriteResponse = await fetch(upstream.spritesheetUrl, { signal: AbortSignal.timeout(20_000) });
  if (!spriteResponse.ok) return Response.json({ error: "Could not download the selected Petdex spritesheet." }, { status: 502 });
  const contentLength = Number(spriteResponse.headers.get("content-length") ?? 0);
  if (contentLength > maxSpriteBytes) return Response.json({ error: "The selected Petdex spritesheet is too large to import." }, { status: 422 });
  const sprite = new Uint8Array(await spriteResponse.arrayBuffer());
  if (sprite.byteLength === 0 || sprite.byteLength > maxSpriteBytes) return Response.json({ error: "The selected Petdex spritesheet is invalid or too large." }, { status: 422 });
  let atlas: Awaited<ReturnType<typeof validatePetAtlas>>;
  try {
    atlas = await validatePetAtlas(sprite);
  } catch (cause) {
    return Response.json({ error: cause instanceof Error ? cause.message : "The selected Petdex spritesheet is not compatible with Cradle." }, { status: 422 });
  }
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
    objectKey: upstream.spritesheetUrl,
    checksum: createHash("sha256").update(sprite).digest("hex"),
    contentType: "image/webp",
    ...atlas,
    createdAt: new Date().toISOString(),
  });
  await store.saveCompanionPackage(companion);
  return Response.json({ companion });
}
