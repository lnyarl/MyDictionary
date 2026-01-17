-- Stashy Database Schema
-- PostgreSQL Schema Definition
-- Generated: 2026-01-11

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    google_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    nickname VARCHAR(255) UNIQUE NOT NULL,
    profile_picture VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Index for soft delete queries
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id) WHERE deleted_at IS NULL;

-- =====================================================
-- WORDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS words (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    term VARCHAR(100) NOT NULL,
    user_id UUID NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT fk_words_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for words table
CREATE INDEX IF NOT EXISTS idx_words_user_id ON words(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_words_term ON words(term) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_words_is_public ON words(is_public) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_words_created_at ON words(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_words_deleted_at ON words(deleted_at);

-- Index for search queries (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_words_term_trgm ON words USING gin(term gin_trgm_ops) WHERE deleted_at IS NULL;

-- =====================================================
-- DEFINITIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    word_id UUID NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT fk_definitions_word FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE,
    CONSTRAINT fk_definitions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT definitions_content_length CHECK (length(content) <= 5000)
);

-- Indexes for definitions table
CREATE INDEX IF NOT EXISTS idx_definitions_word_id ON definitions(word_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_definitions_user_id ON definitions(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_definitions_created_at ON definitions(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_definitions_deleted_at ON definitions(deleted_at);

-- Index for fetching latest definition per user
CREATE INDEX IF NOT EXISTS idx_definitions_user_created ON definitions(user_id, created_at DESC) WHERE deleted_at IS NULL;

-- =====================================================
-- LIKES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    definition_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT fk_likes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_likes_definition FOREIGN KEY (definition_id) REFERENCES definitions(id) ON DELETE CASCADE,
    CONSTRAINT uk_likes_user_definition UNIQUE (user_id, definition_id)
);

-- Indexes for likes table
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_likes_definition_id ON likes(definition_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_likes_deleted_at ON likes(deleted_at);

-- =====================================================
-- VIEWS (Optional - for common queries)
-- =====================================================

-- View for active words with definition count
CREATE OR REPLACE VIEW vw_words_with_stats AS
SELECT
    w.id,
    w.term,
    w.user_id,
    w.is_public,
    w.created_at,
    w.updated_at,
    COUNT(DISTINCT d.id) as definition_count,
    COUNT(DISTINCT CASE WHEN d.deleted_at IS NULL THEN d.user_id END) as contributor_count
FROM words w
LEFT JOIN definitions d ON w.id = d.word_id AND d.deleted_at IS NULL
WHERE w.deleted_at IS NULL
GROUP BY w.id, w.term, w.user_id, w.is_public, w.created_at, w.updated_at;

-- View for latest definitions per user per word
CREATE OR REPLACE VIEW vw_latest_definitions AS
SELECT DISTINCT ON (d.word_id, d.user_id)
    d.id,
    d.content,
    d.word_id,
    d.user_id,
    d.created_at,
    d.updated_at,
    u.nickname as user_nickname,
    u.profile_picture as user_profile_picture,
    COUNT(l.id) as likes_count
FROM definitions d
INNER JOIN users u ON d.user_id = u.id AND u.deleted_at IS NULL
LEFT JOIN likes l ON d.id = l.definition_id AND l.deleted_at IS NULL
WHERE d.deleted_at IS NULL
GROUP BY d.id, d.content, d.word_id, d.user_id, d.created_at, d.updated_at, u.nickname, u.profile_picture
ORDER BY d.word_id, d.user_id, d.created_at DESC;

-- =====================================================
-- FUNCTIONS (Optional - for triggers)
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for auto-updating updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_words_updated_at ON words;
CREATE TRIGGER update_words_updated_at
    BEFORE UPDATE ON words
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_definitions_updated_at ON definitions;
CREATE TRIGGER update_definitions_updated_at
    BEFORE UPDATE ON definitions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_likes_updated_at ON likes;
CREATE TRIGGER update_likes_updated_at
    BEFORE UPDATE ON likes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS (Optional - for documentation)
-- =====================================================

COMMENT ON TABLE users IS 'Stores user information from Google OAuth authentication';
COMMENT ON TABLE words IS 'Stores words/terms that users want to define';
COMMENT ON TABLE definitions IS 'Stores user-contributed definitions for words. Each user can have multiple versions (history)';
COMMENT ON TABLE likes IS 'Stores likes/upvotes for definitions';

COMMENT ON COLUMN words.is_public IS 'Determines if word and its definitions are visible to other users';
COMMENT ON COLUMN definitions.content IS 'The definition text content (max 5000 characters)';
