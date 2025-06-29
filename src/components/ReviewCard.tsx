
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, ThumbsUp, ThumbsDown, Shield, CheckCircle, Clock } from 'lucide-react';
import { useState } from 'react';

interface ReviewCardProps {
  id: string;
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
  title?: string;
  pseudonym?: string | null;
}

const ReviewCard = ({
  id,
  userName,
  rating,
  content,
  mainBadge,
  reviewSpecificBadge,
  proofProvided,
  proofVerified,
  upvotes: initialUpvotes,
  downvotes: initialDownvotes,
  date,
  businessResponse,
  businessResponseDate,
  title,
  pseudonym
}: ReviewCardProps) => {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);

  const handleVote = (voteType: 'up' | 'down') => {
    if (userVote === voteType) {
      // Remove vote
      if (voteType === 'up') {
        setUpvotes(upvotes - 1);
      } else {
        setDownvotes(downvotes - 1);
      }
      setUserVote(null);
    } else {
      // Change or add vote
      if (userVote === 'up' && voteType === 'down') {
        setUpvotes(upvotes - 1);
        setDownvotes(downvotes + 1);
      } else if (userVote === 'down' && voteType === 'up') {
        setDownvotes(downvotes - 1);
        setUpvotes(upvotes + 1);
      } else if (userVote === null) {
        if (voteType === 'up') {
          setUpvotes(upvotes + 1);
        } else {
          setDownvotes(downvotes + 1);
        }
      }
      setUserVote(voteType);
    }
  };

  const getMainBadgeDisplay = () => {
    if (mainBadge === 'Verified User') {
      return {
        badge: 'Verified User',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: <CheckCircle className="h-4 w-4 mr-1" />
      };
    } else {
      return {
        badge: 'Unverified User',
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: null
      };
    }
  };

  const getReviewSpecificBadgeDisplay = () => {
    if (!reviewSpecificBadge) return null;
    
    if (reviewSpecificBadge === 'Verified Employee') {
      return {
        badge: 'Verified Employee',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: <Shield className="h-4 w-4 mr-1" />
      };
    } else if (reviewSpecificBadge === 'Verified Student') {
      return {
        badge: 'Verified Student',
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: <Shield className="h-4 w-4 mr-1" />
      };
    }
    return null;
  };

  // Display pseudonym if set, otherwise show generic term
  const displayName = pseudonym || userName || 'Anonymous Reviewer';
  const mainBadgeDisplay = getMainBadgeDisplay();
  const reviewSpecificBadgeDisplay = getReviewSpecificBadgeDisplay();

  return (
    <Card className="w-full mb-4">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-semibold text-gray-900">{displayName}</span>
                <Badge 
                  variant="outline" 
                  className={`${mainBadgeDisplay.color} flex items-center`}
                >
                  {mainBadgeDisplay.icon}
                  {mainBadgeDisplay.badge}
                </Badge>
                {reviewSpecificBadgeDisplay && (
                  <Badge 
                    variant="outline" 
                    className={`${reviewSpecificBadgeDisplay.color} flex items-center`}
                  >
                    {reviewSpecificBadgeDisplay.icon}
                    {reviewSpecificBadgeDisplay.badge}
                  </Badge>
                )}
              </div>
              <div className="flex items-center mt-1">
                <div className="flex items-center mr-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">{date}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {title && (
          <h3 className="font-semibold text-lg mb-2 text-gray-900">{title}</h3>
        )}
        <p className="text-gray-700 mb-4 leading-relaxed">{content}</p>
        
        {businessResponse && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
            <div className="flex items-center mb-2">
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                Business Response
              </Badge>
              <span className="text-sm text-gray-600 ml-2">{businessResponseDate}</span>
            </div>
            <p className="text-gray-700">{businessResponse}</p>
          </div>
        )}

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleVote('up')}
            className={`flex items-center space-x-1 ${
              userVote === 'up' ? 'text-green-600 bg-green-50' : ''
            }`}
          >
            <ThumbsUp className="h-4 w-4" />
            <span>{upvotes}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleVote('down')}
            className={`flex items-center space-x-1 ${
              userVote === 'down' ? 'text-red-600 bg-red-50' : ''
            }`}
          >
            <ThumbsDown className="h-4 w-4" />
            <span>{downvotes}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewCard;
