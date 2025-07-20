-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL, -- 'business_response', 'review_vote'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_review_id UUID,
  related_entity_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to create notification for business response
CREATE OR REPLACE FUNCTION public.create_business_response_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create notification if business_response was added (not updated)
  IF OLD.business_response IS NULL AND NEW.business_response IS NOT NULL THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      related_review_id,
      related_entity_id
    )
    SELECT 
      NEW.user_id,
      'business_response',
      'Business Response Received',
      'A business has responded to your review',
      NEW.id,
      NEW.business_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to create notification for review votes
CREATE OR REPLACE FUNCTION public.create_review_vote_notification()
RETURNS TRIGGER AS $$
DECLARE
  review_owner_id UUID;
  voter_id UUID;
BEGIN
  -- Get the review owner and voter
  SELECT user_id INTO review_owner_id FROM public.reviews WHERE id = NEW.review_id;
  SELECT user_id INTO voter_id FROM public.review_votes WHERE id = NEW.id;
  
  -- Only create notification if someone else voted on the review
  IF review_owner_id != voter_id THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      related_review_id
    )
    VALUES (
      review_owner_id,
      'review_vote',
      'Review Vote Received',
      CASE 
        WHEN NEW.vote_type = 'upvote' THEN 'Someone upvoted your review'
        ELSE 'Someone downvoted your review'
      END,
      NEW.review_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER trigger_business_response_notification
  AFTER UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.create_business_response_notification();

CREATE TRIGGER trigger_review_vote_notification
  AFTER INSERT ON public.review_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.create_review_vote_notification();