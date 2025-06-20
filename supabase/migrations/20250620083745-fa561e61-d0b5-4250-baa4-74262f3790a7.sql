
-- Create an enum for different roles
CREATE TYPE public.app_role AS ENUM ('super_admin', 'entity_admin', 'user');

-- Create a user_roles table to store role assignments
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  entity_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  UNIQUE(user_id, role, entity_id)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create a security definer function to check user roles
CREATE OR REPLACE FUNCTION public.get_user_roles(check_user_id UUID DEFAULT auth.uid())
RETURNS TABLE(role app_role, entity_id UUID)
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT ur.role, ur.entity_id
  FROM public.user_roles ur
  WHERE ur.user_id = check_user_id;
$$;

-- Create a helper function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(check_role app_role, check_entity_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.get_user_roles()
    WHERE role = check_role 
    AND (check_entity_id IS NULL OR entity_id = check_entity_id OR entity_id IS NULL)
  );
$$;

-- RLS Policies
CREATE POLICY "Users can see their own roles"
  ON public.user_roles
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Super admins can manage all roles"
  ON public.user_roles
  FOR ALL
  USING (public.has_role('super_admin'));

CREATE POLICY "Entity admins can see roles for their entities"
  ON public.user_roles
  FOR SELECT
  USING (
    entity_id IN (
      SELECT entity_id FROM public.get_user_roles() WHERE role = 'entity_admin'
    )
  );

-- Insert a default super admin role (replace with your actual user ID)
-- You'll need to run this after you know your user ID from auth.users
-- INSERT INTO public.user_roles (user_id, role) 
-- VALUES ('your-user-id-here', 'super_admin');
