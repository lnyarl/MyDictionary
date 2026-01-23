-- Migration: Create badges system tables
-- Generated: 2026-01-22

CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    category VARCHAR(50) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    threshold INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    badge_id UUID NOT NULL,
    earned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_badges_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_badges_badge FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
    CONSTRAINT uk_user_badges UNIQUE (user_id, badge_id)
);

CREATE TABLE IF NOT EXISTS user_badge_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_badge_progress_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_user_badge_progress UNIQUE (user_id, event_type)
);

CREATE INDEX IF NOT EXISTS idx_badges_category ON badges(category);
CREATE INDEX IF NOT EXISTS idx_badges_event_type ON badges(event_type);
CREATE INDEX IF NOT EXISTS idx_badges_is_active ON badges(is_active);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_earned_at ON user_badges(earned_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_badge_progress_user_id ON user_badge_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badge_progress_event_type ON user_badge_progress(event_type);

DROP TRIGGER IF EXISTS update_badges_updated_at ON badges;
CREATE TRIGGER update_badges_updated_at
    BEFORE UPDATE ON badges
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

INSERT INTO badges (code, name, description, icon, category, event_type, threshold) VALUES
('first_word', '첫 단어', '첫 번째 단어를 등록했습니다', 'pencil', 'words', 'word_create', 1),
('word_collector_10', '단어 수집가', '10개의 단어를 등록했습니다', 'book', 'words', 'word_create', 10),
('word_master_50', '단어 마스터', '50개의 단어를 등록했습니다', 'crown', 'words', 'word_create', 50),
('word_legend_100', '단어 전설', '100개의 단어를 등록했습니다', 'trophy', 'words', 'word_create', 100),
('first_definition', '첫 정의', '첫 번째 정의를 작성했습니다', 'file-text', 'definitions', 'definition_create', 1),
('definition_writer_10', '정의 작가', '10개의 정의를 작성했습니다', 'feather', 'definitions', 'definition_create', 10),
('definition_expert_50', '정의 전문가', '50개의 정의를 작성했습니다', 'award', 'definitions', 'definition_create', 50),
('first_follower', '첫 팔로워', '첫 번째 팔로워를 얻었습니다', 'user-plus', 'social', 'user_followed', 1),
('popular_10', '인기인', '10명의 팔로워를 얻었습니다', 'users', 'social', 'user_followed', 10),
('influencer_50', '인플루언서', '50명의 팔로워를 얻었습니다', 'star', 'social', 'user_followed', 50),
('first_like_received', '첫 좋아요', '첫 번째 좋아요를 받았습니다', 'heart', 'engagement', 'like_received', 1),
('liked_10', '인기 정의', '10개의 좋아요를 받았습니다', 'thumbs-up', 'engagement', 'like_received', 10),
('viral_50', '바이럴', '50개의 좋아요를 받았습니다', 'flame', 'engagement', 'like_received', 50)
ON CONFLICT (code) DO NOTHING;
