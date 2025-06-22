
-- Ensure the verification-docs storage bucket exists and is properly configured
INSERT INTO storage.buckets (id, name, public)
VALUES ('verification-docs', 'verification-docs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can upload verification docs" ON storage.objects;
DROP POLICY IF EXISTS "Users can view verification docs" ON storage.objects;
DROP POLICY IF EXISTS "Users can update verification docs" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete verification docs" ON storage.objects;
DROP POLICY IF EXISTS "Public can view verification docs" ON storage.objects;

-- Create comprehensive policies for the verification-docs bucket
CREATE POLICY "Allow authenticated users to upload verification docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'verification-docs');

CREATE POLICY "Allow authenticated users to view verification docs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'verification-docs');

CREATE POLICY "Allow authenticated users to update verification docs"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'verification-docs');

CREATE POLICY "Allow authenticated users to delete verification docs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'verification-docs');

-- Allow public access for viewing verification docs (needed for admin verification)
CREATE POLICY "Allow public to view verification docs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'verification-docs');
