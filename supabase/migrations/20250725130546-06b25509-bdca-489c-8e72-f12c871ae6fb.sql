-- Update all existing entities to be unverified and inactive
UPDATE public.entities 
SET 
  is_verified = false,
  status = 'inactive',
  updated_at = now();

-- Create function to activate entity when it gets its first review
CREATE OR REPLACE FUNCTION public.activate_entity_on_first_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if this is a new review (INSERT) and the entity is currently inactive
  IF TG_OP = 'INSERT' THEN
    UPDATE public.entities 
    SET 
      status = 'active',
      updated_at = now()
    WHERE entity_id = NEW.business_id 
    AND status = 'inactive';
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger to activate entity when first review is added
DROP TRIGGER IF EXISTS activate_entity_on_review ON public.reviews;
CREATE TRIGGER activate_entity_on_review
  AFTER INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.activate_entity_on_first_review();