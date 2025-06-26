
-- Add a new status column to separate active/inactive from verification status
ALTER TABLE public.businesses 
ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive'));

-- Update existing 'Inactive' verification_status records to use the new status column
UPDATE public.businesses 
SET status = 'inactive', 
    verification_status = 'Unverified' 
WHERE verification_status = 'Inactive';

-- Create index for efficient querying
CREATE INDEX idx_businesses_status ON public.businesses(status);
