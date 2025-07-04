
-- Create a table for entity addition requests
CREATE TABLE public.entity_addition_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_name TEXT NOT NULL,
  sector TEXT NOT NULL,
  website_link TEXT,
  requested_by UUID REFERENCES auth.users,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.entity_addition_requests ENABLE ROW LEVEL SECURITY;

-- Create policy that allows anyone to view requests (for admin dashboard)
CREATE POLICY "Anyone can view entity addition requests" 
  ON public.entity_addition_requests 
  FOR SELECT 
  USING (true);

-- Create policy that allows authenticated users to create requests
CREATE POLICY "Authenticated users can create entity addition requests" 
  ON public.entity_addition_requests 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create policy that allows super admins to update requests
CREATE POLICY "Super admins can update entity addition requests" 
  ON public.entity_addition_requests 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.get_user_roles()
      WHERE role = 'super_admin'
    )
  );

-- Create an index for better performance
CREATE INDEX idx_entity_addition_requests_status ON public.entity_addition_requests(status);
CREATE INDEX idx_entity_addition_requests_requested_by ON public.entity_addition_requests(requested_by);
