import type { BrandProfile, Character, CompanionPackage, KnowledgeSnapshot } from "@cradle/core";
import { index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const installations = pgTable("installations", {
  id: uuid("id").primaryKey(),
  managementKeyHash: text("management_key_hash").notNull(),
  origin: text("origin").notNull(),
  name: text("name").notNull(),
  instructions: text("instructions").notNull(),
  knowledgeVersion: integer("knowledge_version").notNull(),
  runtime: text("runtime").notNull(),
  character: jsonb("character").$type<Character | null>(),
  brandProfile: jsonb("brand_profile").$type<BrandProfile | null>(),
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
