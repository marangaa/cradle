import assert from "node:assert/strict";
import test from "node:test";
import { MemoryStore } from "./store.js";

test("memory store retains an installation and its selected character", async () => {
  const store = new MemoryStore();
  const installation = {
    id: crypto.randomUUID(),
    ownerId: "user_test_123",
    origin: "https://example.com",
    name: "Example",
    instructions: "Be helpful.",
    knowledgeVersion: 1,
    runtime: "cradle" as const,
    character: { displayName: "Orbit", greeting: "Welcome." },
  };

  await store.saveInstallation(installation);

  assert.deepEqual(await store.getInstallation(installation.id), installation);
});
