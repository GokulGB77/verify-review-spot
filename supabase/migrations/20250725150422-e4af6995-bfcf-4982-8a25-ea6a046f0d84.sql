-- Allow super admins to delete entities
CREATE POLICY "Super admins can delete entities" 
ON public.entities 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM get_user_roles() 
    WHERE role = 'super_admin'::app_role
  )
);