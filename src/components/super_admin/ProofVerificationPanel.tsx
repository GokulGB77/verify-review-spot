import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, FileText, Eye, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from '@tanstack/react-query';

interface ProofVerificationPanelProps {
  reviewId: string;
  proofUrl: string | null;
  proofRemark: string | null;
  isProofSubmitted: boolean;
  isVerified: boolean;
  customVerificationTag: string | null;
  onClose: () => void;
}

const ProofVerificationPanel = ({ 
  reviewId, 
  proofUrl, 
  proofRemark,
  isProofSubmitted, 
  isVerified, 
  customVerificationTag, 
  onClose 
}: ProofVerificationPanelProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [verificationTag, setVerificationTag] = useState(customVerificationTag || '');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleVerify = async () => {
    console.log("🔍 Starting verification process for review:", reviewId);
    console.log("🏷️ Verification tag:", verificationTag);
    
    if (!verificationTag.trim()) {
      console.log("❌ No verification tag provided");
      toast({
        title: "Verification Tag Required",
        description: "Please enter a custom verification tag for this review.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    console.log("⏳ Starting database update...");
    try {
      const { error, data } = await supabase
        .from('reviews')
        .update({
          is_verified: true,
          custom_verification_tag: verificationTag.trim(),
          proof_verified: true,
          proof_verified_at: new Date().toISOString(),
          proof_rejection_reason: null
        })
        .eq('id', reviewId);

      console.log("📊 Update result:", { error, data });
      
      if (error) {
        console.error("❌ Database error:", error);
        throw error;
      }

      console.log("🔄 Invalidating queries...");
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      
      console.log("✅ Verification successful!");
      toast({
        title: "Review Verified",
        description: `Review has been verified with tag: "${verificationTag.trim()}" - User earned 1 token!`,
      });
      
      onClose();
    } catch (error: any) {
      console.error("💥 Verification failed:", error);
      toast({
        title: "Verification Failed",
        description: error.message || "Failed to verify review",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .update({
          is_verified: false,
          custom_verification_tag: null,
          proof_verified: false,
          proof_verified_at: new Date().toISOString(),
          proof_rejection_reason: 'Proof rejected by admin'
        })
        .eq('id', reviewId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      
      toast({
        title: "Review Rejected",
        description: "Review proof has been rejected",
      });
      
      onClose();
    } catch (error: any) {
      toast({
        title: "Rejection Failed",
        description: error.message || "Failed to reject review",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Proof Verification</span>
        </CardTitle>
        <CardDescription>
          Review and verify the submitted proof, then assign a custom verification tag
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="flex items-center space-x-4">
          <Badge variant={isVerified ? 'default' : 'secondary'}>
            {isVerified ? 'Verified' : 'Pending'}
          </Badge>
          {customVerificationTag && (
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
              {customVerificationTag}
            </Badge>
          )}
        </div>

        {/* Proof File */}
        {isProofSubmitted && proofUrl ? (
          <div className="space-y-2">
            <Label>Submitted Proof</Label>
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Proof File</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(proofUrl, '_blank')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View File
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <Alert>
            <AlertDescription>
              No proof file was submitted with this review.
            </AlertDescription>
          </Alert>
        )}

        {/* Custom Verification Tag Input */}
        <div className="space-y-2">
          <Label htmlFor="verification-tag">Custom Verification Tag</Label>
          <Input
            id="verification-tag"
            value={verificationTag}
            onChange={(e) => setVerificationTag(e.target.value)}
            placeholder="e.g., Verified Customer, Verified Employee, Former Student, etc."
            disabled={isProcessing}
          />
          <p className="text-xs text-gray-500">
            This tag will be displayed publicly with the review to indicate the user's verified connection.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          
          <div className="flex space-x-2">
            {isProofSubmitted && (
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={isProcessing}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            )}
            
            <Button
              onClick={handleVerify}
              disabled={isProcessing || !verificationTag.trim()}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {isVerified ? 'Update Tag' : 'Verify & Tag'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProofVerificationPanel;