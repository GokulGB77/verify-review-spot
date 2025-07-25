import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useBusinesses } from "@/hooks/useBusinesses";

interface Business {
  entity_id: string;
  name: string;
  industry?: string;
  average_rating?: number;
  description?: string;
  category_tags?: string[];
  keywords?: string[];
  searchScore?: number;
}

export const useEntitySearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const { data: businesses = [] } = useBusinesses();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
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
    setShowSuggestions(filteredSuggestions.length > 0 && searchQuery.trim().length > 0);
  }, [filteredSuggestions.length, searchQuery]);

  const handleSuggestionClick = (business: Business) => {
    setSearchQuery(business.name);
    setShowSuggestions(false);
    navigate(`/entities/${business.entity_id}`);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setShowSuggestions(false);
  };

  return {
    searchQuery,
    setSearchQuery,
    showSuggestions,
    setShowSuggestions,
    filteredSuggestions,
    handleSearch,
    handleSuggestionClick,
    clearSearch
  };
};