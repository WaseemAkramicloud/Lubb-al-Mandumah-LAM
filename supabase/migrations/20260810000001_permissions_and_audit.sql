-- Create staff_permissions table
CREATE TABLE IF NOT EXISTS public.staff_permissions (
  user_id UUID PRIMARY KEY REFERENCES public.staff_profiles(id) ON DELETE CASCADE,
  permissions JSONB NOT NULL DEFAULT '{}',
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for staff_permissions
ALTER TABLE public.staff_permissions ENABLE ROW LEVEL SECURITY;

-- 1. Staff can read their own permissions
CREATE POLICY "Users can view own permissions" 
ON public.staff_permissions 
FOR SELECT 
USING (auth.uid() = user_id);

-- (Note: Service Role inherently bypasses RLS for admin operations)

-- Function to auto-update updated_at for permissions
CREATE OR REPLACE FUNCTION update_staff_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_staff_permissions_updated_at
BEFORE UPDATE ON public.staff_permissions
FOR EACH ROW
EXECUTE FUNCTION update_staff_permissions_updated_at();

-- Create audit_logs table (preparation for Audit Module)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR NOT NULL,
  entity_id UUID NOT NULL,
  action VARCHAR NOT NULL,
  changes JSONB NOT NULL DEFAULT '{}',
  actor_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- No policies for public or standard staff for audit logs right now.
-- Only Service Role can insert/read (which handles superadmin operations).

-- Migration Logic: Safely insert a full-access master record for the existing superadmin
DO $$
DECLARE
  super_admin_id UUID;
BEGIN
  SELECT id INTO super_admin_id 
  FROM auth.users 
  WHERE email = 'admin@lamweb.com' 
  LIMIT 1;

  IF super_admin_id IS NOT NULL THEN
    INSERT INTO public.staff_permissions (user_id, permissions)
    VALUES (
      super_admin_id, 
      '{
        "leads_clients": ["view", "create", "edit", "delete"],
        "site_management": ["view", "create", "edit", "publish"],
        "products": ["view", "create", "edit", "delete"],
        "insights": ["view", "create", "edit", "delete", "publish"],
        "pricing_plans": ["view", "edit", "manage_pricing"],
        "careers": ["view", "create", "edit", "delete"],
        "media_library": ["view", "create", "delete"],
        "user_management": ["view", "create", "edit", "delete"],
        "access_permissions": ["view", "edit"],
        "audit_log": ["view"],
        "system_settings": ["view", "edit"]
      }'::jsonb
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
END $$;
