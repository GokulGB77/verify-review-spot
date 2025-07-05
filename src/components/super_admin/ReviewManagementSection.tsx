import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Database } from '@/integrations/supabase/types'; // Assuming this type exists
import { Badge } from '@/components/ui/badge'; // Added for review status/tags if needed later

type Review = Database['public']['Tables']['reviews']['Row'] & {
  entities?: { name?: string | null } | null; // For displaying entity name
};

interface ReviewManagementSectionProps {
  reviews: Review[] | undefined;
  reviewsLoading: boolean;
  // Potentially add functions for moderation actions if they are to be handled here
}

const ReviewManagementSection: React.FC<ReviewManagementSectionProps> = ({ reviews, reviewsLoading }) => {
  // TODO: Implement pagination for reviews instead of slice(0, 10)
  const displayedReviews = reviews?.slice(0, 10);

  // TODO: Implement moderation logic (e.g., dialog, API calls)
  const handleModerateReview = (reviewId: string) => {
    console.log("Moderating review:", reviewId);
    // Placeholder for moderation functionality
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Management</CardTitle>
        <CardDescription>Monitor and moderate reviews across the platform. (Showing last 10 reviews)</CardDescription>
      </CardHeader>
      <CardContent>
        {reviewsLoading ? (
          <div className="text-center py-8">Loading reviews...</div>
        ) : !displayedReviews || displayedReviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No reviews found.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business / Entity</TableHead>
                <TableHead>User</TableHead> {/* Assuming user info might be available */}
                <TableHead>Rating</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead> {/* e.g. Pending, Approved, Rejected */}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedReviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>{review.entities?.name || review.business_id || 'N/A'}</TableCell>
                  <TableCell>{review.user_id || 'Anonymous'}</TableCell> {/* Adjust based on actual data */}
                  <TableCell>{review.rating}/5</TableCell>
                  <TableCell className="max-w-xs truncate" title={review.content || ''}>
                    {review.content || 'No content'}
                  </TableCell>
                  <TableCell>{review.created_at ? new Date(review.created_at).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>
                    {/* Placeholder for review status - you'll need a field for this in your DB */}
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
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewManagementSection;
