import { z } from "zod";

export const familiarSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(48),
  archetype: z.enum(["wayfinder", "witness", "keeper"]),
  role: z.string().min(1).max(160),
  traits: z.array(z.string().min(1).max(32)).min(2).max(4),
  motif: z.string().min(1).max(160),
  greeting: z.string().min(1).max(320),
  rationale: z.string().min(1).max(640),
  evidence: z.array(z.string().url()).min(1).max(5),
  palette: z.tuple([z.string(), z.string(), z.string()]),
  version: z.number().int().positive(),
});

export type Familiar = z.infer<typeof familiarSchema>;

export const identityDirectionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(48),
  archetype: z.enum(["wayfinder", "witness", "keeper"]),
  role: z.string().min(1).max(160),
  traits: z.array(z.string().min(1).max(32)).min(2).max(4),
  motif: z.string().min(1).max(220),
  greeting: z.string().min(1).max(320),
  rationale: z.string().min(1).max(640),
  evidence: z.array(z.object({ sourceUrl: z.string().url(), reason: z.string().min(1).max(280) })).min(1).max(5),
  palette: z.tuple([z.string(), z.string(), z.string()]),
  imagePrompt: z.string().min(1).max(2_000),
});

export const brandIdentitySchema = z.object({
  summary: z.string().min(1).max(900),
  audience: z.string().min(1).max(360),
  voice: z.array(z.string().min(1).max(48)).min(3).max(5),
  visualLanguage: z.string().min(1).max(900),
  directions: z.array(identityDirectionSchema).length(3),
});

export type BrandIdentity = z.infer<typeof brandIdentitySchema>;

export const identityRevisionSchema = z.object({
  id: z.string().uuid(),
  installationId: z.string().uuid(),
  version: z.number().int().positive(),
  status: z.enum(["queued", "generating", "ready", "selected", "failed"]),
  identity: brandIdentitySchema.optional(),
  selectedDirectionId: z.string().uuid().optional(),
  error: z.string().max(1_000).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type IdentityRevision = z.infer<typeof identityRevisionSchema>;

export const assetStateSchema = z.enum([
  "canonical",
  "idle",
  "running-right",
  "running-left",
  "waving",
  "jumping",
  "failed",
  "waiting",
  "running",
  "review",
  "atlas",
  "contact-sheet",
]);
export const assetRevisionSchema = z.object({
  id: z.string().uuid(),
  installationId: z.string().uuid(),
  identityRevisionId: z.string().uuid(),
  directionId: z.string().uuid(),
  state: assetStateSchema,
  status: z.enum(["draft", "published", "failed"]),
  objectKey: z.string().min(1).max(500),
  contentType: z.enum(["image/png", "image/webp"]),
  checksum: z.string().regex(/^[a-f0-9]{64}$/),
  parentAssetId: z.string().uuid().optional(),
  provider: z.string().min(1).max(80),
  model: z.string().min(1).max(120),
  promptVersion: z.string().min(1).max(64),
  createdAt: z.string().datetime(),
});

export type AssetRevision = z.infer<typeof assetRevisionSchema>;

export const installationSchema = z.object({
  id: z.string().uuid(),
  managementKeyHash: z.string().regex(/^sha256:[a-f0-9]{64}$/),
  origin: z.string().url(),
  name: z.string().min(1).max(120),
  instructions: z.string().max(12_000),
  knowledgeVersion: z.number().int().positive(),
  runtime: z.enum(["cradle", "qualra"]),
  familiar: familiarSchema.optional(),
});

export type Installation = z.infer<typeof installationSchema>;

export const chatEventSchema = z.object({
  id: z.string().uuid(),
  installationId: z.string().uuid(),
  visitorId: z.string().uuid(),
  conversationId: z.string().uuid(),
  type: z.enum(["conversation.started", "message.created", "conversation.completed"]),
  occurredAt: z.string().datetime(),
  payload: z.record(z.string(), z.unknown()),
});

export type ChatEvent = z.infer<typeof chatEventSchema>;

export const chatRequestSchema = z.object({
  installationId: z.string().uuid(),
  visitorId: z.string().uuid(),
  conversationId: z.string().uuid(),
  message: z.string().min(1).max(8_000),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;

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

/** The server-side agent contract shared by self-hosted and Qualra deployments. */
export interface RuntimeAdapter {
  streamTurn(input: ChatRequest, context: RuntimeContext): AsyncIterable<string>;
}

export interface RuntimeContext {
  installation: Installation;
  knowledge: KnowledgeSnapshot;
  priorMessages: Array<{ role: "user" | "assistant"; content: string }>;
}
