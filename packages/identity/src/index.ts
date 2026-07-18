import type { KnowledgeSnapshot } from "@cradle/core";
import { brandIdentitySchema, type BrandIdentity } from "@cradle/core";

/** Provider-neutral contract for deriving an evidence-backed Cradle identity. */
export interface IdentityGenerator {
  generate(input: { installationName: string; knowledge: KnowledgeSnapshot }): Promise<BrandIdentity>;
}

/** Creates the bounded source material used by an identity-generation provider. */
export function buildIdentitySource(knowledge: KnowledgeSnapshot) {
  return knowledge.pages.map((page) => ({
    url: page.url,
    title: page.title,
    markdown: page.markdown.slice(0, 8_000),
  }));
}

/** Validates untrusted provider output before it is persisted or shown in Studio. */
export function parseBrandIdentity(value: unknown): BrandIdentity {
  return brandIdentitySchema.parse(value);
}
