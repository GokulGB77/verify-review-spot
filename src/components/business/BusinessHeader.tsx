import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Globe, Phone, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import ShareButton from '@/components/ui/share-button';
import type { Entity } from '@/hooks/useEntities';

interface BusinessHeaderProps {
  business: Entity;
  totalReviews: number;
}

const BusinessHeader = ({ business, totalReviews }: BusinessHeaderProps) => {
  const getVerificationBadgeColor = (verified: boolean | null) => {
    return verified 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const displayRating = business.average_rating || 0;
  
  // Safely extract location and contact info from JSONB fields
  const locationData = business.location as any;
  const contactData = business.contact as any;
  
  const formatLocation = (location: any) => {
    if (!location) return '';
    if (typeof location === 'string') return location;
    if (typeof location === 'object') {
      const parts = [];
      if (location.city) parts.push(location.city);
      if (location.state) parts.push(location.state);
      if (location.country) parts.push(location.country);
      return parts.join(', ');
    }
    return '';
  };

  const displayLocation = formatLocation(locationData);
  const website = contactData?.website || '';
  const phone = contactData?.phone || '';

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                {business.name}
              </CardTitle>
              <CardDescription className="text-lg font-medium text-gray-600">
                {business.industry || 'Business'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {business.claimed_by_business && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Trusted
                </Badge>
              )}
              <Badge 
                variant="outline" 
                className={`${getVerificationBadgeColor(business.is_verified)} flex items-center`}
              >
                {business.is_verified && <CheckCircle className="h-3 w-3 mr-1" />}
                {business.is_verified ? 'Verified' : 'Unverified'}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(displayRating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="font-semibold text-xl text-gray-900">
              {displayRating.toFixed(1)}
            </span>
            <span className="text-gray-500">
              ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
            </span>
          </div>

          {business.description && (
            <p className="text-gray-600 leading-relaxed">
              {business.description}
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayLocation && (
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                <span>{displayLocation}</span>
              </div>
            )}
            {website && (
              <div className="flex items-center text-gray-600">
                <Globe className="h-4 w-4 mr-2 text-gray-400" />
                <a 
                  href={website} 
                  className="hover:text-blue-600 transition-colors" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
            {phone && (
              <div className="flex items-center text-gray-600">
                <Phone className="h-4 w-4 mr-2 text-gray-400" />
                <span>{phone}</span>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link to={`/write-review?entityId=${business.entity_id}`}>
                Write a Review
              </Link>
            </Button>
            <Button variant="outline" size="lg">
              Contact Business
            </Button>
            <ShareButton 
              entityName={business.name}
              entityId={business.entity_id}
              rating={displayRating}
              description={business.description}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessHeader;
