
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Search, Star, Building, CheckCircle } from 'lucide-react';
import { useBusinesses, useBusiness } from '@/hooks/useBusinesses';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ReviewFormData {
  business_id: string;
  rating: number;
  content: string;
  proof_provided: boolean;
  user_badge: string;
}

const WriteReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: businesses = [] } = useBusinesses();
  const { data: selectedBusiness } = useBusiness(id || '');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(!id);
  const [selectedBusinessForReview, setSelectedBusinessForReview] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<ReviewFormData>({
    business_id: '',
    rating: 0,
    content: '',
    proof_provided: false,
    user_badge: 'Unverified User'
  });

  // Set business when coming from a specific business page
  useEffect(() => {
    if (selectedBusiness) {
      setSelectedBusinessForReview(selectedBusiness);
      setFormData(prev => ({ ...prev, business_id: selectedBusiness.id }));
      setShowSearchResults(false);
    }
  }, [selectedBusiness]);

  // Filter businesses based on search query
  const filteredBusinesses = businesses.filter(business => {
    if (!searchQuery.trim()) return false;
    
    const query = searchQuery.toLowerCase();
    return (
      business.name.toLowerCase().includes(query) ||
      business.category.toLowerCase().includes(query) ||
      (business.description && business.description.toLowerCase().includes(query)) ||
      (business.location && business.location.toLowerCase().includes(query))
    );
  });

  const handleBusinessSelect = (business: any) => {
    setSelectedBusinessForReview(business);
    setFormData(prev => ({ ...prev, business_id: business.id }));
    setShowSearchResults(false);
    setSearchQuery('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to write a review.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    if (!formData.business_id) {
      toast({
        title: "Business Required",
        description: "Please select a business to review.",
        variant: "destructive",
      });
      return;
    }

    if (formData.rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please provide a rating for your review.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.content.trim()) {
      toast({
        title: "Review Content Required",
        description: "Please write your review.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('reviews').insert({
        business_id: formData.business_id,
        user_id: user.id,
        rating: formData.rating,
        content: formData.content.trim(),
        proof_provided: formData.proof_provided,
        user_badge: formData.user_badge
      });

      if (error) throw error;

      toast({
        title: "Review Submitted",
        description: "Thank you for sharing your experience!",
      });

      navigate(`/business/${formData.business_id}`);
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStarRating = () => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
            className={`p-1 rounded transition-colors ${
              star <= formData.rating 
                ? 'text-yellow-400 hover:text-yellow-500' 
                : 'text-gray-300 hover:text-gray-400'
            }`}
          >
            <Star className="h-8 w-8 fill-current" />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {formData.rating > 0 ? `${formData.rating} star${formData.rating !== 1 ? 's' : ''}` : 'Click to rate'}
        </span>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
            <p className="text-gray-600 mb-4">You need to be signed in to write a review.</p>
            <Button onClick={() => navigate('/auth')} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Write a Review</h1>
          <p className="text-lg text-gray-600">Share your honest experience to help others make informed decisions</p>
        </div>

        {showSearchResults ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Search for Business</CardTitle>
              <CardDescription>Find the business you want to review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search by business name, category, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {searchQuery.trim() && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredBusinesses.length > 0 ? (
                    filteredBusinesses.map((business) => (
                      <div
                        key={business.id}
                        onClick={() => handleBusinessSelect(business)}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-gray-900">{business.name}</h3>
                              {business.verification_status === 'Verified' && (
                                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{business.category}</p>
                            {business.location && (
                              <p className="text-sm text-gray-500">{business.location}</p>
                            )}
                            {business.description && (
                              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{business.description}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-1 ml-4">
                            {business.rating > 0 && (
                              <>
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <span className="text-sm font-medium">{business.rating.toFixed(1)}</span>
                                <span className="text-sm text-gray-500">({business.review_count || 0})</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No businesses found matching "{searchQuery}"</p>
                      <p className="text-sm text-gray-400 mt-1">Try adjusting your search terms</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ) : selectedBusinessForReview && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-xl font-semibold text-gray-900">{selectedBusinessForReview.name}</h3>
                    {selectedBusinessForReview.verification_status === 'Verified' && (
                      <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-600">{selectedBusinessForReview.category}</p>
                  {selectedBusinessForReview.location && (
                    <p className="text-sm text-gray-500">{selectedBusinessForReview.location}</p>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowSearchResults(true);
                    setSelectedBusinessForReview(null);
                    setFormData(prev => ({ ...prev, business_id: '' }));
                  }}
                >
                  Change Business
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedBusinessForReview && (
          <Card>
            <CardHeader>
              <CardTitle>Your Review</CardTitle>
              <CardDescription>Share your honest experience with {selectedBusinessForReview.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Rating */}
                <div>
                  <Label className="text-base font-medium">Rating *</Label>
                  <div className="mt-2">
                    {renderStarRating()}
                  </div>
                </div>

                {/* Review Content */}
                <div>
                  <Label htmlFor="content" className="text-base font-medium">Your Review *</Label>
                  <Textarea
                    id="content"
                    placeholder="Share your experience... What did you like or dislike? How was the service? Any specific details that might help others?"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    className="mt-2 min-h-[120px]"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.content.length}/500 characters (minimum 10 characters)
                  </p>
                </div>

                {/* Verification Level */}
                <div>
                  <Label className="text-base font-medium">Your Verification Status</Label>
                  <RadioGroup
                    value={formData.user_badge}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, user_badge: value }))}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Verified Graduate" id="verified-graduate" />
                      <Label htmlFor="verified-graduate">Verified Graduate/Alumni</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Verified Employee" id="verified-employee" />
                      <Label htmlFor="verified-employee">Verified Employee/Staff</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Verified User" id="verified-user" />
                      <Label htmlFor="verified-user">Verified User</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Unverified User" id="unverified" />
                      <Label htmlFor="unverified">Unverified User</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Proof Provided */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="proof"
                    checked={formData.proof_provided}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, proof_provided: !!checked }))}
                  />
                  <Label htmlFor="proof" className="text-sm">
                    I can provide proof of my experience (certificates, enrollment records, etc.)
                  </Label>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WriteReview;
