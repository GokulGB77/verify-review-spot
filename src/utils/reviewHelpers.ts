
import type { Review } from '@/hooks/useReviews';

export const transformReviews = (allReviews: Review[]) => {
  // Group reviews by user_id to handle original reviews and their updates
  const reviewsByUser = new Map<string, Review[]>();
  
  allReviews.forEach(review => {
    const userId = review.user_id;
    if (!reviewsByUser.has(userId)) {
      reviewsByUser.set(userId, []);
    }
    reviewsByUser.get(userId)!.push(review);
  });

  const transformedReviews = [];

  for (const [userId, userReviews] of reviewsByUser) {
    // Sort reviews by creation date (oldest first)
    const sortedReviews = userReviews.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    // Find the original review (not an update)
    const originalReview = sortedReviews.find(review => !review.is_update) || sortedReviews[0];
    
    // Get all updates for this user's review
    const updates = sortedReviews.filter(review => review.is_update);
    
    // Use the latest review (original or most recent update) as the current content
    const latestReview = updates.length > 0 ? updates[updates.length - 1] : originalReview;

    // Get user profile info
    const profile = originalReview.profiles;
    const displayName = profile?.display_name_preference === 'full_name' 
      ? profile?.full_name 
      : profile?.pseudonym || 'Anonymous User';

    const transformedReview = {
      id: latestReview.id,
      userId: userId,
      userName: displayName || 'Anonymous User',
      rating: latestReview.rating,
      content: latestReview.content,
      mainBadge: (profile?.main_badge || 'Unverified User') as 'Verified User' | 'Unverified User',
      reviewSpecificBadge: latestReview.review_specific_badge as 'Verified Employee' | 'Verified Student' | null,
      proofProvided: !!latestReview.proof_url,
      upvotes: latestReview.upvotes || 0,
      downvotes: latestReview.downvotes || 0,
      date: new Date(latestReview.created_at).toLocaleDateString(),
      businessResponse: latestReview.business_response || undefined,
      businessResponseDate: latestReview.business_response_date 
        ? new Date(latestReview.business_response_date).toLocaleDateString() 
        : undefined,
      hasUpdates: updates.length > 0,
      totalUpdates: updates.length,
      updateNumber: latestReview.update_number || 0,
      allReviews: sortedReviews.map(review => ({
        content: review.content,
        rating: review.rating,
        date: new Date(review.created_at).toLocaleDateString(),
        updateNumber: review.update_number || 0,
        isUpdate: review.is_update || false
      })),
      // IMPORTANT: Pass through the created_at timestamp for edit window calculation
      created_at: latestReview.created_at,
      business_id: latestReview.business_id
    };

    transformedReviews.push(transformedReview);
  }

  // Sort by creation date (newest first) for display
  return transformedReviews.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
};

export const calculateRatingDistribution = (reviews: any[]) => {
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
  reviews.forEach(review => {
    if (review.rating >= 1 && review.rating <= 5) {
      distribution[review.rating as keyof typeof distribution]++;
    }
  });
  
  const total = reviews.length;
  
  // Convert to array format expected by RatingBreakdown component
  return [
    { stars: 5, count: distribution[5], percentage: total > 0 ? (distribution[5] / total) * 100 : 0 },
    { stars: 4, count: distribution[4], percentage: total > 0 ? (distribution[4] / total) * 100 : 0 },
    { stars: 3, count: distribution[3], percentage: total > 0 ? (distribution[3] / total) * 100 : 0 },
    { stars: 2, count: distribution[2], percentage: total > 0 ? (distribution[2] / total) * 100 : 0 },
    { stars: 1, count: distribution[1], percentage: total > 0 ? (distribution[1] / total) * 100 : 0 }
  ];
};

// Helper function to get display name from review
export const getDisplayName = (review: any) => {
  const profile = review.profiles;
  return profile?.display_name_preference === 'full_name' 
    ? profile?.full_name 
    : profile?.pseudonym || 'Anonymous User';
};

// Helper function to get main badge
export const getMainBadge = (review: any) => {
  const profile = review.profiles;
  return (profile?.main_badge || 'Unverified User') as 'Verified User' | 'Unverified User';
};

// Helper function to get review specific badge
export const getReviewSpecificBadge = (review: any) => {
  return review.review_specific_badge as 'Verified Employee' | 'Verified Student' | null;
};
