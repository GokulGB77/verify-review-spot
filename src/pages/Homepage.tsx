import { useState, useEffect, useRef } from "react";
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
import TypingAnimation from "@/components/ui/typing-animation";
import {
  Search,
  Shield,
  CheckCircle,
  Star,
  Users,
  TrendingUp,
  Lock,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import CTASection from "@/components/CtaSection";
import ScrollingReviews from "@/components/ScrollingReviews";

import { useBusinesses } from "@/hooks/useBusinesses";
import { useReviews } from "@/hooks/useReviews";
import { getDisplayName } from "@/utils/reviewHelpers";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();
  const { data: businesses = [] } = useBusinesses();
  const { data: allReviews = [] } = useReviews();
  const searchInputRef = useRef(null);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  };

  // Update suggestions when search query changes
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const filtered = businesses
        .filter((business) =>
          business.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5); // Show max 5 suggestions
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, businesses]);

  const handleSuggestionClick = (business) => {
    setSearchQuery(business.name);
    setShowSuggestions(false);
    navigate(`/entities/${business.entity_id}`);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter reviews to only include those from active entities
  const activeEntityReviews = allReviews.filter((review) => {
    const business = businesses.find((b) => b.entity_id === review.business_id);
    return business && business.status === "active";
  });

  // Group reviews by user and business, showing only the latest review/update
  const getLatestReviewsGrouped = () => {
    const reviewGroups = new Map();

    activeEntityReviews.forEach((review) => {
      const key = `${review.user_id}-${review.business_id}`;

      if (!reviewGroups.has(key)) {
        reviewGroups.set(key, []);
      }

      reviewGroups.get(key).push(review);
    });

    // For each group, get the latest review (original + all updates sorted by date)
    const latestReviews = [];

    reviewGroups.forEach((reviews) => {
      // Sort by created_at to get the latest
      const sortedReviews = reviews.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      const latestReview = sortedReviews[0];
      const business = businesses.find(
        (b) => b.entity_id === latestReview.business_id
      );

      latestReviews.push({
        id: latestReview.id,
        userName: getDisplayName(latestReview),
        rating: latestReview.rating || 0,
        content: latestReview.content || "",
        businessName: business?.name || "Unknown Business",
        businessWebsite: (business?.contact as any)?.website || "",
        userBadge: latestReview.user_badge || "Unverified User",
        date: new Date(latestReview.created_at).toLocaleDateString(),
        businessCategory: business?.industry || "Business",
        isUpdate: latestReview.is_update || false,
        updateCount: reviews.filter((r) => r.is_update).length,
        created_at: latestReview.created_at,
      });
    });

    // Sort by creation date and return first 8
    return latestReviews
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 8);
  };

  // Get recent reviews with business information (grouped by user-business)
  const recentReviews = getLatestReviewsGrouped();

  // Get best entities (highest rated with minimum review count)
  const featuredReviews = businesses
    .filter(
      (business) => business.average_rating && business.average_rating >= 4
    )
    .slice(0, 3)
    .map((business) => ({
      id: business.entity_id,
      businessName: business.name,
      rating: business.average_rating || 0,
      reviewCount: business.review_count || 0,
      verificationLevel: business.is_verified
        ? "Verified Business"
        : "Claimed Business",
      category: business.industry,
      badge: business.is_verified ? "verified" : "claimed",
    }));

  // Get best entities (highest rated with minimum review count)
  const bestEntities = businesses
    .filter(
      (business) =>
        business.average_rating &&
        business.average_rating >= 4.0 &&
        business.review_count &&
        business.review_count >= 5
    )
    .sort((a, b) => {
      // Sort by rating first, then by review count
      if (b.average_rating !== a.average_rating) {
        return (b.average_rating || 0) - (a.average_rating || 0);
      }
      return (b.review_count || 0) - (a.review_count || 0);
    })
    .slice(0, 8) // Show up to 8 best entities
    .map((business) => ({
      id: business.entity_id,
      name: business.name,
      category: business.industry,
      website: (business.contact as any)?.website,
      rating: business.average_rating || 0,
      reviewCount: business.review_count || 0,
      verificationStatus: business.is_verified ? "Verified" : "Unverified",
    }));

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-red-500",
      "bg-yellow-500",
      "bg-indigo-500",
      "bg-pink-500",
      "bg-gray-500",
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            AUTHENTIC REVIEWS YOU CAN
            <span className="text-blue-600"> TRUST</span>
          </h1>
          <p className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto">
            Discover verified reviews from real users. No fake reviews, no
            manipulation. Just honest experiences backed by proof.
          </p>

          <TypingAnimation />

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12" ref={searchInputRef}>
            <div className="flex gap-2 relative">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search for entities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-lg"
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  onFocus={() => {
                    if (
                      searchQuery.trim().length > 0 &&
                      suggestions.length > 0
                    ) {
                      setShowSuggestions(true);
                    }
                  }}
                />

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1">
                    {suggestions.map((business) => (
                      <div
                        key={business.entity_id}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => handleSuggestionClick(business)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-600">
                              {business.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {business.name}
                            </div>
                            {business.industry && (
                              <div className="text-sm text-gray-500">
                                {business.industry}
                              </div>
                            )}
                          </div>
                          {business.average_rating && (
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-600">
                                {business.average_rating.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Button onClick={handleSearch} size="lg" className="h-12">
                Search
              </Button>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 mb-8">
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

        {/* Pill-shaped container */}
        <div className="flex items-center justify-center px-4 pt-4">
          <div className="flex items-center w-full max-w-10xl">
            {/* Left extending line */}
            <div className="flex-1 h-px bg-gray-300"></div>
            {/* Pill container */}

            <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-full px-8 py-4 mx-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-center whitespace-nowrap">
                <span className="text-gray-700 text-sm font-medium mr-2">
                  Tried something new — maybe a course or a product?
                </span>
                <Link
                  to="/write-review"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
                >
                  Share your review.
                  <svg
                    className="ml-1 w-4 h-4 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Right extending line */}
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>
        </div>
      </section>

      {/* Recent Reviews Section */}
        <Card>
          
          <CardContent className="p-0">
            <ScrollingReviews />
          </CardContent>
        </Card>

      {/* Best Entities Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Best Entities
              </h2>
              <p className="text-lg text-gray-600">
                Top-rated businesses and organizations trusted by users
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/businesses">See more</Link>
            </Button>
          </div>

          {bestEntities.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestEntities.map((entity) => (
                <Link key={entity.id} to={`/business/${entity.id}`}>
                  <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Entity Icon/Logo Placeholder */}
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                          <span className="text-2xl font-bold text-blue-600">
                            {entity.name.charAt(0).toUpperCase()}
                          </span>
                        </div>

                        {/* Entity Name */}
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
                            {entity.name}
                          </h3>
                          {entity.website && (
                            <p className="text-sm text-blue-600 truncate">
                              {entity.website
                                .replace(/^https?:\/\//, "")
                                .replace(/^www\./, "")}
                            </p>
                          )}
                        </div>

                        {/* Rating */}
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(entity.rating)
                                  ? "text-green-500 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                          <span className="font-semibold text-sm ml-2">
                            {entity.rating.toFixed(1)}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({entity.reviewCount})
                          </span>
                        </div>

                        {/* Category and Verification */}
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs">
                            {entity.category}
                          </Badge>
                          {entity.verificationStatus === "Verified" && (
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200 text-xs"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-50 rounded-lg p-8">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No top-rated entities yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Be the first to review and help others discover great
                  businesses!
                </p>
                <Button asChild>
                  <Link to="/write-review">Write a Review</Link>
                </Button>
              </div>
            </div>
          )}
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
                Complete PAN verification to ensure authentic reviews from real
                people
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
      <CTASection />
    </div>
  );
};

export default Index;
