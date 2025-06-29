
-- Create the review-proofs storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('review-proofs', 'review-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the review-proofs bucket
CREATE POLICY "Allow authenticated users to upload review proofs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'review-proofs');

CREATE POLICY "Allow authenticated users to view review proofs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'review-proofs');

CREATE POLICY "Allow authenticated users to update review proofs"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'review-proofs');

CREATE POLICY "Allow authenticated users to delete review proofs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'review-proofs');

-- Allow public access for viewing review proofs (needed for admin verification)
CREATE POLICY "Allow public to view review proofs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'review-proofs');
