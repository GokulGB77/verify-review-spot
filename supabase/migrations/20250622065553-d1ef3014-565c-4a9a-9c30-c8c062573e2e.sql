
-- Create the verification-docs storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('verification-docs', 'verification-docs', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to upload verification docs" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view verification docs" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update verification docs" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete verification docs" ON storage.objects;

-- Create new policies for the verification-docs bucket
CREATE POLICY "Users can upload verification docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'verification-docs');

CREATE POLICY "Users can view verification docs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'verification-docs');

CREATE POLICY "Users can update verification docs"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'verification-docs');

CREATE POLICY "Users can delete verification docs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'verification-docs');

-- Allow public access to verification docs for viewing
CREATE POLICY "Public can view verification docs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'verification-docs');
