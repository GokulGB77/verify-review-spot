import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useUserReviewVote, useReviewVote, useRemoveReviewVote, VoteType } from '@/hooks/useReviewVotes';
import { cn } from '@/lib/utils';

interface VoteButtonsProps {
  reviewId: string;
  upvotes: number;
  downvotes: number;
  className?: string;
}

export const VoteButtons = ({ reviewId, upvotes, downvotes, className }: VoteButtonsProps) => {
  const { user } = useAuth();
  const { data: userVote } = useUserReviewVote(reviewId);
  const { mutate: vote, isPending: isVoting } = useReviewVote();
  const { mutate: removeVote, isPending: isRemoving } = useRemoveReviewVote();

  const handleVote = (voteType: VoteType) => {
    if (!user) return;

    if (userVote?.vote_type === voteType) {
      // Remove vote if clicking the same button
      removeVote(reviewId);
    } else {
      // Add or change vote
      vote({ reviewId, voteType });
    }
  };

  const isUpvoteActive = userVote?.vote_type === 'upvote';
  const isDownvoteActive = userVote?.vote_type === 'downvote';
  const isPending = isVoting || isRemoving;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote('upvote')}
        disabled={!user || isPending}
        className={cn(
          "flex items-center gap-1 text-xs",
          isUpvoteActive && "text-green-600 bg-green-50 hover:bg-green-100"
        )}
      >
        <ThumbsUp className={cn(
          "h-4 w-4",
          isUpvoteActive && "fill-current"
        )} />
        <span>{upvotes || 0}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote('downvote')}
        disabled={!user || isPending}
        className={cn(
          "flex items-center gap-1 text-xs",
          isDownvoteActive && "text-red-600 bg-red-50 hover:bg-red-100"
        )}
      >
        <ThumbsDown className={cn(
          "h-4 w-4",
          isDownvoteActive && "fill-current"
        )} />
        <span>{downvotes || 0}</span>
      </Button>

      {!user && (
        <span className="text-xs text-muted-foreground ml-2">
          Sign in to vote
        </span>
      )}
    </div>
  );
};