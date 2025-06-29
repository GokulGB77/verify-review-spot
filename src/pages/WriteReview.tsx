import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Star, Search, Upload, AlertCircle, History, CheckCircle, X } from 'lucide-react';
import { useEntities } from '@/hooks/useEntities';
import { useCreateReview, useUserOriginalReviewForBusiness, useUserReviewUpdatesForBusiness, useReview } from '@/hooks/useReviews';
import ReviewContent from '@/components/business/ReviewContent';
import { useQueryClient } from '@tanstack/react-query';

interface ReviewFormData {
  businessId: string;
  businessName: string;
  rating: number;
  content: string;
  proofFile: File | null;
  reviewSpecificBadge: string;
}

interface UserProfile {
  id: string;
  pseudonym: string | null;
  pseudonym_set: boolean;
  main_badge: string | null;
  is_verified: boolean;
}

const WriteReview = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: entities = [] } = useEntities();
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
  const createReviewMutation = useCreateReview();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<ReviewFormData>({
    businessId: '',
    businessName: '',
    rating: 0,
    content: '',
    proofFile: null,
    reviewSpecificBadge: '',
  });

  // Get parameters from URL
  const entityId = searchParams.get('entityId');
  const reviewId = searchParams.get('reviewId');
  const isEdit = searchParams.get('isEdit') === 'true';

  // Fetch the review being edited if in edit mode
  const { data: editingReview, refetch: refetchEditingReview } = useReview(reviewId || '');

  // Check if user already has a review for this business
  const { data: existingReview } = useUserOriginalReviewForBusiness(formData.businessId);
  const { data: reviewUpdates = [] } = useUserReviewUpdatesForBusiness(formData.businessId);

  const isUpdate = !!existingReview && !isEdit;

  // Fetch user profile
  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  // Pre-select business if entityId is provided
  useEffect(() => {
    if (entityId && entities.length > 0) {
      const business = entities.find(b => b.entity_id === entityId);
      if (business) {
        setSelectedBusiness(business);
        setFormData(prev => ({
          ...prev,
          businessId: business.entity_id,
          businessName: business.name
        }));
      }
    }
  }, [entityId, entities]);

  // Prefill form with existing review data if editing
  useEffect(() => {
    if (isEdit && editingReview && user && editingReview.user_id === user.id) {
      setFormData(prev => ({
        ...prev,
        rating: editingReview.rating,
        content: editingReview.content,
        reviewSpecificBadge: editingReview.review_specific_badge || '',
      }));
    }
  }, [isEdit, editingReview, user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, pseudonym, pseudonym_set, main_badge, is_verified')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (profile && !profile.pseudonym_set) {
      toast({
        title: "Pseudonym Required",
        description: "Please set up your pseudonym before writing reviews.",
        variant: "destructive",
      });
      navigate('/profile');
      return;
    }
  }, [user, profile, navigate, toast]);

  const filteredEntities = entities.filter(entity => 
    entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (entity.industry && typeof entity.industry === 'string' && entity.industry.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleBusinessSelect = (business: any) => {
    setSelectedBusiness(business);
    setFormData(prev => ({
      ...prev,
      businessId: business.entity_id,
      businessName: business.name
    }));
    setSearchQuery('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);
      setFormData(prev => ({ ...prev, proofFile: file }));
    }
  };

  const handleConnectionChange = (value: string) => {
    console.log('Connection changed to:', value);
    setFormData(prev => {
      const newFormData = { ...prev, reviewSpecificBadge: value };
      // Clear file if switching to "No specific connection"
      if (value === '') {
        console.log('Clearing file due to connection change to no specific connection');
        newFormData.proofFile = null;
      }
      return newFormData;
    });
  };

  const removeFile = () => {
    console.log('Removing uploaded file');
    setFormData(prev => ({ ...prev, proofFile: null }));
  };

  const uploadFileToStorage = async (file: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated');
    
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    
    console.log('Attempting to upload file:', fileName, 'to review-proofs bucket');
    
    // First, let's check if the bucket exists and create it if it doesn't
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      throw new Error('Failed to access storage');
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === 'review-proofs');
    
    if (!bucketExists) {
      console.log('Creating review-proofs bucket');
      const { error: createBucketError } = await supabase.storage.createBucket('review-proofs', {
        public: false
      });
      
      if (createBucketError) {
        console.error('Error creating bucket:', createBucketError);
        throw new Error('Failed to create storage bucket');
      }
    }
    
    // Upload the file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('review-proofs')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error details:', {
        message: uploadError.message,
        error: uploadError
      });
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    if (!uploadData?.path) {
      throw new Error('Upload succeeded but no path returned');
    }

    console.log('File uploaded successfully to:', uploadData.path);
    return uploadData.path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Submit attempt with form data:', {
      businessId: formData.businessId,
      rating: formData.rating,
      contentLength: formData.content.length,
      hasFile: !!formData.proofFile,
      connection: formData.reviewSpecificBadge,
      isUpdate,
      isEdit
    });
    
    if (!user || !profile) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit a review.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.businessId || !formData.rating || !formData.content.trim()) {
      toast({
        title: "Incomplete Form",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (formData.content.length < 50) {
      toast({
        title: "Review too short",
        description: "Please write at least 50 characters for your review.",
        variant: "destructive",
      });
      return;
    }

    // Check if proof is required but missing
    const needsProof = formData.reviewSpecificBadge === 'Verified Employee' || formData.reviewSpecificBadge === 'Verified Student';
    
    console.log('Proof validation:', {
      needsProof,
      hasFile: !!formData.proofFile,
      connection: formData.reviewSpecificBadge
    });

    if (needsProof && !formData.proofFile) {
      toast({
        title: "Proof Required",
        description: "Please upload proof or select 'No specific connection' to proceed.",
        variant: "destructive",
      });
      return;
    }

    try {
      let proofUrl = null;

      // Upload proof file if provided
      if (formData.proofFile) {
        console.log('Starting file upload process for:', formData.proofFile.name);
        proofUrl = await uploadFileToStorage(formData.proofFile);
        console.log('File upload completed, URL:', proofUrl);
      }

      if (isEdit && editingReview) {
        // Update existing review directly
        const updateData: any = {
          rating: formData.rating,
          content: formData.content.trim(),
          review_specific_badge: formData.reviewSpecificBadge || null,
          updated_at: new Date().toISOString(),
        };

        // Add proof-related fields if file was uploaded
        if (proofUrl) {
          updateData.proof_url = proofUrl;
          updateData.proof_verified = null; // Reset verification status for new proof
          updateData.proof_verified_by = null;
          updateData.proof_verified_at = null;
          updateData.proof_rejection_reason = null;
        } else if (!formData.reviewSpecificBadge) {
          // Clear proof fields if no connection selected
          updateData.proof_url = null;
          updateData.proof_verified = null;
          updateData.proof_verified_by = null;
          updateData.proof_verified_at = null;
          updateData.proof_rejection_reason = null;
        }

        const { error } = await supabase
          .from('reviews')
          .update(updateData)
          .eq('id', editingReview.id);

        if (error) throw error;

        // Invalidate all review-related queries to force refetch with updated data
        queryClient.invalidateQueries({ queryKey: ['reviews'] });
        queryClient.invalidateQueries({ queryKey: ['review', editingReview.id] });
        queryClient.invalidateQueries({ queryKey: ['user-reviews'] });
        queryClient.invalidateQueries({ queryKey: ['entities'] });
        queryClient.invalidateQueries({ queryKey: ['entity', formData.businessId] });

        toast({
          title: "Review Updated",
          description: "Your review has been updated successfully!",
        });
      } else {
        // Submit review using the mutation (for new reviews or updates)
        const reviewData: any = {
          business_id: formData.businessId,
          rating: formData.rating,
          content: formData.content.trim(),
          proof_url: proofUrl,
          user_badge: profile.main_badge || 'Unverified User',
          review_specific_badge: formData.reviewSpecificBadge || undefined,
          is_update: isUpdate,
        };

        console.log('Submitting review with data:', reviewData);
        await createReviewMutation.mutateAsync(reviewData);

        toast({
          title: isUpdate ? "Review Update Submitted" : "Review Submitted",
          description: proofUrl 
            ? "Your review has been submitted and is pending verification!"
            : (isUpdate 
              ? "Your review update has been submitted successfully!" 
              : "Your review has been submitted successfully!"
            ),
        });
      }

      // Redirect to the entity page
      navigate(`/entities/${formData.businessId}`);
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "There was an error submitting your review. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user || !profile || (profile && !profile.pseudonym_set)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600">
              {!user ? 'Please sign in to write a review.' : 'Please set up your pseudonym before writing reviews.'}
            </p>
            <Button 
              className="mt-4" 
              onClick={() => navigate(!user ? '/auth' : '/profile')}
            >
              {!user ? 'Sign In' : 'Set Up Profile'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'Verified User':
        return 'bg-green-100 text-green-800';
      case 'Verified Employee':
        return 'bg-blue-100 text-blue-800';
      case 'Verified Student':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Check if proof upload should be shown
  const shouldShowProofUpload = formData.reviewSpecificBadge === 'Verified Employee' || formData.reviewSpecificBadge === 'Verified Student';

  // Form validation logic
  const isBasicFormValid = selectedBusiness && formData.rating > 0 && formData.content.length >= 50;
  const needsProof = shouldShowProofUpload;
  const hasRequiredProof = !needsProof || (needsProof && formData.proofFile);
  const canSubmit = isBasicFormValid && hasRequiredProof && !createReviewMutation.isPending;

  console.log('Form validation state:', {
    isBasicFormValid,
    needsProof,
    hasRequiredProof,
    hasFile: !!formData.proofFile,
    canSubmit,
    isPending: createReviewMutation.isPending
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isEdit ? 'Edit Your Review' : (isUpdate ? 'Update Your Review' : 'Write a Review')}
          </h1>
          <p className="text-lg text-gray-600">
            {isEdit 
              ? 'Make changes to your existing review'
              : (isUpdate 
                ? 'Add an update to your existing review'
                : 'Share your authentic experience and help others make informed decisions'
              )
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Business or Service</CardTitle>
              <CardDescription>
                {selectedBusiness ? 
                  (isEdit ? 'Editing review for:' : (isUpdate ? 'Updating review for:' : 'You are reviewing:'))
                  : 'Search for the business you want to review'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedBusiness ? (
                <div className="p-4 border rounded-lg bg-green-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-green-900">{selectedBusiness.name}</h3>
                      <p className="text-sm text-green-700">{selectedBusiness.industry}</p>
                    </div>
                    {!isUpdate && !isEdit && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedBusiness(null);
                          setFormData(prev => ({ ...prev, businessId: '', businessName: '' }));
                        }}
                      >
                        Change
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search for a business, service, or institution..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  {searchQuery && filteredEntities.length > 0 && (
                    <div className="border rounded-lg max-h-60 overflow-y-auto mt-2">
                      {filteredEntities.map((entity) => (
                        <div
                          key={entity.entity_id}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                          onClick={() => handleBusinessSelect(entity)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">{entity.name}</h3>
                              <p className="text-sm text-gray-600">{entity.industry}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              {entity.average_rating && (
                                <div className="flex items-center">
                                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                  <span className="text-sm ml-1">{entity.average_rating.toFixed(1)}</span>
                                </div>
                              )}
                              {entity.is_verified && (
                                <Badge variant="outline" className="bg-green-50 text-green-700">
                                  Verified
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Show existing review info if this is an update (not edit) */}
          {isUpdate && existingReview && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <History className="h-5 w-5 text-blue-500" />
                  <span>Your Review History</span>
                </CardTitle>
                <CardDescription>
                  Your complete review history for this business
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Original Review */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 text-xs px-2 py-1">
                        Original Review
                      </Badge>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < existingReview.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-medium">{existingReview.rating}/5</span>
                        <span className="text-sm text-gray-500">
                          {new Date(existingReview.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <ReviewContent content={existingReview.content} maxLength={150} />
                  </div>

                  {/* Previous Updates */}
                  {reviewUpdates.length > 0 && (
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-gray-700">
                        Previous Updates ({reviewUpdates.length})
                      </div>
                      {reviewUpdates
                        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                        .map((update, index) => (
                          <div key={update.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 text-xs px-2 py-1">
                                Update #{update.update_number || index + 1}
                              </Badge>
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < update.rating
                                          ? 'text-yellow-400 fill-current'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="font-medium">{update.rating}/5</span>
                                <span className="text-sm text-gray-500">
                                  {new Date(update.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <ReviewContent content={update.content} maxLength={150} />
                          </div>
                        ))}
                    </div>
                  )}

                  <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded">
                    You're about to add Update #{reviewUpdates.length + 1} to your review history
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rating */}
          <Card>
            <CardHeader>
              <CardTitle>
                {isEdit ? 'Updated Rating' : (isUpdate ? 'Updated Rating' : 'Overall Rating')}
              </CardTitle>
              <CardDescription>
                {isEdit 
                  ? 'Update your rating for this experience'
                  : (isUpdate 
                    ? 'How would you rate your experience now?' 
                    : 'How would you rate your overall experience?'
                  )
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    type="button"
                    key={rating}
                    onClick={() => setFormData(prev => ({ ...prev, rating }))}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        rating <= formData.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-3 text-lg font-medium">
                  {formData.rating > 0 && (
                    <>
                      {formData.rating} star{formData.rating !== 1 ? 's' : ''}
                    </>
                  )}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Review Content */}
          <Card>
            <CardHeader>
              <CardTitle>
                {isEdit ? 'Your Review' : (isUpdate ? 'Your Update' : 'Your Review')}
              </CardTitle>
              <CardDescription>
                {isEdit 
                  ? 'Update your review content'
                  : (isUpdate 
                    ? 'What has changed since your last review?' 
                    : 'Share your detailed experience. Be honest and constructive.'
                  )
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder={isEdit 
                  ? "Update your review with new thoughts or experiences..."
                  : (isUpdate 
                    ? "What's new? Have they improved? What changes have you noticed since your last review?"
                    : "Describe your experience with this business or service. What went well? What could be improved? Include specific details that would help others make informed decisions."
                  )
                }
                rows={6}
                className="w-full"
              />
              <p className="text-sm text-gray-500 mt-2">
                Minimum 50 characters. Current: {formData.content.length}
              </p>
            </CardContent>
          </Card>

          {/* Review-Specific Badge */}
          <Card>
            <CardHeader>
              <CardTitle>Your Connection (Optional)</CardTitle>
              <CardDescription>
                If applicable, specify your relationship to this business
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={formData.reviewSpecificBadge}
                onValueChange={handleConnectionChange}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="" id="none" />
                  <Label htmlFor="none">No specific connection</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Verified Employee" id="employee" />
                  <Label htmlFor="employee">I work/worked here</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Verified Student" id="student" />
                  <Label htmlFor="student">I'm a student/alumni</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Proof Upload - Show when specific connection is selected */}
          {shouldShowProofUpload && (
            <Card>
              <CardHeader>
                <CardTitle>Supporting Evidence (Required)</CardTitle>
                <CardDescription>
                  Upload proof of your experience (receipts, screenshots, certificates, etc.)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {!formData.proofFile ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <Label htmlFor="proof-upload" className="cursor-pointer">
                        <span className="text-blue-600 font-medium">Click to upload</span>
                        <span className="text-gray-600"> or drag and drop</span>
                      </Label>
                      <Input
                        id="proof-upload"
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*,.pdf,.doc,.docx"
                        className="hidden"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        PNG, JPG, PDF up to 5MB
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="text-sm font-medium text-green-800">
                              {formData.proofFile.name}
                            </p>
                            <p className="text-xs text-green-600">
                              {(formData.proofFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={removeFile}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Providing proof increases the credibility of your review. All uploads are manually reviewed for relevance and appropriateness.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <Card>
            <CardContent className="pt-6">
              <Button
                type="submit"
                disabled={!canSubmit}
                className="w-full"
                size="lg"
              >
                {createReviewMutation.isPending 
                  ? (isEdit ? 'Updating...' : (isUpdate ? 'Submitting Update...' : 'Submitting...'))
                  : (isEdit ? 'Update Review' : (isUpdate ? 'Submit Update' : 'Submit Review'))
                }
              </Button>
              
              {!canSubmit && (
                <div className="text-sm text-gray-500 text-center mt-3 space-y-1">
                  {!isBasicFormValid && (
                    <p>Please complete all required fields (business, rating, review text)</p>
                  )}
                  {needsProof && !formData.proofFile && (
                    <p>Please upload proof or select 'No specific connection' to proceed</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default WriteReview;
