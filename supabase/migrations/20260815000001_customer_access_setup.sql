-- ============================================================================
-- MIGRATION: Customer Access Setup, Forced Password Change & Invitation Security
-- Date: 2026-08-15
-- ============================================================================

-- 1. Add must_change_password to customer_identities
ALTER TABLE public.customer_identities
  ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT false;

-- 2. Audit & Enhance customer_invitations table for secure hashed tokens & lifecycle
ALTER TABLE public.customer_invitations
  ADD COLUMN IF NOT EXISTS token_hash VARCHAR(255),
  ADD COLUMN IF NOT EXISTS redeemed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMP WITH TIME ZONE;

-- Index for fast token & email lookups
CREATE INDEX IF NOT EXISTS idx_customer_invitations_token ON public.customer_invitations(token);
CREATE INDEX IF NOT EXISTS idx_customer_invitations_email ON public.customer_invitations(email);
CREATE INDEX IF NOT EXISTS idx_customer_identities_email ON public.customer_identities(email);
CREATE INDEX IF NOT EXISTS idx_customer_identities_auth_user ON public.customer_identities(auth_user_id);
