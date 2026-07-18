import { identityRevisionSchema } from "@cradle/core";
import { CANONICAL_ASSET_QUEUE, IDENTITY_GENERATION_QUEUE, canonicalAssetJobSchema, identityGenerationJobSchema } from "@cradle/jobs";
import { getCradleQueue } from "../../../../lib/queue";
import { isInstallationManager } from "../../../../lib/management";
import { store } from "../../../../lib/store";

const selectionSchema = identityRevisionSchema.pick({ id: true, selectedDirectionId: true });

function studioCorsHeaders(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== process.env.CRADLE_STUDIO_ORIGIN) return null;
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "GET, POST, PATCH, OPTIONS",
    "access-control-allow-headers": "content-type",
    "cache-control": "no-store",
    vary: "Origin",
  };
}

export function OPTIONS(request: Request) {
  const headers = studioCorsHeaders(request);
  return headers ? new Response(null, { status: 204, headers }) : new Response(null, { status: 403 });
}

/** Returns the latest identity revision for Studio's review and polling flow. */
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const headers = studioCorsHeaders(request);
  if (!headers) return Response.json({ error: "Studio origin is not authorized." }, { status: 403 });
  const { id } = await context.params;
  if (!await isInstallationManager(request, id)) return Response.json({ error: "Installation management key is invalid." }, { status: 401, headers });
  return Response.json({ revision: await store.getLatestIdentityRevision(id) }, { headers });
}

/** Queues a new evidence-backed identity revision after the website snapshot is reviewed. */
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const headers = studioCorsHeaders(request);
  if (!headers) return Response.json({ error: "Studio origin is not authorized." }, { status: 403 });
  const { id: installationId } = await context.params;
  if (!await isInstallationManager(request, installationId)) return Response.json({ error: "Installation management key is invalid." }, { status: 401, headers });
  const installation = await store.getInstallation(installationId);
  const knowledge = await store.getKnowledge(installationId);
  if (!installation || !knowledge) return Response.json({ error: "Unknown or unready installation." }, { status: 404, headers });

  const previous = await store.getLatestIdentityRevision(installationId);
  const timestamp = new Date().toISOString();
  const revision = identityRevisionSchema.parse({
    id: crypto.randomUUID(),
    installationId,
    version: (previous?.version ?? 0) + 1,
    status: "queued",
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  await store.saveIdentityRevision(revision);
  const queue = await getCradleQueue();
  await queue.send(IDENTITY_GENERATION_QUEUE, identityGenerationJobSchema.parse({ installationId, revisionId: revision.id }), {
    retryLimit: 3,
    retryBackoff: true,
    expireInSeconds: 300,
  });
  return Response.json({ revision }, { status: 202, headers });
}

/** Records the approved direction without publishing assets before they exist. */
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const headers = studioCorsHeaders(request);
  if (!headers) return Response.json({ error: "Studio origin is not authorized." }, { status: 403 });
  const { id: installationId } = await context.params;
  if (!await isInstallationManager(request, installationId)) return Response.json({ error: "Installation management key is invalid." }, { status: 401, headers });
  const selection = selectionSchema.parse(await request.json());
  const revision = await store.getLatestIdentityRevision(installationId);
  if (!revision || revision.id !== selection.id || revision.status !== "ready" || !revision.identity) {
    return Response.json({ error: "This identity revision cannot be selected." }, { status: 409, headers });
  }
  if (!revision.identity.directions.some((direction) => direction.id === selection.selectedDirectionId)) {
    return Response.json({ error: "The selected direction does not belong to this revision." }, { status: 422, headers });
  }
  const selected = identityRevisionSchema.parse({ ...revision, status: "selected", selectedDirectionId: selection.selectedDirectionId, updatedAt: new Date().toISOString() });
  await store.saveIdentityRevision(selected);
  const queue = await getCradleQueue();
  await queue.send(CANONICAL_ASSET_QUEUE, canonicalAssetJobSchema.parse({ installationId, identityRevisionId: selected.id, directionId: selection.selectedDirectionId }), {
    retryLimit: 2,
    retryBackoff: true,
    expireInSeconds: 300,
  });
  return Response.json({ revision: selected }, { headers });
}
