import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useBusinesses } from "@/hooks/useBusinesses";

interface Business {
  entity_id: string;
  name: string;
  industry?: string;
  average_rating?: number;
  description?: string;
  category_tags?: string[];
  keywords?: string[];
}

interface HeaderSearchProps {
  onSearchStateChange?: (isOpen: boolean) => void;
}

const HeaderSearch = ({ onSearchStateChange }: HeaderSearchProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Business[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { data: businesses = [] } = useBusinesses();
  const searchInputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Don't show search on certain pages
  const hiddenPages = [
    '/',
    '/profile',
    '/admin',
    '/entity-dashboard',
    '/business-dashboard'
  ];

  const shouldHideSearch = hiddenPages.some(page => 
    location.pathname === page || 
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/entity-dashboard') ||
    location.pathname.startsWith('/business-dashboard')
  );

  // Hide search on excluded pages
  if (shouldHideSearch) {
    return null;
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
      setIsExpanded(false);
      setSearchQuery("");
    }
  };

  const filteredSuggestions = useMemo(() => {
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase();
      
      // Helper function to check if text matches query
      const matchesQuery = (text: string) => text.toLowerCase().includes(query);
      
      // Helper function to check if array contains matching item
      const arrayContainsMatch = (arr: string[] | undefined) => 
        arr?.some(item => matchesQuery(item)) || false;
      
      // Filter and score businesses
      const scoredBusinesses = businesses
        .map((business) => {
          let score = 0;
          let matchFound = false;
          
          // Exact name match gets highest priority (score 100)
          if (business.name.toLowerCase() === query) {
            score = 100;
            matchFound = true;
          }
          // Name starts with query gets high priority (score 90)
          else if (business.name.toLowerCase().startsWith(query)) {
            score = 90;
            matchFound = true;
          }
          // Name contains query gets medium-high priority (score 80)
          else if (matchesQuery(business.name)) {
            score = 80;
            matchFound = true;
          }
          // Industry matches get medium priority (score 60)
          else if (business.industry && matchesQuery(business.industry)) {
            score = 60;
            matchFound = true;
          }
          // Category tags match get medium priority (score 50)
          else if (arrayContainsMatch(business.category_tags)) {
            score = 50;
            matchFound = true;
          }
          // Keywords match get medium-low priority (score 40)
          else if (arrayContainsMatch(business.keywords)) {
            score = 40;
            matchFound = true;
          }
          // Description matches get low priority (score 30)
          else if (business.description && matchesQuery(business.description)) {
            score = 30;
            matchFound = true;
          }
          
          return matchFound ? { ...business, searchScore: score } : null;
        })
        .filter(Boolean) // Remove null values
        .sort((a, b) => b!.searchScore - a!.searchScore) // Sort by score (highest first)
        .slice(0, 5); // Show max 5 suggestions
      
      return scoredBusinesses;
    }
    return [];
  }, [searchQuery, businesses]);

  useEffect(() => {
    setSuggestions(filteredSuggestions);
  }, [filteredSuggestions]);

  useEffect(() => {
    setShowSuggestions(filteredSuggestions.length > 0 && searchQuery.trim().length > 0);
  }, [filteredSuggestions.length, searchQuery]);

  const handleSuggestionClick = (business: Business) => {
    setSearchQuery(business.name);
    setShowSuggestions(false);
    setIsExpanded(false);
    navigate(`/entities/${business.entity_id}`);
  };

  const handleExpand = () => {
    setIsExpanded(true);
    onSearchStateChange?.(true);
    // Focus input after state update
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleCollapse = () => {
    setIsExpanded(false);
    setShowSuggestions(false);
    setSearchQuery("");
    onSearchStateChange?.(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        if (isExpanded && !searchQuery.trim()) {
          handleCollapse();
        }
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded, searchQuery]);

  return (
    <div className="relative" ref={searchInputRef}>
      {!isExpanded ? (
        <button
          onClick={handleExpand}
          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              ref={inputRef}
              placeholder="Search entities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64 h-10 text-sm"
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              onFocus={() => {
                if (searchQuery.trim().length > 0 && suggestions.length > 0) {
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleCollapse}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
            aria-label="Close search"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default HeaderSearch;