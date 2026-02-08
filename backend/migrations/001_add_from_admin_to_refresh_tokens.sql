-- Migration: Add from_admin column to refresh_tokens table
-- Purpose: Track refresh tokens created via admin impersonation/mock login

ALTER TABLE "public"."refresh_tokens" 
    ADD COLUMN "from_admin" boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN "public"."refresh_tokens"."from_admin" IS 'True if token was created via admin impersonation/mock login';

CREATE INDEX idx_refresh_tokens_from_admin ON public.refresh_tokens USING btree (from_admin) WHERE (deleted_at IS NULL);
