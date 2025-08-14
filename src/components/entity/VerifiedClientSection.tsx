import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserCheck, Plus, Clock, CheckCircle, XCircle, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useVerificationRequests, useCreateVerificationRequest, useResendVerificationRequest, generateVerificationLink } from '@/hooks/useVerificationRequests';

interface VerifiedClientSectionProps {
  entityId: string;
}

const VerifiedClientSection: React.FC<VerifiedClientSectionProps> = ({ entityId }) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    service_product_name: '',
    service_date: ''
  });

  const { data: requests = [], isLoading } = useVerificationRequests(entityId);
  const createRequestMutation = useCreateVerificationRequest();
  const resendRequestMutation = useResendVerificationRequest();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createRequestMutation.mutateAsync({
      entity_id: entityId,
      ...formData,
      client_phone: formData.client_phone || undefined,
      service_product_name: formData.service_product_name || undefined,
      service_date: formData.service_date || undefined,
    });

    setIsDialogOpen(false);
    setFormData({
      client_name: '',
      client_email: '',
      client_phone: '',
      service_product_name: '',
      service_date: ''
    });
  };

  const handleCopyLink = async (token: string) => {
    const link = generateVerificationLink(token);
    try {
      await navigator.clipboard.writeText(link);
      toast({
        title: 'Copied!',
        description: 'Verification link copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy link to clipboard',
        variant: 'destructive',
      });
    }
  };

  const handleResend = async (requestId: string) => {
    await resendRequestMutation.mutateAsync(requestId);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'declined':
        return 'destructive';
      case 'expired':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'declined':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'expired':
        return <XCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Verified Client Reviews
            </CardTitle>
            <CardDescription>
              Send verification requests to your clients to get verified reviews
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Send Verification Request</DialogTitle>
                <DialogDescription>
                  Add a client to send them a verification request for a review.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="client_name">Client Name *</Label>
                    <Input
                      id="client_name"
                      value={formData.client_name}
                      onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="client_email">Client Email *</Label>
                    <Input
                      id="client_email"
                      type="email"
                      value={formData.client_email}
                      onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="client_phone">Client Phone (Optional)</Label>
                    <Input
                      id="client_phone"
                      value={formData.client_phone}
                      onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="service_product_name">Service/Product Name (Optional)</Label>
                    <Input
                      id="service_product_name"
                      value={formData.service_product_name}
                      onChange={(e) => setFormData({ ...formData, service_product_name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="service_date">Service Date (Optional)</Label>
                    <Input
                      id="service_date"
                      type="date"
                      value={formData.service_date}
                      onChange={(e) => setFormData({ ...formData, service_date: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={createRequestMutation.isPending}
                  >
                    {createRequestMutation.isPending ? 'Sending...' : 'Send Request'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Requests</p>
                  <p className="text-2xl font-bold text-blue-900">{requests.length}</p>
                </div>
                <UserCheck className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 font-medium">Pending</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {requests.filter(r => r.status === 'pending').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Accepted</p>
                  <p className="text-2xl font-bold text-green-900">
                    {requests.filter(r => r.status === 'accepted').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 font-medium">Declined</p>
                  <p className="text-2xl font-bold text-red-900">
                    {requests.filter(r => r.status === 'declined').length}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </div>

          {/* Requests List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Recent Verification Requests</h3>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading verification requests...
              </div>
            ) : requests.length > 0 ? (
              <div className="space-y-3">
                {requests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          {request.client_name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-medium">{request.client_name}</h4>
                          <p className="text-sm text-muted-foreground">{request.client_email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        <Badge variant={getStatusBadgeVariant(request.status)}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Phone:</span>{' '}
                        {request.client_phone || 'Not provided'}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Service:</span>{' '}
                        {request.service_product_name || 'Not specified'}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Date Sent:</span>{' '}
                        {new Date(request.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Verification Link */}
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <ExternalLink className="h-4 w-4" />
                          <span>Verification Link:</span>
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {generateVerificationLink(request.verification_token).substring(0, 40)}...
                          </code>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyLink(request.verification_token)}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy Link
                          </Button>
                          {request.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResend(request.id)}
                              disabled={resendRequestMutation.isPending}
                            >
                              Resend Request
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <UserCheck className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No verification requests yet</p>
                <p>Start by adding your clients to send them verification requests.</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VerifiedClientSection;