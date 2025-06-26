import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useBusinesses } from '@/hooks/useBusinesses';
import { useReviews } from '@/hooks/useReviews';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Building2, MessageSquare, TrendingUp, Search, Filter, Shield, FileCheck, UserCheck, BarChart3, ClipboardList, Eye, Trash2, Ban } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import RoleManagement from '@/components/RoleManagement';
import VerificationManagement from '@/components/VerificationManagement';
import ProofVerificationManagement from '@/components/ProofVerificationManagement';
import EntityRegistrationManagement from '@/components/EntityRegistrationManagement';

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const { isSuperAdmin, loading: rolesLoading } = useUserRoles();
  const { data: businesses, isLoading: businessesLoading } = useBusinesses();
  const { data: reviews, isLoading: reviewsLoading } = useReviews();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeSection, setActiveSection] = useState('businesses');
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
  const [businessToDelete, setBusinessToDelete] = useState<any>(null);

  // Delete business mutation
  const deleteBusiness = useMutation({
    mutationFn: async (businessId: string) => {
      const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', businessId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      toast({
        title: "Business deleted",
        description: "The business has been successfully deleted.",
      });
      setBusinessToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete business. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Deactivate business mutation (we'll set verification_status to 'Deactivated')
  const deactivateBusiness = useMutation({
    mutationFn: async (businessId: string) => {
      const { error } = await supabase
        .from('businesses')
        .update({ verification_status: 'Deactivated' })
        .eq('id', businessId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      toast({
        title: "Business deactivated",
        description: "The business has been successfully deactivated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to deactivate business. Please try again.",
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

  const filteredBusinesses = businesses?.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || business.verification_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalBusinesses: businesses?.length || 0,
    totalReviews: reviews?.length || 0,
    verifiedBusinesses: businesses?.filter(b => b.verification_status === 'Verified').length || 0,
    averageRating: businesses?.reduce((acc, b) => acc + (b.rating || 0), 0) / (businesses?.length || 1) || 0
  };

  const menuItems = [
    {
      title: "Businesses",
      icon: Building2,
      value: "businesses"
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

  const renderContent = () => {
    switch (activeSection) {
      case 'businesses':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Business Management</CardTitle>
              <CardDescription>Manage and verify businesses on the platform</CardDescription>
              
              <div className="flex gap-4 mt-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search Businesses</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search by name or category..."
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
                      <SelectItem value="Verified">Verified</SelectItem>
                      <SelectItem value="Unverified">Unverified</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Deactivated">Deactivated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {businessesLoading ? (
                <div className="text-center py-8">Loading businesses...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Reviews</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBusinesses?.map((business) => (
                      <TableRow key={business.id}>
                        <TableCell className="font-medium">{business.name}</TableCell>
                        <TableCell>{business.category}</TableCell>
                        <TableCell>{business.rating || 0}/5</TableCell>
                        <TableCell>{business.review_count || 0}</TableCell>
                        <TableCell>
                          <Badge variant={business.verification_status === 'Verified' ? 'default' : 'secondary'}>
                            {business.verification_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedBusiness(business)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Business Details</DialogTitle>
                                </DialogHeader>
                                {selectedBusiness && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="font-semibold">Name</Label>
                                        <p className="text-sm">{selectedBusiness.name}</p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">Category</Label>
                                        <p className="text-sm">{selectedBusiness.category}</p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">Location</Label>
                                        <p className="text-sm">{selectedBusiness.location || 'Not provided'}</p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">Rating</Label>
                                        <p className="text-sm">{selectedBusiness.rating || 0}/5 ({selectedBusiness.review_count || 0} reviews)</p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">Website</Label>
                                        <p className="text-sm">{selectedBusiness.website || 'Not provided'}</p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">Phone</Label>
                                        <p className="text-sm">{selectedBusiness.phone || 'Not provided'}</p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">Email</Label>
                                        <p className="text-sm">{selectedBusiness.email || 'Not provided'}</p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">Status</Label>
                                        <Badge variant={selectedBusiness.verification_status === 'Verified' ? 'default' : 'secondary'}>
                                          {selectedBusiness.verification_status}
                                        </Badge>
                                      </div>
                                    </div>
                                    {selectedBusiness.description && (
                                      <div>
                                        <Label className="font-semibold">Description</Label>
                                        <p className="text-sm mt-1">{selectedBusiness.description}</p>
                                      </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="font-semibold">Founded Year</Label>
                                        <p className="text-sm">{selectedBusiness.founded_year || 'Not provided'}</p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">Employee Count</Label>
                                        <p className="text-sm">{selectedBusiness.employee_count || 'Not provided'}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deactivateBusiness.mutate(business.id)}
                              disabled={business.verification_status === 'Deactivated'}
                            >
                              <Ban className="h-4 w-4 mr-1" />
                              Deactivate
                            </Button>
                            
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => setBusinessToDelete(business)}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Delete Business</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to delete "{businessToDelete?.name}"? This action cannot be undone.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={() => setBusinessToDelete(null)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => businessToDelete && deleteBusiness.mutate(businessToDelete.id)}
                                    disabled={deleteBusiness.isPending}
                                  >
                                    {deleteBusiness.isPending ? 'Deleting...' : 'Delete'}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
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
                  <p>New businesses this month: {businesses?.filter(b => 
                    new Date(b.created_at).getMonth() === new Date().getMonth()
                  ).length || 0}</p>
                  <p>New reviews this month: {reviews?.filter(r => 
                    new Date(r.created_at).getMonth() === new Date().getMonth()
                  ).length || 0}</p>
                </div>
              </CardContent>
            </Card>
          </div>
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

          {/* Stats Cards */}
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
                  <MessageSquare className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalReviews}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-purple-600" />
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
