
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Upload, Camera, QrCode, X, FileText, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AadhaarVerificationFormProps {
  formData: {
    aadhaar_number: string;
    aadhaar_mobile: string;
  };
  handleInputChange: (field: string, value: string) => void;
  handleVerifyAadhaar: (e: React.FormEvent) => void;
  loading: boolean;
  aadhaarConsent: boolean;
  setAadhaarConsent: (value: boolean) => void;
  aadhaarFiles: {
    front: File | null;
    back: File | null;
  };
  setAadhaarFiles: (files: { front: File | null; back: File | null }) => void;
  profile: any;
}

const AadhaarVerificationForm = ({
  formData,
  handleInputChange,
  handleVerifyAadhaar,
  loading,
  aadhaarConsent,
  setAadhaarConsent,
  aadhaarFiles,
  setAadhaarFiles,
  profile
}: AadhaarVerificationFormProps) => {
  const { toast } = useToast();
  const [verificationMethod, setVerificationMethod] = useState<'upload' | 'qr'>('upload');
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    
    if (!file) {
      setAadhaarFiles({
        ...aadhaarFiles,
        [side]: null
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Aadhaar card image must be less than 5MB",
        variant: "destructive",
      });
      e.target.value = "";
      return;
    }

    // Check file type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG or PNG file",
        variant: "destructive",
      });
      e.target.value = "";
      return;
    }

    setAadhaarFiles({
      ...aadhaarFiles,
      [side]: file
    });
  };

  const removeFile = (side: 'front' | 'back') => {
    setAadhaarFiles({
      ...aadhaarFiles,
      [side]: null
    });
  };

  const startQRScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment' // Use back camera
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
      }
    } catch (error) {
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to scan QR code",
        variant: "destructive",
      });
    }
  };

  const stopQRScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Aadhaar Verification</h3>
        <p className="text-sm text-gray-600 mb-6">
          Verify your identity using your Aadhaar card. You can either upload images of your Aadhaar card or scan the QR code directly.
        </p>
      </div>

      {/* Verification Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Choose Verification Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button
              type="button"
              variant={verificationMethod === 'upload' ? 'default' : 'outline'}
              onClick={() => {
                setVerificationMethod('upload');
                stopQRScanning();
              }}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Images
            </Button>
            <Button
              type="button"
              variant={verificationMethod === 'qr' ? 'default' : 'outline'}
              onClick={() => setVerificationMethod('qr')}
              className="flex items-center gap-2"
            >
              <QrCode className="h-4 w-4" />
              Scan QR Code
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upload Method */}
      {verificationMethod === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upload Aadhaar Card Images</CardTitle>
            <CardDescription>
              Please upload both front and back images of your Aadhaar card
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Front Side Upload */}
            <div className="space-y-2">
              <Label htmlFor="aadhaar-front">Front Side</Label>
              {!aadhaarFiles.front ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Input
                    id="aadhaar-front"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'front')}
                    className="hidden"
                  />
                  <Label htmlFor="aadhaar-front" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      <Image className="h-8 w-8 text-gray-400" />
                      <span className="text-sm font-medium">Upload Front Side</span>
                      <span className="text-xs text-gray-500">JPG, PNG up to 5MB</span>
                    </div>
                  </Label>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">{aadhaarFiles.front.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(aadhaarFiles.front.size)}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile('front')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Back Side Upload */}
            <div className="space-y-2">
              <Label htmlFor="aadhaar-back">Back Side</Label>
              {!aadhaarFiles.back ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Input
                    id="aadhaar-back"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'back')}
                    className="hidden"
                  />
                  <Label htmlFor="aadhaar-back" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      <Image className="h-8 w-8 text-gray-400" />
                      <span className="text-sm font-medium">Upload Back Side</span>
                      <span className="text-xs text-gray-500">JPG, PNG up to 5MB</span>
                    </div>
                  </Label>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">{aadhaarFiles.back.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(aadhaarFiles.back.size)}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile('back')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* QR Code Scanning Method */}
      {verificationMethod === 'qr' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Scan Aadhaar QR Code</CardTitle>
            <CardDescription>
              Use your device's camera to scan the QR code on your physical Aadhaar card
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isScanning ? (
              <div className="text-center py-8">
                <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-4">
                  Position your Aadhaar card's QR code in front of your device's back camera
                </p>
                <Button onClick={startQRScanning} className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Start Scanning
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 border-2 border-white border-dashed m-8 rounded-lg"></div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={stopQRScanning} variant="outline" className="flex-1">
                    Stop Scanning
                  </Button>
                  <Button onClick={() => {}} className="flex-1">
                    Capture
                  </Button>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Position the QR code within the dashed border
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Form Fields */}
      <form onSubmit={handleVerifyAadhaar} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="aadhaar_number">Aadhaar Number</Label>
            <Input
              id="aadhaar_number"
              type="text"
              placeholder="XXXX XXXX XXXX"
              value={formData.aadhaar_number}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                handleInputChange('aadhaar_number', formatted);
              }}
              maxLength={14}
              disabled={loading}
            />
          </div>
          
          <div>
            <Label htmlFor="aadhaar_mobile">Mobile Number (as per Aadhaar)</Label>
            <Input
              id="aadhaar_mobile"
              type="tel"
              placeholder="10-digit mobile number"
              value={formData.aadhaar_mobile}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                handleInputChange('aadhaar_mobile', value);
              }}
              maxLength={10}
              disabled={loading}
            />
          </div>
        </div>

        {/* Consent Checkbox */}
        <div className="flex items-start space-x-2 p-4 bg-gray-50 rounded-lg">
          <Checkbox
            id="aadhaar-consent"
            checked={aadhaarConsent}
            onCheckedChange={setAadhaarConsent}
            disabled={loading}
          />
          <div className="grid gap-1.5 leading-none">
            <Label
              htmlFor="aadhaar-consent"
              className="text-sm font-normal cursor-pointer"
            >
              I consent to Aadhaar verification and data processing
            </Label>
            <p className="text-xs text-gray-600">
              By checking this box, you agree to allow us to verify your Aadhaar details
              and process the provided information for verification purposes only.
            </p>
          </div>
        </div>

        <Button
          type="submit"
          disabled={
            loading || 
            !aadhaarConsent || 
            !formData.aadhaar_number || 
            !formData.aadhaar_mobile ||
            (verificationMethod === 'upload' && (!aadhaarFiles.front || !aadhaarFiles.back))
          }
          className="w-full"
        >
          {loading ? "Submitting..." : "Submit for Verification"}
        </Button>
      </form>

      {/* Current Status */}
      {profile?.aadhaar_number && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-green-600">Verification Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Your Aadhaar verification has been submitted and is under review.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AadhaarVerificationForm;
