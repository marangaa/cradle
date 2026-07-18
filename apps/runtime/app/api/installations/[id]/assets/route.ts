import { assetRevisionSchema } from "@cradle/core";
import { isInstallationManager } from "../../../../lib/management";
import { store } from "../../../../lib/store";

const requiredStates = ["canonical", "idle", "welcome", "listening", "thinking", "resolved", "away"] as const;

function studioCorsHeaders(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== process.env.CRADLE_STUDIO_ORIGIN) return null;
  return { "access-control-allow-origin": origin, "access-control-allow-methods": "GET, POST, OPTIONS", "access-control-allow-headers": "content-type", "cache-control": "no-store", vary: "Origin" };
}

export function OPTIONS(request: Request) {
  const headers = studioCorsHeaders(request);
  return headers ? new Response(null, { status: 204, headers }) : new Response(null, { status: 403 });
}

/** Returns draft and published asset metadata to the authorized Studio review flow. */
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const headers = studioCorsHeaders(request);
  if (!headers) return Response.json({ error: "Studio origin is not authorized." }, { status: 403 });
  const { id } = await context.params;
  if (!await isInstallationManager(request, id)) return Response.json({ error: "Installation management key is invalid." }, { status: 401, headers });
  const revision = await store.getLatestIdentityRevision(id);
  if (!revision) return Response.json({ assets: [] }, { headers });
  return Response.json({ assets: await store.listAssetRevisions(revision.id) }, { headers });
}

/** Publishes a complete reviewed state pack; incomplete or failed packs remain private drafts. */
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const headers = studioCorsHeaders(request);
  if (!headers) return Response.json({ error: "Studio origin is not authorized." }, { status: 403 });
  const { id: installationId } = await context.params;
  if (!await isInstallationManager(request, installationId)) return Response.json({ error: "Installation management key is invalid." }, { status: 401, headers });
  const revision = await store.getLatestIdentityRevision(installationId);
  if (!revision || revision.status !== "selected") return Response.json({ error: "Select an identity direction before publishing assets." }, { status: 409, headers });
  const assets = await store.listAssetRevisions(revision.id);
  const byState = new Map(assets.filter((asset) => asset.directionId === revision.selectedDirectionId && asset.status === "draft").map((asset) => [asset.state, asset]));
  if (!requiredStates.every((state) => byState.has(state))) return Response.json({ error: "The canonical asset and every interaction state must finish before publishing." }, { status: 409, headers });
  const published = await Promise.all([...byState.values()].map(async (asset) => {
    const next = assetRevisionSchema.parse({ ...asset, status: "published" });
    await store.saveAssetRevision(next);
    return next;
  }));
  const direction = revision.identity?.directions.find((item) => item.id === revision.selectedDirectionId);
  const installation = await store.getInstallation(installationId);
  if (direction && installation) {
    await store.saveInstallation({ ...installation, familiar: {
      id: direction.id,
      name: direction.name,
      archetype: direction.archetype,
      role: direction.role,
      traits: direction.traits,
      motif: direction.motif,
      greeting: direction.greeting,
      rationale: direction.rationale,
      evidence: direction.evidence.map((item) => item.sourceUrl),
      palette: direction.palette,
      version: revision.version,
    } });
  }
  return Response.json({ assets: published }, { headers });
}
