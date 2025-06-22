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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, DialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { Search, Star, Building, CheckCircle, Upload, X, MessageSquare } from 'lucide-react';
import { useBusinesses, useBusiness } from '@/hooks/useBusinesses';
import { useUserOriginalReviewForBusiness, useUserReviewUpdatesForBusiness, useCreateReview } from '@/hooks/useReviews';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const formSchema = z.object({
  business_id: z.string().min(1, "Please select a business to review"),
  rating: z.number().min(1, "Please provide a rating").max(5),
  content: z.string().min(10, "Review must be at least 10 characters long").max(500),
  proof_provided: z.boolean().default(false),
  user_badge: z.enum(['Verified Graduate', 'Verified Employee']).optional()
});

type FormData = z.infer<typeof formSchema>;

const WriteReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: businesses = [] } = useBusinesses();
  const { data: selectedBusiness } = useBusiness(id || '');
  const { data: originalReview } = useUserOriginalReviewForBusiness(id || '');
  const { data: reviewUpdates = [] } = useUserReviewUpdatesForBusiness(id || '');
  const createReviewMutation = useCreateReview();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(!id);
  const [selectedBusinessForReview, setSelectedBusinessForReview] = useState<any>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      business_id: '',
      rating: 0,
      content: '',
      proof_provided: false,
      user_badge: undefined
    },
  });

  const watchedUserBadge = form.watch('user_badge');
  const requiresProof = watchedUserBadge && ['Verified Graduate', 'Verified Employee'].includes(watchedUserBadge);

  // Set business when coming from a specific business page
  useEffect(() => {
    if (selectedBusiness) {
      setSelectedBusinessForReview(selectedBusiness);
      form.setValue('business_id', selectedBusiness.id);
      setShowSearchResults(false);
    }
  }, [selectedBusiness, form]);

  // Populate form with existing review data
  useEffect(() => {
    if (originalReview) {
      form.setValue('rating', originalReview.rating);
      form.setValue('content', originalReview.content);
      form.setValue('user_badge', (originalReview.user_badge as any) || 'Unverified User');
      form.setValue('proof_provided', originalReview.proof_provided || false);
    }
  }, [originalReview, form]);

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPG, PNG, or PDF file.",
          variant: "destructive",
        });
        return;
      }
      
      setUploadedFile(file);
      form.setValue('proof_provided', true);
    }
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
    form.setValue('proof_provided', false);
  };

  const handleSubmitAttempt = (data: FormData) => {
    if (requiresProof && !uploadedFile) {
      setShowWarningDialog(true);
      setPendingSubmit(true);
      return;
    }
    
    onSubmit(data);
  };

  const handleContinueWithoutProof = () => {
    setShowWarningDialog(false);
    setPendingSubmit(false);
    
    const formData = form.getValues();
    formData.user_badge = undefined; // Reset to default verification status
    formData.proof_provided = false;
    onSubmit(formData);
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
      let proofUrl = null;
      
      if (uploadedFile && data.proof_provided) {
        const fileExt = uploadedFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('verification-docs')
          .upload(fileName, uploadedFile);
          
        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast({
            title: "Upload Failed",
            description: "Failed to upload proof document. Please try again.",
            variant: "destructive",
          });
          return;
        }
        
        proofUrl = uploadData.path;
      }

      const isUpdate = !!originalReview;
      
      await createReviewMutation.mutateAsync({
        business_id: data.business_id,
        rating: data.rating,
        content: data.content.trim(),
        proof_provided: data.proof_provided,
        user_badge: data.user_badge || 'Unverified User', // Default to appropriate status
        proof_url: proofUrl,
        is_update: isUpdate
      });

      toast({
        title: isUpdate ? "Review Update Added" : "Review Submitted",
        description: isUpdate 
          ? "Your review update has been added successfully!" 
          : "Thank you for sharing your experience!",
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {originalReview ? 'Add Review Update' : 'Write a Review'}
          </h1>
          <p className="text-lg text-gray-600">
            {originalReview 
              ? 'Add an update to your existing review to share new experiences' 
              : 'Share your honest experience to help others make informed decisions'
            }
          </p>
        </div>

        {/* Show existing original review if it exists */}
        {originalReview && selectedBusinessForReview && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Your Original Review</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < originalReview.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold">{originalReview.rating}/5</span>
                  <Badge variant="outline">{originalReview.user_badge}</Badge>
                </div>
                <p className="text-gray-700">{originalReview.content}</p>
                <p className="text-sm text-gray-500">
                  Posted on {new Date(originalReview.created_at).toLocaleDateString()}
                </p>
              </div>

              {/* Show existing updates */}
              {reviewUpdates.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold mb-4">Previous Updates:</h4>
                  <div className="space-y-4">
                    {reviewUpdates.map((update, index) => (
                      <div key={update.id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Update #{update.update_number}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(update.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < update.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm">{update.rating}/5</span>
                        </div>
                        <p className="text-sm text-gray-700">{update.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Search for business section */}
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

        {/* Review form */}
        {selectedBusinessForReview && (
          <Card>
            <CardHeader>
              <CardTitle>
                {originalReview ? `Add Update #${reviewUpdates.length + 1}` : 'Your Review'}
              </CardTitle>
              <CardDescription>
                {originalReview 
                  ? `Add an update to your review for ${selectedBusinessForReview.name}`
                  : `Share your honest experience with ${selectedBusinessForReview.name}`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmitAttempt)} className="space-y-6">
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
                        <FormLabel>
                          {originalReview ? 'Your Update' : 'Your Review'} *
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={originalReview 
                              ? "Share what's new in your experience... Any changes since your last review? New observations?"
                              : "Share your experience... What did you like or dislike? How was the service? Any specific details that might help others?"
                            }
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

                  {/* Verification Level - Only show enhanced verification options */}
                  <FormField
                    control={form.control}
                    name="user_badge"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Enhanced Verification (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select if you want to verify additional credentials" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Verified Graduate">Verified Graduate/Alumni</SelectItem>
                            <SelectItem value="Verified Employee">Verified Employee/Staff</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Your basic verification status is determined by your PAN verification. 
                          These options are for additional credential verification that requires proof documents.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* File Upload Section - Show only if verification status requires proof */}
                  {requiresProof && (
                    <div className="space-y-4">
                      <Label>Upload Proof Document</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                        {!uploadedFile ? (
                          <div className="text-center">
                            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <div className="mb-2">
                              <Label htmlFor="proof-upload" className="cursor-pointer">
                                <span className="text-blue-600 hover:text-blue-500 font-medium">
                                  Click to upload
                                </span>
                                <span className="text-gray-500"> or drag and drop</span>
                              </Label>
                              <Input
                                id="proof-upload"
                                type="file"
                                accept=".jpg,.jpeg,.png,.pdf"
                                onChange={handleFileUpload}
                                className="hidden"
                              />
                            </div>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, PDF up to 5MB
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                                <Upload className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                                <p className="text-xs text-gray-500">
                                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={removeUploadedFile}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Proof Provided Checkbox - Show for all statuses */}
                  <FormField
                    control={form.control}
                    name="proof_provided"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={requiresProof && !uploadedFile}
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
                      {form.formState.isSubmitting 
                        ? (originalReview ? 'Adding Update...' : 'Submitting...') 
                        : (originalReview ? 'Add Update' : 'Submit Review')
                      }
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Warning Dialog */}
        <AlertDialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>No Proof Document Uploaded</AlertDialogTitle>
              <AlertDialogDescription>
                You've selected a verified status but haven't uploaded any proof document. 
                If you continue without proof, your review will be shown with your current verification status 
                (based on PAN card authentication) or as an unverified user.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setShowWarningDialog(false);
                setPendingSubmit(false);
              }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleContinueWithoutProof}>
                Continue Without Proof
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default WriteReview;
