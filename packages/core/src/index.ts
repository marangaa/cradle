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

export const installationSchema = z.object({
  id: z.string().uuid(),
  publicKey: z.string().min(12),
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
