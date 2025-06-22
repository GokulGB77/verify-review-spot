
-- Remove the unique constraint that prevents users from having multiple reviews for the same business
ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_user_id_business_id_key;

-- Add a unique constraint only for original reviews (where parent_review_id IS NULL)
-- This ensures users can only have one original review per business, but multiple updates
CREATE UNIQUE INDEX reviews_user_business_original_unique 
ON public.reviews(user_id, business_id) 
WHERE parent_review_id IS NULL;
