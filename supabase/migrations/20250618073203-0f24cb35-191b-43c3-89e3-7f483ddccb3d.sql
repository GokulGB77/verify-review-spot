
-- Create businesses table
CREATE TABLE public.businesses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  rating DECIMAL(2,1) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  verification_status TEXT DEFAULT 'Unverified',
  location TEXT,
  website TEXT,
  phone TEXT,
  email TEXT,
  has_subscription BOOLEAN DEFAULT false,
  founded_year INTEGER,
  employee_count TEXT,
  programs TEXT[], -- Array of programs/services offered
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT NOT NULL,
  user_badge TEXT DEFAULT 'Unverified User',
  proof_provided BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  business_response TEXT,
  business_response_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, business_id) -- One review per user per business
);

-- Enable RLS on businesses table
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- Enable RLS on reviews table
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policies for businesses (public readable, authenticated users can create)
CREATE POLICY "Anyone can view businesses" 
  ON public.businesses 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create businesses" 
  ON public.businesses 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update businesses" 
  ON public.businesses 
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

-- Policies for reviews
CREATE POLICY "Anyone can view reviews" 
  ON public.reviews 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create their own reviews" 
  ON public.reviews 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" 
  ON public.reviews 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" 
  ON public.reviews 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Insert 10 dummy businesses
INSERT INTO public.businesses (name, category, description, rating, review_count, verification_status, location, website, phone, email, has_subscription, founded_year, employee_count, programs) VALUES
('Tech Academy Pro', 'EdTech', 'Leading online coding bootcamp with industry-relevant curriculum and job placement assistance. We offer comprehensive programs in full-stack development, data science, and mobile app development.', 4.2, 156, 'Verified', 'Mumbai, Maharashtra', 'https://techacademypro.com', '+91 98765 43210', 'contact@techacademypro.com', true, 2018, '50-100', ARRAY['Full Stack Development', 'Data Science', 'Mobile App Development', 'UI/UX Design']),
('Green Earth Restaurant', 'Food & Beverage', 'Organic farm-to-table restaurant serving locally sourced, sustainable cuisine in a cozy atmosphere.', 4.5, 89, 'Verified', 'Bangalore, Karnataka', 'https://greenearthrestaurant.com', '+91 98765 43211', 'hello@greenearthrestaurant.com', true, 2020, '20-50', ARRAY['Organic Food', 'Catering', 'Private Events']),
('FitLife Gym', 'Health & Fitness', 'Modern fitness center with state-of-the-art equipment, personal training, and group classes.', 4.0, 234, 'Verified', 'Delhi, NCR', 'https://fitlifegym.com', '+91 98765 43212', 'info@fitlifegym.com', false, 2015, '10-20', ARRAY['Personal Training', 'Group Classes', 'Nutrition Counseling']),
('Creative Minds Agency', 'Marketing', 'Full-service digital marketing agency specializing in brand strategy, social media, and web development.', 3.8, 67, 'Unverified', 'Pune, Maharashtra', 'https://creativemindsagency.com', '+91 98765 43213', 'contact@creativemindsagency.com', false, 2019, '5-10', ARRAY['Digital Marketing', 'Web Development', 'Brand Strategy']),
('EcoTech Solutions', 'Technology', 'Innovative technology company focused on sustainable solutions for smart cities and IoT applications.', 4.3, 45, 'Verified', 'Hyderabad, Telangana', 'https://ecotechsolutions.com', '+91 98765 43214', 'info@ecotechsolutions.com', true, 2017, '100-200', ARRAY['IoT Solutions', 'Smart City Tech', 'Environmental Monitoring']),
('Artisan Coffee House', 'Food & Beverage', 'Specialty coffee roastery and cafe serving ethically sourced, freshly roasted coffee beans.', 4.4, 178, 'Verified', 'Chennai, Tamil Nadu', 'https://artisancoffeehouse.com', '+91 98765 43215', 'hello@artisancoffeehouse.com', false, 2016, '5-10', ARRAY['Coffee Roasting', 'Cafe Services', 'Coffee Training']),
('NextGen Academy', 'Education', 'Online learning platform offering courses in emerging technologies like AI, blockchain, and cybersecurity.', 3.9, 312, 'Verified', 'Kolkata, West Bengal', 'https://nextgenacademy.com', '+91 98765 43216', 'support@nextgenacademy.com', true, 2021, '20-50', ARRAY['AI Courses', 'Blockchain', 'Cybersecurity', 'Cloud Computing']),
('Urban Salon & Spa', 'Beauty & Wellness', 'Premium salon and spa offering a wide range of beauty treatments and wellness services.', 4.1, 198, 'Verified', 'Gurgaon, Haryana', 'https://urbansalonspa.com', '+91 98765 43217', 'booking@urbansalonspa.com', false, 2014, '10-20', ARRAY['Hair Styling', 'Spa Services', 'Skincare', 'Massage Therapy']),
('TechFix Solutions', 'Technology', 'Computer and mobile device repair service with quick turnaround and affordable pricing.', 3.7, 423, 'Unverified', 'Jaipur, Rajasthan', 'https://techfixsolutions.com', '+91 98765 43218', 'support@techfixsolutions.com', false, 2012, '5-10', ARRAY['Computer Repair', 'Mobile Repair', 'Data Recovery']),
('Fresh Market Organic', 'Retail', 'Organic grocery store chain offering fresh, locally sourced produce and sustainable products.', 4.6, 89, 'Verified', 'Ahmedabad, Gujarat', 'https://freshmarketorganic.com', '+91 98765 43219', 'info@freshmarketorganic.com', true, 2019, '50-100', ARRAY['Organic Groceries', 'Local Produce', 'Eco-friendly Products']);

-- Function to update business rating when reviews are added/updated
CREATE OR REPLACE FUNCTION update_business_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the business rating and review count
  UPDATE public.businesses 
  SET 
    rating = (
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
  WHERE id = COALESCE(NEW.business_id, OLD.business_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update business rating
CREATE TRIGGER update_business_rating_on_insert
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_business_rating();

CREATE TRIGGER update_business_rating_on_update
  AFTER UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_business_rating();

CREATE TRIGGER update_business_rating_on_delete
  AFTER DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_business_rating();
