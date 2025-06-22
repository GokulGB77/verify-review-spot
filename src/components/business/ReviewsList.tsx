
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import SingleReviewCard from './SingleReviewCard';

interface ReviewsListProps {
  reviews: any[];
  businessId: string;
  isLoading: boolean;
}

const ReviewsList = ({ reviews, businessId, isLoading }: ReviewsListProps) => {
  const { user } = useAuth();
  const [viewingHistory, setViewingHistory] = useState<Record<string, boolean>>({});

  const toggleHistory = (userId: string) => {
    setViewingHistory(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading reviews...</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500 mb-4">No reviews yet. Be the first to write one!</p>
        {user ? (
          <Button asChild>
            <Link to={`/business/${businessId}/write-review`}>
              Write the First Review
            </Link>
          </Button>
        ) : (
          <Button asChild>
            <Link to="/auth">
              Sign in to Write Review
            </Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">See what reviewers are saying</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {reviews.map((review) => (
          <SingleReviewCard
            key={review.userId}
            review={review}
            viewingHistory={viewingHistory}
            onToggleHistory={toggleHistory}
          />
        ))}
      </div>
    </div>
  );
};

export default ReviewsList;
