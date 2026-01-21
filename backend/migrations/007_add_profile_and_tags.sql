-- Add bio to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add tags and media_urls to definitions
ALTER TABLE definitions ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE definitions ADD COLUMN IF NOT EXISTS media_urls JSONB DEFAULT '[]'::jsonb;
