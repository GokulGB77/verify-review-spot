import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Shield, Filter, Star, MapPin, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import ReviewCard from '@/components/ReviewCard';

const Homepage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  // Mock data for all reviews across the platform
  const allReviews = [
    {
      id: '1',
      businessId: '1',
      businessName: 'Tech Academy Pro',
      businessCategory: 'EdTech',
      userName: 'Priya Sharma',
      userBadge: 'Verified Graduate' as const,
      rating: 4,
      date: '2024-01-15',
      title: 'Excellent curriculum and job placement support',
      content: 'Completed the full-stack development course. The curriculum is up-to-date with industry standards. Got placed within 2 months of completion.',
      isVerified: true,
      proofProvided: true,
      upvotes: 23,
      downvotes: 2,
      businessLocation: 'Mumbai, Maharashtra'
    },
    {
      id: '2',
      businessId: '2',
      businessName: 'Digital Skills Institute',
      businessCategory: 'Education',
      userName: 'Rahul Kumar',
      userBadge: 'Verified User' as const,
      rating: 3,
      date: '2024-01-12',
      title: 'Good content but poor support',
      content: 'The course content is comprehensive but the support team is unresponsive. Had to wait weeks for query resolution.',
      isVerified: true,
      proofProvided: false,
      upvotes: 15,
      downvotes: 5,
      businessLocation: 'Delhi, NCR'
    },
    {
      id: '3',
      businessId: '3',
      businessName: 'Career Boost Academy',
      businessCategory: 'EdTech',
      userName: 'Sneha Patel',
      userBadge: 'Unverified User' as const,
      rating: 2,
      date: '2024-01-10',
      title: 'Overpromised and underdelivered',
      content: 'The marketing materials promised a lot but the actual course quality was disappointing. No job assistance as advertised.',
      isVerified: false,
      proofProvided: false,
      upvotes: 8,
      downvotes: 12,
      businessLocation: 'Bangalore, Karnataka'
    },
    {
      id: '4',
      businessId: '1',
      businessName: 'Tech Academy Pro',
      businessCategory: 'EdTech',
      userName: 'Amit Singh',
      userBadge: 'Verified Graduate' as const,
      rating: 5,
      date: '2024-01-08',
      title: 'Life-changing experience',
      content: 'Switched careers from marketing to tech after this course. The mentors are industry experts and provide real-world insights.',
      isVerified: true,
      proofProvided: true,
      upvotes: 31,
      downvotes: 1,
      businessLocation: 'Mumbai, Maharashtra'
    },
    {
      id: '5',
      businessId: '4',
      businessName: 'CodeMaster Institute',
      businessCategory: 'EdTech',
      userName: 'Anita Gupta',
      userBadge: 'Verified Employee' as const,
      rating: 4,
      date: '2024-01-05',
      title: 'Great for beginners',
      content: 'As someone who works in the industry, I can say their beginner courses are well-structured. Good foundation building.',
      isVerified: true,
      proofProvided: true,
      upvotes: 19,
      downvotes: 3,
      businessLocation: 'Pune, Maharashtra'
    }
  ];

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
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Review Spot</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link to="/businesses">Browse Businesses</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/search">Search</Link>
              </Button>
              <Button variant="ghost">Sign In</Button>
              <Button asChild>
                <Link to="/write-review">Write Review</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Reviews</h1>
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
    </div>
  );
};

export default Homepage;
