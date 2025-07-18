-- Manually create the missing profile for the Google user
INSERT INTO public.profiles (id, full_name, email) 
VALUES ('bd59b0c8-0d44-4a04-a01b-8432174f8c2a', 'Gokul G Bhattathiri', 'gokulgb2020@gmail.com') 
ON CONFLICT (id) DO UPDATE SET 
  full_name = EXCLUDED.full_name, 
  email = EXCLUDED.email;