
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Shield, CheckCircle, Star, Users, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const featuredReviews = [
    {
      id: 1,
      businessName: "Tech Academy Pro",
      rating: 4.2,
      reviewCount: 156,
      verificationLevel: "Verified Graduate",
      category: "EdTech",
      badge: "verified"
    },
    {
      id: 2,
      businessName: "Digital Skills Institute",
      rating: 3.8,
      reviewCount: 89,
      verificationLevel: "Verified User",
      category: "Education",
      badge: "verified"
    },
    {
      id: 3,
      businessName: "Career Boost Academy",
      rating: 2.1,
      reviewCount: 234,
      verificationLevel: "Mixed Verification",
      category: "EdTech",
      badge: "mixed"
    }
  ];

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Navigate to search results - will implement routing later
      console.log('Searching for:', searchQuery);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Review Spot</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost">For Businesses</Button>
              <Button variant="ghost">Sign In</Button>
              <Button>Get Started</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Authentic Reviews You Can
            <span className="text-blue-600"> Trust</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Discover verified reviews from real users. No fake reviews, no manipulation. 
            Just honest experiences backed by proof.
          </p>

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
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} size="lg" className="h-12">
                Search
              </Button>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="flex items-center justify-center space-x-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="text-left">
                <div className="font-semibold text-gray-900">Aadhaar Verified</div>
                <div className="text-sm text-gray-600">Real identity verification</div>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <Shield className="h-8 w-8 text-blue-500" />
              <div className="text-left">
                <div className="font-semibold text-gray-900">Proof Required</div>
                <div className="text-sm text-gray-600">Document verification</div>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div className="text-left">
                <div className="font-semibold text-gray-900">Transparent</div>
                <div className="text-sm text-gray-600">Unmanipulated results</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Reviews Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Recently Reviewed</h2>
            <p className="text-lg text-gray-600">See what verified users are saying</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredReviews.map((review) => (
              <Card key={review.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{review.businessName}</CardTitle>
                      <CardDescription>{review.category}</CardDescription>
                    </div>
                    <Badge 
                      variant={review.badge === 'verified' ? 'default' : 'secondary'}
                      className={review.badge === 'verified' ? 'bg-green-100 text-green-800' : ''}
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
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-semibold">{review.rating}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-1" />
                    {review.reviewCount} reviews
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              View All Reviews
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How Review Spot Works</h2>
            <p className="text-lg text-gray-600">Simple, transparent, and trustworthy</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Verify Your Identity</h3>
              <p className="text-gray-600">
                Complete Aadhaar verification to ensure authentic reviews from real people
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Share Your Experience</h3>
              <p className="text-gray-600">
                Write honest reviews with optional proof of your experience or interaction
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Build Trust</h3>
              <p className="text-gray-600">
                Help others make informed decisions with verified, authentic feedback
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Share Your Experience?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of verified users making the review ecosystem more trustworthy
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Write a Review
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600">
              Register Your Business
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-6 w-6" />
              <span className="text-xl font-bold">Review Spot</span>
            </div>
            <p className="text-gray-400">
              Building trust through verified, authentic reviews
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">For Users</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/search" className="hover:text-white">Search Reviews</Link></li>
              <li><Link to="/write-review" className="hover:text-white">Write a Review</Link></li>
              <li><Link to="/verify" className="hover:text-white">Get Verified</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">For Businesses</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/business/register" className="hover:text-white">Register Business</Link></li>
              <li><Link to="/business/dashboard" className="hover:text-white">Business Dashboard</Link></li>
              <li><Link to="/business/pricing" className="hover:text-white">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/help" className="hover:text-white">Help Center</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
              <li><Link to="/legal" className="hover:text-white">Legal Assistance</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; 2024 Review Spot. All rights reserved. | Privacy Policy | Terms of Service</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
