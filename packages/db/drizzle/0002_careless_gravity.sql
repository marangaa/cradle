CREATE TABLE "asset_revisions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"installation_id" uuid NOT NULL,
	"identity_revision_id" uuid NOT NULL,
	"direction_id" uuid NOT NULL,
	"state" text NOT NULL,
	"status" text NOT NULL,
	"object_key" text NOT NULL,
	"content_type" text NOT NULL,
	"checksum" text NOT NULL,
	"parent_asset_id" uuid,
	"provider" text NOT NULL,
	"model" text NOT NULL,
	"prompt_version" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "asset_revisions" ADD CONSTRAINT "asset_revisions_installation_id_installations_id_fk" FOREIGN KEY ("installation_id") REFERENCES "public"."installations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_revisions" ADD CONSTRAINT "asset_revisions_identity_revision_id_identity_revisions_id_fk" FOREIGN KEY ("identity_revision_id") REFERENCES "public"."identity_revisions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "asset_revisions_object_key_idx" ON "asset_revisions" USING btree ("object_key");--> statement-breakpoint
CREATE INDEX "asset_revisions_identity_state_idx" ON "asset_revisions" USING btree ("identity_revision_id","state");--> statement-breakpoint
CREATE INDEX "asset_revisions_installation_status_idx" ON "asset_revisions" USING btree ("installation_id","status");