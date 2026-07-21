DROP TABLE IF EXISTS "conversation_events";
DROP TABLE IF EXISTS "asset_revisions";
DROP TABLE IF EXISTS "identity_revisions";
ALTER TABLE "installations" DROP COLUMN IF EXISTS "familiar";
ALTER TABLE "installations" RENAME COLUMN "presence" TO "character";
