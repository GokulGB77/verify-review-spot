
-- Insert a single dummy entity for testing
INSERT INTO public.entities (
  entity_type,
  name,
  legal_name,
  tagline,
  description,
  industry,
  founded_year,
  number_of_employees,
  location,
  contact,
  is_verified,
  trust_level,
  average_rating,
  review_count,
  status
) VALUES (
  'business',
  'TechStart Solutions',
  'TechStart Solutions Private Limited',
  'Innovative software solutions for modern businesses',
  'A leading software development company specializing in web applications, mobile apps, and cloud solutions. We help businesses transform digitally with cutting-edge technology.',
  'Software Development',
  2018,
  '50-100',
  jsonb_build_object(
    'address', '123 Innovation Street',
    'city', 'Bangalore',
    'state', 'Karnataka',
    'country', 'India',
    'pincode', '560001'
  ),
  jsonb_build_object(
    'website', 'https://techstartsolutions.com',
    'email', 'contact@techstartsolutions.com',
    'phone', '+91-80-12345678'
  ),
  true,
  'verified',
  4.2,
  15,
  'active'
);
