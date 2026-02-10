-- Migration: Add search indexes for weighted full-text search
-- Purpose: Improve performance of search across term text, definition content, and tags

-- GIN trigram index on definitions.content for efficient ILIKE pattern matching
CREATE INDEX idx_definitions_content_trgm ON public.definitions USING gin (content gin_trgm_ops) WHERE (deleted_at IS NULL);

-- GIN index on definitions.tags array for efficient ANY queries
CREATE INDEX idx_definitions_tags_gin ON public.definitions USING gin (tags) WHERE (deleted_at IS NULL);

-- Composite index on definitions for term_id + deleted_at to optimize the join
CREATE INDEX idx_definitions_term_id_deleted_at ON public.definitions USING btree (term_id) WHERE (deleted_at IS NULL);
