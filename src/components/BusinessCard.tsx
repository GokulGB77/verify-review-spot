import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Globe, Phone, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Business } from '@/hooks/useBusinesses';

interface BusinessCardProps {
  entity_id: string;
  name: string;
  industry?: string | null;
  description?: string | null;
  average_rating?: number | null;
  review_count?: number | null;
  is_verified?: boolean | null;
  location?: any;
  contact?: any;
  trust_level?: string | null;
  claimed_by_business?: boolean | null;
}

const BusinessCard = ({
  entity_id,
  name,
  industry,
  description,
  average_rating,
  review_count,
  is_verified,
  location,
  contact,
  trust_level,
  claimed_by_business
}: BusinessCardProps) => {
  const getVerificationBadgeColor = (verified: boolean | null) => {
    return verified 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const displayRating = average_rating || 0;
  const displayReviewCount = review_count || 0;
  
  // Extract location and contact info from JSONB fields
  const locationData = location as any;
  const contactData = contact as any;
  const displayLocation = locationData?.address || locationData?.city || '';
  const website = contactData?.website || '';
  const phone = contactData?.phone || '';

  return (
    <Card className="w-full h-full hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white">
      <CardHeader className="pb-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-xl font-semibold text-gray-900 line-clamp-1">
              {name}
            </CardTitle>
            {claimed_by_business && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                Trusted
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <CardDescription className="text-sm font-medium text-gray-600">
              {industry || 'Business'}
            </CardDescription>
            <Badge 
              variant="outline" 
              className={`${getVerificationBadgeColor(is_verified)} flex items-center text-xs`}
            >
              {is_verified && <CheckCircle className="h-3 w-3 mr-1" />}
              {is_verified ? 'Verified' : 'Unverified'}
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
            {displayLocation && (
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                <span className="truncate">{displayLocation}</span>
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
              <Link to={`/entities/${entity_id}`}>
                View Reviews
              </Link>
            </Button>
            <Button variant="outline" asChild className="border-gray-300 hover:bg-gray-50">
              <Link to={`/write-review?entityId=${entity_id}`}>
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
