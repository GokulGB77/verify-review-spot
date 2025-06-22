
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from 'lucide-react';

interface RatingBreakdownProps {
  ratingDistribution: Array<{
    stars: number;
    count: number;
    percentage: number;
  }>;
}

const RatingBreakdown = ({ ratingDistribution }: RatingBreakdownProps) => {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Rating Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {ratingDistribution.map((item) => (
          <div key={item.stars} className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 w-12">
              <span className="text-sm font-medium">{item.stars}</span>
              <Star className="h-3 w-3 text-yellow-400 fill-current" />
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-400 h-2 rounded-full" 
                style={{ width: `${item.percentage}%` }}
              />
            </div>
            <span className="text-sm text-gray-600 w-8 text-right">{item.count}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default RatingBreakdown;
