-- Migration: 20260815000003_sso_auth_codes_nonce_column.sql
-- Add dedicated OIDC nonce column to public.sso_auth_codes table

ALTER TABLE public.sso_auth_codes ADD COLUMN IF NOT EXISTS nonce TEXT;
