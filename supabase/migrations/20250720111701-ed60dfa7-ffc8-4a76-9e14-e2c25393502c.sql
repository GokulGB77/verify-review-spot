-- Add RLS policy to allow super admins to update reviews for verification
CREATE POLICY "Super admins can update reviews for verification" 
ON public.reviews 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM get_user_roles() 
    WHERE role = 'super_admin'::app_role
  )
);