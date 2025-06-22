
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertTriangle } from 'lucide-react';

interface BusinessOverviewProps {
  business: any;
  totalReviews: number;
  verifiedReviewsCount: number;
}

const BusinessOverview = ({ business, totalReviews, verifiedReviewsCount }: BusinessOverviewProps) => {
  const verifiedPercentage = totalReviews > 0 ? Math.round((verifiedReviewsCount / totalReviews) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Total Reviews</span>
              <span className="font-semibold">{totalReviews}</span>
            </div>
            <div className="flex justify-between">
              <span>Verified Reviews</span>
              <span className="font-semibold">
                {verifiedReviewsCount} ({verifiedPercentage}%)
              </span>
            </div>
            <div className="flex justify-between">
              <span>Average Rating</span>
              <span className="font-semibold">{(business.rating || 0).toFixed(1)}/5</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Business Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Identity Verified</span>
              {business.verification_status === 'Verified' ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span>Business Claimed</span>
              {business.verification_status !== 'Unclaimed' ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span>Premium Member</span>
              {business.has_subscription ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <span className="text-sm text-gray-600">No</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessOverview;
