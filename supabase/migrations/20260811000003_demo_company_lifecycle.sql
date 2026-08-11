-- ============================================================================
-- MIGRATION: Demo Company Support & Entitlement Lifecycle Controls
-- Date: 2026-08-11
-- Purpose: Add company_type column to crm_companies and ensure entitlements
--          support optional expiry dates and lifecycle status management.
-- ============================================================================

-- 1. ADD COMPANY_TYPE COLUMN TO CRM_COMPANIES
ALTER TABLE public.crm_companies 
ADD COLUMN IF NOT EXISTS company_type VARCHAR(50) NOT NULL DEFAULT 'standard';

-- Index on company_type for fast filtering
CREATE INDEX IF NOT EXISTS idx_crm_companies_company_type ON public.crm_companies (company_type);

-- 2. ENSURE EXPIRES_AT COLUMN IN CUSTOMER_PRODUCT_ENTITLEMENTS
ALTER TABLE public.customer_product_entitlements 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Index on entitlement status & expires_at
CREATE INDEX IF NOT EXISTS idx_customer_entitlements_lifecycle 
ON public.customer_product_entitlements (company_id, product_slug, status, expires_at);
