import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, CheckCircle, TrendingUp } from "lucide-react";

interface Entity {
  id: string;
  name: string;
  category?: string;
  website?: string;
  rating: number;
  reviewCount: number;
  verificationStatus: string;
}

interface BestEntitiesSectionProps {
  bestEntities: Entity[];
}

const BestEntitiesSection: React.FC<BestEntitiesSectionProps> = ({ bestEntities }) => {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Best Entities
            </h2>
            <p className="text-lg text-gray-600">
              Top-rated businesses and organizations trusted by users
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/businesses">See more</Link>
          </Button>
        </div>

        {bestEntities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestEntities.map((entity) => (
              <Link key={entity.id} to={`/business/${entity.id}`}>
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Entity Icon/Logo Placeholder */}
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                        <span className="text-2xl font-bold text-blue-600">
                          {entity.name.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      {/* Entity Name */}
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
                          {entity.name}
                        </h3>
                        {entity.website && (
                          <p className="text-sm text-blue-600 truncate">
                            {entity.website
                              .replace(/^https?:\/\//, "")
                              .replace(/^www\./, "")}
                          </p>
                        )}
                      </div>

                      {/* Rating */}
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(entity.rating)
                                ? "text-green-500 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="font-semibold text-sm ml-2">
                          {entity.rating.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({entity.reviewCount})
                        </span>
                      </div>

                      {/* Category and Verification */}
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {entity.category}
                        </Badge>
                        {entity.verificationStatus === "Verified" && (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200 text-xs"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-gray-50 rounded-lg p-8">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No top-rated entities yet
              </h3>
              <p className="text-gray-500 mb-4">
                Be the first to review and help others discover great
                businesses!
              </p>
              <Button asChild>
                <Link to="/write-review">Write a Review</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default BestEntitiesSection;
