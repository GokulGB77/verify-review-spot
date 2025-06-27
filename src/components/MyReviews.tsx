
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Calendar, History, Edit } from 'lucide-react';
import { useUserReviews } from '@/hooks/useReviews';
import { useAuth } from '@/contexts/AuthContext';
import { useEditTimer } from '@/hooks/useEditTimer';
import { Link, useNavigate } from 'react-router-dom';

const MyReviews = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: reviews, isLoading, error } = useUserReviews();
  const [viewingHistory, setViewingHistory] = useState<Record<string, boolean>>({});

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

  // Group reviews by business and get the latest version for each business
  const groupedReviews = reviews.reduce((acc, review) => {
    const businessId = review.business_id;
    
    if (!acc[businessId]) {
      acc[businessId] = {
        original: null,
        updates: [],
        allReviews: [],
        businessInfo: review.entities
      };
    }
    
    acc[businessId].allReviews.push(review);
    
    if (!review.parent_review_id) {
      acc[businessId].original = review;
    } else {
      acc[businessId].updates.push(review);
    }
    
    return acc;
  }, {} as Record<string, any>);

  // Transform grouped reviews for display
  const transformedReviews = Object.entries(groupedReviews).map(([businessId, data]) => {
    // Sort updates by update_number to get the latest
    const sortedUpdates = data.updates.sort((a: any, b: any) => b.update_number - a.update_number);
    const latestReview = sortedUpdates.length > 0 ? sortedUpdates[0] : data.original;
    
    if (!latestReview) return null;
    
    const hasUpdates = data.updates.length > 0;
    const totalUpdates = data.updates.length;
    
    return {
      businessId,
      review: latestReview,
      businessInfo: data.businessInfo,
      hasUpdates,
      totalUpdates,
      updateNumber: latestReview.update_number || 0,
      allReviews: data.allReviews.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    };
  }).filter(Boolean);

  const toggleHistory = (businessId: string) => {
    setViewingHistory(prev => ({
      ...prev,
      [businessId]: !prev[businessId]
    }));
  };

  const handleEdit = (businessId: string, reviewId: string) => {
    navigate(`/write-review?entityId=${businessId}&editReviewId=${reviewId}`);
  };

  const ReviewEditTimer = ({ review, businessId }: { review: any, businessId: string }) => {
    const { canEdit, formattedTime } = useEditTimer(review.created_at);
    
    if (!canEdit) return null;
    
    return (
      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="text-sm text-blue-700">
            You can edit this for the next {formattedTime}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(businessId, review.id)}
            className="h-7 text-sm px-3 bg-white hover:bg-blue-50"
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6">My Reviews</h2>
      {transformedReviews.map((item) => (
        <div key={item.businessId} className="space-y-2">
          {/* Latest Review */}
          <Card className="w-full relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {item.businessInfo?.name || 'Unknown Business'}
                  </CardTitle>
                  <Badge variant="outline" className="mt-1">
                    {item.businessInfo?.industry || 'Unknown Category'}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < item.review.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold">{item.review.rating}/5</span>
                  {item.hasUpdates && (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                      Update #{item.updateNumber}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-3 leading-relaxed">{item.review.content}</p>
              
              {/* Edit Timer */}
              <ReviewEditTimer review={item.review} businessId={item.businessId} />
              
              <div className="flex items-center justify-between text-sm text-gray-500 mt-3">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(item.review.created_at).toLocaleDateString()}</span>
                  </div>
                  {item.review.user_badge && (
                    <Badge variant="outline" className="text-xs">
                      {item.review.user_badge}
                    </Badge>
                  )}
                </div>
                {item.hasUpdates && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleHistory(item.businessId)}
                    className="h-8 px-2"
                  >
                    <History className="h-4 w-4 mr-1" />
                    {viewingHistory[item.businessId] ? 'Hide' : 'View'} History ({item.totalUpdates + 1})
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Review History */}
          {item.hasUpdates && viewingHistory[item.businessId] && (
            <div className="ml-8 border-l-2 border-gray-200 pl-6 space-y-4">
              <div className="text-sm font-medium text-gray-700 mb-3">
                Review History (oldest to newest)
              </div>
              {item.allReviews.map((historicalReview: any, index: number) => {
                const isOriginal = !historicalReview.parent_review_id;
                const versionLabel = isOriginal ? 'Original Review' : `Update #${historicalReview.update_number}`;
                
                return (
                  <div key={historicalReview.id} className="relative">
                    <div className="absolute -left-8 top-4 w-4 h-4 bg-gray-300 rounded-full border-2 border-white"></div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge 
                          variant="outline" 
                          className={isOriginal ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
                        >
                          {versionLabel}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(historicalReview.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < historicalReview.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium">{historicalReview.rating}/5</span>
                        </div>
                        <p className="text-sm text-gray-700">{historicalReview.content}</p>
                        
                        {/* Edit Timer for historical reviews */}
                        <ReviewEditTimer review={historicalReview} businessId={item.businessId} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MyReviews;
