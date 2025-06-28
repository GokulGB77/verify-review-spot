
import type { Review } from '@/hooks/useReviews';

interface TransformedReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  content: string;
  mainBadge: 'Verified User' | 'Unverified User';
  reviewSpecificBadge?: 'Verified Employee' | 'Verified Student' | null;
  proofProvided: boolean;
  upvotes: number;
  downvotes: number;
  date: string;
  businessResponse?: string;
  businessResponseDate?: string;
  hasUpdates: boolean;
  totalUpdates: number;
  updateNumber: number;
  allReviews: Review[];
  created_at?: string;
  updated_at?: string;
  business_id?: string;
}

export const transformReviews = (reviews: Review[]): TransformedReview[] => {
  // Group reviews by user - original reviews and their updates
  const userReviewGroups = new Map<string, Review[]>();
  
  reviews.forEach(review => {
    const userId = review.user_id;
    if (!userReviewGroups.has(userId)) {
      userReviewGroups.set(userId, []);
    }
    userReviewGroups.get(userId)!.push(review);
  });

  const transformedReviews: TransformedReview[] = [];

  userReviewGroups.forEach((userReviews) => {
    // Sort by creation date
    userReviews.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    
    // Find the original review (no parent_review_id)
    const originalReview = userReviews.find(r => !r.parent_review_id);
    if (!originalReview) return;

    // Get all updates (have parent_review_id)
    const updates = userReviews.filter(r => r.parent_review_id === originalReview.id);
    
    // The latest review is either the last update or the original review
    const latestReview = updates.length > 0 ? updates[updates.length - 1] : originalReview;
    
    // Get display name
    const profile = latestReview.profiles;
    let displayName = 'Anonymous User';
    
    if (profile) {
      if (profile.display_name_preference === 'full_name' && profile.full_name) {
        displayName = profile.full_name;
      } else if (profile.display_name_preference === 'pseudonym' && profile.pseudonym) {
        displayName = profile.pseudonym;
      } else if (profile.pseudonym) {
        displayName = profile.pseudonym;
      } else if (profile.full_name) {
        displayName = profile.full_name;
      }
    }

    const transformedReview: TransformedReview = {
      id: latestReview.id,
      userId: latestReview.user_id,
      userName: displayName,
      rating: latestReview.rating,
      content: latestReview.content,
      mainBadge: (profile?.main_badge as 'Verified User' | 'Unverified User') || 'Unverified User',
      reviewSpecificBadge: latestReview.review_specific_badge as 'Verified Employee' | 'Verified Student' | null,
      proofProvided: !!latestReview.proof_url,
      upvotes: latestReview.upvotes || 0,
      downvotes: latestReview.downvotes || 0,
      date: new Date(latestReview.created_at).toLocaleDateString(),
      businessResponse: latestReview.business_response || undefined,
      businessResponseDate: latestReview.business_response_date ? new Date(latestReview.business_response_date).toLocaleDateString() : undefined,
      hasUpdates: updates.length > 0,
      totalUpdates: updates.length,
      updateNumber: latestReview.update_number || 0,
      allReviews: userReviews,
      created_at: latestReview.created_at,
      updated_at: latestReview.updated_at,
      business_id: latestReview.business_id
    };

    transformedReviews.push(transformedReview);
  });

  // Sort by creation date (newest first)
  return transformedReviews.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
};

export const calculateRatingDistribution = (reviews: TransformedReview[]) => {
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
  reviews.forEach(review => {
    if (review.rating >= 1 && review.rating <= 5) {
      distribution[review.rating as keyof typeof distribution]++;
    }
  });

  return distribution;
};
