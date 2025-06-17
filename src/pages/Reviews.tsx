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
import {allReviews} from '@/mock-data/mockDatas';
const Homepage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  

  const handleSearch = () => {
    console.log('Searching for:', searchQuery);
  };

  const getFilteredReviews = () => {
    let filtered = allReviews;
    
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

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
              <div className="text-2xl font-bold text-blue-600">{allReviews.length}</div>
              <div className="text-sm text-gray-600">Total Reviews</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {allReviews.filter(r => r.isVerified).length}
              </div>
              <div className="text-sm text-gray-600">Verified Reviews</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {(allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {[...new Set(allReviews.map(r => r.businessId))].length}
              </div>
              <div className="text-sm text-gray-600">Businesses</div>
            </CardContent>
          </Card>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {getFilteredReviews().map((review) => (
            <Card key={review.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Link 
                        to={`/business/${review.businessId}`}
                        className="text-lg font-semibold text-blue-600 hover:text-blue-800"
                      >
                        {review.businessName}
                      </Link>
                      <Badge variant="outline">{review.businessCategory}</Badge>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                      <MapPin className="h-3 w-3" />
                      {review.businessLocation}
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
                      {review.userBadge}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ReviewCard {...review} />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button variant="outline" size="lg">
            Load More Reviews
          </Button>
        </div>
      </div>

      <Footer/>
    </div>
  );
};

export default Homepage;
