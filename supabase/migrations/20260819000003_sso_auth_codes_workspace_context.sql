-- ============================================================================
-- MIGRATION: SSO Auth Codes Workspace Context Extension
-- Date: 2026-08-19
-- Purpose: Add workspace_id and workspace_code columns to sso_auth_codes table
--          to preserve exact workspace authorization context during OIDC PKCE flow.
-- ============================================================================

ALTER TABLE public.sso_auth_codes ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.lam_product_workspaces(id) ON DELETE SET NULL;
ALTER TABLE public.sso_auth_codes ADD COLUMN IF NOT EXISTS workspace_code VARCHAR(50);
