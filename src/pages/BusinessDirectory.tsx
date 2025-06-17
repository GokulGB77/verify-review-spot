import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Shield, Filter, Building, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import BusinessCard from '@/components/BusinessCard';

const BusinessDirectory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');

  // Mock data for businesses
  const businesses = [
    {
      id: '1',
      name: 'Tech Academy Pro',
      category: 'EdTech',
      description: 'Leading technology bootcamp offering full-stack development, data science, and AI/ML courses with guaranteed job placement assistance.',
      rating: 4.2,
      reviewCount: 156,
      verificationStatus: 'Verified' as const,
      location: 'Mumbai, Maharashtra',
      website: 'https://techacademypro.com',
      phone: '+91 98765 43210',
      hasSubscription: true
    },
    {
      id: '2',
      name: 'Digital Skills Institute',
      category: 'Education',
      description: 'Comprehensive digital marketing and business skills training institute with flexible learning options and industry partnerships.',
      rating: 3.8,
      reviewCount: 89,
      verificationStatus: 'Claimed' as const,
      location: 'Delhi, NCR',
      website: 'https://digitalskills.edu',
      phone: '+91 87654 32109',
      hasSubscription: false
    },
    {
      id: '3',
      name: 'Career Boost Academy',
      category: 'EdTech',
      description: 'Professional development and career transition programs focusing on emerging technologies and soft skills development.',
      rating: 2.1,
      reviewCount: 234,
      verificationStatus: 'Unclaimed' as const,
      location: 'Bangalore, Karnataka',
      hasSubscription: false
    },
    {
      id: '4',
      name: 'CodeMaster Institute',
      category: 'EdTech',
      description: 'Specialized coding bootcamp for beginners and professionals looking to upskill in programming languages and frameworks.',
      rating: 4.5,
      reviewCount: 127,
      verificationStatus: 'Verified' as const,
      location: 'Pune, Maharashtra',
      website: 'https://codemaster.edu',
      phone: '+91 76543 21098',
      hasSubscription: true
    },
    {
      id: '5',
      name: 'Business Leadership Hub',
      category: 'Professional Training',
      description: 'Executive education and leadership development programs for mid-level to senior management professionals.',
      rating: 4.7,
      reviewCount: 67,
      verificationStatus: 'Verified' as const,
      location: 'Hyderabad, Telangana',
      website: 'https://businessleadership.hub',
      phone: '+91 65432 10987',
      hasSubscription: true
    },
    {
      id: '6',
      name: 'Creative Arts Academy',
      category: 'Arts & Design',
      description: 'Fine arts, graphic design, and digital media courses with hands-on training and portfolio development support.',
      rating: 3.9,
      reviewCount: 43,
      verificationStatus: 'Claimed' as const,
      location: 'Chennai, Tamil Nadu',
      website: 'https://creativearts.academy',
      hasSubscription: false
    }
  ];

  const categories = ['all', 'EdTech', 'Education', 'Professional Training', 'Arts & Design'];
  const verificationStatuses = ['all', 'Verified', 'Claimed', 'Unclaimed'];

  const handleSearch = () => {
    console.log('Searching for:', searchQuery);
  };

  const getFilteredBusinesses = () => {
    let filtered = businesses;
    
    if (searchQuery.trim()) {
      filtered = filtered.filter(business => 
        business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(business => business.category === categoryFilter);
    }

    if (verificationFilter !== 'all') {
      filtered = filtered.filter(business => business.verificationStatus === verificationFilter);
    }

    return filtered;
  };

  const totalBusinesses = businesses.length;
  const verifiedBusinesses = businesses.filter(b => b.verificationStatus === 'Verified').length;
  const averageRating = (businesses.reduce((acc, b) => acc + b.rating, 0) / businesses.length).toFixed(1);
  const totalReviews = businesses.reduce((acc, b) => acc + b.reviewCount, 0);

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
                <Link to="/homepage">All Reviews</Link>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Directory</h1>
          <p className="text-lg text-gray-600">
            Discover verified businesses and read authentic reviews from real users
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search businesses, categories, or locations..."
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
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Category:</span>
              <div className="flex gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={categoryFilter === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCategoryFilter(category)}
                  >
                    {category === 'all' ? 'All Categories' : category}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Status:</span>
              <div className="flex gap-2">
                {verificationStatuses.map((status) => (
                  <Button
                    key={status}
                    variant={verificationFilter === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setVerificationFilter(status)}
                  >
                    {status === 'all' ? 'All Status' : status}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{totalBusinesses}</div>
              <div className="text-sm text-gray-600">Total Businesses</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{verifiedBusinesses}</div>
              <div className="text-sm text-gray-600">Verified Businesses</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{averageRating}</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{totalReviews}</div>
              <div className="text-sm text-gray-600">Total Reviews</div>
            </CardContent>
          </Card>
        </div>

        {/* Business Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getFilteredBusinesses().map((business) => (
            <BusinessCard key={business.id} {...business} />
          ))}
        </div>

        {getFilteredBusinesses().length === 0 && (
          <div className="text-center py-12">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No businesses found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Load More */}
        {getFilteredBusinesses().length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              Load More Businesses
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessDirectory;
