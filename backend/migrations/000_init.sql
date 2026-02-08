-- -------------------------------------------------------------
-- TablePlus 6.6.4(624)
--
-- https://tableplus.com/
--
-- Database: stashy
-- Generation Time: 2026-01-28 15:33:28.7120
-- -------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
-- -------------------------------------------------------------
-- Stashy Database Reset Script
-- Deletes tables in reverse order of dependencies to avoid Foreign Key conflicts.
-- -------------------------------------------------------------

-- 1. Drop Views (Dependent on tables)
DROP VIEW IF EXISTS "public"."vw_latest_definitions" CASCADE;
DROP VIEW IF EXISTS "public"."vw_words_with_stats" CASCADE;
DROP VIEW IF EXISTS "public"."vw_definitions_with_likes" CASCADE;

-- 2. Drop Child Tables (Deepest dependencies first)
-- Depends on: definitions
DROP TABLE IF EXISTS "public"."definition_histories" CASCADE;

-- Depends on: definitions, users
DROP TABLE IF EXISTS "public"."reports" CASCADE;
DROP TABLE IF EXISTS "public"."likes" CASCADE;

-- Depends on: users, badges
DROP TABLE IF EXISTS "public"."user_badges" CASCADE;
DROP TABLE IF EXISTS "public"."user_badge_progress" CASCADE;

-- Depends on: users
DROP TABLE IF EXISTS "public"."event_aggregates" CASCADE;
DROP TABLE IF EXISTS "public"."events" CASCADE;
DROP TABLE IF EXISTS "public"."notifications" CASCADE;
DROP TABLE IF EXISTS "public"."follows" CASCADE;
DROP TABLE IF EXISTS "public"."refresh_tokens" CASCADE;

-- 3. Drop Middle Tables
-- Depends on: words, users, terms
DROP TABLE IF EXISTS "public"."definitions" CASCADE;

-- Depends on: users
DROP TABLE IF EXISTS "public"."words" CASCADE;

-- 4. Drop Independent/Parent Tables
DROP TABLE IF EXISTS "public"."badges" CASCADE;
DROP TABLE IF EXISTS "public"."terms" CASCADE;
DROP TABLE IF EXISTS "public"."admin_users" CASCADE;
DROP TABLE IF EXISTS "public"."migration_history" CASCADE;

-- Most referenced table (should be last)
DROP TABLE IF EXISTS "public"."users" CASCADE;

-- 5. Drop Custom Types
DROP TYPE IF EXISTS "public"."admin_role" CASCADE;


-- migration_history
CREATE TABLE "public"."migration_history" (
    "sequence_id" int4 NOT NULL,
    "filename" text NOT NULL,
    "executed_at" timestamp DEFAULT now(),
    PRIMARY KEY ("sequence_id")
);

-- users
CREATE TABLE "public"."users" (
    "id" uuid NOT NULL,
    "google_id" varchar(255),
    "email" varchar(255) NOT NULL CHECK ((email)::text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text),
    "nickname" varchar(255) NOT NULL,
    "profile_picture" varchar(500),
    "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamp,
    "bio" text,
    "suspended_at" timestamp,
    PRIMARY KEY ("id")
);
COMMENT ON COLUMN "public"."users"."google_id" IS 'Google OAuth ID. NULL for admin-created users';
COMMENT ON TABLE "public"."users" IS 'Stores user information. Users can be created via Google OAuth or manually by admins';
CREATE UNIQUE INDEX users_google_id_key ON "public"."users" USING btree (google_id);
CREATE UNIQUE INDEX users_email_key ON "public"."users" USING btree (email);
CREATE UNIQUE INDEX users_nickname_key ON "public"."users" USING btree (nickname);
CREATE INDEX idx_users_deleted_at ON "public"."users" USING btree (deleted_at);
CREATE INDEX idx_users_email ON "public"."users" USING btree (email) WHERE (deleted_at IS NULL);
CREATE INDEX idx_users_google_id ON "public"."users" USING btree (google_id) WHERE (deleted_at IS NULL);

-- term
CREATE TABLE "public"."terms" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "text" varchar(255) NOT NULL,
    "number" SERIAL NOT NULL,
    "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamp,
    PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX idx_terms_text_unique ON "public"."terms" USING btree (text);
CREATE INDEX idx_terms_number ON "public"."terms" USING btree (number);
CREATE INDEX idx_terms_created_at ON "public"."terms" USING btree (created_at DESC);
CREATE INDEX idx_terms_text_trgm ON "public"."terms" USING gin (text gin_trgm_ops);

-- words
CREATE TABLE "public"."words" (
    "id" uuid NOT NULL,
    "term" varchar(100) NOT NULL,
    "user_id" uuid NOT NULL,
    "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamp,
    PRIMARY KEY ("id")
);
ALTER TABLE "public"."words" ADD FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;
COMMENT ON TABLE "public"."words" IS 'Stores words/terms that users want to define';
CREATE INDEX idx_words_user_id ON public.words USING btree (user_id) WHERE (deleted_at IS NULL);
CREATE INDEX idx_words_term ON public.words USING btree (term) WHERE (deleted_at IS NULL);
CREATE INDEX idx_words_created_at ON public.words USING btree (created_at DESC) WHERE (deleted_at IS NULL);
CREATE INDEX idx_words_deleted_at ON public.words USING btree (deleted_at);
CREATE INDEX idx_words_term_trgm ON public.words USING gin (term gin_trgm_ops) WHERE (deleted_at IS NULL);

-- definitions
CREATE TABLE "public"."definitions" (
    "id" uuid NOT NULL,
    "content" text NOT NULL CHECK (length(content) <= 5000),
    "word_id" uuid NOT NULL,
    "user_id" uuid NOT NULL,
    "term_id" uuid NOT NULL,
    "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamp,
    "tags" _text DEFAULT '{}'::text[],
    "media_urls" jsonb DEFAULT '[]'::jsonb,
    "is_public" bool NOT NULL DEFAULT false,
    PRIMARY KEY ("id")
);
COMMENT ON COLUMN "public"."definitions"."content" IS 'The definition text content (max 5000 characters)';
ALTER TABLE "public"."definitions" ADD FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;
ALTER TABLE "public"."definitions" ADD FOREIGN KEY ("word_id") REFERENCES "public"."words"("id") ON DELETE CASCADE;
ALTER TABLE "public"."definitions" ADD CONSTRAINT fk_definitions_term_id FOREIGN KEY ("term_id") REFERENCES "public"."terms"("id") ON DELETE CASCADE;
COMMENT ON TABLE "public"."definitions" IS 'Stores user-contributed definitions for words. Each user can have multiple versions (history)';
CREATE INDEX idx_definitions_term_id ON "public"."definitions" USING btree (term_id) WHERE (deleted_at IS NULL);
CREATE INDEX idx_definitions_word_id ON public.definitions USING btree (word_id) WHERE (deleted_at IS NULL);
CREATE INDEX idx_definitions_user_id ON public.definitions USING btree (user_id) WHERE (deleted_at IS NULL);
CREATE INDEX idx_definitions_created_at ON public.definitions USING btree (created_at DESC) WHERE (deleted_at IS NULL);
CREATE INDEX idx_definitions_deleted_at ON public.definitions USING btree (deleted_at);
CREATE INDEX idx_definitions_user_created ON public.definitions USING btree (user_id, created_at DESC) WHERE (deleted_at IS NULL);
CREATE INDEX idx_definitions_created_desc ON public.definitions USING btree (created_at DESC) WHERE (deleted_at IS NULL);
CREATE INDEX idx_definitions_is_public ON public.definitions USING btree (is_public) WHERE (deleted_at IS NULL);

-- likes
CREATE TABLE "public"."likes" (
    "id" uuid NOT NULL,
    "user_id" uuid NOT NULL,
    "definition_id" uuid NOT NULL,
    "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamp,
    PRIMARY KEY ("id")
);
-- Comments
COMMENT ON TABLE "public"."likes" IS 'Stores likes/upvotes for definitions';
-- Indices
CREATE UNIQUE INDEX IF NOT EXISTS uk_likes_user_definition ON public.likes USING btree (user_id, definition_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes USING btree (user_id) WHERE (deleted_at IS NULL);
CREATE INDEX IF NOT EXISTS idx_likes_definition_id ON public.likes USING btree (definition_id) WHERE (deleted_at IS NULL);
CREATE INDEX IF NOT EXISTS idx_likes_deleted_at ON public.likes USING btree (deleted_at);
CREATE INDEX IF NOT EXISTS idx_likes_count ON public.likes USING btree (definition_id) WHERE (deleted_at IS NULL);
ALTER TABLE "public"."likes" ADD FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;
ALTER TABLE "public"."likes" ADD FOREIGN KEY ("definition_id") REFERENCES "public"."definitions"("id") ON DELETE CASCADE;

-- follows
CREATE TABLE "public"."follows" (
    "id" uuid NOT NULL,
    "follower_id" uuid NOT NULL,
    "following_id" uuid NOT NULL,
    "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamp,
    PRIMARY KEY ("id")
);
COMMENT ON COLUMN "public"."follows"."follower_id" IS 'The user who is following';
COMMENT ON COLUMN "public"."follows"."following_id" IS 'The user who is being followed';
ALTER TABLE "public"."follows" ADD FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;
ALTER TABLE "public"."follows" ADD FOREIGN KEY ("following_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;
COMMENT ON TABLE "public"."follows" IS 'Stores follower/following relationships between users';
CREATE UNIQUE INDEX uk_follows_follower_following ON public.follows USING btree (follower_id, following_id);
CREATE INDEX idx_follows_follower_id ON public.follows USING btree (follower_id) WHERE (deleted_at IS NULL);
CREATE INDEX idx_follows_following_id ON public.follows USING btree (following_id) WHERE (deleted_at IS NULL);
CREATE INDEX idx_follows_deleted_at ON public.follows USING btree (deleted_at);

-- admin_role
CREATE TYPE "public"."admin_role" AS ENUM ('super_admin', 'developer', 'operator');

-- admin_users
CREATE TABLE "public"."admin_users" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "username" varchar(255) NOT NULL,
    "password" varchar(255) NOT NULL,
    "role" "public"."admin_role" NOT NULL DEFAULT 'operator'::admin_role,
    "must_change_password" bool DEFAULT true,
    "last_login" timestamp,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now(),
    "deleted_at" timestamp,
    PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX admin_users_username_key ON public.admin_users USING btree (username);
INSERT INTO admin_users (username, password, role, must_change_password)
    VALUES ('admin', '$2b$10$HlgRj4yUJJhCcVeUQr0i8e.9Ed6V1yWBY8g3pu9i25/DpxxglExEq', 'super_admin', TRUE)
    ON CONFLICT (username) DO NOTHING;



-- notifications
CREATE TABLE "public"."notifications" (
    "id" uuid NOT NULL,
    "user_id" uuid NOT NULL,
    "type" varchar(50) NOT NULL,
    "title" varchar(255) NOT NULL,
    "message" text,
    "actor_id" uuid,
    "target_url" varchar(500),
    "is_read" bool NOT NULL DEFAULT false,
    "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamp,
    PRIMARY KEY ("id")
);
COMMENT ON COLUMN "public"."notifications"."user_id" IS 'The user who receives the notification';
COMMENT ON COLUMN "public"."notifications"."type" IS 'Type of notification (follow, like, etc.)';
COMMENT ON COLUMN "public"."notifications"."title" IS 'Notification title';
COMMENT ON COLUMN "public"."notifications"."message" IS 'Optional notification message/description';
COMMENT ON COLUMN "public"."notifications"."actor_id" IS 'The user who triggered the notification (e.g., the follower)';
COMMENT ON COLUMN "public"."notifications"."target_url" IS 'Optional URL to navigate when notification is clicked';
COMMENT ON COLUMN "public"."notifications"."is_read" IS 'Whether the notification has been read';
ALTER TABLE "public"."notifications" ADD FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;
ALTER TABLE "public"."notifications" ADD FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;
COMMENT ON TABLE "public"."notifications" IS 'Stores user notifications for various events';
CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id) WHERE (deleted_at IS NULL);
CREATE INDEX idx_notifications_user_id_is_read ON public.notifications USING btree (user_id, is_read) WHERE (deleted_at IS NULL);
CREATE INDEX idx_notifications_created_at ON public.notifications USING btree (created_at DESC) WHERE (deleted_at IS NULL);
CREATE INDEX idx_notifications_deleted_at ON public.notifications USING btree (deleted_at);

-- events
CREATE TABLE "public"."events" (
    "id" uuid NOT NULL,
    "type" varchar(50) NOT NULL,
    "user_id" uuid,
    "payload" jsonb NOT NULL DEFAULT '{}'::jsonb,
    "metadata" jsonb DEFAULT '{}'::jsonb,
    "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamp,
    PRIMARY KEY ("id")
);
COMMENT ON COLUMN "public"."events"."type" IS 'Event type (page_view, word_create, etc.)';
COMMENT ON COLUMN "public"."events"."payload" IS 'Event-specific data in JSON format';
COMMENT ON COLUMN "public"."events"."metadata" IS 'Additional metadata (user agent, IP, etc.)';
ALTER TABLE "public"."events" ADD FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;
COMMENT ON TABLE "public"."events" IS 'Stores raw user activity events for analytics';
CREATE INDEX idx_events_type ON public.events USING btree (type);
CREATE INDEX idx_events_user_id ON public.events USING btree (user_id);
CREATE INDEX idx_events_created_at ON public.events USING btree (created_at DESC);
CREATE INDEX idx_events_type_created_at ON public.events USING btree (type, created_at DESC);
CREATE INDEX idx_events_payload ON public.events USING gin (payload);

-- event_aggregates
CREATE TABLE "public"."event_aggregates" (
    "id" uuid NOT NULL,
    "type" varchar(50) NOT NULL,
    "user_id" uuid,
    "aggregate_key" varchar(255) NOT NULL,
    "count" int4 NOT NULL DEFAULT 0,
    "first_occurrence" timestamp NOT NULL,
    "last_occurrence" timestamp NOT NULL,
    "metadata" jsonb DEFAULT '{}'::jsonb,
    "period_start" timestamp NOT NULL,
    "period_end" timestamp NOT NULL,
    "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamp,
    PRIMARY KEY ("id")
);
COMMENT ON COLUMN "public"."event_aggregates"."aggregate_key" IS 'Unique key for aggregation (e.g., page path, word ID)';
COMMENT ON COLUMN "public"."event_aggregates"."count" IS 'Number of occurrences in the period';
COMMENT ON COLUMN "public"."event_aggregates"."period_start" IS 'Start of the aggregation period';
COMMENT ON COLUMN "public"."event_aggregates"."period_end" IS 'End of the aggregation period';
ALTER TABLE "public"."event_aggregates" ADD FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;
COMMENT ON TABLE "public"."event_aggregates" IS 'Stores aggregated/compressed event data for efficient querying';
CREATE UNIQUE INDEX uk_event_aggregates ON public.event_aggregates USING btree (type, user_id, aggregate_key, period_start);
CREATE INDEX idx_event_aggregates_type ON public.event_aggregates USING btree (type);
CREATE INDEX idx_event_aggregates_user_id ON public.event_aggregates USING btree (user_id);
CREATE INDEX idx_event_aggregates_period ON public.event_aggregates USING btree (period_start, period_end);
CREATE INDEX idx_event_aggregates_aggregate_key ON public.event_aggregates USING btree (aggregate_key);

-- badges
CREATE TABLE "public"."badges" (
    "id" uuid NOT NULL,
    "code" varchar(50) NOT NULL,
    "name" varchar(100) NOT NULL,
    "description" text,
    "icon" varchar(50),
    "category" varchar(50) NOT NULL,
    "event_type" varchar(50) NOT NULL,
    "threshold" int4 NOT NULL,
    "is_active" bool NOT NULL DEFAULT true,
    "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamp,
    PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX badges_code_key ON public.badges USING btree (code);
CREATE INDEX idx_badges_category ON public.badges USING btree (category);
CREATE INDEX idx_badges_event_type ON public.badges USING btree (event_type);
CREATE INDEX idx_badges_is_active ON public.badges USING btree (is_active);

-- user_badges
CREATE TABLE "public"."user_badges" (
    "id" uuid NOT NULL,
    "user_id" uuid NOT NULL,
    "badge_id" uuid NOT NULL,
    "earned_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamp,
    PRIMARY KEY ("id")
);
ALTER TABLE "public"."user_badges" ADD FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("id") ON DELETE CASCADE;
ALTER TABLE "public"."user_badges" ADD FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;
CREATE UNIQUE INDEX uk_user_badges ON public.user_badges USING btree (user_id, badge_id);
CREATE INDEX idx_user_badges_user_id ON public.user_badges USING btree (user_id);
CREATE INDEX idx_user_badges_badge_id ON public.user_badges USING btree (badge_id);
CREATE INDEX idx_user_badges_earned_at ON public.user_badges USING btree (earned_at DESC);

-- user_badge_progress
CREATE TABLE "public"."user_badge_progress" (
    "id" uuid NOT NULL,
    "user_id" uuid NOT NULL,
    "event_type" varchar(50) NOT NULL,
    "count" int4 NOT NULL DEFAULT 0,
    "last_updated" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamp,
    PRIMARY KEY ("id")
);
ALTER TABLE "public"."user_badge_progress" ADD FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;
CREATE UNIQUE INDEX uk_user_badge_progress ON public.user_badge_progress USING btree (user_id, event_type);
CREATE INDEX idx_user_badge_progress_user_id ON public.user_badge_progress USING btree (user_id);
CREATE INDEX idx_user_badge_progress_event_type ON public.user_badge_progress USING btree (event_type);

-- reports
CREATE TABLE "public"."reports" (
    "id" uuid NOT NULL,
    "reporter_id" uuid NOT NULL,
    "reported_user_id" uuid NOT NULL,
    "definition_id" uuid,
    "reason" varchar(50) NOT NULL,
    "status" varchar(20) NOT NULL DEFAULT 'PENDING'::character varying,
    "description" text,
    "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" timestamp,
    PRIMARY KEY ("id")
);
ALTER TABLE "public"."reports" ADD FOREIGN KEY ("definition_id") REFERENCES "public"."definitions"("id") ON DELETE SET NULL;
ALTER TABLE "public"."reports" ADD FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;
ALTER TABLE "public"."reports" ADD FOREIGN KEY ("reported_user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;
CREATE INDEX idx_reports_reported_user ON public.reports USING btree (reported_user_id);
CREATE INDEX idx_reports_status ON public.reports USING btree (status);
CREATE INDEX idx_reports_created_at ON public.reports USING btree (created_at DESC);

-- definition_histories
CREATE TABLE "public"."definition_histories" (
    "id" uuid NOT NULL,
    "definition_id" uuid NOT NULL,
    "content" text NOT NULL CHECK (length(content) <= 5000),
    "tags" _text DEFAULT '{}'::text[],
    "media_urls" jsonb DEFAULT '[]'::jsonb,
    "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id")
);
ALTER TABLE "public"."definition_histories" ADD FOREIGN KEY ("definition_id") REFERENCES "public"."definitions"("id") ON DELETE CASCADE;
CREATE INDEX idx_definition_histories_definition_id ON public.definition_histories USING btree (definition_id);
CREATE INDEX idx_definition_histories_created_at ON public.definition_histories USING btree (created_at DESC);

-- vw_definitions_with_likes
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

-- View for active words with definition count
CREATE OR REPLACE VIEW vw_words_with_stats AS
SELECT
    w.*,
    COUNT(DISTINCT d.id) as definition_count,
    COUNT(DISTINCT CASE WHEN d.deleted_at IS NULL AND d.is_public = true THEN d.id END) as public_definition_count,
    COUNT(DISTINCT CASE WHEN d.deleted_at IS NULL THEN d.user_id END) as contributor_count
FROM words w
LEFT JOIN definitions d ON w.id = d.word_id AND d.deleted_at IS NULL
WHERE w.deleted_at IS NULL
GROUP BY w.id, w.term, w.user_id, w.created_at, w.updated_at;

-- View for latest definitions per user per word
CREATE OR REPLACE VIEW vw_latest_definitions AS
SELECT DISTINCT ON (d.word_id, d.user_id)
    d.*,
    u.nickname as user_nickname,
    u.profile_picture as user_profile_picture,
    COUNT(l.id) as likes_count
FROM definitions d
INNER JOIN users u ON d.user_id = u.id AND u.deleted_at IS NULL
LEFT JOIN likes l ON d.id = l.definition_id AND l.deleted_at IS NULL
WHERE d.deleted_at IS NULL
GROUP BY d.id, d.content, d.word_id, d.user_id, d.is_public, d.created_at, d.updated_at, u.nickname, u.profile_picture
ORDER BY d.word_id, d.user_id, d.created_at DESC;

-- refresh_tokens table
CREATE TABLE "public"."refresh_tokens" (
    "id" uuid NOT NULL,
    "user_id" uuid NOT NULL,
    "token" varchar(500) NOT NULL,
    "expires_at" timestamp NOT NULL,
    "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamp,
    PRIMARY KEY ("id")
);

COMMENT ON TABLE "public"."refresh_tokens" IS 'Stores refresh tokens for JWT token rotation';
COMMENT ON COLUMN "public"."refresh_tokens"."token" IS 'Hashed refresh token value';
COMMENT ON COLUMN "public"."refresh_tokens"."expires_at" IS 'Token expiration timestamp';

ALTER TABLE "public"."refresh_tokens" ADD FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

CREATE UNIQUE INDEX uk_refresh_tokens_token ON public.refresh_tokens USING btree (token) WHERE (deleted_at IS NULL);
CREATE INDEX idx_refresh_tokens_user_id ON public.refresh_tokens USING btree (user_id) WHERE (deleted_at IS NULL);
CREATE INDEX idx_refresh_tokens_expires_at ON public.refresh_tokens USING btree (expires_at);
CREATE INDEX idx_refresh_tokens_deleted_at ON public.refresh_tokens USING btree (deleted_at);
