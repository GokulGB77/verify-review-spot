
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, CheckCircle, X, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface ProofUploadProps {
  proofFile: File | null;
  onFileChange: (file: File | null) => void;
  proofRemark: string;
  onRemarkChange: (remark: string) => void;
}

const ProofUpload = ({ proofFile, onFileChange, proofRemark, onRemarkChange }: ProofUploadProps) => {
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);
      onFileChange(file);
    }
  };

  const removeFile = () => {
    console.log('Removing uploaded file');
    onFileChange(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supporting Evidence (Required)</CardTitle>
        <CardDescription>
          Upload proof of your experience (receipts, screenshots, certificates, etc.)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!proofFile ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <Label htmlFor="proof-upload" className="cursor-pointer">
                <span className="text-blue-600 font-medium">Click to upload</span>
                <span className="text-gray-600"> or drag and drop</span>
              </Label>
              <Input
                id="proof-upload"
                type="file"
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx"
                className="hidden"
              />
              <p className="text-xs text-gray-500 mt-2">
                PNG, JPG, PDF up to 5MB
              </p>
            </div>
          ) : (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      {proofFile.name}
                    </p>
                    <p className="text-xs text-green-600">
                      {(proofFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Proof Remark Field - shown after file upload */}
          {proofFile && (
            <div className="space-y-2">
              <Label htmlFor="proof-remark">
                File Description <span className="text-sm text-gray-500">(Optional)</span>
              </Label>
              <Input
                id="proof-remark"
                type="text"
                placeholder="e.g., Experience Certificate, Purchase Receipt, Screenshot"
                value={proofRemark}
                onChange={(e) => onRemarkChange(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Help admins understand what this file represents during verification.
              </p>
            </div>
          )}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Providing proof increases the credibility of your review. All uploads are manually reviewed for relevance and appropriateness.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProofUpload;
