import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, MessageSquare, TrendingUp } from 'lucide-react';
import { Database } from '@/integrations/supabase/types'; // Assuming this type exists

type Entity = Database['public']['Tables']['entities']['Row'];
type Review = Database['public']['Tables']['reviews']['Row']; // Assuming this type exists

interface Stats {
  totalBusinesses: number;
  totalReviews: number;
  verifiedBusinesses: number;
  activeBusinesses: number;
  averageRating: number;
}

interface AnalyticsSectionProps {
  stats: Stats;
  entities: Entity[] | undefined; // For "new this month" calculation
  reviews: Review[] | undefined;  // For "new this month" calculation
}

const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ stats, entities, reviews }) => {
  const newBusinessesThisMonth = entities?.filter(b =>
    b.created_at && new Date(b.created_at).getMonth() === new Date().getMonth() && new Date(b.created_at).getFullYear() === new Date().getFullYear()
  ).length || 0;

  const newReviewsThisMonth = reviews?.filter(r =>
    r.created_at && new Date(r.created_at).getMonth() === new Date().getMonth() && new Date(r.created_at).getFullYear() === new Date().getFullYear()
  ).length || 0;

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Businesses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBusinesses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" /> {/* Changed icon for variety, was Building2 */}
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Businesses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeBusinesses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-purple-600" /> {/* Changed icon, was Users */}
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Verified Businesses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.verifiedBusinesses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Platform Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Total Businesses:</span>
                <span className="font-semibold">{stats.totalBusinesses}</span>
              </div>
              <div className="flex justify-between">
                <span>Active Businesses:</span>
                <span className="font-semibold">{stats.activeBusinesses}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Reviews:</span>
                <span className="font-semibold">{stats.totalReviews}</span>
              </div>
              <div className="flex justify-between">
                <span>Verification Rate:</span>
                <span className="font-semibold">
                  {stats.totalBusinesses > 0 ? Math.round((stats.verifiedBusinesses / stats.totalBusinesses) * 100) : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity (This Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600 space-y-2">
              <p>New businesses registered: {newBusinessesThisMonth}</p>
              <p>New reviews submitted: {newReviewsThisMonth}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AnalyticsSection;
