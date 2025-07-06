import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Search, Eye, Edit, Ban, RefreshCcw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import EntityEditForm from '@/components/EntityEditForm';
import { useEntityMutations } from '@/hooks/useEntityMutations';

interface EntityManagementSectionProps {
  entities: any[];
  entitiesLoading: boolean;
}

const EntityManagementSection: React.FC<EntityManagementSectionProps> = ({
  entities,
  entitiesLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [selectedEntity, setSelectedEntity] = useState<any | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    toggleBusinessClaimed,
    deactivateEntity,
    reactivateEntity,
  } = useEntityMutations(queryClient);

  const filteredEntities = entities?.filter(entity => {
    const nameMatch = entity.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const industryMatch = entity.industry?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = nameMatch || industryMatch;
    const matchesStatus = statusFilter === 'all' || (entity.status || 'active') === statusFilter;
    const matchesVerification = verificationFilter === 'all' ||
                               (entity.is_verified ? 'Verified' : 'Unverified') === verificationFilter;
    return matchesSearch && matchesStatus && matchesVerification;
  });

  const handleViewDialogClose = () => {
    setSelectedEntity(null);
    setIsEditMode(false);
  };

  const handleEditSuccess = () => {
    setIsEditMode(false);
    queryClient.invalidateQueries({ queryKey: ['entities'] });
    toast({
      title: 'Entity Updated',
      description: 'The entity details have been successfully updated.',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Entity Management</CardTitle>
        <CardDescription>Manage and verify entities on the platform</CardDescription>

        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex-1">
            <Label htmlFor="search-entities">Search Entities</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search-entities"
                placeholder="Search by name or industry..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex-shrink-0">
            <Label htmlFor="status-filter">Filter by Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="status-filter" className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-shrink-0">
            <Label htmlFor="verification-filter">Filter by Verification</Label>
            <Select value={verificationFilter} onValueChange={setVerificationFilter}>
              <SelectTrigger id="verification-filter" className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Verification</SelectItem>
                <SelectItem value="Verified">Verified</SelectItem>
                <SelectItem value="Unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {entitiesLoading ? (
          <div className="text-center py-8">Loading entities...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Reviews</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Business Claimed</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntities?.map((entity) => (
                <TableRow key={entity.entity_id}>
                  <TableCell className="font-medium">{entity.name}</TableCell>
                  <TableCell className="capitalize">{entity.entity_type?.replace('_', ' ') || 'N/A'}</TableCell>
                  <TableCell>{entity.industry || 'N/A'}</TableCell>
                  <TableCell>{entity.average_rating || 0}/5</TableCell>
                  <TableCell>{entity.review_count || 0}</TableCell>
                  <TableCell>
                    <Badge variant={entity.is_verified ? 'default' : 'secondary'}>
                      {entity.is_verified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={(entity.status || 'active') === 'active' ? 'default' : 'destructive'}>
                      {(entity.status || 'active') === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={entity.claimed_by_business || false}
                        onCheckedChange={() => toggleBusinessClaimed.mutate({
                          entityId: entity.entity_id,
                          currentStatus: entity.claimed_by_business || false
                        })}
                        disabled={toggleBusinessClaimed.isPending}
                        id={`claimed-${entity.entity_id}`}
                      />
                      <Label htmlFor={`claimed-${entity.entity_id}`} className="text-xs">
                        {entity.claimed_by_business ? 'Claimed' : 'Unclaimed'}
                      </Label>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog onOpenChange={(open) => !open && handleViewDialogClose()}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedEntity(entity)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              Entity Details
                              {!isEditMode && selectedEntity && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setIsEditMode(true)}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                              )}
                            </DialogTitle>
                          </DialogHeader>
                          {selectedEntity && (
                            <div className="space-y-4">
                              {isEditMode ? (
                                <EntityEditForm
                                  entity={selectedEntity}
                                  onCancel={() => setIsEditMode(false)}
                                  onSuccess={handleEditSuccess}
                                />
                              ) : (
                                <>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <Label className="font-semibold">Name</Label>
                                      <p className="text-sm">{selectedEntity.name}</p>
                                    </div>
                                    <div>
                                      <Label className="font-semibold">Legal Name</Label>
                                      <p className="text-sm">{selectedEntity.legal_name || 'Not provided'}</p>
                                    </div>
                                    <div>
                                      <Label className="font-semibold">Entity Type</Label>
                                      <p className="text-sm capitalize">{selectedEntity.entity_type?.replace('_', ' ') || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <Label className="font-semibold">Industry</Label>
                                      <p className="text-sm">{selectedEntity.industry || 'Not provided'}</p>
                                    </div>
                                    <div>
                                      <Label className="font-semibold">Rating</Label>
                                      <p className="text-sm">{selectedEntity.average_rating || 0}/5 ({selectedEntity.review_count || 0} reviews)</p>
                                    </div>
                                    <div>
                                      <Label className="font-semibold">Website</Label>
                                      <p className="text-sm">{(selectedEntity.contact as any)?.website || 'Not provided'}</p>
                                    </div>
                                    <div>
                                      <Label className="font-semibold">Phone</Label>
                                      <p className="text-sm">{(selectedEntity.contact as any)?.phone || 'Not provided'}</p>
                                    </div>
                                    <div>
                                      <Label className="font-semibold">Email</Label>
                                      <p className="text-sm">{(selectedEntity.contact as any)?.email || 'Not provided'}</p>
                                    </div>
                                    <div>
                                      <Label className="font-semibold">Verification Status</Label>
                                      <div className="mt-1">
                                        <Badge variant={selectedEntity.is_verified ? 'default' : 'secondary'}>
                                          {selectedEntity.is_verified ? 'Verified' : 'Unverified'}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="font-semibold">Active Status</Label>
                                      <div className="mt-1">
                                        <Badge variant={(selectedEntity.status || 'active') === 'active' ? 'default' : 'destructive'}>
                                          {(selectedEntity.status || 'active') === 'active' ? 'Active' : 'Inactive'}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                  {selectedEntity.description && (
                                    <div>
                                      <Label className="font-semibold">Description</Label>
                                      <p className="text-sm mt-1 whitespace-pre-wrap">{selectedEntity.description}</p>
                                    </div>
                                  )}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <Label className="font-semibold">Founded Year</Label>
                                      <p className="text-sm">{selectedEntity.founded_year || 'Not provided'}</p>
                                    </div>
                                    <div>
                                      <Label className="font-semibold">Employee Count</Label>
                                      <p className="text-sm">{selectedEntity.number_of_employees || 'Not provided'}</p>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      {(entity.status || 'active') === 'inactive' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => reactivateEntity.mutate(entity.entity_id)}
                          disabled={reactivateEntity.isPending}
                        >
                          <RefreshCcw className="h-4 w-4 mr-1" />
                          {reactivateEntity.isPending ? 'Reactivating...' : 'Reactivate'}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deactivateEntity.mutate(entity.entity_id)}
                          disabled={deactivateEntity.isPending}
                        >
                          <Ban className="h-4 w-4 mr-1" />
                          {deactivateEntity.isPending ? 'Deactivating...' : 'Deactivate'}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {filteredEntities && filteredEntities.length === 0 && !entitiesLoading && (
          <div className="text-center py-8 text-gray-500">No entities found matching your criteria.</div>
        )}
      </CardContent>
    </Card>
  );
};

export default EntityManagementSection;