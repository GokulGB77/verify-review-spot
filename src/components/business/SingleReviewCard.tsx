import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, CheckCircle, MessageSquare, History, Edit, Shield, Clock, MoreVertical, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ReviewContent from './ReviewContent';
import ReviewHistory from './ReviewHistory';
import { VoteButtons } from '@/components/review/VoteButtons';
import ReviewShareButton from '@/components/ui/review-share-button';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SingleReviewCardProps {
  review: {
    id: string;
    userId: string;
    userName: string;
    title?: string;
    rating: number;
    content: string;
    mainBadge: 'Verified User' | 'Unverified User';
    customVerificationTag?: string | null;
    isProofSubmitted: boolean;
    isVerified?: boolean | null;
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
  entityName?: string;
}

const SingleReviewCard = ({ review, viewingHistory, onToggleHistory, entityName }: SingleReviewCardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [fetchedEntityName, setFetchedEntityName] = useState<string>("");

  // Fetch entity name from database
  useEffect(() => {
    const fetchEntityName = async () => {
      if (review.business_id && !entityName) {
        try {
          const { data, error } = await supabase
            .from('entities')
            .select('name')
            .eq('entity_id', review.business_id)
            .single();
          
          if (data && !error) {
            setFetchedEntityName(data.name);
          }
        } catch (error) {
          console.error('Error fetching entity name:', error);
        }
      }
    };

    fetchEntityName();
  }, [review.business_id, entityName]);

  // Check if review has been edited (updated_at is different from created_at)
  const hasBeenEdited = review.updated_at && review.created_at && 
    new Date(review.updated_at).getTime() !== new Date(review.created_at).getTime();

  console.log('SingleReviewCard - Badge debug:', {
    reviewId: review.id,
    isProofSubmitted: review.isProofSubmitted,
    isVerified: review.isVerified,
    customVerificationTag: review.customVerificationTag,
    mainBadge: review.mainBadge,
    userName: review.userName
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

  const handleAddUpdate = () => {
    if (review.business_id) {
      navigate(`/write-review?entityId=${review.business_id}`);
    }
  };

  const isEditable = timeLeft > 0 && user && review.userId === user.id && !hasBeenEdited;

  // Badge display logic - show only one badge per review
  const getBadgeDisplay = () => {
    console.log('getBadgeDisplay called with:', {
      isProofSubmitted: review.isProofSubmitted,
      isVerified: review.isVerified,
      customVerificationTag: review.customVerificationTag,
      mainBadge: review.mainBadge
    });

    // Priority 1: If proof is uploaded and verified, show custom verification tag
    if (review.isProofSubmitted && review.isVerified === true && review.customVerificationTag) {
      console.log('Using custom verification tag:', review.customVerificationTag);
      return {
        text: review.customVerificationTag,
        className: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: <Shield className="h-3 w-3 mr-1" />
      };
    }
    
    // Priority 2: If proof is uploaded but not yet verified, show pending verification
    if (review.isProofSubmitted && review.isVerified !== true) {
      console.log('Using pending verification badge');
      return {
        text: 'Pending Verification',
        className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        icon: <Clock className="h-3 w-3 mr-1" />
      };
    }
    
    // Priority 3: Fall back to profile-based verification status
    if (review.mainBadge === 'Verified User') {
      console.log('Using verified user badge');
      return {
        text: 'Verified',
        className: 'bg-green-50 text-green-700 border-green-200',
        icon: <CheckCircle className="h-3 w-3 mr-1" />
      };
    }
    
    // Default: Unverified
    console.log('Using unverified badge');
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
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {review.userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-gray-900 text-sm truncate">{review.userName}</span>
              <div className="flex items-center space-x-1 ml-2">
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
            </div>
            <div className="flex items-center justify-end">
              <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">{review.date}</span>
            </div>
          </div>
        </div>
        {user && review.userId === user.id && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 ml-2">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isEditable && (
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit ({formatTime(timeLeft)})
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleAddUpdate}>
                <Plus className="h-4 w-4 mr-2" />
                Add Update
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Review Content */}
      <div className="mb-4">
        <div className="mb-2">
          <Badge 
            variant="outline" 
            className={`text-xs px-2 py-1 h-5 ${badgeDisplay.className} flex items-center whitespace-nowrap flex-shrink-0 w-fit`}
          >
            {badgeDisplay.icon}
            {badgeDisplay.text}
          </Badge>
        </div>
        {review.title && (
          <h3 className="font-semibold text-md mb-2 text-gray-900">{review.title}</h3>
        )}
        <ReviewContent content={review.content} maxLength={150} />
      </div>

      {/* Business Response */}
      {review.businessResponse && (
        <div className="bg-gray-50 rounded p-3 mb-4 border-l-2 border-blue-400">
          <div className="mb-2">
            <div className="flex items-center space-x-2 ">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">{fetchedEntityName}</span>
            </div>
            <span className="text-xs text-gray-500 ml-6">{review.businessResponseDate}</span>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed break-words overflow-wrap-anywhere whitespace-pre-wrap">{review.businessResponse}</p>
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

      {/* Vote Buttons and Share */}
      <div className="pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <VoteButtons 
            reviewId={review.id}
            upvotes={review.upvotes || 0}
            downvotes={review.downvotes || 0}
          />
          {review.business_id && (
            <ReviewShareButton
              reviewId={review.id}
              entityName={entityName || fetchedEntityName || "this business"}
              entityId={review.business_id}
              rating={review.rating}
              reviewContent={review.content}
              reviewerName={review.userName}
              variant="icon"
            />
          )}
        </div>
      </div>

      {/* Review History */}
      {review.hasUpdates && viewingHistory[review.userId] && (
        <div className="mt-4">
          <ReviewHistory allReviews={review.allReviews} />
        </div>
      )}
      
      {/* Edit message - Only show if user owns the review, recently posted, and hasn't been edited */}
      {user && review.userId === user.id && !hasBeenEdited && timeLeft === 0 && review.created_at && (
        (() => {
          const reviewTime = new Date(review.created_at).getTime();
          const currentTime = Date.now();
          const timeDiff = currentTime - reviewTime;
          const fiveMinutes = 5 * 60 * 1000; // Show message for 5 minutes after posting
          
          if (timeDiff < fiveMinutes) {
            return (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Reviews can be edited for 1 minute after posting.
                </p>
              </div>
            );
          }
          return null;
        })()
      )}
    </div>
  );
};

export default SingleReviewCard;