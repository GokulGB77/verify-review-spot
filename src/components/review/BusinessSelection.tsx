
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Star } from 'lucide-react';

interface BusinessSelectionProps {
  selectedBusiness: any;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredEntities: any[];
  onBusinessSelect: (business: any) => void;
  onClearSelection: () => void;
  isUpdate: boolean;
  isEdit: boolean;
}

const BusinessSelection = ({
  selectedBusiness,
  searchQuery,
  setSearchQuery,
  filteredEntities,
  onBusinessSelect,
  onClearSelection,
  isUpdate,
  isEdit
}: BusinessSelectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Business or Service</CardTitle>
        <CardDescription>
          {selectedBusiness ? 
            (isEdit ? 'Editing review for:' : (isUpdate ? 'Updating review for:' : 'You are reviewing:'))
            : 'Search for the business you want to review'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedBusiness ? (
          <div className="p-4 border rounded-lg bg-green-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-green-900">{selectedBusiness.name}</h3>
                <p className="text-sm text-green-700">{selectedBusiness.industry}</p>
              </div>
              {!isUpdate && !isEdit && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClearSelection}
                >
                  Change
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search for a business, service, or institution..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {searchQuery && filteredEntities.length > 0 && (
              <div className="border rounded-lg max-h-60 overflow-y-auto mt-2">
                {filteredEntities.map((entity) => (
                  <div
                    key={entity.entity_id}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                    onClick={() => onBusinessSelect(entity)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{entity.name}</h3>
                        <p className="text-sm text-gray-600">{entity.industry}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {entity.average_rating && (
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm ml-1">{entity.average_rating.toFixed(1)}</span>
                          </div>
                        )}
                        {entity.is_verified && (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BusinessSelection;
