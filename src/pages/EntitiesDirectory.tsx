import { useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Search, Shield, Filter, Building, MapPin, Loader2, X } from 'lucide-react';
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from 'react-router-dom';
import BusinessCard from '@/components/BusinessCard';
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { usePaginatedEntities } from '@/hooks/usePaginatedEntities';
import { useReviews } from '@/hooks/useReviews';
import { transformReviews } from '@/utils/reviewHelpers';

const BusinessDirectory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const loadMoreButtonRef = useRef<HTMLButtonElement>(null);
  const isMobile = useIsMobile();
  
  const { 
    data, 
    isLoading, 
    error, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = usePaginatedEntities();
  
  const { data: allReviews = [] } = useReviews();

  // Flatten all pages into a single array
  const businesses = useMemo(() => {
    return data?.pages.flatMap(page => page.data) || [];
  }, [data]);

  const totalCount = data?.pages[0]?.totalCount || 0;

  // Remove automatic infinite scroll

  const verificationStatuses = ['all', 'Verified', 'Unverified'];

  const handleSearch = () => {
    console.log('Searching for:', searchQuery);
  };

  // Calculate correct ratings and review counts for each business
  const getBusinessWithCorrectStats = () => {
    // Group reviews by business first
    const reviewsByBusiness = allReviews.reduce((acc, review) => {
      const businessId = review.business_id;
      if (!acc[businessId]) {
        acc[businessId] = [];
      }
      acc[businessId].push(review);
      return acc;
    }, {} as Record<string, any[]>);

    // Calculate stats for each business using the same logic as EntityProfile
    const businessStats = Object.entries(reviewsByBusiness).reduce((acc, [businessId, businessReviews]) => {
      // Transform reviews to get latest versions (same as EntityProfile)
      const transformedReviews = transformReviews(businessReviews);
      
      // Calculate average rating and count using only the latest review from each user
      const averageRating = transformedReviews.length > 0 
        ? Number((transformedReviews.reduce((sum, review) => sum + review.rating, 0) / transformedReviews.length).toFixed(1))
        : 0;
      
      acc[businessId] = {
        average_rating: averageRating,
        review_count: transformedReviews.length
      };
      return acc;
    }, {} as Record<string, { average_rating: number, review_count: number }>);

    // Return businesses with corrected stats
    return businesses.map(business => ({
      ...business,
      average_rating: businessStats[business.entity_id]?.average_rating || 0,
      review_count: businessStats[business.entity_id]?.review_count || 0
    }));
  };

  const businessesWithCorrectStats = getBusinessWithCorrectStats();

  // Get available categories based on current filtered results (excluding category filter)
  const getAvailableCategories = () => {
    let businessesToCheck = businessesWithCorrectStats;
    
    // Apply search filter
    if (searchQuery.trim()) {
      businessesToCheck = businessesToCheck.filter(business => 
        business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (business.location as any)?.address?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply verification filter
    if (verificationFilter !== 'all') {
      const isVerified = verificationFilter === 'Verified';
      businessesToCheck = businessesToCheck.filter(business => business.is_verified === isVerified);
    }

    const uniqueCategories = new Set(
      businessesToCheck
        .map(business => business.industry)
        .filter(industry => industry && industry.trim() !== '')
    );
    return ['all', ...Array.from(uniqueCategories).sort()];
  };
  
  const availableCategories = getAvailableCategories();

  const getFilteredBusinesses = () => {
    let filtered = businessesWithCorrectStats;
    
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

    // Sort alphabetically by entity name
    filtered.sort((a, b) => a.name.localeCompare(b.name));

    return filtered;
  };

  // Calculate statistics using the same logic as EntityProfile
  const getBusinessStats = () => {
    // Transform all reviews to get only the latest from each user
    const transformedReviews = transformReviews(allReviews);

    // Calculate stats based on transformed reviews
    const totalReviews = transformedReviews.length;
    const verifiedReviews = transformedReviews.filter(r => r.mainBadge === 'Verified User').length;
    const averageRating = totalReviews > 0 
      ? (transformedReviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1) 
      : '0.0';

    return {
      totalReviews,
      verifiedReviews,
      averageRating
    };
  };

  const stats = getBusinessStats();
  const totalBusinesses = totalCount;
  const verifiedBusinesses = businesses.filter(b => b.is_verified).length;

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
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Business Directory</h1>
          <p className="text-sm md:text-lg text-gray-600">
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

          {/* Mobile Filters */}
          {isMobile ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters</span>
                {(categoryFilter !== 'all' || verificationFilter !== 'all') && (
                  <Badge variant="secondary" className="text-xs">
                    {[
                      categoryFilter !== 'all' ? 1 : 0,
                      verificationFilter !== 'all' ? 1 : 0
                    ].reduce((a, b) => a + b, 0)} active
                  </Badge>
                )}
              </div>
              
              <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[80vh]">
                  <SheetHeader>
                    <SheetTitle>Filter Businesses</SheetTitle>
                  </SheetHeader>
                  
                  <div className="space-y-6 mt-6">
                    {/* Category Filter */}
                    <div className="space-y-3">
                      <h3 className="font-medium">Category</h3>
                      <div className="flex flex-wrap gap-2">
                        {availableCategories.map((category) => (
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

                    {/* Status Filter */}
                    <div className="space-y-3">
                      <h3 className="font-medium">Verification Status</h3>
                      <div className="flex flex-wrap gap-2">
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

                    {/* Clear Filters */}
                    <div className="pt-4 border-t">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          setCategoryFilter('all');
                          setVerificationFilter('all');
                        }}
                      >
                        Clear All Filters
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          ) : (
            /* Desktop Filters */
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Category:</span>
                <div className="flex gap-2">
                  {availableCategories.map((category) => (
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
          )}
        </div>

        {/* Entity Count Display */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-gray-600">
            Showing {businesses.length} of {totalCount} entities
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <Card>
            <CardContent className="p-3 md:p-4 text-center">
              <div className="text-lg md:text-2xl font-bold text-blue-600">{totalBusinesses}</div>
              <div className="text-xs md:text-sm text-gray-600">Total Businesses</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:p-4 text-center">
              <div className="text-lg md:text-2xl font-bold text-green-600">{verifiedBusinesses}</div>
              <div className="text-xs md:text-sm text-gray-600">Verified Businesses</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:p-4 text-center">
              <div className="text-lg md:text-2xl font-bold text-yellow-600">{stats.averageRating}</div>
              <div className="text-xs md:text-sm text-gray-600">Average Rating</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:p-4 text-center">
              <div className="text-lg md:text-2xl font-bold text-purple-600">{stats.totalReviews}</div>
              <div className="text-xs md:text-sm text-gray-600">Total Reviews</div>
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

        {getFilteredBusinesses().length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No businesses found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Loading More Indicator */}
        {isFetchingNextPage && (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading more businesses...</p>
          </div>
        )}

        {/* Load More Button */}
        {hasNextPage && !isFetchingNextPage && getFilteredBusinesses().length > 0 && (
          <div className="text-center mt-8 space-y-4">
            <p className="text-sm text-gray-600">
              Showing {businesses.length} of {totalCount} entities
            </p>
            <Button 
              ref={loadMoreButtonRef}
              variant="outline" 
              size="lg"
              onClick={() => {
                const currentScrollPosition = window.scrollY;
                fetchNextPage().then(() => {
                  // Maintain scroll position after new content loads
                  setTimeout(() => {
                    window.scrollTo(0, currentScrollPosition);
                  }, 100);
                });
              }}
            >
              Load More Businesses
            </Button>
          </div>
        )}

        {/* End of results indicator */}
        {!hasNextPage && getFilteredBusinesses().length > 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">You've reached the end of the results</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessDirectory;
