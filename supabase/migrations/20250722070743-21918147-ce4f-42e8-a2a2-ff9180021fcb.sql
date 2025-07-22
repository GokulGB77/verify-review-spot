-- Create the missing update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create verification history table to track all verification attempts
CREATE TABLE public.verification_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  attempt_number INTEGER NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  pan_number TEXT,
  full_name_pan TEXT,
  mobile TEXT,
  pan_image_url TEXT,
  rejection_reason TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.verification_history ENABLE ROW LEVEL SECURITY;

-- Create policies for verification history
CREATE POLICY "Users can view their own history" 
ON public.verification_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all history" 
ON public.verification_history 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM get_user_roles() 
  WHERE role = 'super_admin'::app_role
));

-- Create trigger for timestamps
CREATE TRIGGER update_verification_history_updated_at
BEFORE UPDATE ON public.verification_history
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically log verification attempts
CREATE OR REPLACE FUNCTION public.log_verification_attempt()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  attempt_count INTEGER;
BEGIN
  -- Get the next attempt number for this user
  SELECT COALESCE(MAX(attempt_number), 0) + 1 
  INTO attempt_count
  FROM public.verification_history
  WHERE user_id = NEW.id;

  -- Log the verification attempt when PAN data is submitted
  IF NEW.pan_number IS NOT NULL AND NEW.full_name_pan IS NOT NULL THEN
    INSERT INTO public.verification_history (
      user_id,
      attempt_number,
      status,
      pan_number,
      full_name_pan,
      mobile,
      pan_image_url
    ) VALUES (
      NEW.id,
      attempt_count,
      CASE 
        WHEN NEW.is_verified IS NULL THEN 'pending'
        WHEN NEW.is_verified = true THEN 'approved'
        ELSE 'rejected'
      END,
      NEW.pan_number,
      NEW.full_name_pan,
      NEW.mobile,
      NEW.pan_image_url
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger to log verification attempts on profile updates
CREATE TRIGGER log_verification_attempt_trigger
AFTER UPDATE ON public.profiles
FOR EACH ROW
WHEN (
  -- Trigger when PAN verification data is added/changed
  (OLD.pan_number IS DISTINCT FROM NEW.pan_number OR 
   OLD.full_name_pan IS DISTINCT FROM NEW.full_name_pan) AND
  NEW.pan_number IS NOT NULL AND NEW.full_name_pan IS NOT NULL
)
EXECUTE FUNCTION public.log_verification_attempt();

-- Create function to update verification history when admin reviews
CREATE OR REPLACE FUNCTION public.update_verification_history_on_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the latest verification history entry when admin reviews
  IF OLD.is_verified IS DISTINCT FROM NEW.is_verified AND NEW.is_verified IS NOT NULL THEN
    UPDATE public.verification_history
    SET 
      status = CASE 
        WHEN NEW.is_verified = true THEN 'approved'
        ELSE 'rejected'
      END,
      rejection_reason = NEW.rejection_reason,
      reviewed_by = auth.uid(),
      reviewed_at = now(),
      updated_at = now()
    WHERE user_id = NEW.id 
    AND status = 'pending'
    ORDER BY submitted_at DESC
    LIMIT 1;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger to update verification history on review
CREATE TRIGGER update_verification_history_on_review_trigger
AFTER UPDATE ON public.profiles
FOR EACH ROW
WHEN (OLD.is_verified IS DISTINCT FROM NEW.is_verified AND NEW.is_verified IS NOT NULL)
EXECUTE FUNCTION public.update_verification_history_on_review();