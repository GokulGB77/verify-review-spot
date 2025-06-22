
-- Add columns to support review updates/follow-ups
ALTER TABLE public.reviews 
ADD COLUMN parent_review_id uuid REFERENCES public.reviews(id),
ADD COLUMN is_update boolean DEFAULT false,
ADD COLUMN update_number integer DEFAULT 0;

-- Create an index for better performance when querying review chains
CREATE INDEX idx_reviews_parent_review_id ON public.reviews(parent_review_id);

-- Create an index for querying original reviews by business and user
CREATE INDEX idx_reviews_original ON public.reviews(business_id, user_id) WHERE parent_review_id IS NULL;
