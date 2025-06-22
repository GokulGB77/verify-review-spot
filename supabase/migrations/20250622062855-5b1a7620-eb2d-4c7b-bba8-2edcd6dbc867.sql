
-- Add verification fields to reviews table
ALTER TABLE public.reviews 
ADD COLUMN proof_verified BOOLEAN DEFAULT NULL,
ADD COLUMN proof_verified_by UUID REFERENCES auth.users(id),
ADD COLUMN proof_verified_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN proof_rejection_reason TEXT DEFAULT NULL;

-- Add index for efficient querying of unverified proofs
CREATE INDEX idx_reviews_proof_verification ON public.reviews(proof_provided, proof_verified) WHERE proof_provided = true;
