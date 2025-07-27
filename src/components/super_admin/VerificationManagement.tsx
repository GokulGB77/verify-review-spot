import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useVerificationHistory, useUserVerificationStats } from '@/hooks/useVerificationHistory';
import { Eye, Check, X, AlertCircle, RefreshCw, ExternalLink, History, Clock, Search, Trash2, Filter } from 'lucide-react';
import VerificationHistoryPanel from './VerificationHistoryPanel';

interface VerificationRequest {
  id: string;
  full_name: string | null;
  full_name_pan: string | null;
  pan_number: string | null;
  mobile: string | null;
  pan_image_url: string | null;
  is_verified: boolean | null;
  main_badge: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
  rejection_reason?: string | null;
}

const VerificationManagement = () => {
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [requestToReject, setRequestToReject] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [sortField, setSortField] = useState<'name' | 'email' | 'updated_at'>('updated_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchVerificationRequests();
  }, []);

  const fetchVerificationRequests = async () => {
    try {
      setLoading(true);
      console.log('Fetching verification requests...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .not('pan_number', 'is', null)
        .not('full_name_pan', 'is', null)
        .not('mobile', 'is', null)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching verification requests:', error);
        throw error;
      }

      console.log('Fetched verification requests:', data);
      const requests = data || [];
      setVerificationRequests(requests);
      setFilteredRequests(requests);
    } catch (error) {
      console.error('Error fetching verification requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load verification requests.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewPanImage = async (imageUrl: string | null) => {
    console.log('Attempting to view PAN image:', imageUrl);
    
    if (!imageUrl) {
      toast({
        title: 'No PAN Image',
        description: 'No PAN card image is available for this request.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Extract the file path from the URL
      let filePath = imageUrl;
      
      // If it's a full URL, extract just the file path part
      if (imageUrl.includes('/verification-docs/')) {
        filePath = imageUrl.split('/verification-docs/')[1];
      } else if (imageUrl.includes('verification-docs/')) {
        filePath = imageUrl.split('verification-docs/')[1];
      }
      
      console.log('File path:', filePath);
      
      // First try to get a signed URL for better security
      const { data: signedData, error: signedError } = await supabase.storage
        .from('verification-docs')
        .createSignedUrl(filePath, 3600); // 1 hour expiry
      
      let finalUrl = imageUrl; // fallback to original URL
      
      if (signedData?.signedUrl && !signedError) {
        finalUrl = signedData.signedUrl;
        console.log('Using signed URL:', finalUrl);
      } else {
        console.log('Signed URL error:', signedError);
        // Fallback to public URL
        const { data: publicData } = supabase.storage
          .from('verification-docs')
          .getPublicUrl(filePath);
        
        if (publicData?.publicUrl) {
          finalUrl = publicData.publicUrl;
          console.log('Using public URL:', finalUrl);
        }
      }
      
      // Open the document in a new tab
      console.log('Opening URL:', finalUrl);
      window.open(finalUrl, '_blank');
      
    } catch (error) {
      console.error('Error opening PAN image:', error);
      toast({
        title: 'Error',
        description: 'Failed to open PAN image. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleApproveVerification = async (userId: string) => {
    try {
      console.log('Approving verification for user:', userId);
      setProcessing(userId);
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_verified: true,
          main_badge: 'Verified User',
          rejection_reason: null // Clear any previous rejection reason
        })
        .eq('id', userId);

      if (error) {
        console.error('Error approving verification:', error);
        throw error;
      }

      console.log('Verification approved successfully for user:', userId);
      toast({
        title: 'Success',
        description: 'User verification approved successfully. They now have the "Verified User" badge.',
      });

      // Refresh the list
      await fetchVerificationRequests();
    } catch (error) {
      console.error('Error approving verification:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve verification. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectVerification = async () => {
    if (!requestToReject || !rejectionReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for rejection.',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('Rejecting verification for user:', requestToReject, 'with reason:', rejectionReason);
      setProcessing(requestToReject);
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_verified: false,
          main_badge: 'Unverified User',
          rejection_reason: rejectionReason.trim()
        })
        .eq('id', requestToReject);

      if (error) {
        console.error('Error rejecting verification:', error);
        throw error;
      }

      console.log('Verification rejected successfully for user:', requestToReject);
      toast({
        title: 'Success',
        description: 'User verification rejected with reason provided.',
      });

      // Close dialog and reset state
      setShowRejectDialog(false);
      setRejectionReason('');
      setRequestToReject(null);

      // Refresh the list
      await fetchVerificationRequests();
    } catch (error) {
      console.error('Error rejecting verification:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject verification. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(null);
    }
  };

  const openRejectDialog = (userId: string) => {
    console.log('Opening reject dialog for user:', userId);
    setRequestToReject(userId);
    setRejectionReason('');
    setShowRejectDialog(true);
  };

  const handleDeleteRequest = async () => {
    if (!requestToDelete) return;

    try {
      setProcessing(requestToDelete);
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          pan_number: null,
          full_name_pan: null,
          mobile: null,
          pan_image_url: null,
          is_verified: null,
          rejection_reason: null,
          main_badge: 'Unverified User'
        })
        .eq('id', requestToDelete);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Verification request deleted successfully.',
      });

      setShowDeleteDialog(false);
      setRequestToDelete(null);
      await fetchVerificationRequests();
    } catch (error) {
      console.error('Error deleting verification request:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete verification request.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(null);
    }
  };

  const openDeleteDialog = (userId: string) => {
    setRequestToDelete(userId);
    setShowDeleteDialog(true);
  };

  // Filter and sort logic
  useEffect(() => {
    let filtered = [...verificationRequests];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(request => 
        request.full_name?.toLowerCase().includes(query) ||
        request.email?.toLowerCase().includes(query) ||
        request.full_name_pan?.toLowerCase().includes(query) ||
        request.mobile?.includes(query) ||
        request.pan_number?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => {
        if (statusFilter === 'verified') return request.main_badge === 'Verified User';
        if (statusFilter === 'rejected') return request.is_verified === false;
        if (statusFilter === 'pending') return request.is_verified === null;
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case 'name':
          aValue = a.full_name?.toLowerCase() || '';
          bValue = b.full_name?.toLowerCase() || '';
          break;
        case 'email':
          aValue = a.email?.toLowerCase() || '';
          bValue = b.email?.toLowerCase() || '';
          break;
        case 'updated_at':
        default:
          aValue = new Date(a.updated_at).getTime();
          bValue = new Date(b.updated_at).getTime();
          break;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredRequests(filtered);
  }, [verificationRequests, searchQuery, statusFilter, sortField, sortOrder]);

  const getVerificationStatus = (request: VerificationRequest) => {
    if (request.main_badge === 'Verified User') {
      return <Badge variant="default" className="bg-green-500">Verified</Badge>;
    } else if (request.is_verified === false) {
      return <Badge variant="destructive">Rejected</Badge>;
    } else {
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  const isPending = (request: VerificationRequest) => {
    return request.is_verified === null;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
            Loading verification requests...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>PAN Verification Management</CardTitle>
          <CardDescription>
            Review and approve user verification requests for "Verified User" badges
          </CardDescription>
          
          {/* Search and Filter Controls */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, PAN name, mobile, or PAN number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={`${sortField}-${sortOrder}`} onValueChange={(value) => {
                const [field, order] = value.split('-');
                setSortField(field as any);
                setSortOrder(order as any);
              }}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updated_at-desc">Latest First</SelectItem>
                  <SelectItem value="updated_at-asc">Oldest First</SelectItem>
                  <SelectItem value="name-asc">Name A-Z</SelectItem>
                  <SelectItem value="name-desc">Name Z-A</SelectItem>
                  <SelectItem value="email-asc">Email A-Z</SelectItem>
                  <SelectItem value="email-desc">Email Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Showing {filteredRequests.length} of {verificationRequests.length} requests
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchVerificationRequests}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {verificationRequests.length === 0 
                ? "No verification requests found." 
                : "No requests match your search criteria."
              }
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>PAN Name</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      {request.full_name || 'N/A'}
                    </TableCell>
                    <TableCell>{request.email || 'N/A'}</TableCell>
                    <TableCell>{request.full_name_pan || 'N/A'}</TableCell>
                    <TableCell>{request.mobile || 'N/A'}</TableCell>
                    <TableCell>{getVerificationStatus(request)}</TableCell>
                    <TableCell>
                      {new Date(request.updated_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedRequest(request)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Verification Details</DialogTitle>
                              <DialogDescription>
                                Review the user's verification information and history
                              </DialogDescription>
                            </DialogHeader>
                            {selectedRequest && (
                              <div className="space-y-6">
                                {/* Current Verification Details */}
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Current Verification Details</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-sm font-medium">Full Name:</label>
                                        <p className="text-sm">{selectedRequest.full_name || 'N/A'}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Email:</label>
                                        <p className="text-sm">{selectedRequest.email || 'N/A'}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">PAN Name:</label>
                                        <p className="text-sm">{selectedRequest.full_name_pan || 'N/A'}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">PAN Number:</label>
                                        <p className="text-sm font-mono">{selectedRequest.pan_number || 'N/A'}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Mobile:</label>
                                        <p className="text-sm">{selectedRequest.mobile || 'N/A'}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Status:</label>
                                        <div className="mt-1">{getVerificationStatus(selectedRequest)}</div>
                                      </div>
                                    </div>

                                    {selectedRequest.is_verified === false && selectedRequest.rejection_reason && (
                                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                        <label className="text-sm font-medium text-red-800">Current Rejection Reason:</label>
                                        <p className="text-sm text-red-700 mt-1">{selectedRequest.rejection_reason}</p>
                                      </div>
                                    )}
                                    
                                    {selectedRequest.pan_image_url ? (
                                      <div>
                                        <label className="text-sm font-medium">PAN Card Image:</label>
                                        <div className="mt-2 space-y-3">
                                          <div className="flex items-center gap-2">
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => handleViewPanImage(selectedRequest.pan_image_url)}
                                            >
                                              <ExternalLink className="h-4 w-4 mr-2" />
                                              Open Image in New Tab
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="text-sm text-gray-500">
                                        No PAN card image uploaded
                                      </div>
                                    )}

                                    {isPending(selectedRequest) && (
                                      <div className="flex gap-2 pt-4">
                                        <Button
                                          onClick={() => handleApproveVerification(selectedRequest.id)}
                                          disabled={processing === selectedRequest.id}
                                          className="bg-green-600 hover:bg-green-700"
                                        >
                                          <Check className="h-4 w-4 mr-2" />
                                          {processing === selectedRequest.id ? 'Processing...' : 'Approve'}
                                        </Button>
                                        <Button
                                          variant="destructive"
                                          onClick={() => openRejectDialog(selectedRequest.id)}
                                          disabled={processing === selectedRequest.id}
                                        >
                                          <X className="h-4 w-4 mr-2" />
                                          Reject
                                        </Button>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>

                                {/* Verification History */}
                                <VerificationHistoryPanel 
                                  userId={selectedRequest.id}
                                  onViewDocument={handleViewPanImage}
                                />
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        {isPending(request) && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApproveVerification(request.id)}
                              disabled={processing === request.id}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {processing === request.id ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => openRejectDialog(request.id)}
                              disabled={processing === request.id}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(request.id)}
                          disabled={processing === request.id}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Rejection Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Verification</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this verification request. The user will see this reason.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejection-reason">Rejection Reason</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Please provide a clear reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="mt-1"
                rows={4}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectionReason('');
                  setRequestToReject(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRejectVerification}
                disabled={!rejectionReason.trim() || processing === requestToReject}
              >
                {processing === requestToReject ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Reject with Reason'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Verification Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this verification request? This will clear all PAN verification data for this user and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              disabled={processing !== null}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteRequest}
              disabled={processing !== null}
            >
              {processing ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VerificationManagement;
