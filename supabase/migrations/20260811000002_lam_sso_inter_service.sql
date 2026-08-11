-- ============================================================================
-- MIGRATION: LAM SSO Inter-Service & Platform Admin Contracts
-- Date: 2026-08-11
-- Purpose: Inter-service request replay protection (nonces), NEXORA platform
--          admin grants mapping, and database index optimizations.
-- ============================================================================

-- 1. INTER-SERVICE REPLAY PROTECTION (NONCES)
CREATE TABLE IF NOT EXISTS public.inter_service_nonces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nonce VARCHAR(255) UNIQUE NOT NULL,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.inter_service_nonces ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow service_role full access to inter_service_nonces" ON public.inter_service_nonces;
CREATE POLICY "Allow service_role full access to inter_service_nonces"
  ON public.inter_service_nonces FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Clean up expired nonces (older than 15 minutes) index
CREATE INDEX IF NOT EXISTS idx_inter_service_nonces_timestamp ON public.inter_service_nonces (timestamp);

-- 2. NEXORA PLATFORM ADMINISTRATORS MAPPING
CREATE TABLE IF NOT EXISTS public.nexora_platform_admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customer_identities(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, revoked
  granted_by_staff_id UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(customer_id)
);

ALTER TABLE public.nexora_platform_admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow service_role full access to nexora_platform_admins" ON public.nexora_platform_admins;
CREATE POLICY "Allow service_role full access to nexora_platform_admins"
  ON public.nexora_platform_admins FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 3. INDEX OPTIMIZATIONS FOR CENTRAL IDENTITY & SSO LOOKUPS
CREATE INDEX IF NOT EXISTS idx_customer_identities_email ON public.customer_identities (email);
CREATE INDEX IF NOT EXISTS idx_customer_identities_status ON public.customer_identities (status);
CREATE INDEX IF NOT EXISTS idx_customer_company_memberships_lookup ON public.customer_company_memberships (customer_id, company_id, status);
CREATE INDEX IF NOT EXISTS idx_customer_product_entitlements_lookup ON public.customer_product_entitlements (company_id, product_slug, status);
CREATE INDEX IF NOT EXISTS idx_customer_product_access_lookup ON public.customer_product_access (customer_id, company_id, product_slug, status);
CREATE INDEX IF NOT EXISTS idx_sso_auth_codes_code ON public.sso_auth_codes (code);
CREATE INDEX IF NOT EXISTS idx_sso_applications_client_id ON public.sso_applications (client_id);
