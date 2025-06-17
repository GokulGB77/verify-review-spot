
import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from 'lucide-react';
import BusinessCard from '@/components/BusinessCard';
import SearchFilters from '@/components/SearchFilters';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const SearchResults = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  
  // Mock data for development
  const mockBusinesses = [
    {
      id: '1',
      name: 'Tech Academy Pro',
      category: 'EdTech',
      description: 'Leading online coding bootcamp with industry-relevant curriculum and job placement assistance.',
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
      description: 'Comprehensive digital marketing and web development courses with hands-on projects.',
      rating: 3.8,
      reviewCount: 89,
      verificationStatus: 'Claimed' as const,
      location: 'Delhi, NCR',
      website: 'https://digitalskills.in'
    },
    {
      id: '3',
      name: 'Career Boost Academy',
      category: 'EdTech',
      description: 'Professional development and career guidance platform for working professionals.',
      rating: 2.1,
      reviewCount: 234,
      verificationStatus: 'Unclaimed' as const,
      location: 'Bangalore, Karnataka',
      isSponsored: true
    }
  ];

  const handleSearch = () => {
    console.log('Searching for:', searchQuery, 'with filters:', filters);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-blue-600">Review Spot</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost">Sign In</Button>
              <Button>Write Review</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search for institutes, courses, or services..."
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
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden lg:block w-80">
            <SearchFilters onFiltersChange={setFilters} activeFilters={filters} />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <SearchFilters onFiltersChange={setFilters} activeFilters={filters} />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Results Header */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Found {mockBusinesses.length} results
              </h2>
              <p className="text-gray-600">
                Showing verified reviews for educational institutions
              </p>
            </div>

            {/* Results Grid */}
            <div className="space-y-4">
              {mockBusinesses.map((business) => (
                <BusinessCard key={business.id} {...business} />
              ))}
            </div>

            {/* Pagination placeholder */}
            <div className="mt-8 text-center">
              <Button variant="outline">
                Load More Results
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
