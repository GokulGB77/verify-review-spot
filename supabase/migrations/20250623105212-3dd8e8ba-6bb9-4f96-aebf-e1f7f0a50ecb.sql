
-- Create a table for entity registration requests
CREATE TABLE public.entity_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_name TEXT NOT NULL,
  category TEXT NOT NULL,
  website TEXT,
  description TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  registration_number TEXT,
  tax_id TEXT,
  owner_name TEXT,
  owner_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  submitted_by UUID REFERENCES auth.users,
  reviewed_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.entity_registrations ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to view their own registrations
CREATE POLICY "Users can view their own registrations" 
  ON public.entity_registrations 
  FOR SELECT 
  USING (auth.uid() = submitted_by);

-- Create policy that allows users to insert their own registrations
CREATE POLICY "Users can create registrations" 
  ON public.entity_registrations 
  FOR INSERT 
  WITH CHECK (auth.uid() = submitted_by);

-- Create policy that allows super admins to view all registrations
CREATE POLICY "Super admins can view all registrations" 
  ON public.entity_registrations 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.get_user_roles()
      WHERE role = 'super_admin'
    )
  );

-- Create an index for better performance
CREATE INDEX idx_entity_registrations_status ON public.entity_registrations(status);
CREATE INDEX idx_entity_registrations_submitted_by ON public.entity_registrations(submitted_by);
