-- ============================================================================
-- MIGRATION: LAM Products Identity Mode Classification
-- Date: 2026-08-19
-- Purpose: Add identity_mode column to lam_products to strictly isolate
--          LAM SSO-integrated SaaS products (NEXORA, ATOM, AimHighSERP, MAAMS)
--          from non-integrated / local platform products (PointO, AMAL).
-- ============================================================================

ALTER TABLE public.lam_products ADD COLUMN IF NOT EXISTS identity_mode VARCHAR(50) NOT NULL DEFAULT 'lam_sso';

-- Update product identity classifications
UPDATE public.lam_products
SET identity_mode = 'lam_sso',
    client_id = 'lam_app_nexora',
    app_url = 'https://nexora.lubbalmandumah.com'
WHERE slug = 'nexora';

UPDATE public.lam_products
SET identity_mode = 'lam_sso',
    client_id = 'lam_app_atom',
    app_url = 'https://atom.lubbalmandumah.com'
WHERE slug = 'atom';

UPDATE public.lam_products
SET identity_mode = 'lam_sso',
    client_id = 'lam_app_aimhighserp',
    app_url = 'https://aimhighserp.lubbalmandumah.com'
WHERE slug = 'aimhighserp';

UPDATE public.lam_products
SET identity_mode = 'lam_sso',
    client_id = 'lam_app_maams',
    app_url = 'https://maams.lubbalmandumah.com'
WHERE slug = 'maams';

UPDATE public.lam_products
SET identity_mode = 'local_platform',
    client_id = NULL,
    app_url = NULL
WHERE slug = 'pointo';

UPDATE public.lam_products
SET identity_mode = 'local_platform',
    client_id = NULL,
    app_url = NULL
WHERE slug = 'amal';

-- Clean up any unneeded SSO application entries for non-integrated products
DELETE FROM public.sso_applications WHERE product_slug IN ('pointo', 'amal');

