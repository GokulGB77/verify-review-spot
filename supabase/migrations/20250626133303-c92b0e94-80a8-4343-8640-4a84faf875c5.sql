
-- Remove the old trigger and function that references the non-existent businesses table
DROP TRIGGER IF EXISTS update_business_rating_on_insert ON public.reviews;
DROP TRIGGER IF EXISTS update_business_rating_on_update ON public.reviews;
DROP TRIGGER IF EXISTS update_business_rating_on_delete ON public.reviews;
DROP FUNCTION IF EXISTS public.update_business_rating();

-- Now we can safely remove all reviews and clean up entities
DELETE FROM public.reviews;

-- Remove all entities except the TechStart Solutions dummy entity
DELETE FROM public.entities 
WHERE name != 'TechStart Solutions';

-- Reset the review count and average rating for the remaining entity
UPDATE public.entities 
SET review_count = 0, average_rating = 0.0 
WHERE name = 'TechStart Solutions';
