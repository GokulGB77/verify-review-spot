import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { History, Star } from 'lucide-react';
import { useEntities } from '@/hooks/useEntities';
import { useCreateReview, useUserOriginalReviewForBusiness, useUserReviewUpdatesForBusiness, useReview } from '@/hooks/useReviews';
import ReviewContent from '@/components/business/ReviewContent';
import { useQueryClient } from '@tanstack/react-query';
import { ReviewFormData, UserProfile } from '@/types/reviewForm';
import { uploadFileToStorage } from '@/utils/fileUpload';
import { validateForm } from '@/utils/formValidation';
import BusinessSelection from '@/components/review/BusinessSelection';
import RatingInput from '@/components/review/RatingInput';
import ReviewContentInput from '@/components/review/ReviewContentInput';
import ConnectionSelection from '@/components/review/ConnectionSelection';
import ProofUpload from '@/components/review/ProofUpload';
import SubmitSection from '@/components/review/SubmitSection';
import { useUserBusinessConnection } from '@/hooks/useUserBusinessConnections';

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
  const { data: editingReview } = useReview(reviewId || '');

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
        customVerificationTag: editingReview.custom_verification_tag || '',
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

  // Check if user has an approved connection for this business
  const { data: existingConnection } = useUserBusinessConnection(formData.businessId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Submit attempt with form data:', {
      businessId: formData.businessId,
      rating: formData.rating,
      contentLength: formData.content.length,
      hasFile: !!formData.proofFile,
      connection: formData.reviewSpecificBadge,
      existingConnection: existingConnection?.connection_type,
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

    // Use existing connection if available, otherwise use form selection
    const effectiveConnection = existingConnection?.connection_type || formData.reviewSpecificBadge;
    
    // Check if proof is required but missing (only if no existing connection)
    const needsProof = !existingConnection && formData.reviewSpecificBadge === 'proof_connection';
    
    console.log('Proof validation:', {
      needsProof,
      hasFile: !!formData.proofFile,
      connection: effectiveConnection,
      existingConnection: !!existingConnection
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

      // Upload proof file if provided (only if no existing connection)
      if (formData.proofFile && !existingConnection) {
        console.log('Starting file upload process for:', formData.proofFile.name);
        proofUrl = await uploadFileToStorage(formData.proofFile, user.id);
        console.log('File upload completed, URL:', proofUrl);
      }

      if (isEdit && editingReview) {
        // Update existing review directly
        const updateData: any = {
          rating: formData.rating,
          content: formData.content.trim(),
          review_specific_badge: effectiveConnection || null,
          updated_at: new Date().toISOString(),
        };

        // Add new proof system fields if file was uploaded
        if (proofUrl) {
          updateData.proof_url = proofUrl;
          updateData.is_proof_submitted = true;
          updateData.is_verified = false;
          updateData.custom_verification_tag = null;
          updateData.proof_verified = null; // Reset verification status for new proof
          updateData.proof_verified_by = null;
          updateData.proof_verified_at = null;
          updateData.proof_rejection_reason = null;
        } else if (!effectiveConnection) {
          // Clear proof fields if no connection selected and no existing connection
          updateData.proof_url = null;
          updateData.is_proof_submitted = false;
          updateData.is_verified = false;
          updateData.custom_verification_tag = null;
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
          // Update review data to use new proof system
          const reviewData: any = {
            business_id: formData.businessId,
            rating: formData.rating,
            content: formData.content.trim(),
            proof_url: proofUrl,
            user_badge: profile.main_badge || 'Unverified User',
            review_specific_badge: effectiveConnection || undefined,
            is_update: isUpdate,
            is_proof_submitted: !!proofUrl,
            is_verified: false,
            custom_verification_tag: null
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

  // Check if proof upload should be shown
  const shouldShowProofUpload = formData.reviewSpecificBadge === 'proof_connection';

  // Update validation function to check for proof_connection
  const validation = {
    ...validateForm(formData, selectedBusiness),
    needsProof: !existingConnection && formData.reviewSpecificBadge === 'proof_connection'
  };
  const canSubmit = validation.canSubmit && !createReviewMutation.isPending;

  console.log('Form validation state:', {
    ...validation,
    hasFile: !!formData.proofFile,
    canSubmit,
    isPending: createReviewMutation.isPending,
    existingConnection: existingConnection?.connection_type
  });

  // Override form data with existing connection if available
  const effectiveReviewSpecificBadge = existingConnection?.connection_type || formData.reviewSpecificBadge;

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
          <BusinessSelection
            selectedBusiness={selectedBusiness}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filteredEntities={filteredEntities}
            onBusinessSelect={handleBusinessSelect}
            onClearSelection={() => {
              setSelectedBusiness(null);
              setFormData(prev => ({ ...prev, businessId: '', businessName: '' }));
            }}
            isUpdate={isUpdate}
            isEdit={isEdit}
          />

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

          <RatingInput
            rating={formData.rating}
            onRatingChange={(rating) => setFormData(prev => ({ ...prev, rating }))}
            isEdit={isEdit}
            isUpdate={isUpdate}
          />

          <ReviewContentInput
            content={formData.content}
            onContentChange={(content) => setFormData(prev => ({ ...prev, content }))}
            isEdit={isEdit}
            isUpdate={isUpdate}
          />

          {/* Show existing connection info or connection selection */}
          {existingConnection ? (
            <Card>
              <CardHeader>
                <CardTitle>Your Verified Connection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                    {existingConnection.connection_type}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Verified on {new Date(existingConnection.approved_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Your connection to this business has been verified. This badge will be automatically applied to your review.
                </p>
              </CardContent>
            </Card>
          ) : (
            <ConnectionSelection
              selectedConnection={formData.reviewSpecificBadge}
              onConnectionChange={handleConnectionChange}
            />
          )}

          {/* Only show proof upload if no existing connection and connection is selected */}
          {!existingConnection && shouldShowProofUpload && (
            <ProofUpload
              proofFile={formData.proofFile}
              onFileChange={(file) => setFormData(prev => ({ ...prev, proofFile: file }))}
            />
          )}

          <SubmitSection
            canSubmit={canSubmit}
            isPending={createReviewMutation.isPending}
            isEdit={isEdit}
            isUpdate={isUpdate}
            isBasicFormValid={validation.isBasicFormValid}
            needsProof={validation.needsProof && !existingConnection}
            hasFile={!!formData.proofFile}
          />
        </form>
      </div>
    </div>
  );
};

export default WriteReview;
