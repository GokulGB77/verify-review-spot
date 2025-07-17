-- Get the current super admin user and assign them as entity admin for Brototype
INSERT INTO public.user_roles (user_id, role, entity_id, assigned_by, assigned_at)
SELECT 
    ur.user_id,
    'entity_admin'::app_role,
    '294663d0-35e5-4504-8ec5-4719e2ef5808'::uuid,
    ur.user_id,
    now()
FROM public.user_roles ur 
WHERE ur.role = 'super_admin'::app_role 
AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur2 
    WHERE ur2.user_id = ur.user_id 
    AND ur2.role = 'entity_admin'::app_role 
    AND ur2.entity_id = '294663d0-35e5-4504-8ec5-4719e2ef5808'::uuid
)
LIMIT 1;