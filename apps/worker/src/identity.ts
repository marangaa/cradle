import { brandIdentitySchema, type BrandIdentity } from "@cradle/core";
import { z } from "zod";

const identityDirectionDraftSchema = z.object({
  name: z.string(),
  archetype: z.enum(["wayfinder", "witness", "keeper"]),
  role: z.string(),
  traits: z.array(z.string()),
  motif: z.string(),
  greeting: z.string(),
  rationale: z.string(),
  evidence: z.array(
    z.object({
      sourceUrl: z.string(),
      reason: z.string(),
    }),
  ),
  palette: z.array(z.string()),
  imagePrompt: z.string(),
});

/** Plain structured-output schema accepted by OpenAI's strict JSON Schema subset. */
export const identityDraftSchema = z.object({
  summary: z.string(),
  audience: z.string(),
  voice: z.array(z.string()),
  visualLanguage: z.string(),
  directions: z.array(identityDirectionDraftSchema),
});

type IdentityDraft = z.infer<typeof identityDraftSchema>;

/** Assigns server-owned identifiers and validates generated data before persistence. */
export function toBrandIdentity(draft: IdentityDraft): BrandIdentity {
  return brandIdentitySchema.parse({
    ...draft,
    directions: draft.directions.map((direction) => ({
      ...direction,
      id: crypto.randomUUID(),
    })),
  });
}
