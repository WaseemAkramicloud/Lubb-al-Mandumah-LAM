INSERT INTO public.cms_sections (section_key, page_slug, name, order_index, content_schema, draft_content, published_content) VALUES
('home_products', 'home', 'Featured Products', 3, 
  '[
    {"name": "eyebrow", "label": "Eyebrow Text", "type": "text"},
    {"name": "title", "label": "Main Heading", "type": "text"},
    {"name": "subtitle", "label": "Subtitle", "type": "textarea"},
    {"name": "product_slugs", "label": "Featured Products (Select Slugs)", "type": "text", "description": "Comma separated slugs, e.g. atom, aimhighserp"}
  ]'::jsonb,
  '{}'::jsonb,
  '{}'::jsonb
) ON CONFLICT (section_key) DO UPDATE 
SET content_schema = EXCLUDED.content_schema;
