
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import autoAnimate from '@formkit/auto-animate';
import SingleReviewCard from './SingleReviewCard';

interface ReviewsListProps {
  reviews: any[];
  businessId: string;
  isLoading: boolean;
}

const ReviewsList = ({ reviews, businessId, isLoading }: ReviewsListProps) => {
  const { user } = useAuth();
  const [viewingHistory, setViewingHistory] = useState<Record<string, boolean>>({});
  const [displayedReviews, setDisplayedReviews] = useState<number>(10);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gridRef.current) {
      autoAnimate(gridRef.current, {
        duration: 300,
        easing: 'ease-out'
      });
    }
  }, []);

  const toggleHistory = (userId: string) => {
    setViewingHistory(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleViewMore = () => {
    setDisplayedReviews(prev => Math.min(prev + 10, reviews.length));
  };

  // Get the reviews to display based on current pagination
  const reviewsToDisplay = reviews.slice(0, displayedReviews);
  const hasMoreReviews = displayedReviews < reviews.length;

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
            <Link to={`/write-review?entityId=${businessId}`}>
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
      
      <div 
        ref={gridRef}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {reviewsToDisplay.map((review, index) => (
          <div
            key={review.userId}
            className="masonry-item animate-fade-in"
            style={{
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'backwards'
            }}
          >
            <SingleReviewCard
              review={{
                ...review,
                created_at: review.created_at,
                business_id: businessId
              }}
              viewingHistory={viewingHistory}
              onToggleHistory={toggleHistory}
            />
          </div>
        ))}
      </div>
      
      {/* View More Button */}
      {hasMoreReviews && (
        <div className="text-center mt-8">
          <Button 
            onClick={handleViewMore}
            variant="outline"
            className="px-8 py-2"
          >
            View More Reviews ({reviews.length - displayedReviews} remaining)
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReviewsList;
