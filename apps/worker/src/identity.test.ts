import assert from "node:assert/strict";
import test from "node:test";
import { zodSchema } from "ai";
import { identityDraftSchema, toBrandIdentity } from "./identity.js";

const unsupportedKeywords = new Set([
  "format",
  "minLength",
  "maxLength",
  "pattern",
  "minimum",
  "maximum",
  "multipleOf",
  "minItems",
  "maxItems",
  "prefixItems",
]);

function findUnsupportedKeywords(value: unknown, found: string[] = []): string[] {
  if (Array.isArray(value)) {
    value.forEach((item) => findUnsupportedKeywords(item, found));
    return found;
  }
  if (value && typeof value === "object") {
    for (const [key, nestedValue] of Object.entries(value)) {
      if (unsupportedKeywords.has(key)) found.push(key);
      findUnsupportedKeywords(nestedValue, found);
    }
  }
  return found;
}

test("identity output uses OpenAI-compatible structured JSON Schema", async () => {
  const schema = await zodSchema(identityDraftSchema).jsonSchema;
  assert.deepEqual(findUnsupportedKeywords(schema), []);
});

test("identity drafts receive server-owned IDs and strict validation", () => {
  const identity = toBrandIdentity({
    summary: "A relationship intelligence product.",
    audience: "Teams that need durable customer context.",
    voice: ["clear", "calm", "grounded"],
    visualLanguage: "Restrained, helpful, and precise.",
    directions: (["wayfinder", "witness", "keeper"] as const).map((archetype) => ({
      name: archetype,
      archetype,
      role: "A consistent website presence.",
      traits: ["helpful", "attentive"],
      motif: "A small continuous line.",
      greeting: "Welcome back.",
      rationale: "Grounded in the provided website context.",
      evidence: [
        {
          sourceUrl: "https://example.com/",
          reason: "The approved source describes the product.",
        },
      ],
      palette: ["#112233", "#445566", "#778899"],
      imagePrompt: "An original abstract companion on a transparent background.",
    })),
  });

  assert.equal(identity.directions.length, 3);
  identity.directions.forEach((direction) => assert.match(direction.id, /^[0-9a-f-]{36}$/i));
});
