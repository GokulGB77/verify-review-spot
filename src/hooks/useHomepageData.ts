import { useBusinesses, Business } from "@/hooks/useBusinesses";
import { useReviews } from "@/hooks/useReviews";
import { getDisplayName } from "@/utils/reviewHelpers";

// Interface for Review, assuming structure from Homepage.tsx
interface Review {
  id: string;
  user_id: string;
  business_id: string;
  rating?: number;
  content?: string;
  user_badge?: string;
  created_at: string; // Assuming string, will be converted to Date
  is_update?: boolean;
  // Add other review properties used in getDisplayName if necessary
  pan_verified?: boolean; // Example, adjust based on getDisplayName
  user_name?: string; // Example, adjust based on getDisplayName
}

// Interface for the output of getLatestReviewsGrouped
export interface ProcessedReview {
  id: string;
  userName: string;
  rating: number;
  content: string;
  businessName: string;
  businessWebsite: string;
  userBadge: string;
  date: string;
  businessCategory: string;
  isUpdate: boolean;
  updateCount: number;
  created_at: string;
}

// Interface for the output for bestEntities
export interface ProcessedEntity {
  id: string;
  name: string;
  category?: string;
  website?: string;
  rating: number;
  reviewCount: number;
  verificationStatus: string;
}

export const useHomepageData = () => {
  const { data: businesses = [] } = useBusinesses();
  const { data: allReviews = [] } = useReviews();

  // Calculate bestEntities - show 3 entities with maximum number of reviews
  // Don't count updates (is_update: true) as separate reviews
  const entitiesWithReviewCounts = businesses
    .filter((business: Business) => (business.status || 'active') === 'active')
    .map((business: Business) => {
      // Count only non-update reviews for this entity
      const nonUpdateReviewCount = allReviews.filter(
        (review: Review) => 
          review.business_id === business.entity_id && 
          !review.is_update
      ).length;

      return {
        business,
        actualReviewCount: nonUpdateReviewCount
      };
    })
    .filter(item => item.actualReviewCount > 0) // Only include entities with actual reviews
    .sort((a, b) => b.actualReviewCount - a.actualReviewCount) // Sort by review count descending
    .slice(0, 3); // Take top 3

  const bestEntities: ProcessedEntity[] = entitiesWithReviewCounts.map(({ business, actualReviewCount }) => ({
    id: business.entity_id,
    name: business.name,
    category: business.industry,
    website: (business.contact as any)?.website,
    rating: business.average_rating || 0,
    reviewCount: actualReviewCount,
    verificationStatus: business.is_verified ? "Verified" : "Unverified",
  }));

  // Logic for getLatestReviewsGrouped
  const getLatestReviewsGrouped = (): ProcessedReview[] => {
    const activeEntityReviews = allReviews.filter((review: Review) => {
      const business = businesses.find(
        (b: Business) => b.entity_id === review.business_id
      );
      return business && business.status === "active";
    });

    const reviewGroups = new Map<string, Review[]>();

    activeEntityReviews.forEach((review: Review) => {
      const key = `${review.user_id}-${review.business_id}`;
      if (!reviewGroups.has(key)) {
        reviewGroups.set(key, []);
      }
      reviewGroups.get(key)?.push(review);
    });

    const latestReviews: ProcessedReview[] = [];
    reviewGroups.forEach((reviews: Review[]) => {
      const sortedReviews = [...reviews].sort( // Sort a copy
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      const latestReview = sortedReviews[0];
      const business = businesses.find(
        (b: Business) => b.entity_id === latestReview.business_id
      );

      latestReviews.push({
        id: latestReview.id,
        userName: getDisplayName(latestReview as any), // Cast as any if getDisplayName expects a more specific type not fully defined here
        rating: latestReview.rating || 0,
        content: latestReview.content || "",
        businessName: business?.name || "Unknown Business",
        businessWebsite: (business?.contact as any)?.website || "",
        userBadge: latestReview.user_badge || "Unverified User",
        date: new Date(latestReview.created_at).toLocaleDateString(),
        businessCategory: business?.industry || "Business",
        isUpdate: latestReview.is_update || false,
        updateCount: reviews.filter((r) => r.is_update).length,
        created_at: latestReview.created_at,
      });
    });

    return latestReviews
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 8);
  };

  const recentReviews = getLatestReviewsGrouped(); // Note: This is calculated but not explicitly returned if ScrollingReviews handles its own data.
                                                // If Homepage needs it directly, it should be returned.

  return {
    businesses, // Returning raw businesses in case HeroSection (or other child components) still needs it directly.
                // This can be refined if HeroSection's data dependencies are also moved into a hook.
    allReviews, // Same reasoning as businesses.
    bestEntities,
    // recentReviews, // Uncomment if Homepage.tsx needs direct access to this.
                     // For now, assuming ScrollingReviews handles its data.
  };
};
