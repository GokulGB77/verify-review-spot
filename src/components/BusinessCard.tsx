
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Globe, Phone, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Business } from '@/hooks/useBusinesses';

interface BusinessCardProps extends Business {}

const BusinessCard = ({
  id,
  name,
  category,
  description,
  rating,
  review_count,
  verification_status,
  location,
  website,
  phone,
  has_subscription
}: BusinessCardProps) => {
  const getVerificationBadgeColor = (status: string | null) => {
    switch (status) {
      case 'Verified':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Claimed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const displayRating = rating || 0;
  const displayReviewCount = review_count || 0;

  return (
    <Card className="w-full h-full hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white">
      <CardHeader className="pb-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-xl font-semibold text-gray-900 line-clamp-1">
              {name}
            </CardTitle>
            {has_subscription && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                Trusted
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <CardDescription className="text-sm font-medium text-gray-600">
              {category}
            </CardDescription>
            <Badge 
              variant="outline" 
              className={`${getVerificationBadgeColor(verification_status)} flex items-center text-xs`}
            >
              {verification_status === 'Verified' && <CheckCircle className="h-3 w-3 mr-1" />}
              {verification_status || 'Unverified'}
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(displayRating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="font-semibold text-lg text-gray-900">{displayRating.toFixed(1)}</span>
            <span className="text-sm text-gray-500">({displayReviewCount} reviews)</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {description && (
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
              {description}
            </p>
          )}

          <div className="space-y-2">
            {location && (
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                <span className="truncate">{location}</span>
              </div>
            )}
            {website && (
              <div className="flex items-center text-sm text-gray-600">
                <Globe className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                <a 
                  href={website} 
                  className="hover:text-blue-600 transition-colors truncate" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
            {phone && (
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                <span>{phone}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button asChild className="flex-1 bg-blue-600 hover:bg-blue-700">
              <Link to={`/business/${id}`}>
                View Reviews
              </Link>
            </Button>
            <Button variant="outline" asChild className="border-gray-300 hover:bg-gray-50">
              <Link to={`/business/${id}/write-review`}>
                Write Review
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessCard;
