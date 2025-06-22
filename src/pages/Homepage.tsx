
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Star,
  TrendingUp,
  Users,
  Building2,
  ArrowRight,
  MapPin,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import CTASection from "@/components/CtaSection";
import { useBusinesses } from "@/hooks/useBusinesses";
import { useReviews } from "@/hooks/useReviews";
import { getDisplayName, getMainBadge, getReviewSpecificBadge, transformReviews } from "@/utils/reviewHelpers";
import SingleReviewCard from "@/components/business/SingleReviewCard";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const { data: businesses = [], isLoading: businessesLoading } = useBusinesses();
  const { data: allReviews = [], isLoading: reviewsLoading } = useReviews();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Get latest 6 reviews for display
  const getLatestReviews = () => {
    // Transform all reviews using the helper function
    const transformedReviews = transformReviews(allReviews);
    
    // Sort by date and take the first 6
    return transformedReviews
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6)
      .map(review => {
        // Find the business for this review
        const business = businesses.find(b => b.id === allReviews.find(r => r.user_id === review.userId)?.business_id);
        return {
          ...review,
          businessName: business?.name || "Unknown Business",
          businessId: business?.id || "",
        };
      });
  };

  const featuredBusinesses = businesses.slice(0, 6);
  const latestReviews = getLatestReviews();

  const stats = {
    totalBusinesses: businesses.length,
    totalReviews: allReviews.length,
    verifiedReviews: allReviews.filter(review => getMainBadge(review) === 'Verified User').length,
    averageRating: allReviews.length > 0 
      ? (allReviews.reduce((sum, review) => sum + (review.rating || 0), 0) / allReviews.length).toFixed(1)
      : "0.0"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Find{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Verified
            </span>{" "}
            Reviews
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover authentic reviews from real users. Make informed decisions with our verified review platform.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search for businesses, services, or products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-lg border-2 border-gray-200 focus:border-blue-500 shadow-lg"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} size="lg" className="h-14 px-8 shadow-lg">
                Search
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.totalBusinesses}</div>
              <div className="text-gray-600">Businesses</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.totalReviews}</div>
              <div className="text-gray-600">Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{stats.verifiedReviews}</div>
              <div className="text-gray-600">Verified</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{stats.averageRating}</div>
              <div className="text-gray-600">Avg Rating</div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Recent Reviews Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Latest Reviews</h2>
              <p className="text-gray-600">See what people are saying about businesses</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/reviews">
                View All Reviews <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          {reviewsLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading reviews...</p>
            </div>
          ) : latestReviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {latestReviews.map((review) => (
                <div key={review.id}>
                  <div className="mb-2">
                    <Link 
                      to={`/business/${review.businessId}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      {review.businessName}
                    </Link>
                  </div>
                  <SingleReviewCard
                    review={review}
                    viewingHistory={{}}
                    onToggleHistory={() => {}}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border">
              <p className="text-gray-500">No reviews available yet.</p>
            </div>
          )}
        </section>

        {/* Featured Businesses */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Businesses</h2>
              <p className="text-gray-600">Discover top-rated businesses in your area</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/businesses">
                Browse All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          {businessesLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading businesses...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredBusinesses.map((business) => (
                <Card key={business.id} className="hover:shadow-lg transition-shadow group">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                          <Link to={`/business/${business.id}`}>
                            {business.name}
                          </Link>
                        </CardTitle>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="secondary">{business.category}</Badge>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600 ml-1">{business.rating?.toFixed(1) || "N/A"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      {business.location}
                    </div>
                    <p className="text-gray-700 text-sm line-clamp-2">
                      {business.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {business.review_count || 0} reviews
                      </span>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/business/${business.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>

      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
