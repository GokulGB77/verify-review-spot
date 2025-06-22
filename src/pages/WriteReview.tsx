
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { Search, Star, Building, CheckCircle } from 'lucide-react';
import { useBusinesses, useBusiness } from '@/hooks/useBusinesses';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const formSchema = z.object({
  business_id: z.string().min(1, "Please select a business to review"),
  rating: z.number().min(1, "Please provide a rating").max(5),
  content: z.string().min(10, "Review must be at least 10 characters long").max(500),
  proof_provided: z.boolean().default(false),
  user_badge: z.enum(['Verified Graduate', 'Verified Employee', 'Verified User', 'Unverified User']).default('Unverified User')
});

type FormData = z.infer<typeof formSchema>;

const WriteReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: businesses = [] } = useBusinesses();
  const { data: selectedBusiness } = useBusiness(id || '');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(!id);
  const [selectedBusinessForReview, setSelectedBusinessForReview] = useState<any>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      business_id: '',
      rating: 0,
      content: '',
      proof_provided: false,
      user_badge: 'Unverified User'
    },
  });

  // Set business when coming from a specific business page
  useEffect(() => {
    if (selectedBusiness) {
      setSelectedBusinessForReview(selectedBusiness);
      form.setValue('business_id', selectedBusiness.id);
      setShowSearchResults(false);
    }
  }, [selectedBusiness, form]);

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
    form.setValue('business_id', business.id);
    setShowSearchResults(false);
    setSearchQuery('');
  };

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to write a review.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    try {
      const { error } = await supabase.from('reviews').insert({
        business_id: data.business_id,
        user_id: user.id,
        rating: data.rating,
        content: data.content.trim(),
        proof_provided: data.proof_provided,
        user_badge: data.user_badge
      });

      if (error) throw error;

      toast({
        title: "Review Submitted",
        description: "Thank you for sharing your experience!",
      });

      navigate(`/business/${data.business_id}`);
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderStarRating = (field: any) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => field.onChange(star)}
            className={`p-1 rounded transition-colors ${
              star <= field.value 
                ? 'text-yellow-400 hover:text-yellow-500' 
                : 'text-gray-300 hover:text-gray-400'
            }`}
          >
            <Star className="h-8 w-8 fill-current" />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {field.value > 0 ? `${field.value} star${field.value !== 1 ? 's' : ''}` : 'Click to rate'}
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
                    form.setValue('business_id', '');
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
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Rating */}
                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rating *</FormLabel>
                        <FormControl>
                          <div className="mt-2">
                            {renderStarRating(field)}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Review Content */}
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Review *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Share your experience... What did you like or dislike? How was the service? Any specific details that might help others?"
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {field.value.length}/500 characters (minimum 10 characters)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Verification Level */}
                  <FormField
                    control={form.control}
                    name="user_badge"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Verification Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your verification status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Verified Graduate">Verified Graduate/Alumni</SelectItem>
                            <SelectItem value="Verified Employee">Verified Employee/Staff</SelectItem>
                            <SelectItem value="Verified User">Verified User</SelectItem>
                            <SelectItem value="Unverified User">Unverified User</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Proof Provided */}
                  <FormField
                    control={form.control}
                    name="proof_provided"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I can provide proof of my experience (certificates, enrollment records, etc.)
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate(-1)}
                      disabled={form.formState.isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? 'Submitting...' : 'Submit Review'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WriteReview;
