import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Shield, Filter, Building, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import BusinessCard from '@/components/BusinessCard';
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { useBusinesses } from '@/hooks/useBusinesses';

const BusinessDirectory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const { data: businesses = [], isLoading, error } = useBusinesses();

  const categories = ['all', 'Technology', 'Education', 'Food & Beverage', 'Health & Fitness', 'Marketing', 'Beauty & Wellness', 'Retail'];
  const verificationStatuses = ['all', 'Verified', 'Unverified'];

  const handleSearch = () => {
    console.log('Searching for:', searchQuery);
  };

  const getFilteredBusinesses = () => {
    let filtered = businesses;
    
    if (searchQuery.trim()) {
      filtered = filtered.filter(business => 
        business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (business.location as any)?.address?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(business => business.industry === categoryFilter);
    }

    if (verificationFilter !== 'all') {
      const isVerified = verificationFilter === 'Verified';
      filtered = filtered.filter(business => business.is_verified === isVerified);
    }

    return filtered;
  };

  const totalBusinesses = businesses.length;
  const verifiedBusinesses = businesses.filter(b => b.is_verified).length;
  const averageRating = businesses.length > 0 ? (businesses.reduce((acc, b) => acc + (b.average_rating || 0), 0) / businesses.length).toFixed(1) : '0.0';
  const totalReviews = businesses.reduce((acc, b) => acc + (b.review_count || 0), 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-gray-500">Loading businesses...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-red-500">Error loading businesses. Please try again.</p>
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
            <BusinessCard 
              key={business.entity_id} 
              entity_id={business.entity_id}
              name={business.name}
              industry={business.industry}
              description={business.description}
              average_rating={business.average_rating}
              review_count={business.review_count}
              is_verified={business.is_verified}
              location={business.location}
              contact={business.contact}
              trust_level={business.trust_level}
              claimed_by_business={business.claimed_by_business}
            />
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
