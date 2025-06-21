
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, Lock, Shield, Clock } from "lucide-react";

interface Profile {
  is_verified: boolean | null;
  pan_number: string | null;
  full_name_pan: string | null;
  mobile: string | null;
  pan_image_url: string | null;
}

interface FormData {
  full_name_pan: string;
  pan_number: string;
  mobile: string;
}

interface PANVerificationFormProps {
  formData: FormData;
  handleInputChange: (field: string, value: string) => void;
  handleVerifyPAN: (e: React.FormEvent) => Promise<void>;
  loading: boolean;
  panConsent: boolean;
  setPanConsent: (value: boolean) => void;
  panFile: File | null;
  panFileName: string;
  handlePanFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  profile: Profile | null;
}

const PANVerificationForm = ({
  formData,
  handleInputChange,
  handleVerifyPAN,
  loading,
  panConsent,
  setPanConsent,
  panFile,
  panFileName,
  handlePanFileUpload,
  profile,
}: PANVerificationFormProps) => {
  // Check if user has submitted verification details
  const hasSubmittedVerification = profile?.pan_number && profile?.full_name_pan && profile?.mobile && profile?.pan_image_url;
  
  return (
    <form onSubmit={handleVerifyPAN} className="space-y-6">
      {profile?.is_verified ? (
        <div className="bg-green-50 p-4 rounded-md border border-green-100">
          <p className="flex items-center text-sm text-green-700">
            <Shield className="h-5 w-5 text-green-600 mr-2" />
            <strong>Your account is verified!</strong> This helps other users
            trust your reviews.
          </p>
        </div>
      ) : hasSubmittedVerification ? (
        <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100">
          <p className="flex items-center text-sm text-yellow-700">
            <Clock className="h-5 w-5 text-yellow-600 mr-2" />
            <strong>Verification under process.</strong> You will get the verified user badge once we verify your details.
          </p>
        </div>
      ) : (
        <>
          <div>
            <div className="text-left mb-1">
              <Label htmlFor="full_name_pan">Full Name as per PAN</Label>
            </div>
            <Input
              id="full_name_pan"
              type="text"
              value={formData.full_name_pan || ""}
              onChange={(e) => handleInputChange("full_name_pan", e.target.value)}
              placeholder="Enter your full name exactly as it appears on your PAN card"
            />
          </div>

          <div>
            <div className="text-left mb-1">
              <Label htmlFor="pan_number">PAN Card Number</Label>
            </div>
            <Input
              id="pan_number"
              type="text"
              value={formData.pan_number}
              onChange={(e) => handleInputChange("pan_number", e.target.value.toUpperCase())}
              placeholder="Enter your 10-character PAN number"
              maxLength={10}
              className="uppercase"
            />
          </div>

          <div>
            <div className="text-left mb-1">
              <Label htmlFor="mobile">Mobile Number (for verification)</Label>
            </div>
            <Input
              id="mobile"
              type="tel"
              value={formData.mobile}
              onChange={(e) => handleInputChange("mobile", e.target.value)}
              placeholder="Enter mobile number linked to your PAN"
              maxLength={10}
            />
          </div>

          {/* PAN Card Upload */}
          <div>
            <div className="text-left mb-1">
              <Label htmlFor="pan-upload">Upload PAN Card</Label>
            </div>
            <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <div className="text-sm text-gray-600">
                <label
                  htmlFor="pan-upload"
                  className="cursor-pointer text-blue-600 hover:text-blue-500"
                >
                  Upload a file
                </label>
                <span> or drag and drop</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Clear image of your PAN card (JPG, PNG, PDF up to 2MB)
              </p>
              <input
                id="pan-upload"
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handlePanFileUpload}
              />
            </div>
            {panFileName && (
              <div className="mt-2 text-sm text-green-600">
                ✓ {panFileName} uploaded
              </div>
            )}
          </div>

          {/* PAN Consent Message */}
          <div className="mt-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="pan-consent"
                checked={panConsent}
                onCheckedChange={(checked) => setPanConsent(checked === true)}
                className="mt-1"
              />
              <div className="text-left mb-1">
                <Label htmlFor="pan-consent" className="font-medium cursor-pointer">
                  PAN Verification Consent
                </Label>
                <p className="text-sm text-gray-700 mt-1">
                  I consent to upload my PAN card for identity verification. This document will be used solely to verify my full name, prevent duplicate accounts, and assign a 'Verified by PAN' badge to my profile for added credibility. It will be securely stored and permanently deleted after verification. This information will not be shared with any third party.
                </p>
              </div>
            </div>
          </div>

          {/* Why This Matters */}
          <div className="border border-blue-100 rounded-lg p-4 bg-blue-50">
            <div className="flex items-start space-x-3">
              <Lock className="h-8 w-8 text-blue-600 " />
              <div className="text-left mb-1">
                <h4 className="font-medium text-blue-800">Why this matters:</h4>
                <p className="text-sm text-blue-700 mt-1">
                  The 'Verified by PAN' badge helps build trust in the reviews you
                  post by showing that you're a real, unique person. Your privacy
                  and data security are our top priority.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={
                !formData.full_name_pan?.trim() ||
                !formData.pan_number?.trim() ||
                formData.pan_number.length !== 10 ||
                !formData.mobile?.trim() ||
                formData.mobile.length !== 10 ||
                !panConsent ||
                !panFile ||
                loading
              }
            >
              {loading ? "Submitting..." : "Submit for Verification"}
            </Button>
          </div>
        </>
      )}
    </form>
  );
};

export default PANVerificationForm;
