
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, ThumbsUp, ThumbsDown, Shield, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface ReviewCardProps {
  id: string;
  userName: string;
  rating: number;
  content: string;
  userBadge: 'Verified Graduate' | 'Verified Employee' | 'Verified User' | 'Unverified User';
  proofProvided: boolean;
  upvotes: number;
  downvotes: number;
  date: string;
  businessResponse?: string;
  businessResponseDate?: string;
  title?: string;
  isVerified?: boolean;
  pseudonym?: string | null;
}

const ReviewCard = ({
  id,
  userName,
  rating,
  content,
  userBadge,
  proofProvided,
  upvotes: initialUpvotes,
  downvotes: initialDownvotes,
  date,
  businessResponse,
  businessResponseDate,
  title,
  isVerified = false,
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

  const getVerificationColor = (level: string) => {
    switch (level) {
      case 'Verified Graduate':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Verified Employee':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Verified User':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getVerificationIcon = (level: string) => {
    if (level === 'Unverified User') {
      return null;
    }
    return level === 'Verified Graduate' || level === 'Verified Employee' ? 
      <CheckCircle className="h-4 w-4 mr-1" /> : 
      <Shield className="h-4 w-4 mr-1" />;
  };

  // Display pseudonym if set, otherwise show generic term
  const displayName = pseudonym || 'Anonymous Reviewer';

  return (
    <Card className="w-full mb-4">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-900">{displayName}</span>
                <Badge 
                  variant="outline" 
                  className={`${getVerificationColor(userBadge)} flex items-center`}
                >
                  {getVerificationIcon(userBadge)}
                  {userBadge}
                </Badge>
                {proofProvided && (
                  <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                    Proof Provided
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
