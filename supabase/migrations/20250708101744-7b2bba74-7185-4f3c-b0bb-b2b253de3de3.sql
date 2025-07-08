
-- Add tokens field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN tokens INTEGER DEFAULT 0 NOT NULL;

-- Create function to award tokens for verified reviews
CREATE OR REPLACE FUNCTION public.award_tokens_for_verified_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if review is being verified (is_verified changed from false/null to true)
  -- and has proof submitted
  IF NEW.is_verified = true 
     AND (OLD.is_verified IS NULL OR OLD.is_verified = false)
     AND NEW.is_proof_submitted = true THEN
    
    -- Award 1 token for verified proof-backed review
    UPDATE public.profiles 
    SET tokens = tokens + 1,
        updated_at = now()
    WHERE id = NEW.user_id;
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically award tokens when review is verified
CREATE TRIGGER award_tokens_on_review_verification
  AFTER UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.award_tokens_for_verified_review();

-- Add index for better performance on tokens field
CREATE INDEX idx_profiles_tokens ON public.profiles(tokens DESC);
