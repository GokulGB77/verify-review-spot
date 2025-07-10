-- Create problem_reports table
CREATE TABLE public.problem_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'open',
  contact_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_notes TEXT
);

-- Enable Row Level Security
ALTER TABLE public.problem_reports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own reports" 
ON public.problem_reports 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create problem reports" 
ON public.problem_reports 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL); -- Allow anonymous reports

CREATE POLICY "Users can update their own reports" 
ON public.problem_reports 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all reports" 
ON public.problem_reports 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM get_user_roles() 
  WHERE role = 'super_admin'::app_role
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_problem_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_problem_reports_updated_at
BEFORE UPDATE ON public.problem_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_problem_reports_updated_at();