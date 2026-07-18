import type { BrandIdentity, ChatEvent, CompanionPackage, Familiar, KnowledgeSnapshot } from "@cradle/core";
import { index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const installations = pgTable("installations", {
  id: uuid("id").primaryKey(),
  managementKeyHash: text("management_key_hash").notNull(),
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

export const assetRevisions = pgTable("asset_revisions", {
  id: uuid("id").primaryKey(),
  installationId: uuid("installation_id").notNull().references(() => installations.id, { onDelete: "cascade" }),
  identityRevisionId: uuid("identity_revision_id").notNull().references(() => identityRevisions.id, { onDelete: "cascade" }),
  directionId: uuid("direction_id").notNull(),
  state: text("state", { enum: ["canonical", "idle", "running-right", "running-left", "waving", "jumping", "failed", "waiting", "running", "review", "atlas", "contact-sheet"] }).notNull(),
  status: text("status", { enum: ["draft", "published", "failed"] }).notNull(),
  objectKey: text("object_key").notNull(),
  contentType: text("content_type", { enum: ["image/png", "image/webp"] }).notNull(),
  checksum: text("checksum").notNull(),
  parentAssetId: uuid("parent_asset_id"),
  provider: text("provider").notNull(),
  model: text("model").notNull(),
  promptVersion: text("prompt_version").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
}, (table) => [
  uniqueIndex("asset_revisions_object_key_idx").on(table.objectKey),
  index("asset_revisions_identity_state_idx").on(table.identityRevisionId, table.state),
  index("asset_revisions_installation_status_idx").on(table.installationId, table.status),
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
  uniqueIndex("companion_packages_object_key_idx").on(table.objectKey),
]);
