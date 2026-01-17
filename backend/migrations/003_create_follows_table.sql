-- Migration: Create follows table
-- Generated: 2026-01-18

-- =====================================================
-- FOLLOWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL,
    following_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT fk_follows_follower FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_follows_following FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_follows_follower_following UNIQUE (follower_id, following_id)
);

-- Indexes for follows table
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_follows_deleted_at ON follows(deleted_at);

-- Trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_follows_updated_at ON follows;
CREATE TRIGGER update_follows_updated_at
    BEFORE UPDATE ON follows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Documentation
COMMENT ON TABLE follows IS 'Stores follower/following relationships between users';
COMMENT ON COLUMN follows.follower_id IS 'The user who is following';
COMMENT ON COLUMN follows.following_id IS 'The user who is being followed';
