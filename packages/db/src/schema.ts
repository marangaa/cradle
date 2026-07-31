import type { BrandProfile, Character, CompanionPackage, KnowledgeSnapshot } from "@cradle/core";
import { index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid, vector } from "drizzle-orm/pg-core";

export * from "#auth-schema";

export const installations = pgTable("installations", {
  id: uuid("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  origin: text("origin").notNull(),
  name: text("name").notNull(),
  instructions: text("instructions").notNull(),
  knowledgeVersion: integer("knowledge_version").notNull(),
  runtime: text("runtime").notNull(),
  character: jsonb("character").$type<Character | null>(),
  brandProfile: jsonb("brand_profile").$type<BrandProfile | null>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("installations_owner_id_idx").on(table.ownerId),
]);

export const knowledgeSnapshots = pgTable("knowledge_snapshots", {
  id: uuid("id").primaryKey(),
  installationId: uuid("installation_id").notNull().references(() => installations.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  sourceUrl: text("source_url").notNull(),
  pages: jsonb("pages").$type<KnowledgeSnapshot["pages"]>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
}, (table) => [
  uniqueIndex("knowledge_snapshots_installation_version_idx").on(table.installationId, table.version),
]);

export const companionPackages = pgTable("companion_packages", {
  id: uuid("id").primaryKey(),
  installationId: uuid("installation_id").notNull().references(() => installations.id, { onDelete: "cascade" }),
  provider: text("provider", { enum: ["petdex"] }).notNull(),
  slug: text("slug").notNull(),
  displayName: text("display_name").notNull(),
  description: text("description").notNull(),
  kind: text("kind", { enum: ["character", "creature", "object"] }).notNull(),
  submittedBy: text("submitted_by").notNull(),
  sourceUrl: text("source_url").notNull(),
  petJsonUrl: text("pet_json_url").notNull(),
  objectKey: text("object_key").notNull(),
  checksum: text("checksum").notNull(),
  contentType: text("content_type", { enum: ["image/webp"] }).notNull(),
  columns: integer("columns").notNull(),
  rows: integer("rows").notNull(),
  cellWidth: integer("cell_width").notNull(),
  cellHeight: integer("cell_height").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
}, (table) => [
  uniqueIndex("companion_packages_installation_idx").on(table.installationId),
]);

/**
 * One browser identity per (installation, visitor). The id itself is generated client-side by
 * the widget and persisted in that site's own localStorage — NOT a cookie. A cookie set by the
 * runtime's response would be a third-party cookie from the embedding site's perspective (the
 * request is genuinely cross-origin: browser -> runtime.example.com, called from fasihi.xyz),
 * and Safari's ITP blocks third-party cookie storage outright, with Chrome moving the same
 * direction. A client-generated, first-party-to-the-embedding-site localStorage token sent as a
 * request header sidesteps that entirely and needs no server-side Set-Cookie round-trip.
 */
export const visitors = pgTable("visitors", {
  id: uuid("id").primaryKey(),
  installationId: uuid("installation_id").notNull().references(() => installations.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("visitors_installation_idx").on(table.installationId),
]);

/** One resumable thread per visitor. `messages` stores the AI SDK UIMessage[] array verbatim,
 *  matching the documented chatbot-message-persistence pattern (ai-sdk.dev/docs/ai-sdk-ui/chatbot-message-persistence). */
export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey(),
  installationId: uuid("installation_id").notNull().references(() => installations.id, { onDelete: "cascade" }),
  visitorId: uuid("visitor_id").notNull().references(() => visitors.id, { onDelete: "cascade" }),
  messages: jsonb("messages").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("conversations_visitor_idx").on(table.visitorId),
]);

/**
 * The custom memory tool's storage — structured key/value facts the agent explicitly chose to
 * remember about one visitor ("structured actions" pattern per ai-sdk.dev/docs/agents/memory,
 * not the bash-backed alternative: we don't need shell-command flexibility, and structured
 * writes are safer by construction since there's no command surface to validate).
 */
export const visitorMemories = pgTable("visitor_memories", {
  visitorId: uuid("visitor_id").notNull().references(() => visitors.id, { onDelete: "cascade" }),
  key: text("key").notNull(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("visitor_memories_visitor_key_idx").on(table.visitorId, table.key),
]);

/**
 * Embedded, retrievable slices of a crawled installation's pages — the site-knowledge half of
 * the chat agent's two-tool setup (this + visitor memory). 3072 dims matches Google's
 * gemini-embedding-001 (verified against ai-sdk.dev/docs/ai-sdk-core/embeddings — NOT
 * text-embedding-004, which isn't Google's current embedding model); change alongside
 * CRADLE_EMBEDDING_MODEL_ID if that ever changes.
 * Requires `CREATE EXTENSION IF NOT EXISTS vector;` on the target Postgres database —
 * drizzle-kit does not enable extensions itself, run this once by hand before migrating.
 */
export const knowledgeChunks = pgTable("knowledge_chunks", {
  id: uuid("id").primaryKey(),
  installationId: uuid("installation_id").notNull().references(() => installations.id, { onDelete: "cascade" }),
  pageUrl: text("page_url").notNull(),
  pageTitle: text("page_title").notNull(),
  chunkText: text("chunk_text").notNull(),
  embedding: vector("embedding", { dimensions: 3072 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("knowledge_chunks_installation_idx").on(table.installationId),
]);

/** Free-tier message cap enforcement. One row per installation; reset by moving periodStart forward. */
export const usageCounters = pgTable("usage_counters", {
  installationId: uuid("installation_id").primaryKey().references(() => installations.id, { onDelete: "cascade" }),
  periodStart: timestamp("period_start", { withTimezone: true }).defaultNow().notNull(),
  conversationCount: integer("conversation_count").default(0).notNull(),
  messageCount: integer("message_count").default(0).notNull(),
});
