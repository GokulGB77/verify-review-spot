
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MapPin, Globe, Phone, Mail, CheckCircle, AlertTriangle } from 'lucide-react';
import ReviewCard from '@/components/ReviewCard';

const BusinessProfile = () => {
  const { id } = useParams();
  const [selectedTab, setSelectedTab] = useState('reviews');

  // Mock business data
  const business = {
    id: '1',
    name: 'Tech Academy Pro',
    category: 'EdTech',
    description: 'Leading online coding bootcamp with industry-relevant curriculum and job placement assistance. We offer comprehensive programs in full-stack development, data science, and mobile app development.',
    rating: 4.2,
    reviewCount: 156,
    verificationStatus: 'Verified',
    location: 'Mumbai, Maharashtra',
    website: 'https://techacademypro.com',
    phone: '+91 98765 43210',
    email: 'contact@techacademypro.com',
    hasSubscription: true,
    foundedYear: 2018,
    employeeCount: '50-100',
    programs: ['Full Stack Development', 'Data Science', 'Mobile App Development', 'UI/UX Design']
  };

  // Mock reviews data
  const reviews = [
    {
      id: '1',
      userName: 'Rahul S.',
      rating: 5,
      reviewText: 'Excellent bootcamp! The curriculum is very practical and industry-focused. The instructors are experienced professionals who provide great mentorship. I got placed in a top tech company within 3 months of completion.',
      verificationLevel: 'Verified Graduate' as const,
      proofProvided: true,
      upvotes: 24,
      downvotes: 2,
      createdAt: '2 weeks ago',
      businessResponse: 'Thank you Rahul for your wonderful feedback! We\'re thrilled to hear about your successful placement. Best wishes for your career ahead!',
      businessResponseDate: '1 week ago'
    },
    {
      id: '2',
      userName: 'Priya M.',
      rating: 4,
      reviewText: 'Good program overall. The content is comprehensive and well-structured. However, I felt the pace was a bit fast for beginners. The career support team is very helpful and responsive.',
      verificationLevel: 'Verified Graduate' as const,
      proofProvided: true,
      upvotes: 18,
      downvotes: 5,
      createdAt: '1 month ago'
    },
    {
      id: '3',
      userName: 'Anonymous User',
      rating: 2,
      reviewText: 'Not satisfied with the quality of instruction. Some instructors seemed inexperienced and the course material was outdated. Customer service was also unresponsive to my concerns.',
      verificationLevel: 'Unverified' as const,
      proofProvided: false,
      upvotes: 8,
      downvotes: 15,
      createdAt: '2 months ago',
      businessResponse: 'We apologize for your experience. We have recently updated our curriculum and instructor training program. Please contact us at support@techacademypro.com to discuss your concerns.',
      businessResponseDate: '2 months ago'
    }
  ];

  const ratingDistribution = [
    { stars: 5, count: 78, percentage: 50 },
    { stars: 4, count: 47, percentage: 30 },
    { stars: 3, count: 16, percentage: 10 },
    { stars: 2, count: 9, percentage: 6 },
    { stars: 1, count: 6, percentage: 4 }
  ];

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
                    {business.verificationStatus}
                  </Badge>
                  {business.hasSubscription && (
                    <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                      Trusted by Review Spot
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-lg mb-4">{business.category}</CardDescription>
                <p className="text-gray-700 mb-4">{business.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {business.location}
                  </div>
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-2" />
                    <a href={business.website} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                      {business.website}
                    </a>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    {business.phone}
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    {business.email}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 lg:mt-0 lg:ml-8 text-center">
                <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                  <div className="text-4xl font-bold text-gray-900 mb-2">{business.rating}</div>
                  <div className="flex items-center justify-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(business.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-gray-600">{business.reviewCount} reviews</div>
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
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} {...review} />
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Button variant="outline">Load More Reviews</Button>
                </div>
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
                      <div><span className="font-medium">Founded:</span> {business.foundedYear}</div>
                      <div><span className="font-medium">Company Size:</span> {business.employeeCount} employees</div>
                      <div><span className="font-medium">Industry:</span> {business.category}</div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Programs Offered</h3>
                    <div className="flex flex-wrap gap-2">
                      {business.programs.map((program) => (
                        <Badge key={program} variant="outline">
                          {program}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-700">{business.description}</p>
                </div>
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
                      <span className="font-semibold">{business.reviewCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Verified Reviews</span>
                      <span className="font-semibold">143 (92%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Response Rate</span>
                      <span className="font-semibold">89%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Response Time</span>
                      <span className="font-semibold">2.3 days</span>
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
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Business Claimed</span>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Premium Member</span>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Open Disputes</span>
                      <span className="text-sm text-gray-600">None</span>
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
