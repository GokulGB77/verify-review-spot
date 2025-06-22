
-- Remove the proof_provided column from reviews table as it's redundant
ALTER TABLE public.reviews DROP COLUMN IF EXISTS proof_provided;
