-- ============================================================
-- COMPLETE CMS SECTIONS SEED
-- Registers ALL visible sections across ALL public pages
-- so that Site Management mirrors the actual website.
-- ============================================================

-- ── SOLUTIONS PAGE ──────────────────────────────────────────
INSERT INTO public.cms_pages (slug, title) VALUES ('solutions', 'Solutions') ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.cms_sections (section_key, page_slug, name, order_index, content_schema, draft_content, published_content) VALUES
('solutions_hero', 'solutions', 'Hero Section', 10,
  '[
    { "name": "eyebrow", "label": "Eyebrow Label", "type": "text" },
    { "name": "title", "label": "Page Title", "type": "text" },
    { "name": "subtitle", "label": "Subtitle / Description", "type": "textarea" }
  ]'::jsonb,
  '{}'::jsonb, '{}'::jsonb
),
('solutions_info', 'solutions', 'Solutions Grid (Info Panel)', 20,
  '[
    { "name": "info_text", "label": "Introductory Note (shown above the grid if desired)", "type": "textarea" }
  ]'::jsonb,
  '{"info_text": "Individual solution cards are managed via the Solutions module in the sidebar. Each solution you create or edit there automatically appears on the public Solutions page."}'::jsonb,
  '{"info_text": "Individual solution cards are managed via the Solutions module in the sidebar. Each solution you create or edit there automatically appears on the public Solutions page."}'::jsonb
)
ON CONFLICT (section_key) DO UPDATE SET content_schema = EXCLUDED.content_schema;


-- ── PRODUCTS PAGE ───────────────────────────────────────────
INSERT INTO public.cms_pages (slug, title) VALUES ('products', 'Products') ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.cms_sections (section_key, page_slug, name, order_index, content_schema, draft_content, published_content) VALUES
('products_hero', 'products', 'Hero Section', 10,
  '[
    { "name": "eyebrow", "label": "Eyebrow Label", "type": "text" },
    { "name": "title", "label": "Page Title", "type": "text" },
    { "name": "subtitle", "label": "Subtitle / Description", "type": "textarea" }
  ]'::jsonb,
  '{}'::jsonb, '{}'::jsonb
),
('products_info', 'products', 'Product Cards (Info Panel)', 20,
  '[
    { "name": "info_text", "label": "Introductory Note", "type": "textarea" }
  ]'::jsonb,
  '{"info_text": "Individual product cards are managed via the Products module in the sidebar. Each product you create or edit there automatically appears on the public Products page."}'::jsonb,
  '{"info_text": "Individual product cards are managed via the Products module in the sidebar. Each product you create or edit there automatically appears on the public Products page."}'::jsonb
)
ON CONFLICT (section_key) DO UPDATE SET content_schema = EXCLUDED.content_schema;


-- ── INDUSTRIES PAGE ─────────────────────────────────────────
INSERT INTO public.cms_pages (slug, title) VALUES ('industries', 'Industries') ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.cms_sections (section_key, page_slug, name, order_index, content_schema, draft_content, published_content) VALUES
('industries_hero', 'industries', 'Hero Section', 10,
  '[
    { "name": "eyebrow", "label": "Eyebrow Label", "type": "text" },
    { "name": "title", "label": "Page Title", "type": "text" },
    { "name": "subtitle", "label": "Subtitle / Description", "type": "textarea" }
  ]'::jsonb,
  '{}'::jsonb, '{}'::jsonb
),
('industries_info', 'industries', 'Industry Cards (Info Panel)', 20,
  '[
    { "name": "info_text", "label": "Introductory Note", "type": "textarea" }
  ]'::jsonb,
  '{"info_text": "Individual industry cards are managed via the Industries module in the sidebar. Each industry you create or edit there automatically appears on the public Industries page."}'::jsonb,
  '{"info_text": "Individual industry cards are managed via the Industries module in the sidebar. Each industry you create or edit there automatically appears on the public Industries page."}'::jsonb
)
ON CONFLICT (section_key) DO UPDATE SET content_schema = EXCLUDED.content_schema;


-- ── INSIGHTS PAGE ───────────────────────────────────────────
INSERT INTO public.cms_pages (slug, title) VALUES ('insights', 'Insights') ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.cms_sections (section_key, page_slug, name, order_index, content_schema, draft_content, published_content) VALUES
('insights_hero', 'insights', 'Hero Section', 10,
  '[
    { "name": "eyebrow", "label": "Eyebrow Label", "type": "text" },
    { "name": "title", "label": "Page Title", "type": "text" },
    { "name": "subtitle", "label": "Subtitle / Description", "type": "textarea" }
  ]'::jsonb,
  '{}'::jsonb, '{}'::jsonb
),
('insights_info', 'insights', 'Article Cards (Info Panel)', 20,
  '[
    { "name": "info_text", "label": "Introductory Note", "type": "textarea" }
  ]'::jsonb,
  '{"info_text": "Individual insight articles are managed via the Insights module in the sidebar. Each article you create or publish there automatically appears on the public Insights page."}'::jsonb,
  '{"info_text": "Individual insight articles are managed via the Insights module in the sidebar. Each article you create or publish there automatically appears on the public Insights page."}'::jsonb
)
ON CONFLICT (section_key) DO UPDATE SET content_schema = EXCLUDED.content_schema;


-- ── PARTNERS PAGE ───────────────────────────────────────────
INSERT INTO public.cms_pages (slug, title) VALUES ('partners', 'Partners & Clients') ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.cms_sections (section_key, page_slug, name, order_index, content_schema, draft_content, published_content) VALUES
('partners_hero', 'partners', 'Hero Section', 10,
  '[
    { "name": "eyebrow", "label": "Eyebrow Label", "type": "text" },
    { "name": "title", "label": "Page Title", "type": "text" },
    { "name": "subtitle", "label": "Subtitle / Description", "type": "textarea" }
  ]'::jsonb,
  '{}'::jsonb, '{}'::jsonb
),
('partners_approach', 'partners', 'Partnership Approach', 20,
  '[
    { "name": "heading", "label": "Section Heading", "type": "text" },
    { "name": "description", "label": "Description Text", "type": "textarea" }
  ]'::jsonb,
  '{"heading": "Partnership Approach", "description": "LΛM does not operate in isolation. Our platforms are designed to be the foundational infrastructure upon which other systems integrate and thrive. We collaborate with select technology vendors, integration specialists, and strategic consultancies to deliver uncompromising value to our end clients."}'::jsonb,
  '{"heading": "Partnership Approach", "description": "LΛM does not operate in isolation. Our platforms are designed to be the foundational infrastructure upon which other systems integrate and thrive. We collaborate with select technology vendors, integration specialists, and strategic consultancies to deliver uncompromising value to our end clients."}'::jsonb
),
('partners_collaboration', 'partners', 'Areas of Collaboration', 30,
  '[
    { "name": "heading", "label": "Section Heading", "type": "text" },
    {
      "name": "partner_types",
      "label": "Partner Type Cards",
      "type": "array",
      "fields": [
        { "name": "title", "label": "Partner Type Title", "type": "text" },
        { "name": "description", "label": "Description", "type": "textarea" }
      ]
    }
  ]'::jsonb,
  '{"heading": "Areas of Collaboration", "partner_types": [{"title": "Technology Partners", "description": "Hardware manufacturers and specialized software vendors whose products integrate natively with the LΛM ecosystem."}, {"title": "Implementation Partners", "description": "Certified agencies and system integrators authorized to deploy, configure, and maintain LΛM platforms on-premise or in hybrid clouds."}, {"title": "Strategic Partners", "description": "Management consultancies and advisory firms that leverage our platforms to execute large-scale digital transformation mandates."}]}'::jsonb,
  '{"heading": "Areas of Collaboration", "partner_types": [{"title": "Technology Partners", "description": "Hardware manufacturers and specialized software vendors whose products integrate natively with the LΛM ecosystem."}, {"title": "Implementation Partners", "description": "Certified agencies and system integrators authorized to deploy, configure, and maintain LΛM platforms on-premise or in hybrid clouds."}, {"title": "Strategic Partners", "description": "Management consultancies and advisory firms that leverage our platforms to execute large-scale digital transformation mandates."}]}'::jsonb
),
('partners_cta', 'partners', 'Become a Partner CTA', 40,
  '[
    { "name": "title", "label": "CTA Heading", "type": "text" },
    { "name": "description", "label": "CTA Description", "type": "textarea" },
    { "name": "button_text", "label": "Button Text", "type": "text" },
    { "name": "button_link", "label": "Button Link", "type": "text" }
  ]'::jsonb,
  '{"title": "Become a Partner", "description": "Whether you are a hardware manufacturer looking to integrate with PointO, or a digital agency seeking to leverage AimHighSERP, we are open to strategic alliances.", "button_text": "Apply for Partnership", "button_link": "/contact?subject=Partnership"}'::jsonb,
  '{"title": "Become a Partner", "description": "Whether you are a hardware manufacturer looking to integrate with PointO, or a digital agency seeking to leverage AimHighSERP, we are open to strategic alliances.", "button_text": "Apply for Partnership", "button_link": "/contact?subject=Partnership"}'::jsonb
),
('partners_clients', 'partners', 'Selected Clients', 50,
  '[
    { "name": "heading", "label": "Section Heading", "type": "text" },
    { "name": "message", "label": "Confidentiality Message", "type": "textarea" }
  ]'::jsonb,
  '{"heading": "Selected Clients", "message": "LΛM respects the confidentiality of its institutional and enterprise clients. Operating under strict Non-Disclosure Agreements, we do not publicly list client logos or operational metrics. Approved public case studies will appear here once authorized."}'::jsonb,
  '{"heading": "Selected Clients", "message": "LΛM respects the confidentiality of its institutional and enterprise clients. Operating under strict Non-Disclosure Agreements, we do not publicly list client logos or operational metrics. Approved public case studies will appear here once authorized."}'::jsonb
)
ON CONFLICT (section_key) DO UPDATE SET content_schema = EXCLUDED.content_schema;


-- ── ABOUT PAGE ──────────────────────────────────────────────
INSERT INTO public.cms_pages (slug, title) VALUES ('about', 'About Us') ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.cms_sections (section_key, page_slug, name, order_index, content_schema, draft_content, published_content) VALUES
('about_hero', 'about', 'Hero Section', 10,
  '[
    { "name": "eyebrow", "label": "Eyebrow Label", "type": "text" },
    { "name": "title", "label": "Page Title", "type": "text" },
    { "name": "subtitle", "label": "Subtitle / Description", "type": "textarea" }
  ]'::jsonb,
  '{}'::jsonb, '{}'::jsonb
),
('about_intro', 'about', 'Who We Are & What We Build', 20,
  '[
    { "name": "who_we_are_title", "label": "Who We Are — Heading", "type": "text" },
    { "name": "who_we_are_desc", "label": "Who We Are — Description", "type": "textarea" },
    { "name": "what_we_build_title", "label": "What We Build — Heading", "type": "text" },
    { "name": "what_we_build_desc", "label": "What We Build — Description", "type": "textarea" }
  ]'::jsonb,
  '{}'::jsonb, '{}'::jsonb
),
('about_philosophy', 'about', 'Our Ecosystem Philosophy', 30,
  '[
    { "name": "title", "label": "Section Heading", "type": "text" },
    { "name": "main_quote", "label": "Philosophy Quote / Statement", "type": "textarea" },
    {
      "name": "pillars",
      "label": "Pillars",
      "type": "array",
      "fields": [
        { "name": "title", "label": "Pillar Title", "type": "text" },
        { "name": "description", "label": "Pillar Description", "type": "textarea" }
      ]
    }
  ]'::jsonb,
  '{}'::jsonb, '{}'::jsonb
),
('about_future', 'about', 'Security & Future Direction', 40,
  '[
    { "name": "security_title", "label": "Security & Trust — Heading", "type": "text" },
    { "name": "security_desc", "label": "Security & Trust — Description", "type": "textarea" },
    { "name": "future_title", "label": "Future Direction — Heading", "type": "text" },
    { "name": "future_desc", "label": "Future Direction — Description", "type": "textarea" }
  ]'::jsonb,
  '{}'::jsonb, '{}'::jsonb
),
('about_cta', 'about', 'Join the Ecosystem CTA', 50,
  '[
    { "name": "title", "label": "CTA Heading", "type": "text" },
    { "name": "description", "label": "CTA Description", "type": "textarea" },
    { "name": "button_text", "label": "Button Text", "type": "text" },
    { "name": "button_link", "label": "Button Link", "type": "text" }
  ]'::jsonb,
  '{}'::jsonb, '{}'::jsonb
)
ON CONFLICT (section_key) DO UPDATE SET content_schema = EXCLUDED.content_schema;


-- ── CAREERS PAGE ────────────────────────────────────────────
INSERT INTO public.cms_pages (slug, title) VALUES ('careers', 'Careers') ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.cms_sections (section_key, page_slug, name, order_index, content_schema, draft_content, published_content) VALUES
('careers_hero', 'careers', 'Hero Section', 10,
  '[
    { "name": "eyebrow", "label": "Eyebrow Label", "type": "text" },
    { "name": "title", "label": "Page Title", "type": "text" },
    { "name": "subtitle", "label": "Subtitle / Description", "type": "textarea" }
  ]'::jsonb,
  '{}'::jsonb, '{}'::jsonb
),
('careers_why', 'careers', 'Why LΛM?', 20,
  '[
    { "name": "title", "label": "Section Heading", "type": "text" },
    { "name": "main_text", "label": "Main Description", "type": "textarea" },
    {
      "name": "pillars",
      "label": "Value Pillars",
      "type": "array",
      "fields": [
        { "name": "title", "label": "Pillar Title", "type": "text" },
        { "name": "description", "label": "Pillar Description", "type": "textarea" }
      ]
    }
  ]'::jsonb,
  '{}'::jsonb, '{}'::jsonb
),
('careers_positions', 'careers', 'Open Positions (Info Panel)', 30,
  '[
    { "name": "info_text", "label": "Introductory Note", "type": "textarea" }
  ]'::jsonb,
  '{"info_text": "Open positions are managed via the Careers module in the sidebar. Each career posting you create and publish there automatically appears in this section on the public page."}'::jsonb,
  '{"info_text": "Open positions are managed via the Careers module in the sidebar. Each career posting you create and publish there automatically appears in this section on the public page."}'::jsonb
),
('careers_internships', 'careers', 'Internships & Application CTA', 40,
  '[
    { "name": "internship_title", "label": "Internships Heading", "type": "text" },
    { "name": "internship_desc", "label": "Internships Description", "type": "textarea" },
    { "name": "cta_title", "label": "Application CTA Title", "type": "text" },
    { "name": "cta_desc", "label": "Application CTA Description", "type": "textarea" },
    { "name": "button_text", "label": "Button Text", "type": "text" },
    { "name": "button_link", "label": "Button Link", "type": "text" }
  ]'::jsonb,
  '{}'::jsonb, '{}'::jsonb
)
ON CONFLICT (section_key) DO UPDATE SET content_schema = EXCLUDED.content_schema;


-- ── CONTACT PAGE ────────────────────────────────────────────
INSERT INTO public.cms_pages (slug, title) VALUES ('contact', 'Contact') ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.cms_sections (section_key, page_slug, name, order_index, content_schema, draft_content, published_content) VALUES
('contact_hero', 'contact', 'Hero Section', 10,
  '[
    { "name": "eyebrow", "label": "Eyebrow Label", "type": "text" },
    { "name": "title", "label": "Page Title", "type": "text" },
    { "name": "subtitle", "label": "Subtitle / Description", "type": "textarea" }
  ]'::jsonb,
  '{}'::jsonb, '{}'::jsonb
),
('contact_offices', 'contact', 'Office Locations', 20,
  '[
    {
      "name": "offices",
      "label": "Office Cards",
      "type": "array",
      "fields": [
        { "name": "city", "label": "City / Office Name", "type": "text" },
        { "name": "address", "label": "Full Address", "type": "textarea" },
        { "name": "phone", "label": "Phone Number", "type": "text" },
        { "name": "email", "label": "Email Address", "type": "text" }
      ]
    }
  ]'::jsonb,
  '{}'::jsonb, '{}'::jsonb
),
('contact_form', 'contact', 'Contact Form (Info Panel)', 30,
  '[
    { "name": "info_text", "label": "Note", "type": "textarea" }
  ]'::jsonb,
  '{"info_text": "The contact form is automatically rendered and submissions are captured in the Leads & Clients module. Form fields and logic are managed by the system."}'::jsonb,
  '{"info_text": "The contact form is automatically rendered and submissions are captured in the Leads & Clients module. Form fields and logic are managed by the system."}'::jsonb
)
ON CONFLICT (section_key) DO UPDATE SET content_schema = EXCLUDED.content_schema;


-- ── REQUEST DEMO PAGE ───────────────────────────────────────
INSERT INTO public.cms_pages (slug, title) VALUES ('request-demo', 'Request Demo') ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.cms_sections (section_key, page_slug, name, order_index, content_schema, draft_content, published_content) VALUES
('demo_hero', 'request-demo', 'Hero Section', 10,
  '[
    { "name": "eyebrow", "label": "Eyebrow Label", "type": "text" },
    { "name": "title", "label": "Page Title", "type": "text" },
    { "name": "subtitle", "label": "Subtitle / Description", "type": "textarea" }
  ]'::jsonb,
  '{}'::jsonb, '{}'::jsonb
),
('demo_form', 'request-demo', 'Demo Request Form (Info Panel)', 20,
  '[
    { "name": "info_text", "label": "Note", "type": "textarea" }
  ]'::jsonb,
  '{"info_text": "The demo request form is automatically rendered and submissions are captured in the Leads & Clients module. Form fields and logic are managed by the system."}'::jsonb,
  '{"info_text": "The demo request form is automatically rendered and submissions are captured in the Leads & Clients module. Form fields and logic are managed by the system."}'::jsonb
)
ON CONFLICT (section_key) DO UPDATE SET content_schema = EXCLUDED.content_schema;
