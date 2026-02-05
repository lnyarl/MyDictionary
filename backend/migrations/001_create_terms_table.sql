-- Create terms table
CREATE TABLE "public"."terms" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "text" varchar(255) NOT NULL,
    "number" SERIAL NOT NULL,
    "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX idx_terms_text_unique ON "public"."terms" USING btree (text);
CREATE INDEX idx_terms_number ON "public"."terms" USING btree (number);

-- Backfill terms from existing words
-- Order by MIN(created_at) to preserve historical creation order
INSERT INTO "public"."terms" (text, created_at)
SELECT term, MIN(created_at)
FROM "public"."words"
GROUP BY term
ORDER BY MIN(created_at) ASC;
