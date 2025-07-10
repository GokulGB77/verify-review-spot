import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TypingAnimation from "@/components/ui/typing-animation";
import { Search, Shield, PenTool, Play } from "lucide-react";
import { useBusinesses } from "@/hooks/useBusinesses";

interface Business {
  entity_id: string;
  name: string;
  industry?: string;
  average_rating?: number;
}

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Business[]>([]);
  const navigate = useNavigate();
  const { data: businesses = [] } = useBusinesses();
  const searchInputRef = useRef<HTMLDivElement>(null);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const filtered = businesses
        .filter((business) =>
          business.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5); // Show max 5 suggestions
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, businesses]);

  const handleSuggestionClick = (business: Business) => {
    setSearchQuery(business.name);
    setShowSuggestions(false);
    navigate(`/entities/${business.entity_id}`);
  };

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
  }, []);

  return (
    <section className="pt-6 sm:pt-16 md:pt-10 pb-6 sm:pb-8 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full text-blue-700 text-sm font-medium mb-2">
          <Shield className="h-4 w-4 mr-2" />
          The only review platform that requires proof
        </div>
        <h1 className="text-5xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
          Reviews You Can
          <span className="text-blue-600"> Actually Trust</span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto">
          Discover verified reviews from real users. No fake reviews, no
          manipulation. Just honest experiences backed by proof.
        </p>

        <TypingAnimation />

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mt-6 sm:mt-8" ref={searchInputRef}>
          <div className="flex flex-col sm:flex-row gap-2 relative">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search for entities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base sm:text-lg"
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
            <Button
              onClick={handleSearch}
              size="lg"
              className="h-12 w-full sm:w-auto"
            >
              Search
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center  mt-8">
            {/* <button className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center">
              <PenTool className="h-6 w-6 mr-2" />
              <Link to="/write-review">Write A Review</Link>
            </button> */}
            <Link
              to="/write-review"
              className="border-2 border-blue-600 text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-blue-50 active:bg-blue-100 transition-colors flex items-center justify-center text-sm sm:text-base min-h-[48px] sm:min-h-[52px]"
            >
              <PenTool className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
              <span>Write A Review</span>
            </Link>
            {/* <button className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center">
              <Play className="h-5 w-5 mr-2" />
              See How It Works
            </button> */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
