
import { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, CheckCircle, MessageSquare, History, Edit } from 'lucide-react';
import ReviewContent from './ReviewContent';
import ReviewHistory from './ReviewHistory';
import { useEditTimer } from '@/hooks/useEditTimer';
import { useAuth } from '@/contexts/AuthContext';

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
    upvotes: number;
    downvotes: number;
    date: string;
    businessResponse?: string;
    businessResponseDate?: string;
    hasUpdates: boolean;
    totalUpdates: number;
    updateNumber: number;
    allReviews: any[];
    createdAt?: string;
  };
  viewingHistory: Record<string, boolean>;
  onToggleHistory: (userId: string) => void;
  onEdit?: (reviewId: string) => void;
}

const SingleReviewCard = ({ review, viewingHistory, onToggleHistory, onEdit }: SingleReviewCardProps) => {
  const { user } = useAuth();
  const { canEdit, formattedTime } = useEditTimer(review.createdAt || review.date);
  
  // Check if current user is the author of this review
  const isAuthor = user?.id === review.userId;
  const showEditButton = isAuthor && canEdit && onEdit;

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
            <div className="flex items-center space-x-2">
              <Badge 
                variant="outline" 
                className={`text-xs px-2 py-1 h-5 ${
                  review.mainBadge === 'Verified User' 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : 'bg-gray-50 text-gray-600 border-gray-200'
                }`}
              >
                {review.mainBadge === 'Verified User' && <CheckCircle className="h-3 w-3 mr-1" />}
                {review.mainBadge === 'Verified User' ? 'Verified' : 'Unverified'}
              </Badge>
              {review.reviewSpecificBadge && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-2 py-1 h-5">
                  {review.reviewSpecificBadge === 'Verified Employee' ? 'Employee' : 'Student'}
                </Badge>
              )}
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

      {/* Edit Timer and Button */}
      {showEditButton && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-700">
              You can edit this for the next {formattedTime}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(review.id)}
              className="h-7 text-sm px-3 bg-white hover:bg-blue-50"
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          </div>
        </div>
      )}

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
