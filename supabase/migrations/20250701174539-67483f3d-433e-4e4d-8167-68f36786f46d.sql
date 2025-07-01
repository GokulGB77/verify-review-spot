
-- Create a table to track approved user connections for specific businesses
CREATE TABLE public.user_business_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.entities(entity_id) ON DELETE CASCADE,
  connection_type TEXT NOT NULL CHECK (connection_type IN ('Verified Employee', 'Verified Student')),
  approved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, business_id)
);

-- Enable RLS
ALTER TABLE public.user_business_connections ENABLE ROW LEVEL SECURITY;

-- Policy for users to see their own approved connections
CREATE POLICY "Users can view their own approved connections" 
  ON public.user_business_connections 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy for super admins to manage all connections
CREATE POLICY "Super admins can manage all connections" 
  ON public.user_business_connections 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM get_user_roles() 
    WHERE role = 'super_admin'::app_role
  ));

-- Create index for efficient querying
CREATE INDEX idx_user_business_connections_user_business ON public.user_business_connections(user_id, business_id);
