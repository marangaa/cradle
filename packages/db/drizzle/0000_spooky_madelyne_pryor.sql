CREATE TABLE "conversation_events" (
	"id" uuid PRIMARY KEY NOT NULL,
	"installation_id" uuid NOT NULL,
	"visitor_id" uuid NOT NULL,
	"conversation_id" uuid NOT NULL,
	"type" text NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"payload" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "installations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"public_key" text NOT NULL,
	"origin" text NOT NULL,
	"name" text NOT NULL,
	"instructions" text NOT NULL,
	"knowledge_version" integer NOT NULL,
	"runtime" text NOT NULL,
	"familiar" jsonb,
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
ALTER TABLE "conversation_events" ADD CONSTRAINT "conversation_events_installation_id_installations_id_fk" FOREIGN KEY ("installation_id") REFERENCES "public"."installations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_snapshots" ADD CONSTRAINT "knowledge_snapshots_installation_id_installations_id_fk" FOREIGN KEY ("installation_id") REFERENCES "public"."installations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "conversation_events_conversation_occurred_idx" ON "conversation_events" USING btree ("conversation_id","occurred_at");--> statement-breakpoint
CREATE INDEX "conversation_events_installation_occurred_idx" ON "conversation_events" USING btree ("installation_id","occurred_at");--> statement-breakpoint
CREATE UNIQUE INDEX "knowledge_snapshots_installation_version_idx" ON "knowledge_snapshots" USING btree ("installation_id","version");