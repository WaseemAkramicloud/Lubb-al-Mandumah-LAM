-- ============================================================================
-- MIGRATION: LAM Central Identity & Workspace Control Plane (Stage B)
-- Date: 2026-08-19
-- Purpose: Additive domain model for LAM Customer Accounts, Organizations,
--          Product Workspaces (PPPXXXX codes), and Workspace Memberships.
--          100% ADDITIVE & NON-DESTRUCTIVE. Coexists with legacy tables.
-- ============================================================================

-- ============================================================================
-- 1. CENTRAL PRODUCT REGISTRY EXTENSIONS
-- ============================================================================

ALTER TABLE public.cms_products ADD COLUMN IF NOT EXISTS workspace_prefix VARCHAR(10);

-- Backfill canonical product prefixes
UPDATE public.cms_products SET workspace_prefix = 'NEX' WHERE slug = 'nexora' AND (workspace_prefix IS NULL OR workspace_prefix = '');
UPDATE public.cms_products SET workspace_prefix = 'ATO' WHERE slug = 'atom' AND (workspace_prefix IS NULL OR workspace_prefix = '');
UPDATE public.cms_products SET workspace_prefix = 'AHS' WHERE slug = 'aimhighserp' AND (workspace_prefix IS NULL OR workspace_prefix = '');
UPDATE public.cms_products SET workspace_prefix = 'MAA' WHERE slug = 'maams' AND (workspace_prefix IS NULL OR workspace_prefix = '');
UPDATE public.cms_products SET workspace_prefix = 'POI' WHERE slug = 'pointo' AND (workspace_prefix IS NULL OR workspace_prefix = '');
UPDATE public.cms_products SET workspace_prefix = 'AMA' WHERE slug = 'amal' AND (workspace_prefix IS NULL OR workspace_prefix = '');

CREATE TABLE IF NOT EXISTS public.lam_products (
  slug VARCHAR(255) PRIMARY KEY REFERENCES public.cms_products(slug) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  workspace_prefix VARCHAR(10) UNIQUE NOT NULL,
  client_id VARCHAR(100),
  app_url TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.lam_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow service_role full access to lam_products" ON public.lam_products;
CREATE POLICY "Allow service_role full access to lam_products"
  ON public.lam_products FOR ALL TO service_role USING (true) WITH CHECK (true);

INSERT INTO public.lam_products (slug, name, workspace_prefix, client_id, app_url, status)
VALUES
  ('nexora', 'NEXORA', 'NEX', 'lam_app_nexora', 'https://nexora.lubbalmandumah.com', 'active'),
  ('atom', 'ATOM', 'ATO', 'lam_app_atom', 'https://atom.lubbalmandumah.com', 'active'),
  ('aimhighserp', 'AimHighSERP', 'AHS', 'lam_app_aimhighserp', 'https://aimhighserp.lubbalmandumah.com', 'active'),
  ('maams', 'MAAMS', 'MAA', 'lam_app_maams', 'https://maams.lubbalmandumah.com', 'active'),
  ('pointo', 'PointO', 'POI', 'lam_app_pointo', 'https://pointo.lubbalmandumah.com', 'development'),
  ('amal', 'AMAL', 'AMA', 'lam_app_amal', 'https://amal.lubbalmandumah.com', 'development')
ON CONFLICT (slug) DO UPDATE
SET workspace_prefix = EXCLUDED.workspace_prefix,
    app_url = EXCLUDED.app_url,
    updated_at = timezone('utc'::text, now());

-- ============================================================================
-- 2. LAM CUSTOMER ACCOUNTS (Commercial Client Relationship)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.lam_customer_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_account_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  legal_name VARCHAR(255),
  country VARCHAR(100),
  city VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(50),
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, suspended, archived
  owner_customer_id UUID REFERENCES public.customer_identities(id) ON DELETE SET NULL,
  legacy_company_id UUID REFERENCES public.crm_companies(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.lam_customer_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow service_role full access to lam_customer_accounts" ON public.lam_customer_accounts;
CREATE POLICY "Allow service_role full access to lam_customer_accounts"
  ON public.lam_customer_accounts FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Sequence for human-readable account code
CREATE SEQUENCE IF NOT EXISTS lam_customer_account_code_seq START WITH 1;

-- ============================================================================
-- 3. LAM ORGANIZATIONS (Operational Business Units)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.lam_organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_account_id UUID NOT NULL REFERENCES public.lam_customer_accounts(id) ON DELETE CASCADE,
  organization_code VARCHAR(50) UNIQUE,
  name VARCHAR(255) NOT NULL,
  legal_name VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, suspended
  legacy_company_id UUID REFERENCES public.crm_companies(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.lam_organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow service_role full access to lam_organizations" ON public.lam_organizations;
CREATE POLICY "Allow service_role full access to lam_organizations"
  ON public.lam_organizations FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Sequence for organization code
CREATE SEQUENCE IF NOT EXISTS lam_organization_code_seq START WITH 1;

-- ============================================================================
-- 4. LAM PRODUCT WORKSPACES (Organization + Product Subscribed Workspace)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.lam_product_workspaces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_account_id UUID NOT NULL REFERENCES public.lam_customer_accounts(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.lam_organizations(id) ON DELETE CASCADE,
  product_slug VARCHAR(255) NOT NULL REFERENCES public.cms_products(slug) ON DELETE CASCADE,
  workspace_code VARCHAR(20) NOT NULL, -- Human-readable PPPXXXX code (e.g. NEX7K4Q)
  plan_tier VARCHAR(50) NOT NULL DEFAULT 'standard', -- starter, standard, enterprise, demo
  max_seats INT NOT NULL DEFAULT 10,
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, trial, suspended, cancelled, archived
  legacy_entitlement_id UUID REFERENCES public.customer_product_entitlements(id) ON DELETE SET NULL,
  legacy_instance_id UUID REFERENCES public.customer_product_instances(id) ON DELETE SET NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(organization_id, product_slug)
);

ALTER TABLE public.lam_product_workspaces ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow service_role full access to lam_product_workspaces" ON public.lam_product_workspaces;
CREATE POLICY "Allow service_role full access to lam_product_workspaces"
  ON public.lam_product_workspaces FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Case-insensitive unique constraint for workspace_code
CREATE UNIQUE INDEX IF NOT EXISTS idx_lam_product_workspaces_code_lower ON public.lam_product_workspaces (LOWER(workspace_code));

-- ============================================================================
-- 5. LAM WORKSPACE MEMBERSHIPS (User Access to a Specific Product Workspace)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.lam_workspace_memberships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.lam_product_workspaces(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customer_identities(id) ON DELETE CASCADE,
  user_id VARCHAR(100) NOT NULL, -- Workspace-scoped human readable User ID (e.g. ayesha, ali)
  workspace_role VARCHAR(50) NOT NULL DEFAULT 'member', -- owner, admin, member
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, suspended, invited
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(workspace_id, customer_id)
);

ALTER TABLE public.lam_workspace_memberships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow service_role full access to lam_workspace_memberships" ON public.lam_workspace_memberships;
CREATE POLICY "Allow service_role full access to lam_workspace_memberships"
  ON public.lam_workspace_memberships FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Case-insensitive unique constraint for user_id per workspace
CREATE UNIQUE INDEX IF NOT EXISTS idx_lam_workspace_memberships_user_id_lower ON public.lam_workspace_memberships (workspace_id, LOWER(user_id));

-- ============================================================================
-- 6. ADDITIVE BACKWARD-COMPATIBLE COLUMNS ON LEGACY TABLES
-- ============================================================================

ALTER TABLE public.crm_companies ADD COLUMN IF NOT EXISTS customer_account_id UUID REFERENCES public.lam_customer_accounts(id) ON DELETE SET NULL;
ALTER TABLE public.crm_companies ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.lam_organizations(id) ON DELETE SET NULL;

ALTER TABLE public.customer_product_entitlements ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.lam_product_workspaces(id) ON DELETE SET NULL;

ALTER TABLE public.customer_product_instances ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.lam_product_workspaces(id) ON DELETE SET NULL;

ALTER TABLE public.customer_product_access ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.lam_product_workspaces(id) ON DELETE SET NULL;

-- ============================================================================
-- 7. PERFORMANCE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_lam_customer_accounts_code ON public.lam_customer_accounts (customer_account_code);
CREATE INDEX IF NOT EXISTS idx_lam_organizations_customer ON public.lam_organizations (customer_account_id);
CREATE INDEX IF NOT EXISTS idx_lam_product_workspaces_org ON public.lam_product_workspaces (organization_id);
CREATE INDEX IF NOT EXISTS idx_lam_product_workspaces_product ON public.lam_product_workspaces (product_slug);
CREATE INDEX IF NOT EXISTS idx_lam_workspace_memberships_customer ON public.lam_workspace_memberships (customer_id);
CREATE INDEX IF NOT EXISTS idx_lam_workspace_memberships_workspace ON public.lam_workspace_memberships (workspace_id);

-- ============================================================================
-- 8. UPDATED_AT TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS update_lam_customer_accounts_updated_at ON public.lam_customer_accounts;
CREATE TRIGGER update_lam_customer_accounts_updated_at
  BEFORE UPDATE ON public.lam_customer_accounts
  FOR EACH ROW EXECUTE FUNCTION update_staff_permissions_updated_at();

DROP TRIGGER IF EXISTS update_lam_organizations_updated_at ON public.lam_organizations;
CREATE TRIGGER update_lam_organizations_updated_at
  BEFORE UPDATE ON public.lam_organizations
  FOR EACH ROW EXECUTE FUNCTION update_staff_permissions_updated_at();

DROP TRIGGER IF EXISTS update_lam_product_workspaces_updated_at ON public.lam_product_workspaces;
CREATE TRIGGER update_lam_product_workspaces_updated_at
  BEFORE UPDATE ON public.lam_product_workspaces
  FOR EACH ROW EXECUTE FUNCTION update_staff_permissions_updated_at();

DROP TRIGGER IF EXISTS update_lam_workspace_memberships_updated_at ON public.lam_workspace_memberships;
CREATE TRIGGER update_lam_workspace_memberships_updated_at
  BEFORE UPDATE ON public.lam_workspace_memberships
  FOR EACH ROW EXECUTE FUNCTION update_staff_permissions_updated_at();

