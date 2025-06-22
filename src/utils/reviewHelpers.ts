
// Helper function to get main badge from profiles or review
export const getMainBadge = (review: any): 'Verified User' | 'Unverified User' => {
  const profileBadge = review.profiles?.main_badge;
  const userBadge = review.user_badge;
  
  if (profileBadge === 'Verified User') return 'Verified User';
  if (userBadge === 'Verified User') return 'Verified User';
  return 'Unverified User';
};

// Helper function to get review-specific badge
export const getReviewSpecificBadge = (review: any): 'Verified Employee' | 'Verified Student' | null => {
  const specificBadge = review.review_specific_badge;
  if (specificBadge === 'Verified Employee' || specificBadge === 'Verified Student') {
    return specificBadge;
  }
  return null;
};

// Helper function to get display name
export const getDisplayName = (review: any) => {
  if (review.profiles?.display_name_preference === 'real_name' && review.profiles?.full_name) {
    return review.profiles.full_name;
  } else if (review.profiles?.pseudonym) {
    return review.profiles.pseudonym;
  }
  return 'Anonymous User';
};

// Define the grouped review structure type
interface GroupedReviewData {
  original: any | null;
  updates: any[];
  allReviews: any[];
}

// Transform grouped reviews for display
export const transformReviews = (reviews: any[]) => {
  // Group reviews by user and get the latest version for each user
  const groupedReviews = reviews.reduce((acc, review) => {
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
  }, {} as Record<string, GroupedReviewData>);

  // Transform grouped reviews for display
  return Object.entries(groupedReviews).map(([userId, data]: [string, GroupedReviewData]) => {
    const sortedUpdates = data.updates.sort((a: any, b: any) => b.update_number - a.update_number);
    const latestReview = sortedUpdates.length > 0 ? sortedUpdates[0] : data.original;
    
    if (!latestReview) return null;
    
    const hasUpdates = data.updates.length > 0;
    const totalUpdates = data.updates.length;
    
    return {
      id: latestReview.id,
      userId: userId,
      userName: getDisplayName(latestReview),
      rating: latestReview.rating,
      content: latestReview.content,
      mainBadge: getMainBadge(latestReview),
      reviewSpecificBadge: getReviewSpecificBadge(latestReview),
      proofProvided: latestReview.proof_provided || false,
      upvotes: latestReview.upvotes || 0,
      downvotes: latestReview.downvotes || 0,
      date: new Date(latestReview.created_at).toLocaleDateString(),
      businessResponse: latestReview.business_response,
      businessResponseDate: latestReview.business_response_date ? new Date(latestReview.business_response_date).toLocaleDateString() : undefined,
      hasUpdates,
      totalUpdates,
      updateNumber: latestReview.update_number || 0,
      allReviews: data.allReviews.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    };
  }).filter(Boolean);
};

// Calculate rating distribution using only the latest review from each user
export const calculateRatingDistribution = (transformedReviews: any[]) => {
  const latestReviewsForRating = transformedReviews.map(review => ({
    rating: review.rating
  }));
  
  const ratingCounts = [1, 2, 3, 4, 5].map(rating => 
    latestReviewsForRating.filter(review => review.rating === rating).length
  );
  
  const totalReviews = latestReviewsForRating.length;
  return ratingCounts.map((count, index) => ({
    stars: index + 1,
    count,
    percentage: totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0
  })).reverse();
};
