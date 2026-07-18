import { familiarSchema } from "@cradle/core";
import { store } from "../../../lib/store";

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
  const canonical = published.find((asset) => asset.state === "canonical");
  return Response.json({
    name: installation.name,
    familiar: installation.familiar ?? null,
    assets: canonical ? { canonical: { id: canonical.id, url: `/api/assets/${canonical.id}` } } : null,
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
