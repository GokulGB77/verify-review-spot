
-- First, clean up any existing pseudonyms that don't match the format
-- Replace spaces and invalid characters with underscores
UPDATE public.profiles 
SET pseudonym = REGEXP_REPLACE(
  REGEXP_REPLACE(pseudonym, '[^a-zA-Z0-9_-]', '_', 'g'),
  '_+', '_', 'g'
)
WHERE pseudonym IS NOT NULL 
AND pseudonym !~ '^[a-zA-Z0-9_-]+$';

-- Remove any pseudonyms that are now empty or just underscores
UPDATE public.profiles 
SET pseudonym = NULL 
WHERE pseudonym IS NOT NULL 
AND (LENGTH(TRIM(pseudonym)) = 0 OR pseudonym ~ '^_+$');

-- Clean up duplicate data for phone numbers
WITH duplicate_phones AS (
  SELECT phone, MIN(created_at) as first_created
  FROM public.profiles 
  WHERE phone IS NOT NULL AND phone != ''
  GROUP BY phone 
  HAVING COUNT(*) > 1
)
UPDATE public.profiles 
SET phone = NULL 
WHERE phone IN (SELECT phone FROM duplicate_phones) 
AND created_at != (
  SELECT first_created 
  FROM duplicate_phones 
  WHERE duplicate_phones.phone = profiles.phone
);

-- Clean up duplicate data for mobile numbers
WITH duplicate_mobiles AS (
  SELECT mobile, MIN(created_at) as first_created
  FROM public.profiles 
  WHERE mobile IS NOT NULL AND mobile != ''
  GROUP BY mobile 
  HAVING COUNT(*) > 1
)
UPDATE public.profiles 
SET mobile = NULL 
WHERE mobile IN (SELECT mobile FROM duplicate_mobiles) 
AND created_at != (
  SELECT first_created 
  FROM duplicate_mobiles 
  WHERE duplicate_mobiles.mobile = profiles.mobile
);

-- Clean up duplicate data for emails
WITH duplicate_emails AS (
  SELECT email, MIN(created_at) as first_created
  FROM public.profiles 
  WHERE email IS NOT NULL AND email != ''
  GROUP BY email 
  HAVING COUNT(*) > 1
)
UPDATE public.profiles 
SET email = NULL 
WHERE email IN (SELECT email FROM duplicate_emails) 
AND created_at != (
  SELECT first_created 
  FROM duplicate_emails 
  WHERE duplicate_emails.email = profiles.email
);

-- Now add the unique constraints
ALTER TABLE public.profiles 
ADD CONSTRAINT unique_email UNIQUE (email),
ADD CONSTRAINT unique_phone UNIQUE (phone),
ADD CONSTRAINT unique_mobile UNIQUE (mobile);

-- Update pseudonym constraint to allow only letters, numbers, underscore, and hyphen
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS check_pseudonym_not_empty;

-- Add new constraint for pseudonym format (alphanumeric, underscore, hyphen only - no spaces)
ALTER TABLE public.profiles 
ADD CONSTRAINT check_pseudonym_format 
CHECK (pseudonym IS NULL OR (LENGTH(TRIM(pseudonym)) > 0 AND pseudonym ~ '^[a-zA-Z0-9_-]+$'));
