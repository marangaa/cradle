import { store } from "../../../../lib/store";

function corsHeaders(request: Request, origin: string) {
  if (request.headers.get("origin") !== origin) return null;
  return { "access-control-allow-origin": origin, vary: "Origin" };
}

/** Exposes the selected character as a portable Codex-compatible package descriptor. */
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const installation = await store.getInstallation(id);
  if (!installation) return Response.json({ error: "Unknown installation." }, { status: 404 });
  const headers = corsHeaders(request, installation.origin);
  if (!headers) return Response.json({ error: "Origin is not authorized." }, { status: 403 });
  const revision = await store.getLatestIdentityRevision(id);
  const atlas = revision ? (await store.listAssetRevisions(revision.id)).find((asset) => asset.status === "published" && asset.state === "atlas") : null;
  if (!atlas || !installation.familiar) return Response.json({ error: "No published character package." }, { status: 404, headers });
  return Response.json({
    id: installation.familiar.id,
    displayName: installation.familiar.name,
    description: installation.familiar.role,
    spritesheetPath: `/api/assets/${atlas.id}`,
  }, { headers });
}
