import assert from "node:assert/strict";
import test from "node:test";
import { MemoryStore } from "./store.js";

test("memory store retains an installation and its selected character", async () => {
  const store = new MemoryStore();
  const installation = {
    id: crypto.randomUUID(),
    managementKeyHash: `sha256:${"a".repeat(64)}`,
    origin: "https://example.com",
    name: "Example",
    instructions: "Be helpful.",
    knowledgeVersion: 1,
    runtime: "cradle" as const,
    character: { displayName: "Orbit", greeting: "Welcome.", surface: "floating" as const },
  };

  await store.saveInstallation(installation);

  assert.deepEqual(await store.getInstallation(installation.id), installation);
});
