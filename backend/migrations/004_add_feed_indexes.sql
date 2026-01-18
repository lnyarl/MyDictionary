-- Migration: Add indexes for feed query optimization
-- Generated: 2026-01-18

-- =====================================================
-- FEED QUERY OPTIMIZATION INDEXES
-- =====================================================

-- Index for feed queries: filtering by user_id and ordering by created_at
-- Used by: FeedRepository.findFeeds() - WHERE definitions.user_id IN (...) ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_definitions_user_created 
ON definitions(user_id, created_at DESC) 
WHERE deleted_at IS NULL;

-- Index for recommendations: ordering by likes_count and created_at
-- Used by: FeedRepository.findRecommendations() - ORDER BY likes_count DESC, created_at DESC
CREATE INDEX IF NOT EXISTS idx_definitions_likes_created 
ON definitions(likes_count DESC, created_at DESC) 
WHERE deleted_at IS NULL;

-- Composite index for words table used in feed JOINs
-- Used by: WHERE words.is_public = true AND words.deleted_at IS NULL
CREATE INDEX IF NOT EXISTS idx_words_public_active 
ON words(is_public, deleted_at) 
WHERE is_public = true AND deleted_at IS NULL;
