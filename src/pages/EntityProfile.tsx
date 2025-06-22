import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MapPin, Globe, Phone, Mail, CheckCircle, AlertTriangle, History, MessageSquare } from 'lucide-react';
import { useBusiness } from '@/hooks/useBusinesses';
import { useReviews } from '@/hooks/useReviews';
import { useAuth } from '@/contexts/AuthContext';

const BusinessProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('reviews');
  const [viewingHistory, setViewingHistory] = useState<Record<string, boolean>>({});
  
  const { data: business, isLoading: businessLoading } = useBusiness(id || '');
  const { data: reviews = [], isLoading: reviewsLoading } = useReviews(id);

  if (businessLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center py-12">
            <p className="text-gray-500">Loading business profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center py-12">
            <p className="text-red-500">Business not found.</p>
          </div>
        </div>
      </div>
    );
  }

  // Helper function to get main badge from profiles or review
  const getMainBadge = (review: any): 'Verified User' | 'Unverified User' => {
    const profileBadge = review.profiles?.main_badge;
    const userBadge = review.user_badge;
    
    if (profileBadge === 'Verified User') return 'Verified User';
    if (userBadge === 'Verified User') return 'Verified User';
    return 'Unverified User';
  };

  // Helper function to get review-specific badge
  const getReviewSpecificBadge = (review: any): 'Verified Employee' | 'Verified Student' | null => {
    const specificBadge = review.review_specific_badge;
    if (specificBadge === 'Verified Employee' || specificBadge === 'Verified Student') {
      return specificBadge;
    }
    return null;
  };

  // Helper function to get display name
  const getDisplayName = (review: any) => {
    if (review.profiles?.display_name_preference === 'real_name' && review.profiles?.full_name) {
      return review.profiles.full_name;
    } else if (review.profiles?.pseudonym) {
      return review.profiles.pseudonym;
    }
    return 'Anonymous User';
  };

  // Group reviews by user and get the latest version for each user
  const groupedReviews = reviews.reduce((acc, review) => {
    const userId = review.user_id;
    
    if (!acc[userId]) {
      acc[userId] = {
        original: null,
        updates: [],
        allReviews: []
      };
    }
    
    acc[userId].allReviews.push(review);
    
    if (!review.parent_review_id) {
      acc[userId].original = review;
    } else {
      acc[userId].updates.push(review);
    }
    
    return acc;
  }, {} as Record<string, any>);

  // Transform grouped reviews for display
  const transformedReviews = Object.entries(groupedReviews).map(([userId, data]) => {
    const sortedUpdates = data.updates.sort((a: any, b: any) => b.update_number - a.update_number);
    const latestReview = sortedUpdates.length > 0 ? sortedUpdates[0] : data.original;
    
    if (!latestReview) return null;
    
    const hasUpdates = data.updates.length > 0;
    const totalUpdates = data.updates.length;
    
    return {
      id: latestReview.id,
      userId: userId,
      userName: getDisplayName(latestReview),
      rating: latestReview.rating,
      content: latestReview.content,
      mainBadge: getMainBadge(latestReview),
      reviewSpecificBadge: getReviewSpecificBadge(latestReview),
      proofProvided: latestReview.proof_provided || false,
      upvotes: latestReview.upvotes || 0,
      downvotes: latestReview.downvotes || 0,
      date: new Date(latestReview.created_at).toLocaleDateString(),
      businessResponse: latestReview.business_response,
      businessResponseDate: latestReview.business_response_date ? new Date(latestReview.business_response_date).toLocaleDateString() : undefined,
      hasUpdates,
      totalUpdates,
      updateNumber: latestReview.update_number || 0,
      allReviews: data.allReviews.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    };
  }).filter(Boolean);

  // Calculate rating distribution using all individual reviews
  const allIndividualReviews = reviews.map(review => ({
    rating: review.rating
  }));
  
  const ratingCounts = [1, 2, 3, 4, 5].map(rating => 
    allIndividualReviews.filter(review => review.rating === rating).length
  );
  
  const totalReviews = allIndividualReviews.length;
  const ratingDistribution = ratingCounts.map((count, index) => ({
    stars: index + 1,
    count,
    percentage: totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0
  })).reverse();

  const toggleHistory = (userId: string) => {
    setViewingHistory(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  // Helper function to render review content with "See more" functionality
  const ReviewContent = ({ content, maxLength = 80 }: { content: string; maxLength?: number }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const shouldTruncate = content.length > maxLength;
    
    return (
      <div>
        <p className="text-gray-700 text-xs leading-relaxed">
          {shouldTruncate && !isExpanded ? `${content.slice(0, maxLength)}...` : content}
        </p>
        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:text-blue-800 text-xs font-medium mt-1"
          >
            {isExpanded ? 'See less' : 'See more'}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Business Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <CardTitle className="text-3xl">{business.name}</CardTitle>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {business.verification_status || 'Unverified'}
                  </Badge>
                  {business.has_subscription && (
                    <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                      Trusted by Review Spot
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-lg mb-4">{business.category}</CardDescription>
                {business.description && (
                  <p className="text-gray-700 mb-4">{business.description}</p>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  {business.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {business.location}
                    </div>
                  )}
                  {business.website && (
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2" />
                      <a href={business.website} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                        {business.website}
                      </a>
                    </div>
                  )}
                  {business.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      {business.phone}
                    </div>
                  )}
                  {business.email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      {business.email}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-6 lg:mt-0 lg:ml-8 text-center">
                <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                  <div className="text-4xl font-bold text-gray-900 mb-2">{(business.rating || 0).toFixed(1)}</div>
                  <div className="flex items-center justify-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(business.rating || 0)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-gray-600">{business.review_count || 0} reviews</div>
                  {user ? (
                    <Button className="w-full mt-4" asChild>
                      <Link to={`/business/${id}/write-review`}>
                        Write a Review
                      </Link>
                    </Button>
                  ) : (
                    <Button className="w-full mt-4" asChild>
                      <Link to="/auth">
                        Sign in to Review
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="reviews" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Rating Overview */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Rating Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {ratingDistribution.map((item) => (
                      <div key={item.stars} className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1 w-12">
                          <span className="text-sm font-medium">{item.stars}</span>
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full" 
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-8 text-right">{item.count}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Reviews List */}
              <div className="lg:col-span-3">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">See what reviewers are saying</h2>
                </div>
                
                {reviewsLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading reviews...</p>
                  </div>
                ) : transformedReviews.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {transformedReviews.map((review) => (
                      <div key={review.userId} className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 h-fit">
                        {/* User Info and Rating */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                              {review.userName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center space-x-1 mb-1">
                                <span className="font-medium text-gray-900 text-xs">{review.userName}</span>
                                {review.hasUpdates && (
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-1 py-0 h-4">
                                    Update #{review.updateNumber}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center space-x-1">
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs px-1 py-0 h-4 ${
                                    review.mainBadge === 'Verified User' 
                                      ? 'bg-green-50 text-green-700 border-green-200' 
                                      : 'bg-gray-50 text-gray-600 border-gray-200'
                                  }`}
                                >
                                  {review.mainBadge === 'Verified User' && <CheckCircle className="h-2 w-2 mr-1" />}
                                  {review.mainBadge === 'Verified User' ? 'Verified' : 'Unverified'}
                                </Badge>
                                {review.reviewSpecificBadge && (
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-1 py-0 h-4">
                                    {review.reviewSpecificBadge === 'Verified Employee' ? 'Employee' : 'Student'}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-1 mb-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-2 w-2 ${
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
                        <div className="mb-2">
                          <ReviewContent content={review.content} />
                        </div>

                        {/* Business Response */}
                        {review.businessResponse && (
                          <div className="bg-gray-50 rounded p-2 mb-2 border-l-2 border-blue-400">
                            <div className="flex items-center space-x-1 mb-1">
                              <MessageSquare className="h-2 w-2 text-blue-600" />
                              <span className="text-xs font-medium text-blue-900">Business Response</span>
                              <span className="text-xs text-gray-500">{review.businessResponseDate}</span>
                            </div>
                            <p className="text-gray-700 text-xs">{review.businessResponse}</p>
                          </div>
                        )}

                        {/* Review History Button */}
                        {review.hasUpdates && (
                          <div className="pt-1 border-t border-gray-100">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleHistory(review.userId)}
                              className="text-gray-600 hover:text-gray-900 h-5 text-xs px-1"
                            >
                              <History className="h-2 w-2 mr-1" />
                              {viewingHistory[review.userId] ? 'Hide' : 'View'} History ({review.totalUpdates + 1})
                            </Button>
                          </div>
                        )}

                        {/* Review History */}
                        {review.hasUpdates && viewingHistory[review.userId] && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <div className="text-xs font-medium text-gray-700 mb-1">
                              Review History
                            </div>
                            <div className="space-y-1">
                              {review.allReviews.map((historicalReview: any, index: number) => {
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
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <p className="text-gray-500 mb-4">No reviews yet. Be the first to write one!</p>
                    {user ? (
                      <Button asChild>
                        <Link to={`/business/${id}/write-review`}>
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
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="about" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>About {business.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Company Information</h3>
                    <div className="space-y-2 text-sm">
                      {business.founded_year && (
                        <div><span className="font-medium">Founded:</span> {business.founded_year}</div>
                      )}
                      {business.employee_count && (
                        <div><span className="font-medium">Company Size:</span> {business.employee_count} employees</div>
                      )}
                      <div><span className="font-medium">Industry:</span> {business.category}</div>
                    </div>
                  </div>
                  {business.programs && business.programs.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Programs Offered</h3>
                      <div className="flex flex-wrap gap-2">
                        {business.programs.map((program: string) => (
                          <Badge key={program} variant="outline">
                            {program}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {business.description && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-gray-700">{business.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Reviews</span>
                      <span className="font-semibold">{business.review_count || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Verified Reviews</span>
                      <span className="font-semibold">
                        {transformedReviews.filter(r => r.mainBadge !== 'Unverified User').length} 
                        ({transformedReviews.length > 0 ? Math.round((transformedReviews.filter(r => r.mainBadge !== 'Unverified User').length / transformedReviews.length) * 100) : 0}%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Rating</span>
                      <span className="font-semibold">{(business.rating || 0).toFixed(1)}/5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Business Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Identity Verified</span>
                      {business.verification_status === 'Verified' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Business Claimed</span>
                      {business.verification_status !== 'Unclaimed' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Premium Member</span>
                      {business.has_subscription ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <span className="text-sm text-gray-600">No</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BusinessProfile;
