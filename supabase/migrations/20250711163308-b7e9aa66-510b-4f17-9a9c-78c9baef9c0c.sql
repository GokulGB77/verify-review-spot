-- Add proof_remark field to reviews table
ALTER TABLE public.reviews 
ADD COLUMN proof_remark TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.reviews.proof_remark IS 'User-provided remark about the uploaded proof file (e.g., "Experience Certificate")';