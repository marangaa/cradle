import { z } from "zod";

export const characterSchema = z.object({
  displayName: z.string().min(1).max(48),
  greeting: z.string().min(1).max(320),
});

export type Character = z.infer<typeof characterSchema>;

export const brandProfileSchema = z.object({
  name: z.string().min(1).max(120),
  colors: z.array(z.object({ hex: z.string().regex(/^#[0-9a-fA-F]{6}$/), usage: z.enum(["primary", "secondary", "accent", "background", "text"]).optional() })).max(12),
  logos: z.array(z.object({ url: z.string().url(), alt: z.string().max(240).optional() })).max(12),
  backdrops: z.array(z.object({ url: z.string().url(), description: z.string().max(320).optional() })).max(12),
  source: z.enum(["openbrand", "manual"]),
  reviewedAt: z.string().datetime().optional(),
});

export type BrandProfile = z.infer<typeof brandProfileSchema>;

/** Creates a usable, intentionally plain default before an operator shapes a character. */
export function createDefaultCharacter(siteName: string): Character {
  return {
    displayName: siteName,
    greeting: `Welcome to ${siteName}. What can I help you find?`,
  };
}

export const companionPackageSchema = z.object({
  id: z.string().uuid(),
  installationId: z.string().uuid(),
  provider: z.literal("petdex"),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  displayName: z.string().min(1).max(80),
  description: z.string().min(1).max(500).optional(),
  kind: z.enum(["character", "creature", "object"]),
  submittedBy: z.string().min(1).max(120),
  sourceUrl: z.string().url(),
  petJsonUrl: z.string().url(),
  objectKey: z.string().min(1).max(500),
  checksum: z.string().regex(/^[a-f0-9]{64}$/),
  contentType: z.literal("image/webp"),
  columns: z.literal(8),
  rows: z.number().int().min(9).max(32),
  cellWidth: z.literal(192),
  cellHeight: z.literal(208),
  createdAt: z.string().datetime(),
});

export type CompanionPackage = z.infer<typeof companionPackageSchema>;

export const petdexCatalogItemSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  displayName: z.string().min(1).max(80),
  description: z.string().min(1).max(500).optional(),
  kind: z.enum(["character", "creature", "object"]),
  submittedBy: z.string().min(1).max(120),
  spritesheetUrl: z.string().url(),
  petJsonUrl: z.string().url(),
});

export type PetdexCatalogItem = z.infer<typeof petdexCatalogItemSchema>;

export const installationSchema = z.object({
  id: z.string().uuid(),
  managementKeyHash: z.string().regex(/^sha256:[a-f0-9]{64}$/),
  origin: z.string().url(),
  name: z.string().min(1).max(120),
  instructions: z.string().max(12_000),
  knowledgeVersion: z.number().int().positive(),
  runtime: z.literal("cradle"),
  character: characterSchema.optional(),
  brandProfile: brandProfileSchema.optional(),
});

export type Installation = z.infer<typeof installationSchema>;

export const crawlRequestSchema = z.object({
  url: z.string().url(),
  maxPages: z.number().int().min(1).max(50).default(20),
});

export type CrawlRequest = z.infer<typeof crawlRequestSchema>;

/** Owner-approved subset of a bounded crawl that may inform identity generation. */
export const knowledgeReviewSchema = z.object({
  includedUrls: z.array(z.string().url()).min(1).max(50),
});

/** A versioned knowledge source generated from a bounded public crawl. */
export interface KnowledgeSnapshot {
  id: string;
  installationId: string;
  version: number;
  sourceUrl: string;
  pages: Array<{ url: string; title: string; markdown: string }>;
  createdAt: string;
}
