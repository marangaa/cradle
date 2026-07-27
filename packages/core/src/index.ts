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

/**
 * Petdex's spritesheet protocol is fixed, not per-pet: 8 columns always, and either the v1
 * (9-row) or v2 (11-row) grid at 192x208 cells. Nothing beyond that is declared anywhere by
 * Petdex (not the manifest, not pet.json), so this is the full set of geometry values that can
 * legitimately vary per companion — anything else (frame counts, durations) must be derived from
 * the actual image at render time, never guessed here.
 */
export const PETDEX_GRID_VERSIONS = [9, 11] as const;

/**
 * Canonical row → state mapping, confirmed against Petdex's own "State viewer" UI copy
 * (idle, running-right, running-left, waving, jumping, failed, waiting, running, review).
 * This is Petdex's documented convention, not something Cradle invented, so it's fixed here
 * as a single source of truth rather than re-declared per installation.
 */
export const PETDEX_STATE_ROWS = {
  idle: 0,
  "running-right": 1,
  "running-left": 2,
  waving: 3,
  jumping: 4,
  failed: 5,
  waiting: 6,
  running: 7,
  review: 8,
} as const;

export type PetdexState = keyof typeof PETDEX_STATE_ROWS;

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
  rows: z.union([z.literal(9), z.literal(11)]),
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
  ownerId: z.string().min(1),
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
