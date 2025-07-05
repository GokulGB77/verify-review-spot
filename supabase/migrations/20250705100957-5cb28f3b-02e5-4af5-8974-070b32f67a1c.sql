-- Add new fields to reviews table for simplified proof system
ALTER TABLE public.reviews 
ADD COLUMN custom_verification_tag TEXT,
ADD COLUMN is_proof_submitted BOOLEAN DEFAULT FALSE,
ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;

-- Update existing reviews to set is_proof_submitted based on existing proof_url
UPDATE public.reviews 
SET is_proof_submitted = (proof_url IS NOT NULL AND proof_url != '');

-- Add index for better performance on verification queries
CREATE INDEX idx_reviews_verification ON public.reviews(is_verified, is_proof_submitted);

-- Add comments for documentation
COMMENT ON COLUMN public.reviews.custom_verification_tag IS 'Admin-assigned custom verification tag/badge';
COMMENT ON COLUMN public.reviews.is_proof_submitted IS 'Whether user submitted proof with their review';
COMMENT ON COLUMN public.reviews.is_verified IS 'Whether admin has verified and tagged the review';