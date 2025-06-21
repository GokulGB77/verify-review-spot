
-- Add pseudonym field to profiles table with unique constraint
ALTER TABLE public.profiles 
ADD COLUMN pseudonym TEXT UNIQUE;

-- Add constraint to ensure pseudonym is not empty when set
ALTER TABLE public.profiles 
ADD CONSTRAINT check_pseudonym_not_empty 
CHECK (pseudonym IS NULL OR LENGTH(TRIM(pseudonym)) > 0);

-- Create index for better performance on pseudonym lookups
CREATE INDEX idx_profiles_pseudonym ON public.profiles(pseudonym) WHERE pseudonym IS NOT NULL;

-- Add a flag to track if pseudonym has been set (to prevent editing after first save)
ALTER TABLE public.profiles 
ADD COLUMN pseudonym_set BOOLEAN DEFAULT FALSE;
