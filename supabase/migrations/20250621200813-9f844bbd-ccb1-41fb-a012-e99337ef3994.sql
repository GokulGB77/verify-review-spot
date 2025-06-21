
-- First, let's drop the existing policies that might be causing issues
DROP POLICY IF EXISTS "Users can upload their own verification docs" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own verification docs" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own verification docs" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own verification docs" ON storage.objects;

-- Create new, more permissive policies for the verification-docs bucket
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
