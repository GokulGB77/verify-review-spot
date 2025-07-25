import { useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useEntitySearch } from "@/hooks/useEntitySearch";

interface SearchBarProps {
  variant?: "hero" | "compact";
  placeholder?: string;
  showButton?: boolean;
  className?: string;
}

const SearchBar = ({ 
  variant = "hero", 
  placeholder = "Search for entities...", 
  showButton = true,
  className = ""
}: SearchBarProps) => {
  const {
    searchQuery,
    setSearchQuery,
    showSuggestions,
    setShowSuggestions,
    filteredSuggestions,
    handleSearch,
    handleSuggestionClick
  } = useEntitySearch();

  const searchInputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setShowSuggestions]);

  const isHero = variant === "hero";
  const inputHeight = isHero ? "h-12" : "h-10";
  const textSize = isHero ? "text-base sm:text-lg" : "text-sm";

  return (
    <div className={`relative ${className}`} ref={searchInputRef}>
      <div className="flex gap-2 relative">
        <div className="flex-1 relative">
          <Search className={`absolute left-3 ${isHero ? 'top-3' : 'top-2.5'} h-5 w-5 text-gray-400`} />
          <Input
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`pl-10 ${inputHeight} ${textSize}`}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            onFocus={() => {
              if (searchQuery.trim().length > 0 && filteredSuggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
          />

          {/* Suggestions Dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1">
              {filteredSuggestions.map((business) => (
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
        {showButton && (
          <Button
            onClick={handleSearch}
            size={isHero ? "lg" : "default"}
            className={`${inputHeight} w-auto px-4 ${isHero ? 'sm:px-6' : ''}`}
          >
            Search
          </Button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;