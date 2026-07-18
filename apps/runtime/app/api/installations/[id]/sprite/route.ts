import { createAssetStoreFromEnv } from "@cradle/media";
import { store } from "../../../../lib/store";

const assetStore = createAssetStoreFromEnv();

/** Serves an imported, immutable companion spritesheet only to its installed website origin. */
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const installation = await store.getInstallation(id);
  const companion = await store.getCompanionPackage(id);
  if (!installation || !companion) return new Response("Not found", { status: 404 });
  if (request.headers.get("origin") !== installation.origin) return new Response("Origin is not authorized.", { status: 403 });
  const bytes = await assetStore.get(companion.objectKey);
  return new Response(Uint8Array.from(bytes).buffer, { headers: { "access-control-allow-origin": installation.origin, "cache-control": "public, max-age=31536000, immutable", "content-type": companion.contentType, etag: companion.checksum, vary: "Origin", "x-content-type-options": "nosniff" } });
}
