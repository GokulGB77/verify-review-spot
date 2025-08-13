import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Database } from '@/integrations/supabase/types'; // Assuming this type exists
import { Badge } from '@/components/ui/badge'; // Added for review status/tags if needed later
import CreateDummyReviews from '../CreateDummyReviews';

type Review = Database['public']['Tables']['reviews']['Row'] & {
  entities?: { name?: string | null } | null; // For displaying entity name
};

interface ReviewManagementSectionProps {
  reviews: Review[] | undefined;
  reviewsLoading: boolean;
  // Potentially add functions for moderation actions if they are to be handled here
}

const REVIEWS_PER_PAGE = 10;

const ReviewManagementSection: React.FC<ReviewManagementSectionProps> = ({ reviews, reviewsLoading }) => {
  const [page, setPage] = useState(1);

  const totalReviews = reviews?.length || 0;
  const totalPages = Math.ceil(totalReviews / REVIEWS_PER_PAGE);

  const displayedReviews = reviews
    ? reviews.slice((page - 1) * REVIEWS_PER_PAGE, page * REVIEWS_PER_PAGE)
    : [];

  const handleModerateReview = (reviewId: string) => {
    console.log("Moderating review:", reviewId);
    // Placeholder for moderation functionality
  };

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <Card>
    <CardHeader>
      <CardTitle>Review Management</CardTitle>
      <CardDescription>
        Monitor and moderate reviews across the platform.
        {totalReviews > 0 && (
          <span className="ml-2 text-xs text-gray-500">
            (Page {page} of {totalPages}, {totalReviews} total)
          </span>
        )}
      </CardDescription>
      <div className="mt-2">
        <CreateDummyReviews />
      </div>
    </CardHeader>
      <CardContent>
        {reviewsLoading ? (
          <div className="text-center py-8">Loading reviews...</div>
        ) : !displayedReviews || displayedReviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No reviews found.</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business / Entity</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedReviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>{review.entities?.name || review.business_id || 'N/A'}</TableCell>
                    <TableCell>{review.user_id || 'Anonymous'}</TableCell>
                    <TableCell>{review.rating}/5</TableCell>
                    <TableCell className="max-w-xs truncate" title={review.content || ''}>
                      {review.content || 'No content'}
                    </TableCell>
                    <TableCell>{review.created_at ? new Date(review.created_at).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={review.is_verified ? "default" : "secondary"}>
                        {review.is_verified ? 'Verified' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleModerateReview(review.id)}
                      >
                        Moderate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-between items-center mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={page === totalPages || totalPages === 0}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewManagementSection;
