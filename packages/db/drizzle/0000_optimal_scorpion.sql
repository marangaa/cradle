CREATE TABLE "companion_packages" (
	"id" uuid PRIMARY KEY NOT NULL,
	"installation_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"slug" text NOT NULL,
	"display_name" text NOT NULL,
	"description" text NOT NULL,
	"kind" text NOT NULL,
	"submitted_by" text NOT NULL,
	"source_url" text NOT NULL,
	"pet_json_url" text NOT NULL,
	"object_key" text NOT NULL,
	"checksum" text NOT NULL,
	"content_type" text NOT NULL,
	"columns" integer NOT NULL,
	"rows" integer NOT NULL,
	"cell_width" integer NOT NULL,
	"cell_height" integer NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "installations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"origin" text NOT NULL,
	"name" text NOT NULL,
	"instructions" text NOT NULL,
	"knowledge_version" integer NOT NULL,
	"runtime" text NOT NULL,
	"character" jsonb,
	"brand_profile" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_snapshots" (
	"id" uuid PRIMARY KEY NOT NULL,
	"installation_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"source_url" text NOT NULL,
	"pages" jsonb NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "companion_packages" ADD CONSTRAINT "companion_packages_installation_id_installations_id_fk" FOREIGN KEY ("installation_id") REFERENCES "public"."installations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_snapshots" ADD CONSTRAINT "knowledge_snapshots_installation_id_installations_id_fk" FOREIGN KEY ("installation_id") REFERENCES "public"."installations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "companion_packages_installation_idx" ON "companion_packages" USING btree ("installation_id");--> statement-breakpoint
CREATE INDEX "installations_owner_id_idx" ON "installations" USING btree ("owner_id");--> statement-breakpoint
CREATE UNIQUE INDEX "knowledge_snapshots_installation_version_idx" ON "knowledge_snapshots" USING btree ("installation_id","version");