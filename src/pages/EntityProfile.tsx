
import { useParams } from 'react-router-dom';
import { useEntity } from '@/hooks/useEntities';
import { useReviews } from '@/hooks/useReviews';
import BusinessHeader from '@/components/business/BusinessHeader';
import BusinessOverview from '@/components/business/BusinessOverview';
import BusinessAbout from '@/components/business/BusinessAbout';
import RatingBreakdown from '@/components/business/RatingBreakdown';
import ReviewsList from '@/components/business/ReviewsList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { transformReviews, calculateRatingDistribution } from '@/utils/reviewHelpers';

const EntityProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { data: entity, isLoading: entityLoading } = useEntity(id || '');
  const { data: allReviews = [], isLoading: reviewsLoading } = useReviews(id);

  if (entityLoading) {
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

  if (!entity) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-gray-500">Entity not found</p>
          </div>
        </div>
      </div>
    );
  }

  // Transform reviews to get latest versions with update history
  const transformedReviews = transformReviews(allReviews);

  // Calculate rating distribution using only the latest review from each user
  const ratingDistribution = calculateRatingDistribution(transformedReviews);

  // Calculate verified reviews count
  const verifiedReviewsCount = transformedReviews.filter(review => 
    review.mainBadge === 'Verified User' || review.reviewSpecificBadge
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BusinessHeader 
          business={entity} 
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
                    businessId={id || ''}
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
                business={entity}
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
