
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from 'lucide-react';
import BusinessCard from '@/components/BusinessCard';
import SearchFilters from '@/components/SearchFilters';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useBusinesses } from '@/hooks/useBusinesses';
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const { data: businesses = [], isLoading, error } = useBusinesses();

  // Get search query from URL on component mount
  useEffect(() => {
    const queryFromUrl = searchParams.get('q');
    if (queryFromUrl) {
      setSearchQuery(queryFromUrl);
    }
  }, [searchParams]);

  const handleSearch = () => {
    console.log('Searching for:', searchQuery, 'with filters:', filters);
  };

  // Filter businesses based on search query
  const filteredBusinesses = businesses.filter(business => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      business.name.toLowerCase().includes(query) ||
      business.category.toLowerCase().includes(query) ||
      (business.description && business.description.toLowerCase().includes(query)) ||
      (business.location && business.location.toLowerCase().includes(query))
    );
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center py-12">
            <p className="text-gray-500">Loading search results...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center py-12">
            <p className="text-red-500">Error loading search results. Please try again.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

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
                {searchQuery ? `Search results for "${searchQuery}"` : 'All entities'}
              </h2>
              <p className="text-gray-600">
                Found {filteredBusinesses.length} result{filteredBusinesses.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Results Grid */}
            {filteredBusinesses.length > 0 ? (
              <div className="space-y-4">
                {filteredBusinesses.map((business) => (
                  <BusinessCard key={business.id} {...business} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  {searchQuery 
                    ? `No entities found matching "${searchQuery}". Try adjusting your search terms.`
                    : 'No entities found.'
                  }
                </p>
              </div>
            )}

            {/* Pagination placeholder */}
            {filteredBusinesses.length > 0 && (
              <div className="mt-8 text-center">
                <Button variant="outline">
                  Load More Results
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default SearchResults;
