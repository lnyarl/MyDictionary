-- Migration: Make google_id nullable for admin-created users
-- Date: 2026-01-16

ALTER TABLE users ALTER COLUMN google_id DROP NOT NULL;

COMMENT ON TABLE users IS 'Stores user information. Users can be created via Google OAuth or manually by admins';
COMMENT ON COLUMN users.google_id IS 'Google OAuth ID. NULL for admin-created users';
