
-- Add email field to profiles table and aadhaar verification fields
ALTER TABLE public.profiles 
ADD COLUMN email TEXT,
ADD COLUMN aadhaar_number TEXT,
ADD COLUMN aadhaar_mobile TEXT,
ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;

-- Create unique constraint on aadhaar_number to prevent duplicates
ALTER TABLE public.profiles 
ADD CONSTRAINT unique_aadhaar_number UNIQUE (aadhaar_number);

-- Update the handle_new_user function to also store email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, email)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'username',
    new.email
  );
  RETURN new;
END;
$$;

-- Add RLS policies for profile updates
CREATE POLICY "Users can update their own profile data"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Insert roles for Gokul G Bhattathiri (you'll need to replace 'user-id-here' with the actual user ID after they sign up)
-- First, they need to sign up, then you can run:
-- INSERT INTO public.user_roles (user_id, role) 
-- VALUES ('actual-user-id-here', 'super_admin');
-- INSERT INTO public.user_roles (user_id, role, entity_id) 
-- VALUES ('actual-user-id-here', 'entity_admin', 'some-business-id-here');
