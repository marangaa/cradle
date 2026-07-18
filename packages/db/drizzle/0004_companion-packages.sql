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
ALTER TABLE "companion_packages" ADD CONSTRAINT "companion_packages_installation_id_installations_id_fk" FOREIGN KEY ("installation_id") REFERENCES "public"."installations"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "companion_packages_installation_idx" ON "companion_packages" USING btree ("installation_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "companion_packages_object_key_idx" ON "companion_packages" USING btree ("object_key");
