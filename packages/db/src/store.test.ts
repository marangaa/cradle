import assert from "node:assert/strict";
import test from "node:test";
import { MemoryStore } from "./store.js";

const installationId = "5ef884b4-a96e-4cba-9f3f-91f8768c13d6";
const identityRevisionId = "8ec46ec6-653c-444a-9e81-720a9484938d";
const assetId = "a1ce7c3f-7fd8-4ea4-9a89-23bcd77aac5b";
const directionId = "ae8fd64e-511d-43a8-b9b7-6b9b7762b2b5";

test("MemoryStore preserves identity and immutable asset revisions", async () => {
  const store = new MemoryStore();
  const now = new Date().toISOString();
  await store.saveInstallation({ id: installationId, publicKey: "management-key-123", origin: "https://example.com", name: "Example", instructions: "Be grounded.", knowledgeVersion: 1, runtime: "cradle" });
  await store.saveIdentityRevision({ id: identityRevisionId, installationId, version: 1, status: "selected", selectedDirectionId: directionId, createdAt: now, updatedAt: now });
  await store.saveAssetRevision({ id: assetId, installationId, identityRevisionId, directionId, state: "canonical", status: "draft", objectKey: "installations/example/canonical.png", contentType: "image/png", checksum: "a".repeat(64), provider: "openai", model: "gpt-image-2", promptVersion: "canonical-v1", createdAt: now });

  assert.equal((await store.getLatestIdentityRevision(installationId))?.selectedDirectionId, directionId);
  assert.equal((await store.getAssetRevision(assetId))?.status, "draft");
  assert.equal((await store.listAssetRevisions(identityRevisionId)).length, 1);
});
