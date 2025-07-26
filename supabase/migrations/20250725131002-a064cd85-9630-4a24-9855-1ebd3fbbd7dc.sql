-- Reactivate all entities at once
UPDATE public.entities 
SET 
  status = 'active',
  updated_at = now()
WHERE status = 'inactive';