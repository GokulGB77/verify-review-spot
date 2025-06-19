
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { X } from 'lucide-react';
import { useState } from 'react';

interface SearchFiltersProps {
  onFiltersChange: (filters: any) => void;
  activeFilters: any;
}

const SearchFilters = ({ onFiltersChange, activeFilters }: SearchFiltersProps) => {
  const [localFilters, setLocalFilters] = useState({
    category: '',
    rating: [0],
    verificationLevel: [],
    location: '',
    sortBy: 'relevance',
    ...activeFilters
  });

  const categories = [
    'EdTech',
    'Education',
    'Online Courses',
    'Universities',
    'Coaching Institutes',
    'Skill Development',
    'Certification Programs'
  ];

  const verificationLevels = [
    'Verified Graduate',
    'Verified Employee',
    'Verified User',
    'Unverified'
  ];

  const locations = [
    'Mumbai',
    'Delhi',
    'Bangalore',
    'Hyderabad',
    'Chennai',
    'Pune',
    'Kolkata',
    'Online'
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'rating-high', label: 'Highest Rated' },
    { value: 'rating-low', label: 'Lowest Rated' },
    { value: 'reviews-most', label: 'Most Reviews' },
    { value: 'recent', label: 'Most Recent' }
  ];

  const updateFilter = (key: string, value: any) => {
    // Convert "all" values back to empty strings for filtering logic
    const filterValue = value === 'all-categories' || value === 'all-locations' ? '' : value;
    const newFilters = { ...localFilters, [key]: filterValue };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const removeFilter = (key: string, value?: any) => {
    let newFilters = { ...localFilters };
    
    if (key === 'verificationLevel' && value) {
      newFilters[key] = newFilters[key].filter((item: string) => item !== value);
    } else if (key === 'rating') {
      newFilters[key] = [0];
    } else {
      newFilters[key] = '';
    }
    
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    const resetFilters = {
      category: '',
      rating: [0],
      verificationLevel: [],
      location: '',
      sortBy: 'relevance'
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const hasActiveFilters = localFilters.category || 
    localFilters.rating[0] > 0 || 
    localFilters.verificationLevel.length > 0 || 
    localFilters.location || 
    localFilters.sortBy !== 'relevance';

  return (
    <div className="space-y-6">
      {/* Active Filters */}
      {hasActiveFilters && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Active Filters</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {localFilters.category && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Category: {localFilters.category}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeFilter('category')}
                  />
                </Badge>
              )}
              {localFilters.rating[0] > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Rating: {localFilters.rating[0]}+ stars
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeFilter('rating')}
                  />
                </Badge>
              )}
              {localFilters.verificationLevel.map((level: string) => (
                <Badge key={level} variant="secondary" className="flex items-center gap-1">
                  {level}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeFilter('verificationLevel', level)}
                  />
                </Badge>
              ))}
              {localFilters.location && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Location: {localFilters.location}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeFilter('location')}
                  />
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sort Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sort By</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={localFilters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Category</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={localFilters.category || 'all-categories'} onValueChange={(value) => updateFilter('category', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-categories">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Rating Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Minimum Rating</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Slider
              value={localFilters.rating}
              onValueChange={(value) => updateFilter('rating', value)}
              max={5}
              min={0}
              step={1}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-600">
              {localFilters.rating[0]} {localFilters.rating[0] === 1 ? 'star' : 'stars'} and above
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Level Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Verification Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {verificationLevels.map((level) => (
              <div key={level} className="flex items-center space-x-2">
                <Checkbox
                  id={level}
                  checked={localFilters.verificationLevel.includes(level)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateFilter('verificationLevel', [...localFilters.verificationLevel, level]);
                    } else {
                      updateFilter('verificationLevel', localFilters.verificationLevel.filter((item: string) => item !== level));
                    }
                  }}
                />
                <label htmlFor={level} className="text-sm font-medium">
                  {level}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Location Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Location</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={localFilters.location || 'all-locations'} onValueChange={(value) => updateFilter('location', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select location..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-locations">All Locations</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  );
};

export default SearchFilters;
