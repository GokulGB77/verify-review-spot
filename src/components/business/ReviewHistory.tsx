
import { Badge } from "@/components/ui/badge";
import { Star } from 'lucide-react';
import ReviewContent from './ReviewContent';

interface ReviewHistoryProps {
  allReviews: any[];
}

const ReviewHistory = ({ allReviews }: ReviewHistoryProps) => {
  // Sort reviews by creation date to show them in chronological order
  const sortedReviews = [...allReviews].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <div className="text-sm font-medium text-gray-700 mb-3">
        Review History
      </div>
      <div className="space-y-4">
        {sortedReviews.map((historicalReview: any) => {
          const isOriginal = !historicalReview.parent_review_id;
          const versionLabel = isOriginal ? 'Original' : `Update #${historicalReview.update_number}`;
          const formattedDate = new Date(historicalReview.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
          
          return (
            <div key={historicalReview.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs px-2 py-1 ${
                      isOriginal ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    {versionLabel}
                  </Badge>
                  <span className="text-xs text-gray-500">{formattedDate}</span>
                </div>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < historicalReview.rating
                          ? 'text-green-500 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-sm font-medium text-gray-900 ml-1">
                    {historicalReview.rating}/5
                  </span>
                </div>
              </div>
              <ReviewContent content={historicalReview.content} maxLength={100} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReviewHistory;
