
-- Remove the username column from the profiles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS username;

-- Remove the unique constraint on username if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'unique_username' 
               AND table_name = 'profiles' 
               AND table_schema = 'public') THEN
        ALTER TABLE public.profiles DROP CONSTRAINT unique_username;
    END IF;
END $$;
