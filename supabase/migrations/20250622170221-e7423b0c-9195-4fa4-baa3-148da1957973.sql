
-- Add new columns to profiles table for main verification badge
ALTER TABLE public.profiles 
ADD COLUMN main_badge TEXT DEFAULT 'Unverified User',
ADD COLUMN rejection_reason TEXT DEFAULT NULL;

-- Add new column to reviews table for review-specific badges  
ALTER TABLE public.reviews 
ADD COLUMN review_specific_badge TEXT DEFAULT NULL;

-- Update existing profiles based on current verification status
UPDATE public.profiles 
SET main_badge = CASE 
  WHEN is_verified = true THEN 'Verified User'
  WHEN is_verified = false AND pan_number IS NOT NULL THEN 'Unverified User'
  ELSE 'Unverified User'
END;

-- Create index for efficient querying
CREATE INDEX idx_profiles_main_badge ON public.profiles(main_badge);
CREATE INDEX idx_reviews_specific_badge ON public.reviews(review_specific_badge);
