
import { useParams } from 'react-router-dom';
import { useEntity } from '@/hooks/useEntities';
import { useReviews } from '@/hooks/useReviews';
import { useUserRoles } from '@/hooks/useUserRoles';
import BusinessHeader from '@/components/business/BusinessHeader';
import BusinessOverview from '@/components/business/BusinessOverview';
import BusinessAbout from '@/components/business/BusinessAbout';
import RatingBreakdown from '@/components/business/RatingBreakdown';
import ReviewsList from '@/components/business/ReviewsList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { transformReviews, calculateRatingDistribution } from '@/utils/reviewHelpers';
import { AlertTriangle, Mail } from 'lucide-react';

const EntityProfile = () => {
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  const { isSuperAdmin, isEntityAdmin } = useUserRoles();
  
  // Get identifier from either id (from /entities/:id) or slug (from /:slug)
  const identifier = id || slug;
  
  // Try to get active entity first
  const { data: activeEntity, isLoading: entityLoading, error: entityError } = useEntity(identifier || '');
  
  // If no active entity found, try to get inactive entity (for admins)
  const { data: inactiveEntity, isLoading: inactiveLoading } = useEntity(identifier || '', true);
  
  const { data: allReviews = [], isLoading: reviewsLoading } = useReviews(identifier);

  if (entityLoading || inactiveLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-gray-500">Loading entity...</p>
          </div>
        </div>
      </div>
    );
  }

  // Determine which entity to use
  let entity = activeEntity;

  // Check if entity exists but is inactive
  if (!activeEntity && inactiveEntity && inactiveEntity.status === 'inactive') {
    // Allow super admins and entity admins to view inactive entities
    if (isSuperAdmin() || isEntityAdmin(identifier)) {
      entity = inactiveEntity;
    } else {
      // Show inactive entity message for regular users
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="w-96">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Entity Currently Inactive
              </CardTitle>
              <CardDescription>
                This entity is temporarily unavailable. It may be under review or temporarily suspended.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                If you believe this is an error or need access to this entity, please contact our support team.
              </p>
              <div className="flex flex-col gap-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = 'mailto:support@example.com'}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
                <Button 
                  onClick={() => window.history.back()} 
                  className="w-full"
                >
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  // Entity not found at all
  if (!entity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Entity Not Found</CardTitle>
            <CardDescription>
              The entity you're looking for doesn't exist or may have been removed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.history.back()} className="w-full">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Transform reviews to get latest versions with update history
  const transformedReviews = transformReviews(allReviews);

  // Calculate rating distribution using only the latest review from each user
  const ratingDistribution = calculateRatingDistribution(transformedReviews);

  // Calculate the correct average rating using only the latest reviews from each user
  const averageRating = transformedReviews.length > 0 
    ? Number((transformedReviews.reduce((sum, review) => sum + review.rating, 0) / transformedReviews.length).toFixed(1))
    : 0;

  // Calculate verified reviews count
  const verifiedReviewsCount = transformedReviews.filter(review => 
    review.mainBadge === 'Verified User' || review.customVerificationTag
  ).length;

  // Create an updated entity object with the correct average rating
  const entityWithCorrectRating = {
    ...entity,
    average_rating: averageRating,
    review_count: transformedReviews.length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BusinessHeader 
          business={entityWithCorrectRating} 
          totalReviews={transformedReviews.length}
        />
        
        <div className="mt-8">
          <Tabs defaultValue="reviews" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="reviews">Reviews ({transformedReviews.length})</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="overview">Overview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="reviews" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                  <RatingBreakdown ratingDistribution={ratingDistribution} />
                </div>
                <div className="lg:col-span-3">
                  <ReviewsList 
                    reviews={transformedReviews}
                    businessId={identifier || ''}
                    isLoading={reviewsLoading}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="about" className="mt-6">
              <BusinessAbout business={entity} />
            </TabsContent>
            
            <TabsContent value="overview" className="mt-6">
              <BusinessOverview 
                business={entityWithCorrectRating}
                totalReviews={transformedReviews.length}
                verifiedReviewsCount={verifiedReviewsCount}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default EntityProfile;
