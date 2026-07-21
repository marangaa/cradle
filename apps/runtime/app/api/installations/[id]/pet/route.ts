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
  const companion = await store.getCompanionPackage(id);
  if (companion) {
    return Response.json({
      id: companion.slug,
      displayName: companion.displayName,
      description: companion.description,
      spritesheetPath: `/api/installations/${id}/sprite`,
    }, { headers });
  }
  return Response.json({ error: "No companion package has been selected." }, { status: 404, headers });
}
