-- Add indices for terms search and pagination
CREATE INDEX idx_terms_created_at ON "public"."terms" USING btree (created_at DESC);
CREATE INDEX idx_terms_text_trgm ON "public"."terms" USING gin (text gin_trgm_ops);
