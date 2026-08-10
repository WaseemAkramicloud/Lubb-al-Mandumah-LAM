-- Create CMS Pricing Plans Table
CREATE TABLE IF NOT EXISTS public.cms_pricing_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_slug VARCHAR(255) NOT NULL,
  plan_name VARCHAR(255) NOT NULL,
  display_price VARCHAR(255) NOT NULL, -- e.g., "$99", "Contact Sales"
  currency VARCHAR(50),
  billing_period_label VARCHAR(100), -- e.g., "/month per user"
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  cta_text VARCHAR(100) NOT NULL,
  cta_link VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'draft', -- 'draft' or 'published'
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create System Settings Table
CREATE TABLE IF NOT EXISTS public.system_settings (
  setting_key VARCHAR(100) PRIMARY KEY,
  setting_value JSONB NOT NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed System Settings
INSERT INTO public.system_settings (setting_key, setting_value)
VALUES 
  ('company_info', '{"name": "Lubb al-Mandumah", "email": "contact@lamweb.com", "phone": "+1 234 567 8900", "address": "Dubai, UAE"}'::jsonb),
  ('social_links', '{"linkedin": "https://linkedin.com/company/lam", "twitter": "https://twitter.com/lam", "github": ""}'::jsonb),
  ('seo_defaults', '{"title_suffix": " | LAM", "default_description": "Lubb al-Mandumah - Advanced Software Solutions"}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;

-- Enable RLS
ALTER TABLE public.cms_pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Policies for cms_pricing_plans
CREATE POLICY "Allow public read access to published pricing plans"
ON public.cms_pricing_plans FOR SELECT USING (status = 'published');

CREATE POLICY "Allow service_role full access to cms_pricing_plans"
ON public.cms_pricing_plans FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policies for system_settings
CREATE POLICY "Allow public read access to system_settings"
ON public.system_settings FOR SELECT USING (true);

CREATE POLICY "Allow service_role full access to system_settings"
ON public.system_settings FOR ALL TO service_role USING (true) WITH CHECK (true);
