
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MapPin, Globe, Phone, Mail, CheckCircle, AlertTriangle } from 'lucide-react';
import ReviewCard from '@/components/ReviewCard';
import { useBusiness } from '@/hooks/useBusinesses';
import { useReviews } from '@/hooks/useReviews';

const BusinessProfile = () => {
  const { id } = useParams();
  const [selectedTab, setSelectedTab] = useState('reviews');
  
  const { data: business, isLoading: businessLoading } = useBusiness(id || '');
  const { data: reviews = [], isLoading: reviewsLoading } = useReviews(id);

  if (businessLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-blue-600">Review Spot</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="ghost">Sign In</Button>
                <Button>Write Review</Button>
              </div>
            </div>
          </div>
        </header>

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
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-blue-600">Review Spot</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="ghost">Sign In</Button>
                <Button>Write Review</Button>
              </div>
            </div>
          </div>
        </header>

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

  // Transform reviews data for display
  const transformedReviews = reviews.map(review => ({
    id: review.id,
    userName: 'Anonymous User', // We'll implement user profiles later
    rating: review.rating,
    content: review.content,
    userBadge: getValidUserBadge(review.user_badge),
    proofProvided: review.proof_provided || false,
    upvotes: review.upvotes || 0,
    downvotes: review.downvotes || 0,
    date: new Date(review.created_at).toLocaleDateString(),
    businessResponse: review.business_response,
    businessResponseDate: review.business_response_date ? new Date(review.business_response_date).toLocaleDateString() : undefined
  }));

  // Calculate rating distribution
  const ratingCounts = [1, 2, 3, 4, 5].map(rating => 
    transformedReviews.filter(review => review.rating === rating).length
  );
  
  const totalReviews = transformedReviews.length;
  const ratingDistribution = ratingCounts.map((count, index) => ({
    stars: index + 1,
    count,
    percentage: totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0
  })).reverse();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-blue-600">Review Spot</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost">Sign In</Button>
              <Button>Write Review</Button>
            </div>
          </div>
        </div>
      </header>

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
                  <Button className="w-full mt-4">
                    Write a Review
                  </Button>
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
                      <ReviewCard key={review.id} {...review} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No reviews yet. Be the first to write one!</p>
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
