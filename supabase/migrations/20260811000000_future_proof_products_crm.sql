-- ============================================================================
-- MIGRATION: Future-Proof Products & CRM Foundations
-- Date: 2026-08-11
-- Purpose: Extend existing Products and Leads/Clients schemas for LAM Central
--          readiness. All changes are ADDITIVE — no existing columns or tables
--          are dropped or renamed.
-- ============================================================================

-- ============================================================================
-- 1. STRENGTHEN PRODUCTS: Internal Product Administration Fields
-- ============================================================================

-- Permanent Product ID (immutable internal identifier e.g. ATOM, NEXORA)
ALTER TABLE public.cms_products ADD COLUMN IF NOT EXISTS product_id VARCHAR(50) UNIQUE;

-- Product Type (SaaS, Platform, Internal System, Service, Other)
ALTER TABLE public.cms_products ADD COLUMN IF NOT EXISTS product_type VARCHAR(50);

-- Product Lifecycle Status (independent from website publishing status)
ALTER TABLE public.cms_products ADD COLUMN IF NOT EXISTS lifecycle_status VARCHAR(50) DEFAULT 'Active';

-- Database Architecture (informational)
ALTER TABLE public.cms_products ADD COLUMN IF NOT EXISTS db_architecture VARCHAR(100) DEFAULT 'Separate Product Project';

-- Product Application URL
ALTER TABLE public.cms_products ADD COLUMN IF NOT EXISTS app_url TEXT;

-- Product Admin URL
ALTER TABLE public.cms_products ADD COLUMN IF NOT EXISTS admin_url TEXT;

-- Product Owner (LAM staff)
ALTER TABLE public.cms_products ADD COLUMN IF NOT EXISTS product_owner UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL;

-- Technical Owner (LAM staff)
ALTER TABLE public.cms_products ADD COLUMN IF NOT EXISTS technical_owner UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL;

-- Commercial Owner (LAM staff)
ALTER TABLE public.cms_products ADD COLUMN IF NOT EXISTS commercial_owner UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL;

-- Internal Version
ALTER TABLE public.cms_products ADD COLUMN IF NOT EXISTS internal_version VARCHAR(50);

-- Internal Notes (visible only internally)
ALTER TABLE public.cms_products ADD COLUMN IF NOT EXISTS internal_notes TEXT;

-- ============================================================================
-- 2. PRODUCT INTEGRATION METADATA
-- ============================================================================

-- Integration Status
ALTER TABLE public.cms_products ADD COLUMN IF NOT EXISTS integration_status VARCHAR(50) DEFAULT 'Not Configured';

-- Product API Base URL
ALTER TABLE public.cms_products ADD COLUMN IF NOT EXISTS api_base_url TEXT;

-- Health Check URL
ALTER TABLE public.cms_products ADD COLUMN IF NOT EXISTS health_check_url TEXT;

-- Webhook URL
ALTER TABLE public.cms_products ADD COLUMN IF NOT EXISTS webhook_url TEXT;

-- External Product Reference
ALTER TABLE public.cms_products ADD COLUMN IF NOT EXISTS external_product_ref VARCHAR(255);

-- SSO Status
ALTER TABLE public.cms_products ADD COLUMN IF NOT EXISTS sso_status VARCHAR(50) DEFAULT 'Not Configured';

-- Last Successful Connection / Sync
ALTER TABLE public.cms_products ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMP WITH TIME ZONE;

-- Integration Notes
ALTER TABLE public.cms_products ADD COLUMN IF NOT EXISTS integration_notes TEXT;

-- ============================================================================
-- 3. BACKFILL product_id FROM EXISTING SLUGS
-- ============================================================================

UPDATE public.cms_products SET product_id = UPPER(slug) WHERE product_id IS NULL;

-- ============================================================================
-- 4. COMPANIES TABLE (Reusable Company / Client Entity)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.crm_companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id VARCHAR(50) UNIQUE,
  name VARCHAR(255) NOT NULL,
  legal_name VARCHAR(255),
  country VARCHAR(100),
  city VARCHAR(100),
  website TEXT,
  email VARCHAR(255),
  phone VARCHAR(50),
  status VARCHAR(50) NOT NULL DEFAULT 'Prospect',
  source VARCHAR(100),
  assigned_staff UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.crm_companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service_role full access to crm_companies"
  ON public.crm_companies FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Auto-generate company_id sequence
CREATE SEQUENCE IF NOT EXISTS crm_company_id_seq START WITH 1;

-- ============================================================================
-- 5. CONTACTS TABLE (Multiple contacts per company)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.crm_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.crm_companies(id) ON DELETE CASCADE,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255),
  job_title VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  preferred_contact VARCHAR(50) DEFAULT 'Email',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service_role full access to crm_contacts"
  ON public.crm_contacts FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================================
-- 6. COMPANY-PRODUCT INTEREST JUNCTION TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.crm_company_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.crm_companies(id) ON DELETE CASCADE,
  product_slug VARCHAR(255) NOT NULL REFERENCES public.cms_products(slug) ON DELETE CASCADE,
  interest_type VARCHAR(50) NOT NULL DEFAULT 'Interested',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(company_id, product_slug)
);

ALTER TABLE public.crm_company_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service_role full access to crm_company_products"
  ON public.crm_company_products FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================================
-- 7. EXTEND crm_leads WITH RELATIONAL PRODUCT REFERENCE
-- ============================================================================

-- Add product_slug FK (alongside existing interested_product text for backwards compat)
ALTER TABLE public.crm_leads ADD COLUMN IF NOT EXISTS product_slug VARCHAR(255) REFERENCES public.cms_products(slug) ON DELETE SET NULL;

-- Add optional company link
ALTER TABLE public.crm_leads ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.crm_companies(id) ON DELETE SET NULL;

-- Backfill product_slug from interested_product text where possible
-- Match by slug (exact) or by name (case-insensitive)
UPDATE public.crm_leads l
SET product_slug = p.slug
FROM public.cms_products p
WHERE l.product_slug IS NULL
  AND l.interested_product IS NOT NULL
  AND (
    LOWER(l.interested_product) = LOWER(p.slug)
    OR LOWER(l.interested_product) = LOWER(p.name)
    OR LOWER(l.interested_product) LIKE '%' || LOWER(p.slug) || '%'
  );

-- ============================================================================
-- 8. EXTEND crm_clients WITH COMPANY LINK
-- ============================================================================

ALTER TABLE public.crm_clients ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.crm_companies(id) ON DELETE SET NULL;

-- ============================================================================
-- 9. BACKFILL: Create companies from existing clients
-- ============================================================================

-- For each existing crm_client, create a crm_companies record if one doesn't exist
INSERT INTO public.crm_companies (name, email, phone, status, source, assigned_staff, notes, created_at)
SELECT
  c.organization_name,
  c.email,
  c.phone,
  'Active',
  'Legacy Migration',
  c.relationship_owner,
  'Auto-created from existing client record during migration.',
  c.created_at
FROM public.crm_clients c
WHERE NOT EXISTS (
  SELECT 1 FROM public.crm_companies co WHERE LOWER(co.name) = LOWER(c.organization_name)
);

-- Link existing clients to their newly created companies
UPDATE public.crm_clients cl
SET company_id = co.id
FROM public.crm_companies co
WHERE cl.company_id IS NULL
  AND LOWER(co.name) = LOWER(cl.organization_name);

-- Generate company_id values for all companies that don't have one
UPDATE public.crm_companies
SET company_id = 'LAM-C-' || LPAD(nextval('crm_company_id_seq')::TEXT, 6, '0')
WHERE company_id IS NULL;

-- Create contacts from existing client contact info
INSERT INTO public.crm_contacts (company_id, first_name, email, phone, notes, created_at)
SELECT
  cl.company_id,
  cl.contact_name,
  cl.email,
  cl.phone,
  'Primary contact migrated from client record.',
  cl.created_at
FROM public.crm_clients cl
WHERE cl.company_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.crm_contacts ct
    WHERE ct.company_id = cl.company_id AND ct.email = cl.email
  );

-- Backfill company product interests from client related_products
INSERT INTO public.crm_company_products (company_id, product_slug, interest_type)
SELECT
  cl.company_id,
  UNNEST(cl.related_products),
  'Active Client'
FROM public.crm_clients cl
WHERE cl.company_id IS NOT NULL
  AND cl.related_products IS NOT NULL
  AND array_length(cl.related_products, 1) > 0
ON CONFLICT (company_id, product_slug) DO NOTHING;

-- ============================================================================
-- 10. SEED LAM ECOSYSTEM SETTINGS
-- ============================================================================

INSERT INTO public.system_settings (setting_key, setting_value)
VALUES (
  'lam_ecosystem',
  '{
    "parent_platform_name": "LAM",
    "architecture_model": "Independent Product Applications",
    "product_db_strategy": "Separate project/database per serious SaaS",
    "internal_erp": "ATOM",
    "lam_central_status": "Not Yet Enabled",
    "cross_product_sso_status": "Not Yet Enabled",
    "ecosystem_notes": ""
  }'::jsonb
)
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================================================
-- 11. UPDATED_AT TRIGGERS FOR NEW TABLES
-- ============================================================================

CREATE TRIGGER update_crm_companies_updated_at
  BEFORE UPDATE ON public.crm_companies
  FOR EACH ROW EXECUTE FUNCTION update_staff_permissions_updated_at();

CREATE TRIGGER update_crm_contacts_updated_at
  BEFORE UPDATE ON public.crm_contacts
  FOR EACH ROW EXECUTE FUNCTION update_staff_permissions_updated_at();
