-- Migration: Add indexes for feed query optimization
-- Generated: 2026-01-18

CREATE INDEX IF NOT EXISTS idx_definitions_user_created 
ON definitions(user_id, created_at DESC) 
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_words_public_active 
ON words(is_public, deleted_at) 
WHERE is_public = true AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_definitions_created_desc
ON definitions(created_at DESC)
WHERE deleted_at IS NULL;
