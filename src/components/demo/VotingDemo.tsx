import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VoteButtons } from "@/components/review/VoteButtons";

// Demo component to showcase voting functionality
export const VotingDemo = () => {
  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Review Voting Demo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Sample review content...</p>
          <VoteButtons 
            reviewId="demo-review-1" 
            upvotes={5} 
            downvotes={1} 
          />
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Another review with different votes...</p>
          <VoteButtons 
            reviewId="demo-review-2" 
            upvotes={12} 
            downvotes={3} 
          />
        </div>
      </CardContent>
    </Card>
  );
};