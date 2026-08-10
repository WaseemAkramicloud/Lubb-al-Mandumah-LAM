-- Create CMS Pages table
CREATE TABLE IF NOT EXISTS public.cms_pages (
  slug VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create CMS Sections table
CREATE TABLE IF NOT EXISTS public.cms_sections (
  section_key VARCHAR(255) PRIMARY KEY,
  page_slug VARCHAR(255) NOT NULL REFERENCES public.cms_pages(slug) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  content_schema JSONB NOT NULL DEFAULT '[]'::jsonb,
  draft_content JSONB DEFAULT '{}'::jsonb,
  published_content JSONB DEFAULT '{}'::jsonb,
  order_index INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_sections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cms_pages
CREATE POLICY "Allow public read access to cms_pages"
ON public.cms_pages FOR SELECT USING (true);

CREATE POLICY "Allow service_role full access to cms_pages"
ON public.cms_pages FOR ALL TO service_role USING (true) WITH CHECK (true);

-- RLS Policies for cms_sections
CREATE POLICY "Allow public read access to cms_sections"
ON public.cms_sections FOR SELECT USING (true);

CREATE POLICY "Allow service_role full access to cms_sections"
ON public.cms_sections FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_cms_sections_updated_at
BEFORE UPDATE ON public.cms_sections
FOR EACH ROW
EXECUTE FUNCTION update_staff_permissions_updated_at();

-- SEED DATA
INSERT INTO public.cms_pages (slug, title) VALUES
('home', 'Home Page')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.cms_sections (section_key, page_slug, name, order_index, content_schema, draft_content, published_content) VALUES
('home_hero', 'home', 'Hero Slider', 10, 
  '[
    {
      "name": "slides",
      "label": "Slider Images",
      "type": "array",
      "fields": [
        { "name": "src", "label": "Image URL (e.g. /images/slider/image.jpg)", "type": "text" },
        { "name": "alt", "label": "Alt Text", "type": "text" }
      ]
    }
  ]'::jsonb,
  '{}'::jsonb,
  '{}'::jsonb
),
('home_intro', 'home', 'Intro Section', 20,
  '[
    { "name": "eyebrow", "label": "Eyebrow Text", "type": "text" },
    { "name": "title", "label": "Title", "type": "text" },
    { "name": "subtitle", "label": "Subtitle", "type": "textarea" },
    {
      "name": "cards",
      "label": "Highlight Cards",
      "type": "array",
      "fields": [
        { "name": "eyebrow", "label": "Eyebrow (e.g. 01. Parent Infrastructure)", "type": "text" },
        { "name": "title", "label": "Title", "type": "text" },
        { "name": "description", "label": "Description", "type": "textarea" }
      ]
    }
  ]'::jsonb,
  '{}'::jsonb,
  '{}'::jsonb
),
('home_why_lam', 'home', 'Why LΛM Section', 30,
  '[
    { "name": "eyebrow", "label": "Eyebrow Text", "type": "text" },
    { "name": "title", "label": "Title", "type": "text" },
    { "name": "subtitle", "label": "Subtitle", "type": "textarea" },
    {
      "name": "points",
      "label": "Key Points",
      "type": "array",
      "fields": [
        { "name": "title", "label": "Title", "type": "text" },
        { "name": "description", "label": "Description", "type": "textarea" }
      ]
    }
  ]'::jsonb,
  '{}'::jsonb,
  '{}'::jsonb
),
('home_cta', 'home', 'Call to Action (CTA)', 40,
  '[
    { "name": "title", "label": "Title", "type": "text" },
    { "name": "description", "label": "Description", "type": "textarea" },
    { "name": "primary_button_text", "label": "Primary Button Text", "type": "text" },
    { "name": "primary_button_link", "label": "Primary Button Link", "type": "text" },
    { "name": "secondary_button_text", "label": "Secondary Button Text", "type": "text" },
    { "name": "secondary_button_link", "label": "Secondary Button Link", "type": "text" }
  ]'::jsonb,
  '{}'::jsonb,
  '{}'::jsonb
)
ON CONFLICT (section_key) DO UPDATE 
SET content_schema = EXCLUDED.content_schema;
