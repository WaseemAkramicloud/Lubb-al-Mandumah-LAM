-- Create Contact Requests Table
CREATE TABLE IF NOT EXISTS public.contact_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  enquiry_type text NOT NULL,
  message text NOT NULL,
  consent boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'new'
);

-- Create Demo Requests Table
CREATE TABLE IF NOT EXISTS public.demo_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  name text NOT NULL,
  company text NOT NULL,
  email text NOT NULL,
  phone text,
  country text NOT NULL,
  company_size text,
  product_of_interest text NOT NULL,
  requirements text NOT NULL,
  consent boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'new'
);

-- Enable Row Level Security
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_requests ENABLE ROW LEVEL SECURITY;

-- Create Policies for contact_requests
-- Allow anonymous users to insert new requests
CREATE POLICY "Allow anonymous insert for contact_requests"
  ON public.contact_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Restrict select/update/delete to service role only (or authenticated admins if we had auth)
CREATE POLICY "Allow service_role full access to contact_requests"
  ON public.contact_requests
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create Policies for demo_requests
-- Allow anonymous users to insert new requests
CREATE POLICY "Allow anonymous insert for demo_requests"
  ON public.demo_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Restrict select/update/delete to service role only
CREATE POLICY "Allow service_role full access to demo_requests"
  ON public.demo_requests
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
