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
