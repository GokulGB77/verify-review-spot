
import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, CheckCircle, MessageSquare, History, Edit, Shield, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ReviewContent from './ReviewContent';
import ReviewHistory from './ReviewHistory';

interface SingleReviewCardProps {
  review: {
    id: string;
    userId: string;
    userName: string;
    rating: number;
    content: string;
    mainBadge: 'Verified User' | 'Unverified User';
    reviewSpecificBadge?: 'Verified Employee' | 'Verified Student' | null;
    proofProvided: boolean;
    proofVerified?: boolean | null;
    upvotes: number;
    downvotes: number;
    date: string;
    businessResponse?: string;
    businessResponseDate?: string;
    hasUpdates: boolean;
    totalUpdates: number;
    updateNumber: number;
    allReviews: any[];
    created_at?: string;
    updated_at?: string;
    business_id?: string;
  };
  viewingHistory: Record<string, boolean>;
  onToggleHistory: (userId: string) => void;
}

const SingleReviewCard = ({ review, viewingHistory, onToggleHistory }: SingleReviewCardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Check if review has been edited (updated_at is different from created_at)
  const hasBeenEdited = review.updated_at && review.created_at && 
    new Date(review.updated_at).getTime() !== new Date(review.created_at).getTime();

  console.log('SingleReviewCard - Edit check:', {
    reviewId: review.id,
    created_at: review.created_at,
    updated_at: review.updated_at,
    hasBeenEdited: hasBeenEdited,
    userId: review.userId,
    currentUserId: user?.id
  });

  // Calculate if this review is editable (posted by current user, within 1 minute, and not edited)
  useEffect(() => {
    if (!user || !review.created_at || review.userId !== user.id || hasBeenEdited) {
      setTimeLeft(0);
      return;
    }

    const reviewTime = new Date(review.created_at).getTime();
    const currentTime = Date.now();
    const timeDiff = currentTime - reviewTime;
    const oneMinute = 60 * 1000; // 1 minute in milliseconds

    if (timeDiff >= oneMinute) {
      setTimeLeft(0);
      return;
    }

    const remaining = oneMinute - timeDiff;
    const initialTimeLeft = Math.max(0, Math.floor(remaining / 1000));
    setTimeLeft(initialTimeLeft);

    const timer = setInterval(() => {
      const newCurrentTime = Date.now();
      const newTimeDiff = newCurrentTime - reviewTime;
      const newRemaining = oneMinute - newTimeDiff;
      const newTimeLeft = Math.max(0, Math.floor(newRemaining / 1000));
      
      setTimeLeft(newTimeLeft);
      
      if (newTimeLeft <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [user, review.created_at, review.userId, hasBeenEdited, review.updated_at]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEdit = () => {
    if (review.business_id) {
      navigate(`/write-review?entityId=${review.business_id}&reviewId=${review.id}&isEdit=true`);
    }
  };

  const isEditable = timeLeft > 0 && user && review.userId === user.id && !hasBeenEdited;

  // Badge display logic - show only one badge per review
  const getBadgeDisplay = () => {
    // Priority 1: If proof is uploaded and verified, show review-specific verification badge
    if (review.proofProvided && review.proofVerified === true && review.reviewSpecificBadge) {
      return {
        text: review.reviewSpecificBadge === 'Verified Employee' ? 'Verified Employee' : 'Verified Student',
        className: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: <Shield className="h-3 w-3 mr-1" />
      };
    }
    
    // Priority 2: If proof is uploaded but not yet verified, show pending verification
    if (review.proofProvided && review.proofVerified === false) {
      return {
        text: 'Pending Verification',
        className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        icon: <Clock className="h-3 w-3 mr-1" />
      };
    }
    
    // Priority 3: Fall back to profile-based verification status
    if (review.mainBadge === 'Verified User') {
      return {
        text: 'Verified',
        className: 'bg-green-50 text-green-700 border-green-200',
        icon: <CheckCircle className="h-3 w-3 mr-1" />
      };
    }
    
    // Default: Unverified
    return {
      text: 'Unverified',
      className: 'bg-gray-50 text-gray-600 border-gray-200',
      icon: null
    };
  };

  const badgeDisplay = getBadgeDisplay();

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 min-h-fit">
      {/* User Info and Rating */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {review.userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="mb-2">
              <span className="font-medium text-gray-900 text-sm">{review.userName}</span>
            </div>
            <div className="flex items-center">
              <Badge 
                variant="outline" 
                className={`text-xs px-2 py-1 h-5 ${badgeDisplay.className} flex items-center`}
              >
                {badgeDisplay.icon}
                {badgeDisplay.text}
              </Badge>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < review.rating
                    ? 'text-green-500 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">{review.date}</span>
        </div>
      </div>

      {/* Review Content */}
      <div className="mb-4">
        <ReviewContent content={review.content} maxLength={150} />
      </div>

      {/* Business Response */}
      {review.businessResponse && (
        <div className="bg-gray-50 rounded p-3 mb-4 border-l-2 border-blue-400">
          <div className="flex items-center space-x-2 mb-2">
            <MessageSquare className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Business Response</span>
            <span className="text-xs text-gray-500">{review.businessResponseDate}</span>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">{review.businessResponse}</p>
        </div>
      )}

      {/* Edit Section - Only show if user owns the review, within edit window, and hasn't been edited */}
      {isEditable && (
        <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              You can edit this for the next {formatTime(timeLeft)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="text-blue-700 border-blue-300 hover:bg-blue-100 h-7 text-xs px-2"
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          </div>
        </div>
      )}

      {/* Review History Button and Update Badge */}
      {review.hasUpdates && (
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleHistory(review.userId)}
            className="text-gray-600 hover:text-gray-900 h-7 text-sm px-2"
          >
            <History className="h-3 w-3 mr-1" />
            {viewingHistory[review.userId] ? 'Hide' : 'View'} History ({review.totalUpdates + 1})
          </Button>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-2 py-1 h-5">
            Update #{review.updateNumber}
          </Badge>
        </div>
      )}

      {/* Review History */}
      {review.hasUpdates && viewingHistory[review.userId] && (
        <div className="mt-4">
          <ReviewHistory allReviews={review.allReviews} />
        </div>
      )}
    </div>
  );
};

export default SingleReviewCard;
