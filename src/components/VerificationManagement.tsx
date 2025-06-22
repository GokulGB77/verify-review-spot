import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Eye, Check, X, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';

interface VerificationRequest {
  id: string;
  full_name: string | null;
  full_name_pan: string | null;
  pan_number: string | null;
  mobile: string | null;
  pan_image_url: string | null;
  is_verified: boolean | null;
  email: string | null;
  created_at: string;
  updated_at: string;
  rejection_reason?: string | null;
}

const VerificationManagement = () => {
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [requestToReject, setRequestToReject] = useState<string | null>(null);
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
      setVerificationRequests(data || []);
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

  // Improved function to get proper image URL
  const getImageUrl = async (imageUrl: string | null): Promise<string | null> => {
    if (!imageUrl) return null;
    
    console.log('Processing image URL:', imageUrl);
    
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    try {
      // Extract the file path from the URL if it contains storage path
      let filePath = imageUrl;
      
      // Handle different URL formats
      if (imageUrl.includes('/verification-docs/')) {
        const parts = imageUrl.split('/verification-docs/');
        filePath = parts[parts.length - 1];
      } else if (imageUrl.includes('verification-docs/')) {
        const parts = imageUrl.split('verification-docs/');
        filePath = parts[parts.length - 1];
      }
      
      console.log('Extracted file path:', filePath);
      
      // Try to get a signed URL first for better security
      const { data: signedData, error: signedError } = await supabase.storage
        .from('verification-docs')
        .createSignedUrl(filePath, 3600); // 1 hour expiry
      
      if (signedData?.signedUrl && !signedError) {
        console.log('Using signed URL:', signedData.signedUrl);
        return signedData.signedUrl;
      } else {
        console.log('Signed URL error:', signedError);
        // Fallback to public URL
        const { data: publicData } = supabase.storage
          .from('verification-docs')
          .getPublicUrl(filePath);
        
        if (publicData?.publicUrl) {
          console.log('Using public URL:', publicData.publicUrl);
          return publicData.publicUrl;
        }
      }
    } catch (error) {
      console.error('Error processing image URL:', error);
    }
    
    return null;
  };

  const handleApproveVerification = async (userId: string) => {
    try {
      console.log('Approving verification for user:', userId);
      setProcessing(userId);
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_verified: true,
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
        description: 'User verification approved successfully.',
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

  const getVerificationStatus = (request: VerificationRequest) => {
    if (request.is_verified === true) {
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

  const handleImageError = (imageUrl: string) => {
    console.error('Failed to load image:', imageUrl);
    setImageError(imageUrl);
  };

  const handleImageLoad = (imageUrl: string) => {
    console.log('Image loaded successfully:', imageUrl);
    if (imageError === imageUrl) {
      setImageError(null);
    }
  };

  const handleViewImage = async (imageUrl: string | null) => {
    if (!imageUrl) {
      toast({
        title: 'No Image',
        description: 'No PAN card image is available for this request.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const finalUrl = await getImageUrl(imageUrl);
      if (finalUrl) {
        window.open(finalUrl, '_blank');
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load image. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error opening image:', error);
      toast({
        title: 'Error',
        description: 'Failed to open image. Please try again.',
        variant: 'destructive',
      });
    }
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
            Review and approve user verification requests
          </CardDescription>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Total requests: {verificationRequests.length}
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
        </CardHeader>
        <CardContent>
          {verificationRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No verification requests found.
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
                {verificationRequests.map((request) => (
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
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Verification Details</DialogTitle>
                              <DialogDescription>
                                Review the user's verification information
                              </DialogDescription>
                            </DialogHeader>
                            {selectedRequest && (
                              <div className="space-y-4">
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
                                    <label className="text-sm font-medium text-red-800">Rejection Reason:</label>
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
                                          onClick={() => handleViewImage(selectedRequest.pan_image_url)}
                                        >
                                          <ExternalLink className="h-4 w-4 mr-2" />
                                          Open Image in New Tab
                                        </Button>
                                      </div>
                                      <div className="text-xs text-gray-500 space-y-1">
                                        <p><strong>Original URL:</strong> {selectedRequest.pan_image_url}</p>
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
    </>
  );
};

export default VerificationManagement;
