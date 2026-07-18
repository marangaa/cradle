CREATE TABLE "identity_revisions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"installation_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"status" text NOT NULL,
	"identity" jsonb,
	"selected_direction_id" uuid,
	"error" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "identity_revisions" ADD CONSTRAINT "identity_revisions_installation_id_installations_id_fk" FOREIGN KEY ("installation_id") REFERENCES "public"."installations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "identity_revisions_installation_version_idx" ON "identity_revisions" USING btree ("installation_id","version");--> statement-breakpoint
CREATE INDEX "identity_revisions_installation_updated_idx" ON "identity_revisions" USING btree ("installation_id","updated_at");