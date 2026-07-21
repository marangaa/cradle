import { brandProfileSchema, characterSchema, createDefaultCharacter, installationSchema } from "@cradle/core";
import { z } from "zod";
import { isInstallationManager } from "../../../lib/management";
import { store } from "../../../lib/store";
import { issueWidgetToken } from "../../../lib/widget-token";

const updateSchema = z.object({
  name: installationSchema.shape.name.optional(),
  instructions: installationSchema.shape.instructions.optional(),
  character: characterSchema.optional(),
  brandProfile: brandProfileSchema.optional(),
}).refine((value) => Object.keys(value).length > 0, "Provide at least one setting to update.");

function widgetCorsHeaders(request: Request, origin: string) {
  if (request.headers.get("origin") !== origin) return null;
  return { "access-control-allow-origin": origin, "cache-control": "no-store", vary: "Origin" };
}

function studioCorsHeaders(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== process.env.CRADLE_STUDIO_ORIGIN) return null;
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "PATCH, OPTIONS",
    "access-control-allow-headers": "content-type, x-cradle-installation-key",
    "cache-control": "no-store",
    vary: "Origin",
  };
}

export function OPTIONS(request: Request) {
  const headers = studioCorsHeaders(request);
  return headers ? new Response(null, { status: 204, headers }) : new Response(null, { status: 403 });
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
    token: issueWidgetToken(id, installation.origin),
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

/** Updates the operator-controlled character and reference-runtime instructions. */
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const headers = studioCorsHeaders(request);
  if (!headers) return Response.json({ error: "Studio origin is not authorized." }, { status: 403 });
  const { id } = await context.params;
  if (!await isInstallationManager(request, id)) {
    return Response.json({ error: "Installation operator key is invalid." }, { status: 401, headers });
  }
  const installation = await store.getInstallation(id);
  if (!installation) return Response.json({ error: "Unknown installation." }, { status: 404, headers });
  const update = updateSchema.parse(await request.json());
  const name = update.name ?? installation.name;
  const character = update.character ?? installation.character ?? createDefaultCharacter(name);
  const next = installationSchema.parse({ ...installation, ...update, name, character, runtime: "cradle" });
  await store.saveInstallation(next);
  return Response.json({ installation: { id: next.id, name: next.name }, character: next.character, brandProfile: next.brandProfile ?? null }, { headers });
}
