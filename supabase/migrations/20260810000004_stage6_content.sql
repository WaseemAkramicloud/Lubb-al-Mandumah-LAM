-- Create CMS Products table
CREATE TABLE IF NOT EXISTS public.cms_products (
  slug VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  tagline VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(255) NOT NULL,
  href VARCHAR(255) NOT NULL,
  restricted BOOLEAN DEFAULT false,
  coming_soon BOOLEAN DEFAULT false,
  badge VARCHAR(100),
  detail JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(20) NOT NULL DEFAULT 'published',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create CMS Insights table
CREATE TABLE IF NOT EXISTS public.cms_insights (
  slug VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  author VARCHAR(255) NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'published',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create CMS Collections table (Solutions, Industries, Partners, Careers)
CREATE TABLE IF NOT EXISTS public.cms_collections (
  slug VARCHAR(255) PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(20) NOT NULL DEFAULT 'published',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Media Assets table
CREATE TABLE IF NOT EXISTS public.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  alt_text VARCHAR(255),
  size_bytes INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  uploaded_by UUID REFERENCES public.staff_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.cms_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow public read access to cms_products" ON public.cms_products FOR SELECT USING (true);
CREATE POLICY "Allow service_role full access to cms_products" ON public.cms_products FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access to cms_insights" ON public.cms_insights FOR SELECT USING (true);
CREATE POLICY "Allow service_role full access to cms_insights" ON public.cms_insights FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access to cms_collections" ON public.cms_collections FOR SELECT USING (true);
CREATE POLICY "Allow service_role full access to cms_collections" ON public.cms_collections FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access to media_assets" ON public.media_assets FOR SELECT USING (true);
CREATE POLICY "Allow service_role full access to media_assets" ON public.media_assets FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Triggers for updated_at
CREATE TRIGGER update_cms_products_updated_at BEFORE UPDATE ON public.cms_products FOR EACH ROW EXECUTE FUNCTION update_staff_permissions_updated_at();
CREATE TRIGGER update_cms_insights_updated_at BEFORE UPDATE ON public.cms_insights FOR EACH ROW EXECUTE FUNCTION update_staff_permissions_updated_at();
CREATE TRIGGER update_cms_collections_updated_at BEFORE UPDATE ON public.cms_collections FOR EACH ROW EXECUTE FUNCTION update_staff_permissions_updated_at();

-- SEED DATA - PRODUCTS
INSERT INTO public.cms_products (slug, name, tagline, description, category, href, restricted, badge, detail) VALUES
('atom', 'ATOM', 'Enterprise Operations Platform', 'A comprehensive ERP and operations platform built for modern enterprises — covering inventory, procurement, sales, finance and more.', 'Business Software', '/products/atom', false, null, '{"whatItIs": "ATOM is a central nervous system for complex corporate entities. It consolidates disparate data streams and workflows into a single, scalable enterprise resource planning (ERP) environment.", "whoItIsFor": "Mid-to-large tier enterprises, multinational corporations, and multi-subsidiary conglomerates requiring unified oversight.", "problemsSolved": ["Siloed departmental data leading to inaccurate financial forecasting.", "Fragmented supply chain tracking across regional boundaries.", "Inefficient manual reconciliation processes in finance and HR."], "keyCapabilities": ["Real-time General Ledger and multi-currency financial consolidation.", "End-to-end supply chain and inventory tracking.", "Automated procurement and vendor management workflows.", "Human capital and payroll administration."], "benefits": ["Complete visibility into enterprise health in real-time.", "Reduction in operational overhead by automating repetitive administrative tasks.", "Scalable architecture that supports rapid mergers and acquisitions."], "deploymentNote": "Deployed via LΛM Cloud with optional hybrid-cloud configurations for stringent regulatory environments.", "relatedSolutions": ["pointo", "aimhighserp"], "ctaType": "demo"}'),
('aimhighserp', 'AimHighSERP', 'SEO Intelligence Platform', 'Advanced search engine intelligence that helps your brand dominate rankings with data-driven insights and automated optimisation.', 'Business Software', '/products/aimhighserp', false, null, '{"whatItIs": "An advanced digital marketing and search engine intelligence suite. AimHighSERP analyzes competitive landscapes and automatically highlights optimization vectors for enterprise web properties.", "whoItIsFor": "Digital marketing agencies, enterprise CMOs, and large-scale e-commerce brands.", "problemsSolved": ["Loss of organic traffic to aggressive competitors.", "Inability to track keyword performance across hundreds of thousands of SKUs.", "Disconnect between content creation and search intent data."], "keyCapabilities": ["Predictive ranking algorithms and competitor tracking.", "Automated technical SEO audits at scale.", "Content gap analysis using NLP and machine learning.", "Backlink profile health monitoring."], "benefits": ["Increased organic acquisition through data-driven content strategies.", "Early warning systems for algorithmic penalties or drops in visibility.", "Actionable, prioritized tasks for marketing teams."], "deploymentNote": "SaaS deployment with dedicated account management and API access for custom dashboard integration.", "relatedSolutions": ["atom"], "ctaType": "quote"}'),
('maams', 'MAAMS', 'Multi-tenant Administration & Access Management System', 'A restricted-access compliance and governance platform for diplomatic missions and approved institutions.', 'Institutional Systems', '/products/maams', true, 'By Invitation', '{"whatItIs": "MAAMS is a highly secure, restricted-access governance system designed exclusively to handle the operational complexities, protocols, and security requirements of diplomatic missions.", "whoItIsFor": "Embassies, consulates, diplomatic missions, and intergovernmental organizations.", "problemsSolved": ["Insecure transmission of sensitive diplomatic communications.", "Complex visa, consular, and citizen service management.", "Lack of unified protocol management across multiple missions."], "keyCapabilities": ["Encrypted, isolated communication and document transmission.", "Consular service tracking (visas, passports, citizen registry).", "Protocol and event management tailored for diplomatic requirements.", "Strict row-level security and compliance auditing."], "benefits": ["Complete data sovereignty and compliance with international data laws.", "Streamlined consular services resulting in better citizen support.", "Uncompromising security standards backed by zero-trust architecture."], "deploymentNote": "Available strictly by invitation. Deployed on dedicated infrastructure with rigorous isolation standards.", "relatedSolutions": ["atom"], "ctaType": "institutional"}'),
('amal', 'AMAL', 'Finance & Investment Management', 'A sophisticated financial management and investment portfolio platform designed for discerning institutions.', 'Platform Ecosystems', '/products/amal', false, null, '{"whatItIs": "AMAL is a comprehensive wealth and investment management platform. It aggregates complex asset classes into a singular analytical view, facilitating intelligent portfolio decisions.", "whoItIsFor": "Family offices, wealth managers, private equity firms, and institutional investors.", "problemsSolved": ["Scattered asset data across disparate global markets and brokers.", "Delayed reporting leading to missed investment opportunities.", "Complex compliance reporting for high-net-worth portfolios."], "keyCapabilities": ["Multi-asset class portfolio aggregation.", "Real-time risk analytics and exposure modeling.", "Automated compliance and tax reporting structures.", "Client portal with customized visualization."], "benefits": ["Precision in asset allocation through unified data views.", "Reduced administrative burden for wealth managers.", "Enhanced client trust via transparent, real-time reporting."], "deploymentNote": "Enterprise SaaS with optional integration into existing banking infrastructure via secure APIs.", "relatedSolutions": ["atom"], "ctaType": "partnership"}'),
('pointo', 'PointO', 'Modern Point of Sale', 'A sleek, intelligent point-of-sale platform for retail and hospitality businesses seeking operational excellence.', 'Business Software', '/products/pointo', false, null, '{"whatItIs": "PointO bridges the gap between digital infrastructure and the physical storefront. It is a modern, tablet-first POS system that seamlessly synchronizes with enterprise inventory.", "whoItIsFor": "Multi-location retail chains, high-volume hospitality venues, and franchise operators.", "problemsSolved": ["Disconnection between front-of-house sales and back-office inventory.", "Unreliable offline operation during internet outages.", "Clunky interfaces that slow down transaction times."], "keyCapabilities": ["Offline-first architecture ensuring uninterrupted sales.", "Real-time synchronization with centralized ATOM inventory.", "Integrated loyalty programs and customer relationship management.", "Advanced staff permission and shift management."], "benefits": ["Faster checkout experiences leading to higher customer satisfaction.", "Elimination of stock discrepancies through real-time sync.", "Intuitive interface that minimizes staff training time."], "deploymentNote": "Cloud-synchronized application deployed on specialized hardware or standard tablet devices.", "relatedSolutions": ["atom"], "ctaType": "partnership"}')
ON CONFLICT (slug) DO NOTHING;

-- SEED DATA - INSIGHTS
INSERT INTO public.cms_insights (slug, title, category, date, author, excerpt, content) VALUES
('interoperability-in-enterprise-architecture', 'Interoperability in Modern Enterprise Architecture', 'Business Technology', '2026-08-01', 'LΛM Engineering', 'Why the future of corporate software relies on deeply integrated ecosystems rather than isolated applications.', '<h2>The Shift Away from Monoliths</h2><p>For decades, enterprise software was dominated by monolithic structures. While these systems offered broad functionality, their rigidity made adaptation nearly impossible. Today, agility is the primary currency of enterprise technology.</p><h2>The Ecosystem Approach</h2><p>At LΛM, we advocate for the ecosystem approach. Instead of building isolated applications, we architect platforms that inherently communicate. By establishing a single identity layer (LΛM ID) and standardizing API structures across our entire registry, we ensure that adding a new module—whether for procurement, HR, or specialized CRM—feels like unlocking a native capability rather than bolting on a third-party tool.</p><h2>Conclusion</h2><p>True digital transformation is not achieved by migrating legacy monoliths to the cloud. It is achieved by adopting a composable, interoperable architecture that scales precisely alongside the enterprise.</p>'),
('security-in-diplomatic-systems', 'Zero-Trust Architecture for Diplomatic Systems', 'Guides', '2026-07-15', 'LΛM Security', 'An overview of how zero-trust protocols and data sovereignty principles protect institutional infrastructure.', '<h2>The Institutional Imperative</h2><p>Diplomatic missions and government entities operate under unique threat vectors. Standard enterprise security is often insufficient when dealing with state-level actors and highly sensitive consular data.</p><h2>Implementing Zero-Trust</h2><p>Zero-trust architecture operates on a simple principle: never trust, always verify. Within platforms like MAAMS, this means every single data request is authenticated and authorized against strict role-based access controls, regardless of where the request originates on the network.</p><h2>Data Sovereignty</h2><p>Beyond encryption, physical data location matters. True institutional security requires deployment architectures that respect national borders and data localization laws, ensuring that sovereign data remains sovereign.</p>'),
('the-evolution-of-erp', 'The Evolution of ERP: From Ledger to Nervous System', 'ERP & Automation', '2026-06-20', 'LΛM Strategy', 'How modern ERP platforms act as the central nervous system for complex corporate entities.', '<h2>Beyond Accounting</h2><p>Enterprise Resource Planning originally focused heavily on manufacturing and finance. Today, platforms like ATOM serve a much broader purpose. They are the central nervous system of the organization, routing data from front-line point-of-sale systems directly to the executive dashboard.</p><h2>Predictive Automation</h2><p>The next frontier is predictive automation. By analyzing historical data across supply chains, modern ERPs can automatically trigger procurement protocols before a stockout occurs, transforming supply chain management from reactive to proactive.</p>')
ON CONFLICT (slug) DO NOTHING;

-- SEED DATA - SOLUTIONS
INSERT INTO public.cms_collections (slug, type, title, data) VALUES
('business-management', 'solution', 'Business Management', '{"description": "Holistic oversight and administration of enterprise operations, from human resources to strategic planning.", "commonNeeds": ["Consolidating fragmented data from multiple departments into a single source of truth.", "Automating routine administrative tasks to focus on strategic growth.", "Ensuring compliance and unified reporting across international subsidiaries."], "relatedProducts": ["atom"]}'),
('finance-accounting', 'solution', 'Finance & Accounting', '{"description": "Advanced financial workflows, ledger management, and institutional portfolio analytics.", "commonNeeds": ["Real-time reconciliation of complex, multi-currency general ledgers.", "Aggregating distributed asset data for accurate wealth and portfolio management.", "Automating tax, compliance, and regulatory reporting."], "relatedProducts": ["atom", "amal"]}'),
('crm-sales', 'solution', 'CRM & Sales', '{"description": "End-to-end customer relationship and sales pipeline management for B2B and B2C environments.", "commonNeeds": ["Tracking the complete customer journey from lead acquisition to final sale.", "Providing sales teams with offline-capable tools for field and retail environments.", "Integrating front-of-house sales data directly with back-office inventory."], "relatedProducts": ["atom", "pointo"]}'),
('inventory-operations', 'solution', 'Inventory & Operations', '{"description": "Robust supply chain, procurement, and real-time stock synchronization.", "commonNeeds": ["Preventing stockouts and overstock scenarios via predictive analytics.", "Synchronizing multi-warehouse inventory with retail point-of-sale systems.", "Streamlining vendor relationships and automated procurement cycles."], "relatedProducts": ["atom", "pointo"]}'),
('workflow-automation', 'solution', 'Workflow Automation', '{"description": "Intelligent systems that remove friction from repetitive processes and accelerate decision making.", "commonNeeds": ["Replacing manual data entry with system-to-system integrations.", "Standardizing digital marketing and SEO audits at scale.", "Enforcing strict approval hierarchies without slowing down operations."], "relatedProducts": ["atom", "aimhighserp"]}'),
('education-management', 'solution', 'Education Management', '{"description": "Comprehensive administration systems for academic institutions, covering staff, resources, and campus operations.", "commonNeeds": ["Managing complex timetables, faculty assignments, and campus resources.", "Handling tuition billing, grants, and institutional finance.", "Ensuring secure, role-based access to academic and administrative records."], "relatedProducts": ["atom"]}'),
('institutional-administration', 'solution', 'Institutional Administration', '{"description": "Highly secure governance and operational platforms tailored for complex, restricted, or government-level entities.", "commonNeeds": ["Maintaining absolute data sovereignty and encrypted communications.", "Managing complex protocol, event, and visitor clearances.", "Administering citizen services, visas, and consular documentation."], "relatedProducts": ["maams", "amal"]}'),
('digital-transformation', 'solution', 'Digital Transformation', '{"description": "Custom business systems and enterprise-wide architectural upgrades to modernize legacy infrastructure.", "commonNeeds": ["Migrating off decades-old, unsupported on-premise software.", "Unifying disparate acquisitions under a single corporate technology standard.", "Preparing infrastructure for next-generation mobile and AI capabilities."], "relatedProducts": ["atom", "aimhighserp", "pointo"]}')
ON CONFLICT (slug) DO NOTHING;

-- SEED DATA - INDUSTRIES
INSERT INTO public.cms_collections (slug, type, title, data) VALUES
('businesses-smes', 'industry', 'Businesses & SMEs', '{"description": "Scalable technology solutions that allow growing businesses to compete at an enterprise level.", "commonNeeds": ["Access to enterprise-grade tools without prohibitive initial capital expenditure.", "Systems that can scale effortlessly as the business expands into new markets.", "Unified platforms that reduce the need to hire specialized IT personnel for maintenance."], "relatedProducts": ["atom", "pointo", "aimhighserp"]}'),
('education', 'industry', 'Education', '{"description": "Administrative and operational foundations for schools, universities, and training institutes.", "commonNeeds": ["Managing complex faculty schedules, student records, and campus facilities.", "Ensuring strict data privacy for student information.", "Handling grants, tuition billing, and institutional finance efficiently."], "relatedProducts": ["atom"]}'),
('government-institutions', 'industry', 'Government & Institutions', '{"description": "Highly secure, compliant systems for public sector operations and civic administration.", "commonNeeds": ["Uncompromising data sovereignty and compliance with strict national regulations.", "Auditable, transparent workflows for procurement and public spending.", "Citizen-facing portals for service delivery and record management."], "relatedProducts": ["maams", "atom"]}'),
('diplomatic-missions', 'industry', 'Diplomatic Missions', '{"description": "Specialized platforms designed for the unique protocols and security requirements of embassies and consulates.", "commonNeeds": ["Encrypted, isolated communication channels separated from public infrastructure.", "Efficient processing of visas, passports, and citizen emergency services.", "Event and protocol management for high-level diplomatic visits."], "relatedProducts": ["maams"]}'),
('logistics-distribution', 'industry', 'Logistics & Distribution', '{"description": "End-to-end supply chain visibility and inventory control for complex distribution networks.", "commonNeeds": ["Real-time tracking of inventory across multiple warehouses and transit routes.", "Automated procurement triggers based on predictive demand analytics.", "Integration with fleet management and third-party logistics providers."], "relatedProducts": ["atom"]}'),
('retail', 'industry', 'Retail', '{"description": "Omnichannel commerce and point-of-sale systems that bridge the gap between digital and physical storefronts.", "commonNeeds": ["Reliable offline-first point-of-sale systems that never interrupt transactions.", "Real-time synchronization between in-store inventory and e-commerce platforms.", "Unified customer loyalty profiles across all purchasing channels."], "relatedProducts": ["pointo", "atom"]}'),
('construction', 'industry', 'Construction', '{"description": "Project management, resource allocation, and financial tracking for large-scale development projects.", "commonNeeds": ["Tracking material costs, labor hours, and equipment depreciation per project.", "Managing complex subcontractor relationships and compliance documentation.", "Mobile-friendly tools for on-site supervisors to log progress and issues."], "relatedProducts": ["atom"]}'),
('professional-services', 'industry', 'Professional Services', '{"description": "Time tracking, billing, and client management for agencies, consultancies, and specialized firms.", "commonNeeds": ["Accurate tracking of billable hours and expenses against client retainers.", "Advanced digital marketing tools to maintain thought leadership and lead generation.", "Secure client portals for document sharing and project updates."], "relatedProducts": ["atom", "aimhighserp"]}')
ON CONFLICT (slug) DO NOTHING;

-- Note: Supabase Storage bucket 'media' must be created via Dashboard or Storage API since standard PostgreSQL cannot directly create buckets.
-- We will handle that through standard buckets if required, or advise the user.
