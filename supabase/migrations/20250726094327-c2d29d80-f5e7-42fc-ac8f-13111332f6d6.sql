-- First, get the IDs of users to keep
DO $$
DECLARE
  users_to_keep UUID[] := ARRAY[
    (SELECT id FROM auth.users WHERE email = 'gokulgb2020@gmail.com'),
    (SELECT id FROM auth.users WHERE email = 'akhiljagadish124@gmail.com'),
    (SELECT id FROM auth.users WHERE email = 'nidhinramesh4@gmail.com')
  ];
  users_to_delete UUID[];
BEGIN
  -- Get list of users to delete
  SELECT ARRAY(
    SELECT id FROM auth.users 
    WHERE email NOT IN ('gokulgb2020@gmail.com', 'akhiljagadish124@gmail.com', 'nidhinramesh4@gmail.com')
  ) INTO users_to_delete;
  
  -- Delete from public tables first (to avoid foreign key issues)
  DELETE FROM public.notifications WHERE user_id = ANY(users_to_delete);
  DELETE FROM public.review_votes WHERE user_id = ANY(users_to_delete);
  DELETE FROM public.reviews WHERE user_id = ANY(users_to_delete);
  DELETE FROM public.user_business_connections WHERE user_id = ANY(users_to_delete);
  DELETE FROM public.user_roles WHERE user_id = ANY(users_to_delete);
  DELETE FROM public.verification_history WHERE user_id = ANY(users_to_delete);
  DELETE FROM public.entity_addition_requests WHERE requested_by = ANY(users_to_delete);
  DELETE FROM public.entity_registrations WHERE submitted_by = ANY(users_to_delete);
  DELETE FROM public.problem_reports WHERE user_id = ANY(users_to_delete);
  DELETE FROM public.profiles WHERE id = ANY(users_to_delete);
  
  -- Finally delete from auth.users
  DELETE FROM auth.users WHERE id = ANY(users_to_delete);
  
  -- Log the result
  RAISE NOTICE 'Deleted % users, kept %', array_length(users_to_delete, 1), array_length(users_to_keep, 1);
END $$;