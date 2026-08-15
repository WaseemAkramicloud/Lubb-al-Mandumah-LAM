-- ============================================================================
-- MIGRATION: Customer Identities RLS Policy for Authenticated Users
-- Date: 2026-08-15
-- Purpose: Allow authenticated customer users to select their own customer_identities row
-- ============================================================================

ALTER TABLE public.customer_identities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to read their own customer identity" ON public.customer_identities;
CREATE POLICY "Allow authenticated users to read their own customer identity"
  ON public.customer_identities
  FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_user_id);
