import { createAssetStoreFromEnv } from "@cradle/media";
import { isInstallationManager } from "../../../../../lib/management";
import { store } from "../../../../../lib/store";

const assetStore = createAssetStoreFromEnv();

function studioCorsHeaders(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== process.env.CRADLE_STUDIO_ORIGIN) return null;
  return { "access-control-allow-origin": origin, "access-control-allow-methods": "GET, OPTIONS", "access-control-allow-headers": "x-cradle-installation-key", "cache-control": "no-store", vary: "Origin" };
}

export function OPTIONS(request: Request) {
  const headers = studioCorsHeaders(request);
  return headers ? new Response(null, { status: 204, headers }) : new Response(null, { status: 403 });
}

/** Streams a private draft asset to its authorized Studio review session. */
export async function GET(request: Request, context: { params: Promise<{ id: string; assetId: string }> }) {
  const headers = studioCorsHeaders(request);
  if (!headers) return Response.json({ error: "Studio origin is not authorized." }, { status: 403 });
  const { id: installationId, assetId } = await context.params;
  if (!await isInstallationManager(request, installationId)) return Response.json({ error: "Installation management key is invalid." }, { status: 401, headers });
  const asset = await store.getAssetRevision(assetId);
  if (!asset || asset.installationId !== installationId) return Response.json({ error: "Asset not found." }, { status: 404, headers });
  const bytes = await assetStore.get(asset.objectKey);
  return new Response(Uint8Array.from(bytes).buffer, { headers: { ...headers, "content-type": asset.contentType, etag: asset.checksum, "x-content-type-options": "nosniff" } });
}
