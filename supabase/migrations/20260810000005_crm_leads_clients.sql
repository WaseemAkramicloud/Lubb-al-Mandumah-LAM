-- Create CRM Leads Table
CREATE TABLE IF NOT EXISTS public.crm_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_type VARCHAR(50) NOT NULL, -- 'contact' or 'demo'
  source_id UUID NOT NULL, -- references original request
  contact_person VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  country VARCHAR(100),
  interested_product VARCHAR(255),
  message TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'New', -- New, Contacted, Qualified, Proposal, Converted, Closed/Lost
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  internal_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create CRM Clients Table
CREATE TABLE IF NOT EXISTS public.crm_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.crm_leads(id) ON DELETE SET NULL,
  organization_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  related_products TEXT[] DEFAULT '{}',
  relationship_owner UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create CRM Audit Logs Table
CREATE TABLE IF NOT EXISTS public.crm_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.crm_leads(id) ON DELETE CASCADE,
  action_type VARCHAR(100) NOT NULL, -- e.g. 'status_change', 'assigned', 'note_added', 'converted'
  action_details JSONB DEFAULT '{}'::jsonb,
  performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Backfill from contact_requests
INSERT INTO public.crm_leads (
  source_type, source_id, contact_person, email, interested_product, message, status, created_at, updated_at
)
SELECT 
  'contact', id, name, email, enquiry_type, message, 'New', created_at, created_at
FROM public.contact_requests
ON CONFLICT DO NOTHING;

-- Backfill from demo_requests
INSERT INTO public.crm_leads (
  source_type, source_id, contact_person, company, email, phone, country, interested_product, message, status, created_at, updated_at
)
SELECT 
  'demo', id, name, company, email, phone, country, product_of_interest, requirements, 'New', created_at, created_at
FROM public.demo_requests
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies for crm_leads
CREATE POLICY "Allow service_role full access to crm_leads"
ON public.crm_leads FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policies for crm_clients
CREATE POLICY "Allow service_role full access to crm_clients"
ON public.crm_clients FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policies for crm_audit_logs
CREATE POLICY "Allow service_role full access to crm_audit_logs"
ON public.crm_audit_logs FOR ALL TO service_role USING (true) WITH CHECK (true);
