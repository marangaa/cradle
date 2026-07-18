import type { BrandIdentity, ChatEvent, Familiar, KnowledgeSnapshot } from "@cradle/core";
import { index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const installations = pgTable("installations", {
  id: uuid("id").primaryKey(),
  publicKey: text("public_key").notNull(),
  origin: text("origin").notNull(),
  name: text("name").notNull(),
  instructions: text("instructions").notNull(),
  knowledgeVersion: integer("knowledge_version").notNull(),
  runtime: text("runtime", { enum: ["cradle", "qualra"] }).notNull(),
  familiar: jsonb("familiar").$type<Familiar | null>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

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

export const conversationEvents = pgTable("conversation_events", {
  id: uuid("id").primaryKey(),
  installationId: uuid("installation_id").notNull().references(() => installations.id, { onDelete: "cascade" }),
  visitorId: uuid("visitor_id").notNull(),
  conversationId: uuid("conversation_id").notNull(),
  type: text("type", { enum: ["conversation.started", "message.created", "conversation.completed"] }).notNull(),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
  payload: jsonb("payload").$type<ChatEvent["payload"]>().notNull(),
}, (table) => [
  index("conversation_events_conversation_occurred_idx").on(table.conversationId, table.occurredAt),
  index("conversation_events_installation_occurred_idx").on(table.installationId, table.occurredAt),
]);

export const identityRevisions = pgTable("identity_revisions", {
  id: uuid("id").primaryKey(),
  installationId: uuid("installation_id").notNull().references(() => installations.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  status: text("status", { enum: ["queued", "generating", "ready", "selected", "failed"] }).notNull(),
  identity: jsonb("identity").$type<BrandIdentity | null>(),
  selectedDirectionId: uuid("selected_direction_id"),
  error: text("error"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
}, (table) => [
  uniqueIndex("identity_revisions_installation_version_idx").on(table.installationId, table.version),
  index("identity_revisions_installation_updated_idx").on(table.installationId, table.updatedAt),
]);
