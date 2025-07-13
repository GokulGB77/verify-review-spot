import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type VoteType = 'upvote' | 'downvote';

export interface ReviewVote {
  id: string;
  user_id: string;
  review_id: string;
  vote_type: VoteType;
  created_at: string;
  updated_at: string;
}

// Hook to get user's vote for a specific review
export const useUserReviewVote = (reviewId: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-review-vote', reviewId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('review_votes')
        .select('*')
        .eq('review_id', reviewId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as ReviewVote | null;
    },
    enabled: !!user && !!reviewId,
  });
};

// Hook to handle voting on reviews
export const useReviewVote = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, voteType }: { reviewId: string; voteType: VoteType }) => {
      if (!user) {
        throw new Error('You must be logged in to vote');
      }

      const { error } = await supabase.rpc('upsert_review_vote', {
        p_review_id: reviewId,
        p_vote_type: voteType,
      });

      if (error) throw error;
    },
    onSuccess: (_, { reviewId, voteType }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['user-review-vote', reviewId] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      
      toast({
        title: voteType === 'upvote' ? 'Review upvoted!' : 'Review downvoted!',
        description: 'Your vote has been recorded.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to vote on review',
        variant: 'destructive',
      });
    },
  });
};

// Hook to remove vote
export const useRemoveReviewVote = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      if (!user) {
        throw new Error('You must be logged in to remove vote');
      }

      const { error } = await supabase
        .from('review_votes')
        .delete()
        .eq('review_id', reviewId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: (_, reviewId) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['user-review-vote', reviewId] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      
      toast({
        title: 'Vote removed',
        description: 'Your vote has been removed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove vote',
        variant: 'destructive',
      });
    },
  });
};