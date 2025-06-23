
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Building2, Search, Eye, CheckCircle, XCircle } from 'lucide-react';
import { useEntityRegistrations } from '@/hooks/useEntityRegistrations';

const EntityRegistrationManagement = () => {
  const { registrations, loading, updateRegistrationStatus } = useEntityRegistrations();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRegistration, setSelectedRegistration] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredRegistrations = registrations?.filter(registration => {
    const matchesSearch = 
      registration.entity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.contact_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || registration.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = async (registrationId: string) => {
    setIsProcessing(true);
    await updateRegistrationStatus(registrationId, 'approved');
    setIsProcessing(false);
    setSelectedRegistration(null);
  };

  const handleReject = async (registrationId: string) => {
    if (!rejectionReason.trim()) return;
    
    setIsProcessing(true);
    await updateRegistrationStatus(registrationId, 'rejected', rejectionReason);
    setIsProcessing(false);
    setSelectedRegistration(null);
    setRejectionReason('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-6 w-6" />
            <span>Entity Registration Management</span>
          </CardTitle>
          <CardDescription>
            Review and manage entity registration requests
          </CardDescription>
          
          {/* Filters */}
          <div className="flex gap-4 mt-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Registrations</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name, category, or email..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading registrations...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Entity Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Contact Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations?.map((registration) => (
                  <TableRow key={registration.id}>
                    <TableCell className="font-medium">{registration.entity_name}</TableCell>
                    <TableCell>{registration.category}</TableCell>
                    <TableCell>{registration.contact_email}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(registration.status)}>
                        {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(registration.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedRegistration(registration)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Entity Registration Details</DialogTitle>
                              <DialogDescription>
                                Review the registration information and take action
                              </DialogDescription>
                            </DialogHeader>
                            
                            {selectedRegistration && (
                              <div className="space-y-6">
                                {/* Basic Information */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="font-semibold">Entity Name</Label>
                                    <p className="text-sm">{selectedRegistration.entity_name}</p>
                                  </div>
                                  <div>
                                    <Label className="font-semibold">Category</Label>
                                    <p className="text-sm">{selectedRegistration.category}</p>
                                  </div>
                                  <div>
                                    <Label className="font-semibold">Website</Label>
                                    <p className="text-sm">{selectedRegistration.website || 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <Label className="font-semibold">Contact Email</Label>
                                    <p className="text-sm">{selectedRegistration.contact_email}</p>
                                  </div>
                                  <div>
                                    <Label className="font-semibold">Contact Phone</Label>
                                    <p className="text-sm">{selectedRegistration.contact_phone || 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <Label className="font-semibold">Status</Label>
                                    <Badge className={getStatusColor(selectedRegistration.status)}>
                                      {selectedRegistration.status.charAt(0).toUpperCase() + selectedRegistration.status.slice(1)}
                                    </Badge>
                                  </div>
                                </div>

                                {/* Description */}
                                {selectedRegistration.description && (
                                  <div>
                                    <Label className="font-semibold">Description</Label>
                                    <p className="text-sm mt-1">{selectedRegistration.description}</p>
                                  </div>
                                )}

                                {/* Address */}
                                <div>
                                  <Label className="font-semibold">Address</Label>
                                  <p className="text-sm">
                                    {[
                                      selectedRegistration.address,
                                      selectedRegistration.city,
                                      selectedRegistration.state,
                                      selectedRegistration.zip_code
                                    ].filter(Boolean).join(', ') || 'Not provided'}
                                  </p>
                                </div>

                                {/* Legal Information */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="font-semibold">Registration Number</Label>
                                    <p className="text-sm">{selectedRegistration.registration_number || 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <Label className="font-semibold">Tax ID</Label>
                                    <p className="text-sm">{selectedRegistration.tax_id || 'Not provided'}</p>
                                  </div>
                                </div>

                                {/* Owner Information */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="font-semibold">Owner Name</Label>
                                    <p className="text-sm">{selectedRegistration.owner_name || 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <Label className="font-semibold">Owner Email</Label>
                                    <p className="text-sm">{selectedRegistration.owner_email || 'Not provided'}</p>
                                  </div>
                                </div>

                                {/* Rejection Reason (if rejected) */}
                                {selectedRegistration.status === 'rejected' && selectedRegistration.rejection_reason && (
                                  <div>
                                    <Label className="font-semibold text-red-600">Rejection Reason</Label>
                                    <p className="text-sm text-red-600">{selectedRegistration.rejection_reason}</p>
                                  </div>
                                )}

                                {/* Action Buttons for Pending Registrations */}
                                {selectedRegistration.status === 'pending' && (
                                  <div className="space-y-4">
                                    <div className="flex space-x-4">
                                      <Button
                                        onClick={() => handleApprove(selectedRegistration.id)}
                                        disabled={isProcessing}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approve
                                      </Button>
                                      
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <Button variant="destructive">
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Reject
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                          <DialogHeader>
                                            <DialogTitle>Reject Registration</DialogTitle>
                                            <DialogDescription>
                                              Please provide a reason for rejecting this registration.
                                            </DialogDescription>
                                          </DialogHeader>
                                          <div className="space-y-4">
                                            <div>
                                              <Label htmlFor="rejectionReason">Rejection Reason</Label>
                                              <Textarea
                                                id="rejectionReason"
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                placeholder="Explain why this registration is being rejected..."
                                                rows={4}
                                              />
                                            </div>
                                          </div>
                                          <DialogFooter>
                                            <Button
                                              variant="destructive"
                                              onClick={() => handleReject(selectedRegistration.id)}
                                              disabled={!rejectionReason.trim() || isProcessing}
                                            >
                                              {isProcessing ? 'Processing...' : 'Confirm Rejection'}
                                            </Button>
                                          </DialogFooter>
                                        </DialogContent>
                                      </Dialog>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
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
    </div>
  );
};

export default EntityRegistrationManagement;
