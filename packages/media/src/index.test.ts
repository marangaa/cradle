import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { FilesystemAssetStore } from "./index.js";

test("FilesystemAssetStore persists bytes and blocks traversal", async () => {
  const root = await mkdtemp(join(tmpdir(), "cradle-assets-"));
  try {
    const store = new FilesystemAssetStore(root, "http://localhost:3002/api/assets");
    const body = new TextEncoder().encode("cradle");
    const saved = await store.put({ key: "installation/revision/canonical.png", body, contentType: "image/png", visibility: "private" });
    assert.equal(saved.checksum, "b1a704873bce26f990e54e2cb3fcf70f88d74e97ccc2fe706db0b1e598d3f4b4");
    assert.deepEqual(await store.get(saved.key), body);
    await assert.rejects(() => store.put({ key: "../escape.png", body, contentType: "image/png", visibility: "private" }));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
