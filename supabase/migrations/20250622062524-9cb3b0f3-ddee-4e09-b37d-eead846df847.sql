
-- Add proof_url column to reviews table to store uploaded proof documents
ALTER TABLE public.reviews 
ADD COLUMN proof_url TEXT;
