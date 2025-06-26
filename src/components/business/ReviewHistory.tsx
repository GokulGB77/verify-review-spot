
import { Badge } from "@/components/ui/badge";
import { Star } from 'lucide-react';
import ReviewContent from './ReviewContent';

interface ReviewHistoryProps {
  allReviews: any[];
}

const ReviewHistory = ({ allReviews }: ReviewHistoryProps) => {
  return (
    <div className="mt-2 pt-2 border-t border-gray-200">
      <div className="text-xs font-medium text-gray-700 mb-1">
        Review History
      </div>
      <div className="space-y-1">
        {allReviews.map((historicalReview: any) => {
          const isOriginal = !historicalReview.parent_review_id;
          const versionLabel = isOriginal ? 'Original' : `Update #${historicalReview.update_number}`;
          
          return (
            <div key={historicalReview.id} className="bg-gray-50 rounded p-2">
              <div className="flex items-center justify-between mb-1">
                <Badge 
                  variant="outline" 
                  className={`text-xs px-1 py-0 h-4 ${
                    isOriginal ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
                >
                  {versionLabel}
                </Badge>
                <div className="flex items-center space-x-1">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-2 w-2 ${
                          i < historicalReview.rating
                            ? 'text-green-500 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(historicalReview.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <ReviewContent content={historicalReview.content} maxLength={60} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReviewHistory;
