-- Restrict public access to sensitive profiles data and provide safe public interfaces

-- 1) Remove overly permissive public SELECT policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- 2) Add safe SELECT policies
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Super admins can view all profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.get_user_roles() r
    WHERE r.role = 'super_admin'
  )
);

-- 3) Enforce pseudonym uniqueness at the database level
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_pseudonym_unique
ON public.profiles (pseudonym)
WHERE pseudonym IS NOT NULL;

-- 4) Provide a SECURITY DEFINER function to fetch only public-safe profile fields
CREATE OR REPLACE FUNCTION public.get_public_profiles(p_user_ids uuid[])
RETURNS TABLE (
  id uuid,
  pseudonym text,
  full_name text,
  display_name_preference text,
  main_badge text,
  is_verified boolean,
  avatar_url text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
  SELECT 
    p.id,
    p.pseudonym,
    CASE 
      WHEN p.display_name_preference = 'full_name' THEN p.full_name
      ELSE NULL
    END AS full_name,
    p.display_name_preference,
    p.main_badge,
    p.is_verified,
    p.avatar_url
  FROM public.profiles p
  WHERE p.id = ANY (p_user_ids);
$$;

-- 5) Function to return aggregate count of verified users without exposing rows
CREATE OR REPLACE FUNCTION public.count_verified_profiles()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
  SELECT COUNT(*)::int FROM public.profiles WHERE is_verified = true;
$$;