
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MapPin, Globe, Phone, Mail, CheckCircle, AlertTriangle, History } from 'lucide-react';
import ReviewCard from '@/components/ReviewCard';
import { useBusiness } from '@/hooks/useBusinesses';
import { useReviews } from '@/hooks/useReviews';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/common/Header';

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

  // Helper function to ensure userBadge is a valid type
  const getValidUserBadge = (badge: string | null): 'Verified Graduate' | 'Verified Employee' | 'Verified User' | 'Unverified User' => {
    if (!badge) return 'Unverified User';
    
    const validBadges = ['Verified Graduate', 'Verified Employee', 'Verified User', 'Unverified User'];
    return validBadges.includes(badge) ? badge as any : 'Unverified User';
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
    // Sort updates by update_number to get the latest
    const sortedUpdates = data.updates.sort((a: any, b: any) => b.update_number - a.update_number);
    const latestReview = sortedUpdates.length > 0 ? sortedUpdates[0] : data.original;
    
    if (!latestReview) return null;
    
    const hasUpdates = data.updates.length > 0;
    const totalUpdates = data.updates.length;
    
    return {
      id: latestReview.id,
      userId: userId,
      userName: 'Anonymous User',
      rating: latestReview.rating,
      content: latestReview.content,
      userBadge: getValidUserBadge(latestReview.user_badge),
      proofProvided: latestReview.proof_provided || false,
      upvotes: latestReview.upvotes || 0,
      downvotes: latestReview.downvotes || 0,
      date: new Date(latestReview.created_at).toLocaleDateString(),
      businessResponse: latestReview.business_response,
      businessResponseDate: latestReview.business_response_date ? new Date(latestReview.business_response_date).toLocaleDateString() : undefined,
      hasUpdates,
      totalUpdates,
      updateNumber: latestReview.update_number || 0,
      allReviews: data.allReviews.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Rating Overview */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Rating Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {ratingDistribution.map((item) => (
                        <div key={item.stars} className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1 w-12">
                            <span className="text-sm">{item.stars}</span>
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-yellow-400 h-2 rounded-full" 
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-8">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Reviews List */}
              <div className="lg:col-span-2">
                {reviewsLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading reviews...</p>
                  </div>
                ) : transformedReviews.length > 0 ? (
                  <div className="space-y-4">
                    {transformedReviews.map((review) => (
                      <div key={review.userId} className="space-y-2">
                        {/* Latest Review */}
                        <div className="relative">
                          <ReviewCard {...review} />
                          
                          {/* Update Indicator and History Button */}
                          {review.hasUpdates && (
                            <div className="absolute top-4 right-4 flex items-center space-x-2">
                              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                                Update #{review.updateNumber}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleHistory(review.userId)}
                                className="h-8 px-2"
                              >
                                <History className="h-4 w-4 mr-1" />
                                {viewingHistory[review.userId] ? 'Hide' : 'View'} History ({review.totalUpdates + 1})
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        {/* Review History */}
                        {review.hasUpdates && viewingHistory[review.userId] && (
                          <div className="ml-8 border-l-2 border-gray-200 pl-6 space-y-4">
                            <div className="text-sm font-medium text-gray-700 mb-3">
                              Review History (oldest to newest)
                            </div>
                            {review.allReviews.map((historicalReview: any, index: number) => {
                              const transformedHistorical = {
                                id: historicalReview.id,
                                userName: 'Anonymous User',
                                rating: historicalReview.rating,
                                content: historicalReview.content,
                                userBadge: getValidUserBadge(historicalReview.user_badge),
                                proofProvided: historicalReview.proof_provided || false,
                                upvotes: historicalReview.upvotes || 0,
                                downvotes: historicalReview.downvotes || 0,
                                date: new Date(historicalReview.created_at).toLocaleDateString(),
                                businessResponse: historicalReview.business_response,
                                businessResponseDate: historicalReview.business_response_date ? new Date(historicalReview.business_response_date).toLocaleDateString() : undefined
                              };
                              
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
                                      <span className="text-xs text-gray-500">{transformedHistorical.date}</span>
                                    </div>
                                    <ReviewCard {...transformedHistorical} />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No reviews yet. Be the first to write one!</p>
                    {user ? (
                      <Button className="mt-4" asChild>
                        <Link to={`/business/${id}/write-review`}>
                          Write the First Review
                        </Link>
                      </Button>
                    ) : (
                      <Button className="mt-4" asChild>
                        <Link to="/auth">
                          Sign in to Write Review
                        </Link>
                      </Button>
                    )}
                  </div>
                )}
                {transformedReviews.length > 0 && (
                  <div className="mt-6 text-center">
                    <Button variant="outline">Load More Reviews</Button>
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
                        {transformedReviews.filter(r => r.userBadge !== 'Unverified User').length} 
                        ({transformedReviews.length > 0 ? Math.round((transformedReviews.filter(r => r.userBadge !== 'Unverified User').length / transformedReviews.length) * 100) : 0}%)
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
