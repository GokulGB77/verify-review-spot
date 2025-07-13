
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Shield, CheckCircle, Clock } from 'lucide-react';
import { VoteButtons } from '@/components/review/VoteButtons';

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
  upvotes,
  downvotes,
  date,
  businessResponse,
  businessResponseDate,
  title,
  pseudonym
}: ReviewCardProps) => {


  // Badge display logic - show only one badge per review
  const getBadgeDisplay = () => {
    // Priority 1: If proof is uploaded and verified, show review-specific verification badge
    if (proofProvided && proofVerified === true && reviewSpecificBadge) {
      return {
        badge: reviewSpecificBadge === 'Verified Employee' ? 'Verified Employee' : 'Verified Student',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: <Shield className="h-4 w-4 mr-1" />
      };
    }
    
    // Priority 2: If proof is uploaded but not yet verified, show pending verification
    if (proofProvided && proofVerified === false) {
      return {
        badge: 'Pending Verification',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: <Clock className="h-4 w-4 mr-1" />
      };
    }
    
    // Priority 3: Fall back to profile-based verification status
    if (mainBadge === 'Verified User') {
      return {
        badge: 'Verified User',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: <CheckCircle className="h-4 w-4 mr-1" />
      };
    }
    
    // Default: Unverified
    return {
      badge: 'Unverified User',
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: null
    };
  };

  // Display pseudonym if set, otherwise show generic term
  const displayName = pseudonym || userName || 'Anonymous Reviewer';
  const badgeDisplay = getBadgeDisplay();

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
                  className={`${badgeDisplay.color} flex items-center`}
                >
                  {badgeDisplay.icon}
                  {badgeDisplay.badge}
                </Badge>
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
        <p className="text-gray-700 mb-4 leading-relaxed break-words overflow-wrap-anywhere">{content}</p>
        
        {businessResponse && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
            <div className="flex items-center mb-2">
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                Business Response
              </Badge>
              <span className="text-sm text-gray-600 ml-2">{businessResponseDate}</span>
            </div>
            <p className="text-gray-700 break-words overflow-wrap-anywhere">{businessResponse}</p>
          </div>
        )}

        <VoteButtons 
          reviewId={id}
          upvotes={upvotes || 0}
          downvotes={downvotes || 0}
        />
      </CardContent>
    </Card>
  );
};

export default ReviewCard;
