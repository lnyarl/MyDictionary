-- Migration: Create view for definitions with likes count
-- Generated: 2026-01-19

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

CREATE INDEX IF NOT EXISTS idx_likes_definition_count 
ON likes(definition_id) 
WHERE deleted_at IS NULL;
