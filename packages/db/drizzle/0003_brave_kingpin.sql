CREATE EXTENSION IF NOT EXISTS pgcrypto;
--> statement-breakpoint
ALTER TABLE "installations" RENAME COLUMN "public_key" TO "management_key_hash";
--> statement-breakpoint
UPDATE "installations"
SET "management_key_hash" = 'sha256:' || encode(digest("management_key_hash", 'sha256'), 'hex')
WHERE "management_key_hash" NOT LIKE 'sha256:%';
