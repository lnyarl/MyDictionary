-- Add term_id column to definitions
ALTER TABLE "public"."definitions" ADD COLUMN "term_id" uuid;

-- Ensure all current words are in terms (just in case)
INSERT INTO "public"."terms" (text, created_at)
SELECT term, MIN(created_at)
FROM "public"."words"
WHERE term NOT IN (SELECT text FROM "public"."terms")
GROUP BY term;

-- Backfill term_id from words -> terms
UPDATE "public"."definitions" d
SET term_id = t.id
FROM "public"."words" w
JOIN "public"."terms" t ON t.text = w.term
WHERE d.word_id = w.id;

-- Make term_id NOT NULL and add foreign key
ALTER TABLE "public"."definitions" ALTER COLUMN "term_id" SET NOT NULL;
ALTER TABLE "public"."definitions" ADD CONSTRAINT fk_definitions_term_id FOREIGN KEY ("term_id") REFERENCES "public"."terms"("id") ON DELETE CASCADE;

-- Create index for term_id
CREATE INDEX idx_definitions_term_id ON "public"."definitions" USING btree (term_id) WHERE (deleted_at IS NULL);
