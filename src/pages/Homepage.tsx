
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
import  TypingAnimation  from "@/components/ui/typing-animation";
import {
  Search,
  Shield,
  CheckCircle,
  Star,
  Users,
  TrendingUp,
  Lock,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import CTASection from "@/components/CtaSection";
import { useBusinesses } from "@/hooks/useBusinesses";
import { useReviews } from "@/hooks/useReviews";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: businesses = [] } = useBusinesses();
  const { data: allReviews = [] } = useReviews();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Navigate to search results - will implement routing later
      console.log("Searching for:", searchQuery);
    }
  };

  // Get featured reviews (latest reviews with high ratings)
  const featuredReviews = businesses
    .filter(business => business.rating && business.rating >= 4)
    .slice(0, 3)
    .map(business => ({
      id: business.id,
      businessName: business.name,
      rating: business.rating || 0,
      reviewCount: business.review_count || 0,
      verificationLevel: business.verification_status === 'Verified' ? 'Verified Business' : 'Claimed Business',
      category: business.category,
      badge: business.verification_status === 'Verified' ? 'verified' : 'claimed',
    }));

  // Get recently added entities (latest businesses)
  const recentlyAddedEntities = businesses
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3)
    .map(business => ({
      id: business.id,
      businessName: business.name,
      category: business.category,
      location: business.location || 'Location not specified',
      addedDays: Math.floor((new Date().getTime() - new Date(business.created_at).getTime()) / (1000 * 60 * 60 * 24)),
      description: business.description || 'No description available'
    }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Authentic Reviews You Can
            <span className="text-blue-600"> Trust</span>
          </h1>
          <p className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto">
            Discover verified reviews from real users. No fake reviews, no
            manipulation. Just honest experiences backed by proof.
          </p>

          <TypingAnimation />

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search for institutes, courses, or services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-lg"
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} size="lg" className="h-12">
                Search
              </Button>
            </div>
            <div className="mt-8 text-center">
              <Button
                size="lg"
                className="h-12  bg-blue-600 hover:bg-blue-800 mr-4"
              >
                Write a Review
              </Button>
              <Button
                size="lg"
                variant="outline"
                className=" h-12  hover:bg-white hover:text-blue-600"
                asChild
              >
                <Link to="/businesses">Browse All Entities</Link>
              </Button>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 ">
            <div className="flex items-center justify-center space-x-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="text-left">
                <div className="font-semibold text-gray-900">
                  Verified Users
                </div>
                <div className="text-sm text-gray-600">
                  Real identity verification
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <Lock className="h-8 w-8 text-red-500" />
              <div className="text-left">
                <div className="font-semibold text-gray-900">
                  Immutable Reviews
                </div>
                <div className="text-sm text-gray-600">
                  Can't delete, only add updates
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <Eye className="h-8 w-8 text-indigo-500" />
              <div className="text-left">
                <div className="font-semibold text-gray-900">
                  Publicly Auditable
                </div>
                <div className="text-sm text-gray-600">
                  Transparent review history
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Reviews Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Recently Reviewed
            </h2>
            <p className="text-lg text-gray-600">
              See what verified users are saying
            </p>
          </div>

          {featuredReviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredReviews.map((review) => (
                <Card
                  key={review.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {review.businessName}
                        </CardTitle>
                        <CardDescription>{review.category}</CardDescription>
                      </div>
                      <Badge
                        variant={
                          review.badge === "verified" ? "default" : "secondary"
                        }
                        className={
                          review.badge === "verified"
                            ? "bg-green-100 text-green-800"
                            : ""
                        }
                      >
                        {review.verificationLevel}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(review.rating)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold">{review.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-1" />
                      {review.reviewCount} reviews
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No featured reviews available yet.</p>
            </div>
          )}

          <div className="text-center mt-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" size="lg" asChild>
                <Link to="/reviews">View All Reviews</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Recently Added Entities Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 ">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Recently Added Entities
            </h2>
            <p className="text-lg text-gray-600">
              New businesses and organizations joining our platform
            </p>
          </div>

          {recentlyAddedEntities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentlyAddedEntities.map((entity) => (
                <Card
                  key={entity.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {entity.businessName}
                        </CardTitle>
                        <CardDescription>{entity.category}</CardDescription>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200"
                      >
                        New
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-600">
                          Added {entity.addedDays} days ago
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {entity.location}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {entity.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <Star className="h-4 w-4 mr-1 text-gray-400" />
                        Awaiting first review
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/business/${entity.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No recently added entities available.</p>
            </div>
          )}

          <div className="text-center mt-8">
            <Button variant="outline" size="lg" asChild>
              <Link to="/businesses">View All Entities</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How Review Spot Works
            </h2>
            <p className="text-lg text-gray-600">
              Simple, transparent, and trustworthy
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Verify Your Identity
              </h3>
              <p className="text-gray-600">
                Complete Aadhaar verification to ensure authentic reviews from
                real people
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Share Your Experience
              </h3>
              <p className="text-gray-600">
                Write honest reviews with optional proof of your experience or
                interaction
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Build Trust</h3>
              <p className="text-gray-600">
                Help others make informed decisions with verified, authentic
                feedback
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection/>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
