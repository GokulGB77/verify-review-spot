
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Globe, Phone, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BusinessCardProps {
  id: string;
  name: string;
  category: string;
  description: string;
  rating: number;
  reviewCount: number;
  verificationStatus: 'Verified' | 'Claimed' | 'Unclaimed';
  location?: string;
  website?: string;
  phone?: string;
  isSponsored?: boolean;
  hasSubscription?: boolean;
}

const BusinessCard = ({
  id,
  name,
  category,
  description,
  rating,
  reviewCount,
  verificationStatus,
  location,
  website,
  phone,
  isSponsored = false,
  hasSubscription = false
}: BusinessCardProps) => {
  const getVerificationBadgeColor = (status: string) => {
    switch (status) {
      case 'Verified':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Claimed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className={`w-full hover:shadow-lg transition-shadow ${isSponsored ? 'border-yellow-200 bg-yellow-50' : ''}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <CardTitle className="text-xl">{name}</CardTitle>
              {isSponsored && (
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  Sponsored
                </Badge>
              )}
              {hasSubscription && (
                <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                  Trusted by Review Spot
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <CardDescription className="text-base">{category}</CardDescription>
              <Badge 
                variant="outline" 
                className={`${getVerificationBadgeColor(verificationStatus)} flex items-center`}
              >
                {verificationStatus === 'Verified' && <CheckCircle className="h-3 w-3 mr-1" />}
                {verificationStatus}
              </Badge>
            </div>
            <p className="text-gray-600 text-sm line-clamp-2">{description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="font-semibold text-lg">{rating}</span>
          <span className="text-gray-600">({reviewCount} reviews)</span>
        </div>

        <div className="space-y-2 mb-4">
          {location && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              {location}
            </div>
          )}
          {website && (
            <div className="flex items-center text-sm text-gray-600">
              <Globe className="h-4 w-4 mr-2" />
              <a href={website} className="hover:text-blue-600" target="_blank" rel="noopener noreferrer">
                {website}
              </a>
            </div>
          )}
          {phone && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-4 w-4 mr-2" />
              {phone}
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          <Button asChild className="flex-1">
            <Link to={`/business/${id}`}>
              View Reviews
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to={`/business/${id}/write-review`}>
              Write Review
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessCard;
