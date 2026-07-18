import { familiarSchema } from "@cradle/core";
import { store } from "../../../lib/store";
import { issueWidgetToken } from "../../../lib/widget-token";

function corsHeaders(request: Request, origin: string) {
  if (request.headers.get("origin") !== origin) return null;
  return { "access-control-allow-origin": origin, vary: "Origin" };
}

function studioCorsHeaders(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== process.env.CRADLE_STUDIO_ORIGIN) return null;
  return { "access-control-allow-origin": origin, "access-control-allow-methods": "PATCH, OPTIONS", "access-control-allow-headers": "content-type", vary: "Origin" };
}

export function OPTIONS(request: Request) {
  const headers = studioCorsHeaders(request);
  return headers ? new Response(null, { status: 204, headers }) : new Response(null, { status: 403 });
}

/** Returns the published identity that the website widget is allowed to render. */
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const installation = await store.getInstallation(id);
  if (!installation) return Response.json({ error: "Unknown installation." }, { status: 404 });
  const headers = corsHeaders(request, installation.origin);
  if (!headers) return Response.json({ error: "Origin is not authorized." }, { status: 403 });
  const revision = await store.getLatestIdentityRevision(id);
  const assets = revision ? await store.listAssetRevisions(revision.id) : [];
  const published = assets.filter((asset) => asset.status === "published");
  const atlas = published.find((asset) => asset.state === "atlas");
  return Response.json({
    name: installation.name,
    token: issueWidgetToken(id, installation.origin),
    familiar: installation.familiar ?? null,
    assets: atlas ? {
      atlas: {
        id: atlas.id,
        url: `/api/assets/${atlas.id}`,
        columns: 8,
        rows: 9,
        cellWidth: 192,
        cellHeight: 208,
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
      },
    } : null,
  }, { headers });
}

/** Publishes an owner-selected Familiar identity to an installation. */
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const installation = await store.getInstallation(id);
  if (!installation) return Response.json({ error: "Unknown installation." }, { status: 404 });
  const headers = studioCorsHeaders(request);
  if (!headers) return Response.json({ error: "Studio origin is not authorized." }, { status: 403 });
  const familiar = familiarSchema.parse(await request.json());
  await store.saveInstallation({ ...installation, familiar });
  return Response.json({ familiar }, { headers });
}
