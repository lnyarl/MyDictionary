-- Migration: Move is_public from words to definitions
-- Date: 2026-01-25

-- 1. Add is_public column to definitions table
ALTER TABLE definitions
ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT false;

-- 2. Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_definitions_is_public ON definitions(is_public) WHERE deleted_at IS NULL;

-- 4. Drop views that depend on words.is_public
DROP VIEW IF EXISTS vw_words_with_stats;

-- 5. Drop is_public column from words table
ALTER TABLE words
DROP COLUMN IF EXISTS is_public;

-- 6. Recreate views
-- vw_words_with_stats: Removed is_public, added public_definition_count
CREATE OR REPLACE VIEW vw_words_with_stats AS
SELECT
    w.id,
    w.term,
    w.user_id,
    w.created_at,
    w.updated_at,
    COUNT(DISTINCT d.id) as definition_count,
    COUNT(DISTINCT CASE WHEN d.deleted_at IS NULL AND d.is_public = true THEN d.id END) as public_definition_count,
    COUNT(DISTINCT CASE WHEN d.deleted_at IS NULL THEN d.user_id END) as contributor_count
FROM words w
LEFT JOIN definitions d ON w.id = d.word_id AND d.deleted_at IS NULL
WHERE w.deleted_at IS NULL
GROUP BY w.id, w.term, w.user_id, w.created_at, w.updated_at;

-- Recreate vw_definitions_with_likes to include is_public
DROP VIEW IF EXISTS vw_definitions_with_likes;

CREATE OR REPLACE VIEW vw_definitions_with_likes AS
SELECT
    d.*,
    COALESCE(l.likes_count, 0) AS likes_count
FROM definitions d
LEFT JOIN (
    SELECT 
        definition_id, 
        COUNT(*) AS likes_count
    FROM likes
    WHERE deleted_at IS NULL
    GROUP BY definition_id
) l ON d.id = l.definition_id;

-- Update vw_latest_definitions to include is_public
DROP VIEW IF EXISTS vw_latest_definitions;

CREATE OR REPLACE VIEW vw_latest_definitions AS
SELECT DISTINCT ON (d.word_id, d.user_id)
    d.id,
    d.content,
    d.word_id,
    d.user_id,
    d.is_public,
    d.created_at,
    d.updated_at,
    u.nickname as user_nickname,
    u.profile_picture as user_profile_picture,
    COUNT(l.id) as likes_count
FROM definitions d
INNER JOIN users u ON d.user_id = u.id AND u.deleted_at IS NULL
LEFT JOIN likes l ON d.id = l.definition_id AND l.deleted_at IS NULL
WHERE d.deleted_at IS NULL
GROUP BY d.id, d.content, d.word_id, d.user_id, d.is_public, d.created_at, d.updated_at, u.nickname, u.profile_picture
ORDER BY d.word_id, d.user_id, d.created_at DESC;
