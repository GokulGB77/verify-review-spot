import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useEntities } from '@/hooks/useEntities';
import { useReviews } from '@/hooks/useReviews';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Users, Building2, MessageSquare, TrendingUp, Search, Filter, Shield, FileCheck, UserCheck, BarChart3, ClipboardList, Eye, Ban, RefreshCcw, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import RoleManagement from '@/components/RoleManagement';
import VerificationManagement from '@/components/VerificationManagement';
import ProofVerificationManagement from '@/components/ProofVerificationManagement';
import EntityRegistrationManagement from '@/components/EntityRegistrationManagement';
import BusinessEditForm from '@/components/BusinessEditForm';
import EntityEditForm from '@/components/EntityEditForm';
import EntityCreateForm from '@/components/EntityCreateForm';

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const { isSuperAdmin, loading: rolesLoading } = useUserRoles();
  const { data: entities, isLoading: entitiesLoading } = useEntities();
  const { data: reviews, isLoading: reviewsLoading } = useReviews();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [activeSection, setActiveSection] = useState('businesses');
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Toggle business claimed status mutation
  const toggleBusinessClaimed = useMutation({
    mutationFn: async ({ entityId, currentStatus }: { entityId: string, currentStatus: boolean }) => {
      const { error } = await supabase
        .from('entities')
        .update({ claimed_by_business: !currentStatus })
        .eq('entity_id', entityId);
      
      if (error) throw error;
    },
    onSuccess: (_, { currentStatus }) => {
      queryClient.invalidateQueries({ queryKey: ['entities'] });
      toast({
        title: `Business ${!currentStatus ? 'Claimed' : 'Unclaimed'}`,
        description: `The entity has been ${!currentStatus ? 'marked as business claimed' : 'unmarked as business claimed'}.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update business claimed status. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete entity mutation
  const deleteEntity = useMutation({
    mutationFn: async (entityId: string) => {
      const { error } = await supabase
        .from('entities')
        .delete()
        .eq('entity_id', entityId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entities'] });
      toast({
        title: "Entity deleted",
        description: "The entity has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete entity. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Deactivate entity mutation
  const deactivateEntity = useMutation({
    mutationFn: async (entityId: string) => {
      const { error } = await supabase
        .from('entities')
        .update({ status: 'inactive' })
        .eq('entity_id', entityId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entities'] });
      toast({
        title: "Entity deactivated",
        description: "The entity has been successfully deactivated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to deactivate entity. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Reactivate entity mutation
  const reactivateEntity = useMutation({
    mutationFn: async (entityId: string) => {
      const { error } = await supabase
        .from('entities')
        .update({ status: 'active' })
        .eq('entity_id', entityId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entities'] });
      toast({
        title: "Entity reactivated",
        description: "The entity has been successfully reactivated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to reactivate entity. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (rolesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!isSuperAdmin()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don't have permission to access this dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredEntities = entities?.filter(entity => {
    const matchesSearch = entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (entity.industry || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (entity.status || 'active') === statusFilter;
    const matchesVerification = verificationFilter === 'all' || 
                               (entity.is_verified ? 'Verified' : 'Unverified') === verificationFilter;
    return matchesSearch && matchesStatus && matchesVerification;
  });

  const stats = {
    totalBusinesses: entities?.length || 0,
    totalReviews: reviews?.length || 0,
    verifiedBusinesses: entities?.filter(e => e.is_verified).length || 0,
    activeBusinesses: entities?.filter(e => (e.status || 'active') === 'active').length || 0,
    averageRating: entities?.reduce((acc, e) => acc + (e.average_rating || 0), 0) / (entities?.length || 1) || 0
  };

  // Menu items for the sidebar
  const menuItems = [
    {
      title: "Businesses",
      icon: Building2,
      value: "businesses"
    },
    {
      title: "Create Entity",
      icon: Users,
      value: "create-entity"
    },
    {
      title: "Reviews",
      icon: MessageSquare,
      value: "reviews"
    },
    {
      title: "Entity Registrations",
      icon: ClipboardList,
      value: "entity-registrations"
    },
    {
      title: "Proof Verification",
      icon: FileCheck,
      value: "proof-verification"
    },
    {
      title: "Verification",
      icon: UserCheck,
      value: "verification"
    },
    {
      title: "Role Management",
      icon: Shield,
      value: "roles"
    },
    {
      title: "Analytics",
      icon: BarChart3,
      value: "analytics"
    }
  ];

  const handleViewDialogClose = () => {
    setSelectedEntity(null);
    setIsEditMode(false);
  };

  const handleEditSuccess = () => {
    setIsEditMode(false);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'create-entity':
        return (
          <EntityCreateForm
            onCancel={() => setActiveSection('businesses')}
            onSuccess={() => setActiveSection('businesses')}
          />
        );

      case 'businesses':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Entity Management</CardTitle>
              <CardDescription>Manage and verify entities on the platform</CardDescription>
              
              <div className="flex gap-4 mt-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search Entities</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search by name or industry..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="status">Filter by Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="verification">Filter by Verification</Label>
                  <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Verification</SelectItem>
                      <SelectItem value="Verified">Verified</SelectItem>
                      <SelectItem value="Unverified">Unverified</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
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
                        <TableCell className="capitalize">{entity.entity_type.replace('_', ' ')}</TableCell>
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
                            />
                            <Label className="text-xs">
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
                                    {!isEditMode && (
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
                                        <div className="grid grid-cols-2 gap-4">
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
                                            <p className="text-sm capitalize">{selectedEntity.entity_type.replace('_', ' ')}</p>
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
                                            <p className="text-sm">{selectedEntity.contact?.website || 'Not provided'}</p>
                                          </div>
                                          <div>
                                            <Label className="font-semibold">Phone</Label>
                                            <p className="text-sm">{selectedEntity.contact?.phone || 'Not provided'}</p>
                                          </div>
                                          <div>
                                            <Label className="font-semibold">Email</Label>
                                            <p className="text-sm">{selectedEntity.contact?.email || 'Not provided'}</p>
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
                                            <p className="text-sm mt-1">{selectedEntity.description}</p>
                                          </div>
                                        )}
                                        <div className="grid grid-cols-2 gap-4">
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
            </CardContent>
          </Card>
        );

      case 'reviews':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Review Management</CardTitle>
              <CardDescription>Monitor and moderate reviews across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              {reviewsLoading ? (
                <div className="text-center py-8">Loading reviews...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviews?.slice(0, 10).map((review) => (
                      <TableRow key={review.id}>
                        <TableCell>{review.business_id}</TableCell>
                        <TableCell>{review.rating}/5</TableCell>
                        <TableCell className="max-w-xs truncate">{review.content}</TableCell>
                        <TableCell>{new Date(review.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            Moderate
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        );

      case 'entity-registrations':
        return <EntityRegistrationManagement />;

      case 'proof-verification':
        return <ProofVerificationManagement />;

      case 'verification':
        return <VerificationManagement />;

      case 'roles':
        return <RoleManagement />;

      case 'analytics':
        return (
          <>
            {/* Stats Cards - Now moved inside the analytics tab */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Building2 className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Businesses</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalBusinesses}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Businesses</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.activeBusinesses}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <MessageSquare className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Verified Businesses</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.verifiedBusinesses}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Average Rating</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Businesses:</span>
                      <span className="font-semibold">{stats.totalBusinesses}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Businesses:</span>
                      <span className="font-semibold">{stats.activeBusinesses}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Reviews:</span>
                      <span className="font-semibold">{stats.totalReviews}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Verification Rate:</span>
                      <span className="font-semibold">
                        {stats.totalBusinesses > 0 ? Math.round((stats.verifiedBusinesses / stats.totalBusinesses) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600">
                    <p>New businesses this month: {entities?.filter(b => 
                      new Date(b.created_at).getMonth() === new Date().getMonth()
                    ).length || 0}</p>
                    <p>New reviews this month: {reviews?.filter(r => 
                      new Date(r.created_at).getMonth() === new Date().getMonth()
                    ).length || 0}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900">Admin Tools</h2>
        </div>
        <nav className="px-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.value}
              onClick={() => setActiveSection(item.value)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === item.value
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage businesses, reviews, and platform analytics</p>
          </div>

          {/* Dynamic Content */}
          <div className="space-y-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
