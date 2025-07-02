import { useBusinesses } from "@/hooks/useBusinesses";
import { useReviews } from "@/hooks/useReviews";
import { getDisplayName } from "@/utils/reviewHelpers";

// Interface for Business, assuming structure from Homepage.tsx
interface Business {
  entity_id: string;
  name: string;
  industry?: string;
  average_rating?: number;
  review_count?: number;
  is_verified?: boolean;
  status?: string; // Added status for activeEntityReviews filter
  contact?: { website?: string }; // Added for website access
}

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

  // Calculate bestEntities
  const bestEntities: ProcessedEntity[] = businesses
    .filter(
      (business: Business) =>
        business.average_rating &&
        business.average_rating >= 4.0 &&
        business.review_count &&
        business.review_count >= 5
    )
    .sort((a: Business, b: Business) => {
      if ((b.average_rating || 0) !== (a.average_rating || 0)) {
        return (b.average_rating || 0) - (a.average_rating || 0);
      }
      return (b.review_count || 0) - (a.review_count || 0);
    })
    .slice(0, 8)
    .map((business: Business) => ({
      id: business.entity_id,
      name: business.name,
      category: business.industry,
      website: business.contact?.website,
      rating: business.average_rating || 0,
      reviewCount: business.review_count || 0,
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
        businessWebsite: business?.contact?.website || "",
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
