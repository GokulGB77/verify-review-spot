import type { Review } from '@/hooks/useReviews';
import { formatDistanceToNow } from 'date-fns';

export interface TransformedReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  content: string;
  mainBadge: 'Verified User' | 'Unverified User';
  customVerificationTag?: string | null;
  isProofSubmitted: boolean;
  isVerified?: boolean | null;
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

  const result: TransformedReview[] = [];

  // For each user, get their latest review and all their reviews for history
  Object.values(reviewsByUser).forEach(userReviews => {
    // Sort by created_at descending to get the latest review first
    const sortedReviews = userReviews.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    const latest = sortedReviews[0];
    
    // Create the main review object
    const mainReview = {
      id: latest.id,
      userId: latest.user_id,
      userName: getDisplayName(latest.profiles),
      rating: latest.rating,
      content: latest.content,
      mainBadge: getMainBadge(latest.profiles),
      customVerificationTag: getReviewSpecificBadge(latest),
      isProofSubmitted: latest.is_proof_submitted || false,
      isVerified: latest.is_verified,
      upvotes: latest.upvotes || 0,
      downvotes: latest.downvotes || 0,
      date: formatDistanceToNow(new Date(latest.created_at), { addSuffix: true }),
      businessResponse: latest.business_response,
      businessResponseDate: latest.business_response_date 
        ? formatDistanceToNow(new Date(latest.business_response_date), { addSuffix: true })
        : undefined,
      hasUpdates: allReviews.length > 1,
      totalUpdates: allReviews.length - 1,
      updateNumber: allReviews.length,
      allReviews: allReviews,
      created_at: latest.created_at,
      updated_at: latest.updated_at
    };

    result.push(mainReview);
  });

  return result;
};

// Helper functions for backward compatibility
export const getDisplayName = (profile: any) => {
  if (profile?.display_name_preference === 'pseudonym' && profile?.pseudonym) {
    return profile.pseudonym;
  } else if (profile?.display_name_preference === 'full_name' && profile?.full_name) {
    return profile.full_name;
  } else if (profile?.full_name) {
    return profile.full_name;
  }
  return 'Anonymous';
};

export const getMainBadge = (profile: any): 'Verified User' | 'Unverified User' => {
  return (profile?.main_badge === 'Verified User') ? 'Verified User' : 'Unverified User';
};

export const getReviewSpecificBadge = (review: any): string | null => {
  if (!review.is_proof_submitted || !review.is_verified) {
    return null;
  }
  
  // Return custom verification tag if available
  return review.custom_verification_tag || null;
};

export const calculateRatingDistribution = (reviews: any[]) => {
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
  reviews.forEach(review => {
    if (review.rating >= 1 && review.rating <= 5) {
      distribution[review.rating as keyof typeof distribution]++;
    }
  });
  
  const total = reviews.length;
  
  // Convert to the format expected by RatingBreakdown component  
  return [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: distribution[stars as keyof typeof distribution],
    percentage: total > 0 ? Math.round((distribution[stars as keyof typeof distribution] / total) * 100) : 0
  }));
};