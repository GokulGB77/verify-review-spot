
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar } from 'lucide-react';
import { useUserReviews } from '@/hooks/useReviews';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

const MyReviews = () => {
  const { user } = useAuth();
  const { data: reviews, isLoading, error } = useUserReviews();

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Please sign in to view your reviews.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading your reviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading reviews. Please try again.</p>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">You haven't written any reviews yet.</p>
        <Link to="/businesses" className="text-blue-600 hover:underline">
          Browse businesses to write your first review
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6">My Reviews</h2>
      {reviews.map((review) => (
        <Card key={review.id} className="w-full">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">
                  {review.businesses?.name || 'Unknown Business'}
                </CardTitle>
                <Badge variant="outline" className="mt-1">
                  {review.businesses?.category || 'Unknown Category'}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-semibold">{review.rating}/5</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-3 leading-relaxed">{review.content}</p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(review.created_at).toLocaleDateString()}</span>
              </div>
              {review.user_badge && (
                <Badge variant="outline" className="text-xs">
                  {review.user_badge}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MyReviews;
