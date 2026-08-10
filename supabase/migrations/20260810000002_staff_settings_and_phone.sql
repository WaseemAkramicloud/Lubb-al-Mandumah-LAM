-- Add phone column to staff_profiles
ALTER TABLE public.staff_profiles 
ADD COLUMN IF NOT EXISTS phone VARCHAR(50);

-- Create staff_settings table
CREATE TABLE IF NOT EXISTS public.staff_settings (
  user_id UUID PRIMARY KEY REFERENCES public.staff_profiles(id) ON DELETE CASCADE,
  dashboard_layout JSONB NOT NULL DEFAULT '["leads", "users", "audit", "content"]'::jsonb,
  theme VARCHAR(20) NOT NULL DEFAULT 'dark',
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for staff_settings
ALTER TABLE public.staff_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own settings
CREATE POLICY "Users can view own settings" 
ON public.staff_settings 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can update their own settings
CREATE POLICY "Users can update own settings" 
ON public.staff_settings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy: Users can insert their own settings (if not created via trigger)
CREATE POLICY "Users can insert own settings" 
ON public.staff_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE TRIGGER update_staff_settings_updated_at
BEFORE UPDATE ON public.staff_settings
FOR EACH ROW
EXECUTE FUNCTION update_staff_permissions_updated_at();

-- Safe Migration Logic: Ensure every existing user gets a default settings row
INSERT INTO public.staff_settings (user_id)
SELECT id FROM public.staff_profiles
ON CONFLICT (user_id) DO NOTHING;
