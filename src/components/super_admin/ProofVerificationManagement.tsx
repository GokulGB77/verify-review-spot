import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, FileText, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { useReviews } from '@/hooks/useReviews';
import { useEntities } from '@/hooks/useEntities';
import { formatDistanceToNow } from 'date-fns';
import ProofVerificationPanel from './ProofVerificationPanel';

const ReviewVerificationManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [isVerificationPanelOpen, setIsVerificationPanelOpen] = useState(false);
  
  const { data: allReviews = [], isLoading } = useReviews();
  const { data: entities = [] } = useEntities();

  // Create entity map for lookups
  const entityMap = entities.reduce((acc, entity) => {
    acc[entity.entity_id] = entity;
    return acc;
  }, {} as Record<string, any>);

  // Filter reviews with proof submissions
  const reviewsWithProof = allReviews.filter(review => review.is_proof_submitted);
  const pendingReviews = reviewsWithProof.filter(review => !review.is_verified);
  const verifiedReviews = reviewsWithProof.filter(review => review.is_verified);

  // Filter by search query
  const getFilteredReviews = (reviews: any[]) => {
    if (!searchQuery.trim()) return reviews;
    
    return reviews.filter(review => {
      const entity = entityMap[review.business_id];
      const entityName = entity?.name?.toLowerCase() || '';
      const content = review.content?.toLowerCase() || '';
      const query = searchQuery.toLowerCase();
      
      return entityName.includes(query) || content.includes(query);
    });
  };

  const handleVerifyReview = (review: any) => {
    setSelectedReview(review);
    setIsVerificationPanelOpen(true);
  };

  const handleCloseVerificationPanel = () => {
    setIsVerificationPanelOpen(false);
    setSelectedReview(null);
  };

  const ReviewCard = ({ review }: { review: any }) => {
    const entity = entityMap[review.business_id];
    
    return (
      <Card className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg">{entity?.name || 'Unknown Entity'}</CardTitle>
              <CardDescription className="flex items-center space-x-4 mt-1">
                <span>Rating: {review.rating}/5</span>
                <span>{formatDistanceToNow(new Date(review.created_at))} ago</span>
                {review.is_verified && (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {review.custom_verification_tag && (
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    {review.custom_verification_tag}
                  </Badge>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              {review.proof_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(review.proof_url, '_blank')}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Proof
                </Button>
              )}
              <Button
                variant={review.is_verified ? "outline" : "default"}
                size="sm"
                onClick={() => handleVerifyReview(review)}
              >
                <FileText className="h-4 w-4 mr-1" />
                {review.is_verified ? 'Edit Tag' : 'Verify'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 line-clamp-3">{review.content}</p>
          {review.custom_verification_tag && (
            <div className="mt-2">
              <Badge variant="secondary">{review.custom_verification_tag}</Badge>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Review Verification</h2>
          <p className="text-gray-600">Manage proof submissions and assign verification tags</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search reviews by business or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{pendingReviews.length}</div>
            <div className="text-sm text-gray-600">Pending Verification</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{verifiedReviews.length}</div>
            <div className="text-sm text-gray-600">Verified Reviews</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{reviewsWithProof.length}</div>
            <div className="text-sm text-gray-600">Total with Proof</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Pending ({pendingReviews.length})</span>
          </TabsTrigger>
          <TabsTrigger value="verified" className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>Verified ({verifiedReviews.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <div className="space-y-4">
            {getFilteredReviews(pendingReviews).length > 0 ? (
              getFilteredReviews(pendingReviews).map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">
                    {pendingReviews.length === 0 
                      ? "No pending reviews to verify" 
                      : "No reviews match your search"
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="verified" className="mt-6">
          <div className="space-y-4">
            {getFilteredReviews(verifiedReviews).length > 0 ? (
              getFilteredReviews(verifiedReviews).map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">
                    {verifiedReviews.length === 0 
                      ? "No verified reviews yet" 
                      : "No reviews match your search"
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Verification Panel Dialog */}
      <Dialog open={isVerificationPanelOpen} onOpenChange={setIsVerificationPanelOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Review Verification</DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <ProofVerificationPanel
              reviewId={selectedReview.id}
              proofUrl={selectedReview.proof_url}
              proofRemark={selectedReview.proof_remark}
              isProofSubmitted={selectedReview.is_proof_submitted}
              isVerified={selectedReview.is_verified}
              customVerificationTag={selectedReview.custom_verification_tag}
              onClose={handleCloseVerificationPanel}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewVerificationManagement;