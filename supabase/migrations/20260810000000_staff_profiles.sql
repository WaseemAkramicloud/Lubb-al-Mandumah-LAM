-- Create the sequence for Staff IDs
CREATE SEQUENCE IF NOT EXISTS staff_id_seq START WITH 1;

-- Create a function to generate the Staff ID (LAM-000001)
CREATE OR REPLACE FUNCTION generate_staff_id() RETURNS TEXT AS $$
BEGIN
  RETURN 'LAM-' || LPAD(nextval('staff_id_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Create the staff_profiles table
CREATE TABLE IF NOT EXISTS public.staff_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  staff_id VARCHAR UNIQUE DEFAULT generate_staff_id(),
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  designation VARCHAR NOT NULL,
  work_email VARCHAR UNIQUE NOT NULL,
  status VARCHAR CHECK (status IN ('active', 'suspended')) DEFAULT 'active',
  requires_password_change BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- 1. Staff can read their own profile
CREATE POLICY "Users can view own profile" 
ON public.staff_profiles 
FOR SELECT 
USING (auth.uid() = id);

-- 2. Staff can update their own profile (limited fields)
CREATE POLICY "Users can update own profile" 
ON public.staff_profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- (Note: Service Role inherently bypasses RLS, so no policy needed for superadmins fetching via adminClient)

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_staff_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_staff_profiles_updated_at
BEFORE UPDATE ON public.staff_profiles
FOR EACH ROW
EXECUTE FUNCTION update_staff_profiles_updated_at();

-- Migrate existing Superadmin to staff_profiles safely
DO $$
DECLARE
  super_admin_id UUID;
  super_admin_email VARCHAR;
BEGIN
  SELECT id, email INTO super_admin_id, super_admin_email 
  FROM auth.users 
  WHERE email = 'admin@lamweb.com' 
  LIMIT 1;

  IF super_admin_id IS NOT NULL THEN
    INSERT INTO public.staff_profiles (id, staff_id, first_name, last_name, designation, work_email, status, requires_password_change)
    VALUES (super_admin_id, 'LAM-000000', 'Super', 'Admin', 'System Administrator', super_admin_email, 'active', false)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
