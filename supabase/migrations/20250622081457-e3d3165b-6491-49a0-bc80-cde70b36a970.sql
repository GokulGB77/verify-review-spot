
-- Add display_name_preference column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN display_name_preference text DEFAULT 'pseudonym';

-- Add a check constraint to ensure only valid values
ALTER TABLE public.profiles 
ADD CONSTRAINT check_display_name_preference 
CHECK (display_name_preference IN ('pseudonym', 'full_name'));
