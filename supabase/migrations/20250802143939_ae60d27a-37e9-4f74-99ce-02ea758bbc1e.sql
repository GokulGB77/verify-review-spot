-- Add video review URL field to reviews table
ALTER TABLE public.reviews 
ADD COLUMN video_review_url text;