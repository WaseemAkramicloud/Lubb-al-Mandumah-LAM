ALTER TABLE public.cms_products ADD COLUMN IF NOT EXISTS draft_data JSONB;
ALTER TABLE public.cms_insights ADD COLUMN IF NOT EXISTS draft_data JSONB;
ALTER TABLE public.cms_collections ADD COLUMN IF NOT EXISTS draft_data JSONB;
