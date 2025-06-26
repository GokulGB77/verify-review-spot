
-- First, let's create the new entities table without dropping the old businesses table
CREATE TYPE public.entity_type AS ENUM (
  'business', 
  'service', 
  'movie_theatre', 
  'institution', 
  'learning_platform', 
  'ecommerce', 
  'product', 
  'other'
);

CREATE TYPE public.trust_level AS ENUM (
  'basic', 
  'verified', 
  'trusted_partner'
);

-- Create the new entities table with comprehensive structure
CREATE TABLE public.entities (
  entity_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type entity_type NOT NULL DEFAULT 'business',
  name TEXT NOT NULL,
  legal_name TEXT,
  tagline TEXT,
  description TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  
  -- Industry and categorization
  industry TEXT,
  sub_industry TEXT,
  category_tags TEXT[],
  keywords TEXT[],
  
  -- Company details
  founded_year INTEGER,
  founders TEXT[],
  number_of_employees TEXT,
  revenue_range TEXT,
  
  -- Registration info (stored as JSONB)
  registration_info JSONB DEFAULT '{}'::jsonb,
  
  -- Location (stored as JSONB)
  location JSONB DEFAULT '{}'::jsonb,
  
  -- Contact (stored as JSONB)
  contact JSONB DEFAULT '{}'::jsonb,
  
  -- Social links (stored as JSONB)
  social_links JSONB DEFAULT '{}'::jsonb,
  
  -- Apps (stored as JSONB)
  apps JSONB DEFAULT '{}'::jsonb,
  
  -- Media (stored as JSONB)
  media JSONB DEFAULT '{}'::jsonb,
  
  -- Platform metadata
  is_verified BOOLEAN DEFAULT false,
  trust_level trust_level DEFAULT 'basic',
  claimed_by_business BOOLEAN DEFAULT false,
  profile_completion INTEGER DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  average_rating DECIMAL(2,1) DEFAULT 0.0,
  platform_score INTEGER DEFAULT 0,
  can_reply_to_reviews BOOLEAN DEFAULT true,
  flagged_for_review_fraud BOOLEAN DEFAULT false,
  
  -- Custom fields for different entity types (stored as JSONB)
  custom_fields JSONB DEFAULT '{}'::jsonb,
  
  -- System info
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  claimed_by_user_id UUID,
  
  -- Status field for active/inactive
  status TEXT DEFAULT 'active'
);

-- Migrate data from businesses to entities table
INSERT INTO public.entities (
  entity_id,
  entity_type,
  name,
  legal_name,
  description,
  industry,
  founded_year,
  number_of_employees,
  location,
  contact,
  registration_info,
  is_verified,
  trust_level,
  review_count,
  average_rating,
  created_at,
  updated_at,
  status
)
SELECT 
  id as entity_id,
  'business'::entity_type as entity_type,
  name,
  name as legal_name, -- Use name as legal_name for now
  description,
  category as industry,
  founded_year,
  employee_count as number_of_employees,
  jsonb_build_object(
    'address', COALESCE(location, ''),
    'city', '',
    'state', '',
    'country', '',
    'pincode', ''
  ) as location,
  jsonb_build_object(
    'website', COALESCE(website, ''),
    'email', COALESCE(email, ''),
    'phone', COALESCE(phone, '')
  ) as contact,
  jsonb_build_object() as registration_info,
  CASE WHEN verification_status = 'Verified' THEN true ELSE false END as is_verified,
  CASE 
    WHEN verification_status = 'Verified' THEN 'verified'::trust_level 
    ELSE 'basic'::trust_level 
  END as trust_level,
  COALESCE(review_count, 0) as review_count,
  COALESCE(rating, 0.0) as average_rating,
  created_at,
  updated_at,
  COALESCE(status, 'active') as status
FROM public.businesses;

-- Enable RLS on entities table
ALTER TABLE public.entities ENABLE ROW LEVEL SECURITY;

-- Create policies for entities (public readable, authenticated users can create)
CREATE POLICY "Anyone can view entities" 
  ON public.entities 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create entities" 
  ON public.entities 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update entities" 
  ON public.entities 
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

-- Now drop the old businesses table
DROP TABLE public.businesses CASCADE;

-- Create function to update entity rating when reviews are added/updated
CREATE OR REPLACE FUNCTION update_entity_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the entity rating and review count
  UPDATE public.entities 
  SET 
    average_rating = (
      SELECT ROUND(AVG(rating)::numeric, 1) 
      FROM public.reviews 
      WHERE business_id = COALESCE(NEW.business_id, OLD.business_id)
    ),
    review_count = (
      SELECT COUNT(*) 
      FROM public.reviews 
      WHERE business_id = COALESCE(NEW.business_id, OLD.business_id)
    ),
    updated_at = now()
  WHERE entity_id = COALESCE(NEW.business_id, OLD.business_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Add foreign key constraint to reviews table
ALTER TABLE public.reviews 
  ADD CONSTRAINT reviews_entity_id_fkey 
    FOREIGN KEY (business_id) REFERENCES public.entities(entity_id) ON DELETE CASCADE;

-- Update user_roles table to reference entities instead of businesses  
ALTER TABLE public.user_roles 
  DROP CONSTRAINT IF EXISTS user_roles_entity_id_fkey,
  ADD CONSTRAINT user_roles_entity_id_fkey 
    FOREIGN KEY (entity_id) REFERENCES public.entities(entity_id) ON DELETE CASCADE;

-- Create triggers to update entity rating
CREATE TRIGGER update_entity_rating_on_insert
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_entity_rating();

CREATE TRIGGER update_entity_rating_on_update
  AFTER UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_entity_rating();

CREATE TRIGGER update_entity_rating_on_delete
  AFTER DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_entity_rating();
