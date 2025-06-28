
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, CheckCircle } from "lucide-react";
import { useEntities } from "@/hooks/useEntities";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const { data: entities = [], isLoading } = useEntities();
  const [filteredEntities, setFilteredEntities] = useState([]);

  useEffect(() => {
    if (query && entities.length > 0) {
      const filtered = entities.filter((entity) =>
        entity.name.toLowerCase().includes(query.toLowerCase()) ||
        (entity.description && entity.description.toLowerCase().includes(query.toLowerCase())) ||
        (entity.industry && entity.industry.toLowerCase().includes(query.toLowerCase()))
      );
      setFilteredEntities(filtered);
    } else {
      setFilteredEntities([]);
    }
  }, [query, entities]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Search Results for "{query}"
          </h1>
          <p className="text-gray-600">
            Found {filteredEntities.length} results
          </p>
        </div>

        {filteredEntities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEntities.map((entity) => (
              <Link key={entity.entity_id} to={`/entities/${entity.entity_id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2 line-clamp-2">
                          {entity.name}
                        </CardTitle>
                        {entity.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {entity.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Rating */}
                      {entity.average_rating && entity.average_rating > 0 && (
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(entity.average_rating)
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                          <span className="font-semibold text-sm ml-2">
                            {entity.average_rating.toFixed(1)}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({entity.review_count})
                          </span>
                        </div>
                      )}

                      {/* Category */}
                      {entity.industry && (
                        <Badge variant="secondary" className="text-xs">
                          {entity.industry}
                        </Badge>
                      )}

                      {/* Verification Status */}
                      {entity.is_verified && (
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-xs text-green-700">Verified</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No results found
            </h3>
            <p className="text-gray-600">
              Try searching with different keywords or browse all entities.
            </p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default SearchResults;
