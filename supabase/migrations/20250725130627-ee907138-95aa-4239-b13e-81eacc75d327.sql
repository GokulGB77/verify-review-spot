-- Fix the security warning by setting the search path for the function
CREATE OR REPLACE FUNCTION public.activate_entity_on_first_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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