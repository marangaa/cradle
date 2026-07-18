import { createAssetStoreFromEnv } from "@cradle/media";
import { store } from "../../../lib/store";

const assetStore = createAssetStoreFromEnv();

/** Serves only explicitly published immutable asset revisions to embedded widgets. */
export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const asset = await store.getAssetRevision(id);
  if (!asset || asset.status !== "published") return new Response("Not found", { status: 404 });
  const bytes = await assetStore.get(asset.objectKey);
  return new Response(Uint8Array.from(bytes).buffer, { headers: { "content-type": asset.contentType, "cache-control": "public, max-age=31536000, immutable", etag: asset.checksum, "x-content-type-options": "nosniff" } });
}
