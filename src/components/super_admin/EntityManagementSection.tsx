import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Eye, Edit, Ban, RefreshCcw, Trash2, ChevronUp, ChevronDown, CheckSquare, Square, ExternalLink } from 'lucide-react';
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
  const [sortColumn, setSortColumn] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Bulk selection state
  const [selectedEntityIds, setSelectedEntityIds] = useState<Set<string>>(new Set());

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    toggleBusinessClaimed,
    deactivateEntity,
    reactivateEntity,
    deleteEntity,
  } = useEntityMutations(queryClient);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortValue = (entity: any, column: string) => {
    switch (column) {
      case 'name':
        return entity.name?.toLowerCase() || '';
      case 'type':
        return entity.entity_type || '';
      case 'industry':
        return entity.industry?.toLowerCase() || '';
      case 'rating':
        return entity.average_rating || 0;
      case 'reviews':
        return entity.review_count || 0;
      case 'verification':
        return entity.is_verified ? 1 : 0;
      case 'status':
        return entity.status || 'active';
      default:
        return '';
    }
  };

  const filteredEntities = entities?.filter(entity => {
    const nameMatch = entity.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const industryMatch = entity.industry?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = nameMatch || industryMatch;
    const matchesStatus = statusFilter === 'all' || (entity.status || 'active') === statusFilter;
    const matchesVerification = verificationFilter === 'all' ||
                               (entity.is_verified ? 'Verified' : 'Unverified') === verificationFilter;
    return matchesSearch && matchesStatus && matchesVerification;
  })?.sort((a, b) => {
    const aValue = getSortValue(a, sortColumn);
    const bValue = getSortValue(b, sortColumn);
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  // Pagination calculations
  const totalItems = filteredEntities?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEntities = filteredEntities?.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, verificationFilter, sortColumn, sortDirection]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return null;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

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

  // Bulk operations functions
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(paginatedEntities?.map(entity => entity.entity_id) || []);
      setSelectedEntityIds(allIds);
    } else {
      setSelectedEntityIds(new Set());
    }
  };

  const handleSelectEntity = (entityId: string, checked: boolean) => {
    const newSelection = new Set(selectedEntityIds);
    if (checked) {
      newSelection.add(entityId);
    } else {
      newSelection.delete(entityId);
    }
    setSelectedEntityIds(newSelection);
  };

  const handleBulkDeactivate = async () => {
    const activeEntities = Array.from(selectedEntityIds).filter(id => {
      const entity = entities?.find(e => e.entity_id === id);
      return entity && (entity.status || 'active') === 'active';
    });

    if (activeEntities.length === 0) {
      toast({
        title: 'No Active Entities',
        description: 'No active entities selected for deactivation.',
        variant: 'destructive',
      });
      return;
    }

    for (const entityId of activeEntities) {
      try {
        await deactivateEntity.mutateAsync(entityId);
      } catch (error) {
        console.error(`Failed to deactivate entity ${entityId}:`, error);
      }
    }

    setSelectedEntityIds(new Set());
    toast({
      title: 'Bulk Deactivation Complete',
      description: `Successfully deactivated ${activeEntities.length} entities.`,
    });
  };

  const handleBulkReactivate = async () => {
    const inactiveEntities = Array.from(selectedEntityIds).filter(id => {
      const entity = entities?.find(e => e.entity_id === id);
      return entity && (entity.status || 'active') === 'inactive';
    });

    if (inactiveEntities.length === 0) {
      toast({
        title: 'No Inactive Entities',
        description: 'No inactive entities selected for reactivation.',
        variant: 'destructive',
      });
      return;
    }

    for (const entityId of inactiveEntities) {
      try {
        await reactivateEntity.mutateAsync(entityId);
      } catch (error) {
        console.error(`Failed to reactivate entity ${entityId}:`, error);
      }
    }

    setSelectedEntityIds(new Set());
    toast({
      title: 'Bulk Reactivation Complete',
      description: `Successfully reactivated ${inactiveEntities.length} entities.`,
    });
  };

  const handleBulkDelete = async () => {
    const selectedEntitiesArray = Array.from(selectedEntityIds);
    
    if (selectedEntitiesArray.length === 0) {
      toast({
        title: 'No Entities Selected',
        description: 'Please select entities to delete.',
        variant: 'destructive',
      });
      return;
    }

    for (const entityId of selectedEntitiesArray) {
      try {
        await deleteEntity.mutateAsync(entityId);
      } catch (error) {
        console.error(`Failed to delete entity ${entityId}:`, error);
      }
    }

    setSelectedEntityIds(new Set());
    toast({
      title: 'Bulk Deletion Complete',
      description: `Successfully deleted ${selectedEntitiesArray.length} entities.`,
    });
  };

  const isAllSelected = paginatedEntities?.length > 0 && 
    paginatedEntities.every(entity => selectedEntityIds.has(entity.entity_id));
  const isIndeterminate = selectedEntityIds.size > 0 && !isAllSelected;

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
        {/* Bulk Actions Toolbar */}
        {selectedEntityIds.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {selectedEntityIds.size} selected
                </Badge>
                <span className="text-sm text-gray-600">
                  Bulk Actions:
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkReactivate}
                  disabled={deactivateEntity.isPending || reactivateEntity.isPending}
                >
                  <RefreshCcw className="h-4 w-4 mr-1" />
                  Reactivate Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDeactivate}
                  disabled={deactivateEntity.isPending || reactivateEntity.isPending}
                >
                  <Ban className="h-4 w-4 mr-1" />
                  Deactivate Selected
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={deleteEntity.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete Selected
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Selected Entities</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {selectedEntityIds.size} selected entities? This action cannot be undone and will permanently remove all selected entities and their associated data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleBulkDelete}
                        disabled={deleteEntity.isPending}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {deleteEntity.isPending ? 'Deleting...' : 'Delete All Selected'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedEntityIds(new Set())}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </div>
        )}

        {entitiesLoading ? (
          <div className="text-center py-8">Loading entities...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    className={isIndeterminate ? "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground" : ""}
                  />
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                    onClick={() => handleSort('name')}
                  >
                    <span className="flex items-center gap-1">
                      Name
                      {getSortIcon('name')}
                    </span>
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                    onClick={() => handleSort('type')}
                  >
                    <span className="flex items-center gap-1">
                      Type
                      {getSortIcon('type')}
                    </span>
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                    onClick={() => handleSort('industry')}
                  >
                    <span className="flex items-center gap-1">
                      Industry
                      {getSortIcon('industry')}
                    </span>
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                    onClick={() => handleSort('rating')}
                  >
                    <span className="flex items-center gap-1">
                      Rating
                      {getSortIcon('rating')}
                    </span>
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                    onClick={() => handleSort('reviews')}
                  >
                    <span className="flex items-center gap-1">
                      Reviews
                      {getSortIcon('reviews')}
                    </span>
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                    onClick={() => handleSort('verification')}
                  >
                    <span className="flex items-center gap-1">
                      Verification
                      {getSortIcon('verification')}
                    </span>
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                    onClick={() => handleSort('status')}
                  >
                    <span className="flex items-center gap-1">
                      Status
                      {getSortIcon('status')}
                    </span>
                  </Button>
                </TableHead>
                <TableHead>Business Claimed</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEntities?.map((entity) => (
                <TableRow key={entity.entity_id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedEntityIds.has(entity.entity_id)}
                      onCheckedChange={(checked) => 
                        handleSelectEntity(entity.entity_id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div>
                      {(entity.contact as any)?.website ? (
                        <a
                          href={(entity.contact as any).website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                        >
                          {entity.name}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <div className="font-medium">{entity.name}</div>
                      )}
                      {/* <div className="text-xs text-gray-500 font-mono">
                        ID: {entity.entity_id}
                      </div> */}
                    </div>
                  </TableCell>
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
                                <div className="space-y-6">
                                  {/* Basic Information */}
                                  <div className="border-b pb-4">
                                    <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <Label className="font-semibold">Entity ID</Label>
                                        <p className="text-sm font-mono">{selectedEntity.entity_id}</p>
                                      </div>
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
                                        <Label className="font-semibold">Tagline</Label>
                                        <p className="text-sm">{selectedEntity.tagline || 'Not provided'}</p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">Industry</Label>
                                        <p className="text-sm">{selectedEntity.industry || 'Not provided'}</p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">Sub Industry</Label>
                                        <p className="text-sm">{selectedEntity.sub_industry || 'Not provided'}</p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">Founded Year</Label>
                                        <p className="text-sm">{selectedEntity.founded_year || 'Not provided'}</p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">Employee Count</Label>
                                        <p className="text-sm">{selectedEntity.number_of_employees || 'Not provided'}</p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">Revenue Range</Label>
                                        <p className="text-sm">{selectedEntity.revenue_range || 'Not provided'}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Description */}
                                  {selectedEntity.description && (
                                    <div className="border-b pb-4">
                                      <h3 className="text-lg font-semibold mb-3">Description</h3>
                                      <p className="text-sm whitespace-pre-wrap">{selectedEntity.description}</p>
                                    </div>
                                  )}

                                  {/* Contact Information */}
                                  <div className="border-b pb-4">
                                    <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    </div>
                                  </div>

                                  {/* Location Information */}
                                  <div className="border-b pb-4">
                                    <h3 className="text-lg font-semibold mb-3">Location</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <Label className="font-semibold">Address</Label>
                                        <p className="text-sm">{(selectedEntity.location as any)?.address || 'Not provided'}</p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">City</Label>
                                        <p className="text-sm">{(selectedEntity.location as any)?.city || 'Not provided'}</p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">State</Label>
                                        <p className="text-sm">{(selectedEntity.location as any)?.state || 'Not provided'}</p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">Country</Label>
                                        <p className="text-sm">{(selectedEntity.location as any)?.country || 'Not provided'}</p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">Zip Code</Label>
                                        <p className="text-sm">{(selectedEntity.location as any)?.zip_code || 'Not provided'}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Status & Verification */}
                                  <div className="border-b pb-4">
                                    <h3 className="text-lg font-semibold mb-3">Status & Verification</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <Label className="font-semibold">Verification Status</Label>
                                        <div className="mt-1">
                                          <Badge variant={selectedEntity.is_verified ? 'default' : 'secondary'}>
                                            {selectedEntity.is_verified ? 'Verified' : 'Unverified'}
                                          </Badge>
                                        </div>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">Trust Level</Label>
                                        <div className="mt-1">
                                          <Badge variant="outline">
                                            {selectedEntity.trust_level || 'basic'}
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
                                      <div>
                                        <Label className="font-semibold">Business Claimed</Label>
                                        <div className="mt-1">
                                          <Badge variant={selectedEntity.claimed_by_business ? 'default' : 'secondary'}>
                                            {selectedEntity.claimed_by_business ? 'Claimed' : 'Unclaimed'}
                                          </Badge>
                                        </div>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">Claimed By User ID</Label>
                                        <p className="text-sm font-mono">{selectedEntity.claimed_by_user_id || 'Not claimed'}</p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">Profile Completion</Label>
                                        <p className="text-sm">{selectedEntity.profile_completion || 0}%</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Rating & Reviews */}
                                  <div className="border-b pb-4">
                                    <h3 className="text-lg font-semibold mb-3">Rating & Reviews</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <Label className="font-semibold">Average Rating</Label>
                                        <p className="text-sm">{selectedEntity.average_rating || 0}/5</p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">Review Count</Label>
                                        <p className="text-sm">{selectedEntity.review_count || 0}</p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">Platform Score</Label>
                                        <p className="text-sm">{selectedEntity.platform_score || 0}</p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">Can Reply to Reviews</Label>
                                        <div className="mt-1">
                                          <Badge variant={selectedEntity.can_reply_to_reviews ? 'default' : 'secondary'}>
                                            {selectedEntity.can_reply_to_reviews ? 'Yes' : 'No'}
                                          </Badge>
                                        </div>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">Flagged for Review Fraud</Label>
                                        <div className="mt-1">
                                          <Badge variant={selectedEntity.flagged_for_review_fraud ? 'destructive' : 'default'}>
                                            {selectedEntity.flagged_for_review_fraud ? 'Flagged' : 'Not Flagged'}
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Media & Images */}
                                  <div className="border-b pb-4">
                                    <h3 className="text-lg font-semibold mb-3">Media & Images</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <Label className="font-semibold">Logo URL</Label>
                                        <p className="text-sm break-all">{selectedEntity.logo_url || 'Not provided'}</p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">Cover Image URL</Label>
                                        <p className="text-sm break-all">{selectedEntity.cover_image_url || 'Not provided'}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Tags & Keywords */}
                                  <div className="border-b pb-4">
                                    <h3 className="text-lg font-semibold mb-3">Tags & Keywords</h3>
                                    <div className="space-y-3">
                                      <div>
                                        <Label className="font-semibold">Category Tags</Label>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                          {selectedEntity.category_tags && selectedEntity.category_tags.length > 0 ? (
                                            selectedEntity.category_tags.map((tag: string, index: number) => (
                                              <Badge key={index} variant="outline">{tag}</Badge>
                                            ))
                                          ) : (
                                            <p className="text-sm text-gray-500">No category tags</p>
                                          )}
                                        </div>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">Keywords</Label>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                          {selectedEntity.keywords && selectedEntity.keywords.length > 0 ? (
                                            selectedEntity.keywords.map((keyword: string, index: number) => (
                                              <Badge key={index} variant="outline">{keyword}</Badge>
                                            ))
                                          ) : (
                                            <p className="text-sm text-gray-500">No keywords</p>
                                          )}
                                        </div>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">Founders</Label>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                          {selectedEntity.founders && selectedEntity.founders.length > 0 ? (
                                            selectedEntity.founders.map((founder: string, index: number) => (
                                              <Badge key={index} variant="outline">{founder}</Badge>
                                            ))
                                          ) : (
                                            <p className="text-sm text-gray-500">No founders listed</p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* JSON Data Fields */}
                                  <div className="border-b pb-4">
                                    <h3 className="text-lg font-semibold mb-3">Additional Data</h3>
                                    <div className="space-y-4">
                                      {selectedEntity.registration_info && Object.keys(selectedEntity.registration_info).length > 0 && (
                                        <div>
                                          <Label className="font-semibold">Registration Info</Label>
                                          <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                                            {JSON.stringify(selectedEntity.registration_info, null, 2)}
                                          </pre>
                                        </div>
                                      )}
                                      {selectedEntity.social_links && Object.keys(selectedEntity.social_links).length > 0 && (
                                        <div>
                                          <Label className="font-semibold">Social Links</Label>
                                          <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                                            {JSON.stringify(selectedEntity.social_links, null, 2)}
                                          </pre>
                                        </div>
                                      )}
                                      {selectedEntity.apps && Object.keys(selectedEntity.apps).length > 0 && (
                                        <div>
                                          <Label className="font-semibold">Apps</Label>
                                          <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                                            {JSON.stringify(selectedEntity.apps, null, 2)}
                                          </pre>
                                        </div>
                                      )}
                                      {selectedEntity.media && Object.keys(selectedEntity.media).length > 0 && (
                                        <div>
                                          <Label className="font-semibold">Media</Label>
                                          <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                                            {JSON.stringify(selectedEntity.media, null, 2)}
                                          </pre>
                                        </div>
                                      )}
                                      {selectedEntity.custom_fields && Object.keys(selectedEntity.custom_fields).length > 0 && (
                                        <div>
                                          <Label className="font-semibold">Custom Fields</Label>
                                          <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                                            {JSON.stringify(selectedEntity.custom_fields, null, 2)}
                                          </pre>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Timestamps */}
                                  <div>
                                    <h3 className="text-lg font-semibold mb-3">Timestamps</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <Label className="font-semibold">Created At</Label>
                                        <p className="text-sm">{new Date(selectedEntity.created_at).toLocaleString()}</p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">Updated At</Label>
                                        <p className="text-sm">{new Date(selectedEntity.updated_at).toLocaleString()}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
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

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Entity</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{entity.name}"? This action cannot be undone and will permanently remove the entity and all its associated data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteEntity.mutate(entity.entity_id)}
                              disabled={deleteEntity.isPending}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {deleteEntity.isPending ? 'Deleting...' : 'Delete'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Pagination Controls */}
        {!entitiesLoading && totalItems > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
            <div className="flex items-center gap-2">
              <Label htmlFor="items-per-page">Items per page:</Label>
              <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                <SelectTrigger id="items-per-page" className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} entities
              </span>
            </div>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) handlePageChange(currentPage - 1);
                    }}
                    className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>

                {/* Page Numbers */}
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }

                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(pageNumber);
                        }}
                        isActive={currentPage === pageNumber}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) handlePageChange(currentPage + 1);
                    }}
                    className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {filteredEntities && filteredEntities.length === 0 && !entitiesLoading && (
          <div className="text-center py-8 text-gray-500">No entities found matching your criteria.</div>
        )}
      </CardContent>
    </Card>
  );
};

export default EntityManagementSection;