
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBusiness } from '@/hooks/useBusinesses';
import { useReviews } from '@/hooks/useReviews';
import BusinessHeader from '@/components/business/BusinessHeader';
import RatingBreakdown from '@/components/business/RatingBreakdown';
import ReviewsList from '@/components/business/ReviewsList';
import BusinessAbout from '@/components/business/BusinessAbout';
import BusinessOverview from '@/components/business/BusinessOverview';
import { transformReviews, calculateRatingDistribution } from '@/utils/reviewHelpers';

const BusinessProfile = () => {
  const { id } = useParams();
  const [selectedTab, setSelectedTab] = useState('reviews');
  
  const { data: business, isLoading: businessLoading } = useBusiness(id || '');
  const { data: reviews = [], isLoading: reviewsLoading } = useReviews(id);

  if (businessLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center py-12">
            <p className="text-gray-500">Loading business profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center py-12">
            <p className="text-red-500">Business not found.</p>
          </div>
        </div>
      </div>
    );
  }

  const transformedReviews = transformReviews(reviews);
  const ratingDistribution = calculateRatingDistribution(transformedReviews);
  const totalReviews = transformedReviews.length;
  const verifiedReviewsCount = transformedReviews.filter(r => r.mainBadge !== 'Unverified User').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <BusinessHeader business={business} totalReviews={totalReviews} />

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
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
            <BusinessAbout business={business} />
          </TabsContent>

          <TabsContent value="overview" className="mt-6">
            <BusinessOverview 
              business={business} 
              totalReviews={totalReviews} 
              verifiedReviewsCount={verifiedReviewsCount} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BusinessProfile;
