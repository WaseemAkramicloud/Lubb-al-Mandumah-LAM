-- ============================================================================
-- MIGRATION: LAM ID, Customer Identity & SSO Foundation
-- Date: 2026-08-11
-- Purpose: Central customer identity, explicit product access control,
--          OAuth 2.0 / OIDC SSO registry, and customer portals.
-- ============================================================================

-- ============================================================================
-- 0. PRE-REQUISITE PRODUCTS SEED (Guarantee products exist in cms_products)
-- ============================================================================

INSERT INTO public.cms_products (slug, name, tagline, description, category, href, restricted, coming_soon, status)
VALUES
  ('nexora', 'NEXORA', 'Next-Gen Enterprise Management Platform', 'Next-gen enterprise SaaS platform.', 'Core SaaS', '/products/nexora', false, false, 'published'),
  ('atom', 'ATOM', 'Advanced Technology & Operations Engine', 'Core operational ERP system.', 'Core SaaS', '/products/atom', false, false, 'published'),
  ('pointo', 'PointO', 'Point of Sale & Distribution System', 'Distribution and retail POS platform.', 'Core SaaS', '/products/pointo', false, false, 'published'),
  ('aimhighserp', 'AimHighSERP', 'Search Engine Intelligence Engine', 'SERP tracking & intelligence.', 'Core SaaS', '/products/aimhighserp', false, false, 'published'),
  ('maams', 'MAAMS', 'Mission & Institutional Suite', 'Restricted institutional platform.', 'Institutional', '/products/maams', true, false, 'published')
ON CONFLICT (slug) DO NOTHING;

-- Update internal product IDs if missing
UPDATE public.cms_products SET product_id = 'NEXORA', lifecycle_status = 'Active' WHERE slug = 'nexora' AND (product_id IS NULL OR product_id = '');
UPDATE public.cms_products SET product_id = 'ATOM', lifecycle_status = 'Active' WHERE slug = 'atom' AND (product_id IS NULL OR product_id = '');
UPDATE public.cms_products SET product_id = 'POINTO', lifecycle_status = 'Development' WHERE slug = 'pointo' AND (product_id IS NULL OR product_id = '');

-- ============================================================================
-- 1. CUSTOMER IDENTITIES (Stable UUID PK independent of email)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.customer_identities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  avatar_url TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, suspended, pending_verification
  mfa_enabled BOOLEAN NOT NULL DEFAULT false,
  mfa_secret TEXT,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.customer_identities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow service_role full access to customer_identities" ON public.customer_identities;
CREATE POLICY "Allow service_role full access to customer_identities"
  ON public.customer_identities FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================================
-- 2. CUSTOMER COMPANY MEMBERSHIPS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.customer_company_memberships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customer_identities(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.crm_companies(id) ON DELETE CASCADE,
  company_role VARCHAR(50) NOT NULL DEFAULT 'member', -- owner, admin, member
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, invited, suspended
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(customer_id, company_id)
);

ALTER TABLE public.customer_company_memberships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow service_role full access to customer_company_memberships" ON public.customer_company_memberships;
CREATE POLICY "Allow service_role full access to customer_company_memberships"
  ON public.customer_company_memberships FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================================
-- 3. CUSTOMER PRODUCT ENTITLEMENTS (Company-Level Subscriptions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.customer_product_entitlements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.crm_companies(id) ON DELETE CASCADE,
  product_slug VARCHAR(255) NOT NULL REFERENCES public.cms_products(slug) ON DELETE CASCADE,
  plan_tier VARCHAR(50) NOT NULL DEFAULT 'standard', -- starter, standard, enterprise
  max_seats INT NOT NULL DEFAULT 10,
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, trial, suspended, cancelled
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(company_id, product_slug)
);

ALTER TABLE public.customer_product_entitlements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow service_role full access to customer_product_entitlements" ON public.customer_product_entitlements;
CREATE POLICY "Allow service_role full access to customer_product_entitlements"
  ON public.customer_product_entitlements FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================================
-- 4. CUSTOMER PRODUCT ACCESS (Explicit User-Level Product Access Grants)
-- Being a company member does NOT automatically grant access to every product.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.customer_product_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customer_identities(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.crm_companies(id) ON DELETE CASCADE,
  product_slug VARCHAR(255) NOT NULL REFERENCES public.cms_products(slug) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, revoked, suspended
  granted_by UUID REFERENCES public.customer_identities(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(customer_id, company_id, product_slug)
);

ALTER TABLE public.customer_product_access ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow service_role full access to customer_product_access" ON public.customer_product_access;
CREATE POLICY "Allow service_role full access to customer_product_access"
  ON public.customer_product_access FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================================
-- 5. PRODUCT INSTANCES & IDENTITY MAPPINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.customer_product_instances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.crm_companies(id) ON DELETE CASCADE,
  product_slug VARCHAR(255) NOT NULL REFERENCES public.cms_products(slug) ON DELETE CASCADE,
  instance_key VARCHAR(100) NOT NULL,
  environment VARCHAR(50) NOT NULL DEFAULT 'production',
  instance_url TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(company_id, product_slug, instance_key)
);

ALTER TABLE public.customer_product_instances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow service_role full access to customer_product_instances" ON public.customer_product_instances;
CREATE POLICY "Allow service_role full access to customer_product_instances"
  ON public.customer_product_instances FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.customer_identity_mappings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customer_identities(id) ON DELETE CASCADE,
  product_slug VARCHAR(255) NOT NULL REFERENCES public.cms_products(slug) ON DELETE CASCADE,
  external_user_id VARCHAR(255) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(customer_id, product_slug)
);

ALTER TABLE public.customer_identity_mappings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow service_role full access to customer_identity_mappings" ON public.customer_identity_mappings;
CREATE POLICY "Allow service_role full access to customer_identity_mappings"
  ON public.customer_identity_mappings FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================================
-- 6. SSO APPLICATIONS REGISTRY (OAuth 2.0 / OIDC Clients)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.sso_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id VARCHAR(100) UNIQUE NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  product_slug VARCHAR(255) REFERENCES public.cms_products(slug) ON DELETE CASCADE,
  redirect_uris TEXT[] NOT NULL,
  client_secret_hash TEXT NOT NULL,
  is_trusted BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.sso_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow service_role full access to sso_applications" ON public.sso_applications;
CREATE POLICY "Allow service_role full access to sso_applications"
  ON public.sso_applications FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Short-lived Authorization Codes (PKCE)
CREATE TABLE IF NOT EXISTS public.sso_auth_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(255) UNIQUE NOT NULL,
  client_id VARCHAR(100) NOT NULL,
  customer_id UUID NOT NULL REFERENCES public.customer_identities(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.crm_companies(id) ON DELETE CASCADE,
  redirect_uri TEXT NOT NULL,
  scope TEXT DEFAULT 'openid profile email',
  code_challenge TEXT,
  code_challenge_method VARCHAR(10),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.sso_auth_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow service_role full access to sso_auth_codes" ON public.sso_auth_codes;
CREATE POLICY "Allow service_role full access to sso_auth_codes"
  ON public.sso_auth_codes FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Active SSO Customer Sessions
CREATE TABLE IF NOT EXISTS public.customer_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customer_identities(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  user_agent TEXT,
  ip_address VARCHAR(50),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.customer_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow service_role full access to customer_sessions" ON public.customer_sessions;
CREATE POLICY "Allow service_role full access to customer_sessions"
  ON public.customer_sessions FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================================
-- 7. CUSTOMER INVITATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.customer_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token VARCHAR(255) UNIQUE NOT NULL,
  company_id UUID NOT NULL REFERENCES public.crm_companies(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'member',
  product_slugs TEXT[] DEFAULT '{}',
  invited_by UUID REFERENCES public.customer_identities(id) ON DELETE SET NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, expired, revoked
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.customer_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow service_role full access to customer_invitations" ON public.customer_invitations;
CREATE POLICY "Allow service_role full access to customer_invitations"
  ON public.customer_invitations FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================================
-- 8. CUSTOMER AUDIT LOGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.customer_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customer_identities(id) ON DELETE SET NULL,
  company_id UUID REFERENCES public.crm_companies(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.customer_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow service_role full access to customer_audit_logs" ON public.customer_audit_logs;
CREATE POLICY "Allow service_role full access to customer_audit_logs"
  ON public.customer_audit_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================================
-- 9. SEED DEFAULT SSO CLIENT APPLICATIONS
-- ============================================================================

INSERT INTO public.sso_applications (client_id, client_name, product_slug, redirect_uris, client_secret_hash, is_trusted)
VALUES
  (
    'lam_app_nexora',
    'Nexora SaaS',
    'nexora',
    ARRAY['https://nexora.lam.com/api/auth/callback', 'http://localhost:3000/api/auth/callback', 'http://localhost:3001/api/auth/callback'],
    'hash_nexora_secret_2026',
    true
  ),
  (
    'lam_app_atom',
    'ATOM Platform',
    'atom',
    ARRAY['https://atom.lam.com/api/auth/callback', 'http://localhost:3002/api/auth/callback'],
    'hash_atom_secret_2026',
    true
  ),
  (
    'lam_app_pointo',
    'PointO Systems',
    'pointo',
    ARRAY['https://pointo.lam.com/api/auth/callback', 'http://localhost:3003/api/auth/callback'],
    'hash_pointo_secret_2026',
    true
  )
ON CONFLICT (client_id) DO UPDATE SET redirect_uris = EXCLUDED.redirect_uris;

-- ============================================================================
-- 10. UPDATED_AT TRIGGERS FOR NEW TABLES
-- ============================================================================

DROP TRIGGER IF EXISTS update_customer_identities_updated_at ON public.customer_identities;
CREATE TRIGGER update_customer_identities_updated_at
  BEFORE UPDATE ON public.customer_identities
  FOR EACH ROW EXECUTE FUNCTION update_staff_permissions_updated_at();

DROP TRIGGER IF EXISTS update_customer_company_memberships_updated_at ON public.customer_company_memberships;
CREATE TRIGGER update_customer_company_memberships_updated_at
  BEFORE UPDATE ON public.customer_company_memberships
  FOR EACH ROW EXECUTE FUNCTION update_staff_permissions_updated_at();

DROP TRIGGER IF EXISTS update_customer_product_entitlements_updated_at ON public.customer_product_entitlements;
CREATE TRIGGER update_customer_product_entitlements_updated_at
  BEFORE UPDATE ON public.customer_product_entitlements
  FOR EACH ROW EXECUTE FUNCTION update_staff_permissions_updated_at();

DROP TRIGGER IF EXISTS update_customer_product_access_updated_at ON public.customer_product_access;
CREATE TRIGGER update_customer_product_access_updated_at
  BEFORE UPDATE ON public.customer_product_access
  FOR EACH ROW EXECUTE FUNCTION update_staff_permissions_updated_at();

DROP TRIGGER IF EXISTS update_customer_sessions_updated_at ON public.customer_sessions;
CREATE TRIGGER update_customer_sessions_updated_at
  BEFORE UPDATE ON public.customer_sessions
  FOR EACH ROW EXECUTE FUNCTION update_staff_permissions_updated_at();
