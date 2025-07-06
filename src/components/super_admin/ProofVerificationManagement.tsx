import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, FileText, Check, X, Eye, ExternalLink, Filter } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useCreateUserBusinessConnection } from '@/hooks/useUserBusinessConnections';

interface ReviewWithProof {
  id: string;
  business_id: string;
  user_id: string;
  rating: number;
  content: string;
  user_badge: string;
  proof_url: string;
  proof_verified: boolean | null;
  proof_verified_by: string | null;
  proof_verified_at: string | null;
  proof_rejection_reason: string | null;
  created_at: string;
  entities?: {
    name: string;
  };
}

const ProofVerificationManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedReview, setSelectedReview] = useState<ReviewWithProof | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const createConnectionMutation = useCreateUserBusinessConnection();

  // Fetch reviews with submitted proofs - now filter by proof_url existence
  const { data: reviewsWithProof, isLoading } = useQuery({
    queryKey: ['reviews-with-proof'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          entities (
            name
          )
        `)
        .not('proof_url', 'is', null)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Filter reviews based on status
  const filteredReviews = reviewsWithProof?.filter(review => {
    if (statusFilter === 'all') return true;
    
    if (statusFilter === 'pending') {
      return review.proof_verified === null;
    } else if (statusFilter === 'approved') {
      return review.proof_verified === true;
    } else if (statusFilter === 'rejected') {
      return review.proof_verified === false;
    }
    
    return true;
  });

  const verifyProofMutation = useMutation({
    mutationFn: async ({ reviewId, isApproved, reason }: { reviewId: string; isApproved: boolean; reason?: string }) => {
      const { error } = await supabase
        .from('reviews')
        .update({
          proof_verified: isApproved,
          proof_verified_by: user?.id,
          proof_verified_at: new Date().toISOString(),
          proof_rejection_reason: reason || null
        })
        .eq('id', reviewId);
      
      if (error) throw error;
      return { reviewId, isApproved };
    },
    onSuccess: async (data, variables) => {
      const { reviewId, isApproved } = data;
      
      // If approved, create a user business connection record
      if (isApproved && selectedReview) {
        try {
          await createConnectionMutation.mutateAsync({
            user_id: selectedReview.user_id,
            business_id: selectedReview.business_id,
            connection_type: selectedReview.user_badge as 'Verified Employee' | 'Verified Student',
            approved_by: user?.id || '',
          });
          
          console.log('Created user business connection for approved proof');
        } catch (connectionError) {
          console.error('Error creating user business connection:', connectionError);
          // Don't show error to user as the main action (proof approval) succeeded
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ['reviews-with-proof'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['user-business-connection'] });
      
      toast({
        title: isApproved ? 'Proof Approved' : 'Proof Rejected',
        description: `The proof has been ${isApproved ? 'approved' : 'rejected'} successfully.`,
      });
      setSelectedReview(null);
      setRejectionReason('');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update proof verification status.',
        variant: 'destructive',
      });
      console.error('Error verifying proof:', error);
    },
  });

  const handleApprove = (reviewId: string) => {
    verifyProofMutation.mutate({ reviewId, isApproved: true });
  };

  const handleReject = (reviewId: string) => {
    if (!rejectionReason.trim()) {
      toast({
        title: 'Rejection Reason Required',
        description: 'Please provide a reason for rejecting the proof.',
        variant: 'destructive',
      });
      return;
    }
    verifyProofMutation.mutate({ reviewId, isApproved: false, reason: rejectionReason });
  };

  const handleViewProof = async (proofUrl: string) => {
    console.log('Attempting to view proof:', proofUrl);
    
    if (!proofUrl) {
      toast({
        title: 'No Proof Document',
        description: 'No proof document is available for this review.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Extract the file path from the URL
      let filePath = proofUrl;
      
      // If it's a full URL, extract just the file path part
      if (proofUrl.includes('/review-proofs/')) {
        filePath = proofUrl.split('/review-proofs/')[1];
      } else if (proofUrl.includes('review-proofs/')) {
        filePath = proofUrl.split('review-proofs/')[1];
      }
      
      console.log('File path:', filePath);
      
      // First try to get a signed URL for better security from the correct bucket
      const { data: signedData, error: signedError } = await supabase.storage
        .from('review-proofs')
        .createSignedUrl(filePath, 3600); // 1 hour expiry
      
      let finalUrl = proofUrl; // fallback to original URL
      
      if (signedData?.signedUrl && !signedError) {
        finalUrl = signedData.signedUrl;
        console.log('Using signed URL:', finalUrl);
      } else {
        console.log('Signed URL error:', signedError);
        // Fallback to public URL from the correct bucket
        const { data: publicData } = supabase.storage
          .from('review-proofs')
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
      console.error('Error opening proof document:', error);
      toast({
        title: 'Error',
        description: 'Failed to open proof document. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getVerificationStatus = (review: ReviewWithProof) => {
    if (review.proof_verified === null) {
      return { status: 'Pending', color: 'bg-yellow-100 text-yellow-800' };
    } else if (review.proof_verified === true) {
      return { status: 'Approved', color: 'bg-green-100 text-green-800' };
    } else {
      return { status: 'Rejected', color: 'bg-red-100 text-red-800' };
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading proof submissions...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Proof Verification Management</CardTitle>
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Label htmlFor="status-filter">Filter by Status:</Label>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {!filteredReviews || filteredReviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {statusFilter === 'all' 
              ? 'No proof submissions found.'
              : `No ${statusFilter} proof submissions found.`
            }
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>User Badge</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReviews.map((review) => {
                const { status, color } = getVerificationStatus(review);
                return (
                  <TableRow key={review.id}>
                    <TableCell className="font-medium">
                      {review.entities?.name || 'Unknown Business'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        {review.rating}
                      </div>
                    </TableCell>
                    <TableCell>{review.user_badge}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={color}>
                        {status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(review.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {review.proof_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewProof(review.proof_url)}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View Proof
                          </Button>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedReview(review)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Review & Proof Verification</DialogTitle>
                            </DialogHeader>
                            {selectedReview && (
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-semibold">Business:</h4>
                                  <p>{selectedReview.entities?.name}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold">Review Content:</h4>
                                  <p className="text-gray-700">{selectedReview.content}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold">User Badge:</h4>
                                  <Badge variant="outline">{selectedReview.user_badge}</Badge>
                                </div>
                                {selectedReview.proof_url && (
                                  <div>
                                    <h4 className="font-semibold">Proof Document:</h4>
                                    <Button
                                      variant="outline"
                                      onClick={() => handleViewProof(selectedReview.proof_url)}
                                      className="mt-2"
                                    >
                                      <FileText className="h-4 w-4 mr-2" />
                                      View Document
                                    </Button>
                                  </div>
                                )}
                                {selectedReview.proof_verified === null && (
                                  <div className="flex space-x-4 pt-4">
                                    <Button
                                      onClick={() => handleApprove(selectedReview.id)}
                                      disabled={verifyProofMutation.isPending}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <Check className="h-4 w-4 mr-2" />
                                      Approve
                                    </Button>
                                    <div className="flex-1">
                                      <Label htmlFor="rejection-reason">Rejection Reason</Label>
                                      <Textarea
                                        id="rejection-reason"
                                        placeholder="Enter reason for rejection..."
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        className="mt-1"
                                      />
                                      <Button
                                        onClick={() => handleReject(selectedReview.id)}
                                        disabled={verifyProofMutation.isPending}
                                        variant="destructive"
                                        className="mt-2"
                                      >
                                        <X className="h-4 w-4 mr-2" />
                                        Reject
                                      </Button>
                                    </div>
                                  </div>
                                )}
                                {selectedReview.proof_verified === false && selectedReview.proof_rejection_reason && (
                                  <div className="bg-red-50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-red-800">Rejection Reason:</h4>
                                    <p className="text-red-700">{selectedReview.proof_rejection_reason}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ProofVerificationManagement;
