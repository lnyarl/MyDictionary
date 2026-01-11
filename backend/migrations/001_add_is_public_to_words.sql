-- Migration: Add is_public column to words table
-- Date: 2026-01-11

-- Add is_public column to words table
ALTER TABLE words
ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT false;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_words_is_public ON words(is_public);

-- Optional: Update existing words based on their definitions
-- If any definition was public, make the word public
-- Comment out if you want all existing words to remain private
-- UPDATE words w
-- SET is_public = true
-- WHERE EXISTS (
--     SELECT 1 FROM definitions d
--     WHERE d.word_id = w.id AND d.is_public = true AND d.deleted_at IS NULL
-- );
