
import type { Review } from '@/hooks/useReviews';

export interface TransformedReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  content: string;
  mainBadge: 'Verified User' | 'Unverified User';
  reviewSpecificBadge?: 'Verified Employee' | 'Verified Student' | null;
  proofProvided: boolean;
  proofVerified?: boolean | null;
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

export const transformReviews = (allReviews: Review[]): TransformedReview[] => {
  // Group reviews by user_id
  const reviewsByUser = allReviews.reduce((acc, review) => {
    if (!acc[review.user_id]) {
      acc[review.user_id] = [];
    }
    acc[review.user_id].push(review);
    return acc;
  }, {} as Record<string, Review[]>);

  const transformedReviews: TransformedReview[] = [];

  // For each user, get their latest review and all their reviews for history
  Object.values(reviewsByUser).forEach(userReviews => {
    // Sort by created_at descending to get the latest review first
    const sortedReviews = userReviews.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    const latestReview = sortedReviews[0];
    const profile = latestReview.profiles;
    
    // Determine display name based on preference
    let displayName = 'Anonymous';
    if (profile?.display_name_preference === 'pseudonym' && profile?.pseudonym) {
      displayName = profile.pseudonym;
    } else if (profile?.display_name_preference === 'full_name' && profile?.full_name) {
      displayName = profile.full_name;
    } else if (profile?.full_name) {
      displayName = profile.full_name;
    }

    console.log('transformReviews - Processing review:', {
      reviewId: latestReview.id,
      userId: latestReview.user_id,
      proof_url: latestReview.proof_url,
      proof_verified: latestReview.proof_verified,
      review_specific_badge: latestReview.review_specific_badge,
      user_badge: latestReview.user_badge,
      main_badge: profile?.main_badge
    });

    const transformedReview: TransformedReview = {
      id: latestReview.id,
      userId: latestReview.user_id,
      userName: displayName,
      rating: latestReview.rating,
      content: latestReview.content,
      mainBadge: (profile?.main_badge === 'Verified User') ? 'Verified User' : 'Unverified User',
      reviewSpecificBadge: latestReview.review_specific_badge as 'Verified Employee' | 'Verified Student' | null,
      proofProvided: !!latestReview.proof_url,
      proofVerified: latestReview.proof_verified,
      upvotes: latestReview.upvotes || 0,
      downvotes: latestReview.downvotes || 0,
      date: new Date(latestReview.created_at).toLocaleDateString(),
      businessResponse: latestReview.business_response || undefined,
      businessResponseDate: latestReview.business_response_date 
        ? new Date(latestReview.business_response_date).toLocaleDateString() 
        : undefined,
      hasUpdates: sortedReviews.length > 1,
      totalUpdates: sortedReviews.length - 1,
      updateNumber: latestReview.update_number || 0,
      allReviews: sortedReviews,
      created_at: latestReview.created_at,
      updated_at: latestReview.updated_at,
      business_id: latestReview.business_id
    };

    transformedReviews.push(transformedReview);
  });

  // Sort by date descending
  return transformedReviews.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
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
