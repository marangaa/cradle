import { createDefaultCharacter, PETDEX_STATE_ROWS } from "@cradle/core";
import { auth } from "@cradle/db";
import { store } from "../../../lib/store";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-cradle-installation-id, x-cradle-visitor-id",
  "Cache-Control": "no-store",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

/** Returns the public manifest used by the installed website character. */
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const installation = await store.getInstallation(id);
  const companion = installation ? await store.getCompanionPackage(id) : null;

  const atlas = companion ? {
    url: companion.sourceUrl,
    columns: companion.columns,
    rows: companion.rows,
    stateRows: PETDEX_STATE_ROWS,
  } : null;

  const character = installation?.character ?? createDefaultCharacter(installation?.name ?? "Qualra Companion");

  return Response.json({
    site: { id, name: installation?.name ?? "Qualra Companion" },
    character,
    companion: companion ? {
      id: companion.id,
      name: companion.displayName,
      provider: companion.provider,
      slug: companion.slug,
      submittedBy: companion.submittedBy,
    } : null,
    assets: { atlas },
  }, { headers: CORS_HEADERS });
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
