-- Remove old badge system columns that are no longer needed
ALTER TABLE public.reviews 
DROP COLUMN IF EXISTS review_specific_badge,
DROP COLUMN IF EXISTS user_badge;

-- Update any existing reviews to ensure proper defaults
UPDATE public.reviews 
SET is_proof_submitted = COALESCE(is_proof_submitted, false),
    is_verified = COALESCE(is_verified, false)
WHERE is_proof_submitted IS NULL OR is_verified IS NULL;