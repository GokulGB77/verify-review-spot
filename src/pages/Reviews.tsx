
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Shield, Filter, Star, MapPin, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import ReviewCard from '@/components/ReviewCard';
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { useReviews } from '@/hooks/useReviews';
import { useBusinesses } from '@/hooks/useBusinesses';

const Homepage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  
  const { data: allReviews = [], isLoading: reviewsLoading } = useReviews();
  const { data: businesses = [] } = useBusinesses();

  const handleSearch = () => {
    console.log('Searching for:', searchQuery);
  };

  // Helper function to get display name from profile
  const getDisplayName = (review: any) => {
    if (review.profiles?.display_name_preference === 'real_name' && review.profiles?.full_name) {
      return review.profiles.full_name;
    } else if (review.profiles?.pseudonym) {
      return review.profiles.pseudonym;
    }
    return 'Anonymous Reviewer';
  };

  // Helper function to get main badge
  const getMainBadge = (review: any): 'Verified User' | 'Unverified User' => {
    // First check profiles main_badge, then fallback to user_badge
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

  // Helper function to format location
  const formatLocation = (location: any) => {
    if (!location) return 'Location not specified';
    if (typeof location === 'string') return location;
    if (typeof location === 'object') {
      const parts = [];
      if (location.city) parts.push(location.city);
      if (location.state) parts.push(location.state);
      if (location.country) parts.push(location.country);
      return parts.length > 0 ? parts.join(', ') : 'Location not specified';
    }
    return 'Location not specified';
  };

  // Create a map of business ID to business details for easy lookup
  const businessMap = businesses.reduce((acc, business) => {
    acc[business.entity_id] = business;
    return acc;
  }, {} as Record<string, any>);

  const getFilteredReviews = () => {
    let filtered = allReviews.map(review => {
      const business = businessMap[review.business_id];
      const displayName = getDisplayName(review);
      const mainBadge = getMainBadge(review);
      const reviewSpecificBadge = getReviewSpecificBadge(review);
      
      return {
        id: review.id,
        businessId: review.business_id,
        businessName: business?.name || 'Unknown Business',
        businessCategory: business?.industry || 'Unknown Category',
        businessLocation: formatLocation(business?.location),
        userName: displayName,
        mainBadge: mainBadge,
        reviewSpecificBadge: reviewSpecificBadge,
        rating: review.rating,
        date: new Date(review.created_at).toLocaleDateString(),
        title: `Review for ${business?.name || 'Business'}`,
        content: review.content,
        isVerified: mainBadge === 'Verified User',
        proofProvided: !!review.proof_url,
        upvotes: review.upvotes || 0,
        downvotes: review.downvotes || 0,
        pseudonym: review.profiles?.pseudonym,
      };
    });
    
    if (searchQuery.trim()) {
      filtered = filtered.filter(review => 
        review.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort reviews
    switch (sortBy) {
      case 'recent':
        return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      case 'rating-high':
        return filtered.sort((a, b) => b.rating - a.rating);
      case 'rating-low':
        return filtered.sort((a, b) => a.rating - b.rating);
      case 'helpful':
        return filtered.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
      default:
        return filtered;
    }
  };

  const filteredReviews = getFilteredReviews();
  const verifiedReviews = filteredReviews.filter(r => r.isVerified);
  const averageRating = filteredReviews.length > 0 
    ? (filteredReviews.reduce((acc, r) => acc + r.rating, 0) / filteredReviews.length).toFixed(1) 
    : '0.0';
  const uniqueBusinesses = [...new Set(filteredReviews.map(r => r.businessId))].length;

  if (reviewsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-gray-500">Loading reviews...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Feed</h1>
          <p className="text-lg text-gray-600">
            Browse verified reviews from real users across all platforms
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search reviews, businesses, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} size="lg" className="h-12">
              Search
            </Button>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant={sortBy === 'recent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('recent')}
              >
                Most Recent
              </Button>
              <Button
                variant={sortBy === 'rating-high' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('rating-high')}
              >
                Highest Rated
              </Button>
              <Button
                variant={sortBy === 'rating-low' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('rating-low')}
              >
                Lowest Rated
              </Button>
              <Button
                variant={sortBy === 'helpful' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('helpful')}
              >
                Most Helpful
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{filteredReviews.length}</div>
              <div className="text-sm text-gray-600">Total Reviews</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {verifiedReviews.length}
              </div>
              <div className="text-sm text-gray-600">Verified Reviews</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {averageRating}
              </div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {uniqueBusinesses}
              </div>
              <div className="text-sm text-gray-600">Businesses</div>
            </CardContent>
          </Card>
        </div>

        {/* Reviews List */}
        {filteredReviews.length > 0 ? (
          <div className="space-y-6">
            {filteredReviews.map((review) => (
              <Card key={review.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Link 
                          to={`/entities/${review.businessId}`}
                          className="text-lg font-semibold text-blue-600 hover:text-blue-800"
                        >
                          {review.businessName}
                        </Link>
                        <Badge variant="outline">{review.businessCategory}</Badge>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                        <MapPin className="h-3 w-3" />
                        <span>{review.businessLocation}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {review.isVerified && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      <Badge 
                        variant={review.isVerified ? 'default' : 'secondary'}
                        className={review.isVerified ? 'bg-green-100 text-green-800' : ''}
                      >
                        {review.mainBadge}
                      </Badge>
                      {review.reviewSpecificBadge && (
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                          {review.reviewSpecificBadge}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ReviewCard {...review} />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {businesses.length === 0 
                ? "No reviews available. Add a business and write the first review!"
                : "No reviews found matching your criteria."
              }
            </p>
            {businesses.length > 0 && (
              <Button className="mt-4" asChild>
                <Link to="/write-review">Write the First Review</Link>
              </Button>
            )}
          </div>
        )}

        {/* Load More */}
        {filteredReviews.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              Load More Reviews
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Homepage;
