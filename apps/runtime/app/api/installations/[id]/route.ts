import { createDefaultCharacter } from "@cradle/core";
import { auth } from "@cradle/db";
import { store } from "../../../lib/store";

/**
 * CORS for the embedded widget itself — scoped to each installation's own site origin.
 * This is the ONLY route in this file a browser calls directly (from wherever the widget is
 * embedded); PATCH below is Studio-server-to-Runtime-server only and needs no CORS at all.
 */
function widgetCorsHeaders(request: Request, origin: string) {
  if (request.headers.get("origin") !== origin) return null;
  return { "access-control-allow-origin": origin, "cache-control": "no-store", vary: "Origin" };
}

/** Returns the public manifest used by the installed website character. */
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const installation = await store.getInstallation(id);
  if (!installation) return Response.json({ error: "Unknown installation." }, { status: 404 });
  const headers = widgetCorsHeaders(request, installation.origin);
  if (!headers) return Response.json({ error: "Origin is not authorized." }, { status: 403 });

  const companion = await store.getCompanionPackage(id);
  const atlas = companion ? {
    url: companion.sourceUrl,
    columns: companion.columns,
    rows: companion.rows,
    cellWidth: companion.cellWidth,
    cellHeight: companion.cellHeight,
    states: {
      idle: { row: 0, frames: 6, durationMs: 1100 },
      "running-right": { row: 1, frames: 8, durationMs: 1060 },
      "running-left": { row: 2, frames: 8, durationMs: 1060 },
      waving: { row: 3, frames: 4, durationMs: 700 },
      jumping: { row: 4, frames: 5, durationMs: 840 },
      failed: { row: 5, frames: 8, durationMs: 1220 },
      waiting: { row: 6, frames: 6, durationMs: 1010 },
      running: { row: 7, frames: 6, durationMs: 820 },
      review: { row: 8, frames: 6, durationMs: 1030 },
    },
  } : null;

  return Response.json({
    site: { id, name: installation.name },
    character: installation.character ?? createDefaultCharacter(installation.name),
    companion: companion ? {
      id: companion.id,
      name: companion.displayName,
      provider: companion.provider,
      slug: companion.slug,
      submittedBy: companion.submittedBy,
    } : null,
    assets: atlas ? { atlas } : null,
  }, { headers });
}

/** Deletes an installation owned by the signed-in account. */
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Sign in to Studio first." }, { status: 401 });

  const deleted = await store.deleteInstallation(id, session.user.id);
  if (!deleted) return Response.json({ error: "Installation not found or not owned by you." }, { status: 404 });
  return Response.json({ ok: true, deletedId: id });
}

