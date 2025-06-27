
-- Ensure the reviews table has proper timestamp tracking
-- The created_at field should already exist, but let's make sure it's properly set up
-- and add any missing indexes for performance

-- Add an index on created_at for efficient queries when checking edit windows
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at);

-- Add an index on user_id and created_at combination for efficient user-specific queries
CREATE INDEX IF NOT EXISTS idx_reviews_user_created ON public.reviews(user_id, created_at);

-- Ensure the created_at field has a proper default and is not nullable
-- (This should already be the case, but let's make it explicit)
ALTER TABLE public.reviews 
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN created_at SET NOT NULL;

-- Add a function to check if a review is within the edit window
CREATE OR REPLACE FUNCTION public.is_review_editable(review_created_at timestamp with time zone)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT (EXTRACT(epoch FROM (now() - review_created_at)) < 60);
$$;
