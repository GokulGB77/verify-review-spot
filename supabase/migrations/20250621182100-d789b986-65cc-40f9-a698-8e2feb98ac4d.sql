
-- Add new PAN-related columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN pan_number TEXT,
ADD COLUMN mobile TEXT,
ADD COLUMN full_name_pan TEXT,
ADD COLUMN pan_image_url TEXT,
ADD COLUMN phone TEXT;

-- Create unique constraint on pan_number to prevent duplicates
ALTER TABLE public.profiles 
ADD CONSTRAINT unique_pan_number UNIQUE (pan_number);

-- Update existing constraint name if it exists for aadhaar
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'unique_aadhaar_number' 
               AND table_name = 'profiles') THEN
        ALTER TABLE public.profiles DROP CONSTRAINT unique_aadhaar_number;
    END IF;
END $$;

-- Add storage bucket for verification documents if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('verification-docs', 'verification-docs', false)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the verification-docs bucket
CREATE POLICY "Users can upload their own verification docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'verification-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own verification docs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'verification-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own verification docs"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'verification-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own verification docs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'verification-docs' AND auth.uid()::text = (storage.foldername(name))[1]);
