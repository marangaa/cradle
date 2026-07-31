import { createDefaultCharacter, PETDEX_STATE_ROWS } from "@cradle/core";
import { auth } from "@cradle/db";
import { store } from "../../../lib/store";

/** Returns the public manifest used by the installed website character. */
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const installation = await store.getInstallation(id);

  const targetOrigin = installation?.origin;
  const reqOrigin = request.headers.get("origin");
  // Only reflect the request's Origin back if it's genuinely this installation's registered
  // origin. Reflecting any Origin unconditionally (what this used to do) is equivalent to a
  // wildcard for any real caller — it defeats the entire point of storing `origin` per
  // installation. No match -> omit the header entirely; browsers block cross-origin reads
  // without it, same-origin/non-browser callers (curl, server-to-server) are unaffected either way.
  const corsHeaders: Record<string, string> = { "cache-control": "no-store", vary: "Origin" };
  if (targetOrigin && reqOrigin === targetOrigin) {
    corsHeaders["access-control-allow-origin"] = targetOrigin;
  }

  const companion = installation ? await store.getCompanionPackage(id) : null;

  /**
   * We only ever send the widget what Petdex actually gives us: the spritesheet, its real grid
   * dimensions, and the canonical row→state map (confirmed against Petdex's own UI copy). We do
   * NOT send frame counts or animation durations — Petdex declares neither anywhere, so guessing
   * them here was the source of stale/misaligned playback. The widget derives real per-row frame
   * counts itself by inspecting the spritesheet's alpha channel at load time.
   *
   * If no companion is configured for this installation, atlas is simply null — no invented
   * default pet, no stale hardcoded fallback image.
   */
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
  }, { headers: corsHeaders });
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

