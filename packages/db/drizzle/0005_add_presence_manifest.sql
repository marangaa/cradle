ALTER TABLE "installations" ADD COLUMN IF NOT EXISTS "presence" jsonb;
--> statement-breakpoint
UPDATE "installations"
SET "presence" = jsonb_build_object(
  'displayName', "name",
  'greeting', 'Hi — I can help you explore ' || "name" || '. What would you like to know?',
  'tone', 'Clear, warm, and grounded in the reviewed website.',
  'surface', 'floating',
  'suggestions', jsonb_build_array('What do you do?', 'Who is this for?', 'Where should I start?')
)
WHERE "presence" IS NULL;
