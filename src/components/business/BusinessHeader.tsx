
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Globe, Phone, Mail, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface BusinessHeaderProps {
  business: any;
  totalReviews: number;
}

const BusinessHeader = ({ business, totalReviews }: BusinessHeaderProps) => {
  const { user } = useAuth();

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <CardTitle className="text-3xl">{business.name}</CardTitle>
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                {business.verification_status || 'Unverified'}
              </Badge>
              {business.has_subscription && (
                <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                  Trusted by Review Spot
                </Badge>
              )}
            </div>
            <CardDescription className="text-lg mb-4">{business.category}</CardDescription>
            {business.description && (
              <p className="text-gray-700 mb-4">{business.description}</p>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              {business.location && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {business.location}
                </div>
              )}
              {business.website && (
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  <a href={business.website} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                    {business.website}
                  </a>
                </div>
              )}
              {business.phone && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  {business.phone}
                </div>
              )}
              {business.email && (
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  {business.email}
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6 lg:mt-0 lg:ml-8 text-center">
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <div className="text-4xl font-bold text-gray-900 mb-2">{(business.rating || 0).toFixed(1)}</div>
              <div className="flex items-center justify-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(business.rating || 0)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <div className="text-gray-600">{totalReviews} reviews</div>
              {user ? (
                <Button className="w-full mt-4" asChild>
                  <Link to={`/business/${business.id}/write-review`}>
                    Write a Review
                  </Link>
                </Button>
              ) : (
                <Button className="w-full mt-4" asChild>
                  <Link to="/auth">
                    Sign in to Review
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

export default BusinessHeader;
