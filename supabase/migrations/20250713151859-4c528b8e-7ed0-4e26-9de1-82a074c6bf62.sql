-- Create a table to track user votes on reviews
CREATE TABLE public.review_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, review_id)
);

-- Enable Row Level Security
ALTER TABLE public.review_votes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all votes" 
ON public.review_votes 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own votes" 
ON public.review_votes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" 
ON public.review_votes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" 
ON public.review_votes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update review vote counts
CREATE OR REPLACE FUNCTION public.update_review_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the review's upvote and downvote counts
  UPDATE public.reviews 
  SET 
    upvotes = (
      SELECT COUNT(*) 
      FROM public.review_votes 
      WHERE review_id = COALESCE(NEW.review_id, OLD.review_id) 
      AND vote_type = 'upvote'
    ),
    downvotes = (
      SELECT COUNT(*) 
      FROM public.review_votes 
      WHERE review_id = COALESCE(NEW.review_id, OLD.review_id) 
      AND vote_type = 'downvote'
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.review_id, OLD.review_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update vote counts
CREATE TRIGGER update_review_votes_on_insert
  AFTER INSERT ON public.review_votes
  FOR EACH ROW EXECUTE FUNCTION public.update_review_vote_counts();

CREATE TRIGGER update_review_votes_on_update
  AFTER UPDATE ON public.review_votes
  FOR EACH ROW EXECUTE FUNCTION public.update_review_vote_counts();

CREATE TRIGGER update_review_votes_on_delete
  AFTER DELETE ON public.review_votes
  FOR EACH ROW EXECUTE FUNCTION public.update_review_vote_counts();

-- Create function to handle vote upsert (insert or update existing vote)
CREATE OR REPLACE FUNCTION public.upsert_review_vote(
  p_review_id UUID,
  p_vote_type TEXT
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.review_votes (user_id, review_id, vote_type)
  VALUES (auth.uid(), p_review_id, p_vote_type)
  ON CONFLICT (user_id, review_id)
  DO UPDATE SET 
    vote_type = EXCLUDED.vote_type,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;