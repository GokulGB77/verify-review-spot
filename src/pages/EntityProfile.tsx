
import { useParams } from 'react-router-dom';
import { useEntity } from '@/hooks/useEntities';
import { useReviews } from '@/hooks/useReviews';
import BusinessHeader from '@/components/business/BusinessHeader';
import BusinessOverview from '@/components/business/BusinessOverview';
import BusinessAbout from '@/components/business/BusinessAbout';
import RatingBreakdown from '@/components/business/RatingBreakdown';
import ReviewsList from '@/components/business/ReviewsList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  // Group reviews by user to show latest versions with update history
  const groupedReviews = allReviews.reduce((acc, review) => {
    const userId = review.user_id;
    
    if (!acc[userId]) {
      acc[userId] = {
        original: null,
        updates: [],
        allReviews: []
      };
    }
    
    acc[userId].allReviews.push(review);
    
    if (!review.parent_review_id) {
      acc[userId].original = review;
    } else {
      acc[userId].updates.push(review);
    }
    
    return acc;
  }, {} as Record<string, any>);

  // Transform grouped reviews for display - show latest version
  const transformedReviews = Object.entries(groupedReviews).map(([userId, data]) => {
    const sortedUpdates = data.updates.sort((a: any, b: any) => b.update_number - a.update_number);
    const latestReview = sortedUpdates.length > 0 ? sortedUpdates[0] : data.original;
    
    if (!latestReview) return null;
    
    const hasUpdates = data.updates.length > 0;
    const totalUpdates = data.updates.length;
    
    const getDisplayName = (review: any) => {
      if (review.profiles?.display_name_preference === 'real_name' && review.profiles?.full_name) {
        return review.profiles.full_name;
      } else if (review.profiles?.pseudonym) {
        return review.profiles.pseudonym;
      }
      return 'Anonymous Reviewer';
    };

    const getMainBadge = (review: any): 'Verified User' | 'Unverified User' => {
      const profileBadge = review.profiles?.main_badge;
      const userBadge = review.user_badge;
      
      if (profileBadge === 'Verified User') return 'Verified User';
      if (userBadge === 'Verified User') return 'Verified User';
      return 'Unverified User';
    };

    const getReviewSpecificBadge = (review: any): 'Verified Employee' | 'Verified Student' | null => {
      const specificBadge = review.review_specific_badge;
      if (specificBadge === 'Verified Employee' || specificBadge === 'Verified Student') {
        return specificBadge;
      }
      return null;
    };

    return {
      id: latestReview.id,
      userId: userId,
      userName: getDisplayName(latestReview),
      rating: latestReview.rating,
      content: latestReview.content,
      mainBadge: getMainBadge(latestReview),
      reviewSpecificBadge: getReviewSpecificBadge(latestReview),
      proofProvided: !!latestReview.proof_url,
      upvotes: latestReview.upvotes || 0,
      downvotes: latestReview.downvotes || 0,
      date: new Date(latestReview.created_at).toLocaleDateString(),
      businessResponse: latestReview.business_response,
      businessResponseDate: latestReview.business_response_date ? new Date(latestReview.business_response_date).toLocaleDateString() : undefined,
      hasUpdates,
      totalUpdates,
      updateNumber: latestReview.update_number || 0,
      allReviews: data.allReviews.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    };
  }).filter(Boolean);

  // Calculate rating distribution for RatingBreakdown
  const ratingCounts = [1, 2, 3, 4, 5].map(stars => ({
    stars,
    count: allReviews.filter(review => review.rating === stars).length
  }));

  const totalReviews = allReviews.length;
  const ratingDistribution = ratingCounts.map(item => ({
    ...item,
    percentage: totalReviews > 0 ? Math.round((item.count / totalReviews) * 100) : 0
  }));

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
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({transformedReviews.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <BusinessOverview 
                    business={entity}
                    totalReviews={transformedReviews.length}
                    verifiedReviewsCount={verifiedReviewsCount}
                  />
                </div>
                <div>
                  <RatingBreakdown ratingDistribution={ratingDistribution} />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="about" className="mt-6">
              <BusinessAbout business={entity} />
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <ReviewsList 
                reviews={transformedReviews}
                businessId={id || ''}
                isLoading={reviewsLoading}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default EntityProfile;
