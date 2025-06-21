
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Shield, UserCircle, Upload, Lock } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  email: string | null;
  pan_number: string | null;
  mobile: string | null;
  full_name_pan: string | null;
  phone: string | null;
  is_verified: boolean | null;
  pan_image_url: string | null;
}

const ProfileSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    phone: "",
    full_name_pan: "",
    pan_number: "",
    mobile: "",
  });
  const [panConsent, setPanConsent] = useState(false);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [panFileName, setPanFileName] = useState<string>("");
  const [activeTab, setActiveTab] = useState("details");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setFormData({
        full_name: data.full_name || "",
        username: data.username || "",
        phone: data.phone || "",
        pan_number: data.pan_number || "",
        mobile: data.mobile || "",
        full_name_pan: data.full_name_pan || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePanFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "PAN card image must be less than 2MB",
          variant: "destructive",
        });
        return;
      }

      // Check file type
      if (
        !["image/jpeg", "image/png", "image/jpg", "application/pdf"].includes(
          file.type
        )
      ) {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPG, PNG or PDF file",
          variant: "destructive",
        });
        return;
      }

      setPanFile(file);
      setPanFileName(file.name);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          username: formData.username,
          phone: formData.phone,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your profile has been updated.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyPAN = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check consent
    if (!panConsent) {
      toast({
        title: "Consent Required",
        description:
          "Please agree to the PAN verification consent to continue.",
        variant: "destructive",
      });
      return;
    }

    // Check if PAN image is uploaded
    if (!panFile) {
      toast({
        title: "PAN Image Required",
        description: "Please upload an image of your PAN card.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // First, upload the PAN image
      let panImageUrl = null;
      if (panFile) {
        const fileExt = panFileName.split(".").pop();
        const fileName = `${user.id}-pan-${Date.now()}.${fileExt}`;
        const { error: uploadError, data: fileData } = await supabase.storage
          .from("verification-docs")
          .upload(fileName, panFile, {
            upsert: true,
            cacheControl: "3600",
          });

        if (uploadError) throw uploadError;

        // Get public URL or path to stored file
        const { data } = supabase.storage
          .from("verification-docs")
          .getPublicUrl(fileName);

        if (data) {
          panImageUrl = data.publicUrl;
        }
      }

      // Then update profile with all verification data
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name_pan: formData.full_name_pan || null,
          pan_number: formData.pan_number || null,
          mobile: formData.mobile || null,
          pan_image_url: panImageUrl,
          is_verified:
            formData.pan_number && formData.mobile && panImageUrl
              ? true
              : profile?.is_verified,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your verification details have been updated.",
      });

      // Refresh profile data
      await fetchProfile();
    } catch (error) {
      console.error("Error updating verification:", error);
      toast({
        title: "Error",
        description: "Failed to update verification details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <p>Please log in to access your profile settings.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="h-5 w-5" />
              Profile Settings
              {profile?.is_verified && (
                <Badge variant="secondary" className="ml-2">
                  <Shield className="h-3 w-3 mr-1" />
                  Verified User
                </Badge>
              )}
            </CardTitle>
            <div className="text-left mb-1">
              <CardDescription>
                Manage your account information and verification status
              </CardDescription>
            </div>
          </CardHeader>

          <div className="px-6 border-b">
            <div className="h-12 flex">
              <button
                onClick={() => setActiveTab("details")}
                className={`flex items-center gap-2 text-sm px-4 h-full border-b-2 transition-all ${
                  activeTab === "details"
                    ? "bg-white shadow-none border-blue-600 rounded-none"
                    : "border-transparent"
                }`}
              >
                <UserCircle className="h-4 w-4" />
                Basic Details
              </button>
              <button
                onClick={() => setActiveTab("verification")}
                className={`flex items-center gap-2 text-sm px-4 h-full border-b-2 transition-all ${
                  activeTab === "verification"
                    ? "bg-white shadow-none border-blue-600 rounded-none"
                    : "border-transparent"
                }`}
              >
                <Shield className="h-4 w-4" />
                PAN Verification
                {profile?.is_verified && (
                  <div className="ml-2 w-2 h-2 bg-green-500 rounded-full"></div>
                )}
              </button>
            </div>
          </div>

          <CardContent className="pt-6">
            {/* Basic Details Tab */}
            {activeTab === "details" && (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <div className="text-left mb-1">
                    <Label htmlFor="full_name">Full Name</Label>
                  </div>
                  <Input
                    id="full_name"
                    type="text"
                    value={formData.full_name}
                    onChange={(e) =>
                      handleInputChange("full_name", e.target.value)
                    }
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <div className="text-left mb-1">
                    <Label htmlFor="username">Username</Label>
                  </div>
                  <Input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      handleInputChange("username", e.target.value)
                    }
                    placeholder="Enter your username"
                  />
                </div>

                <div>
                  <div className="text-left mb-1">
                    <Label htmlFor="phone">Phone Number</Label>
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="Enter your phone number"
                    maxLength={10}
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Updating..." : "Update Profile"}
                  </Button>
                </div>
              </form>
            )}

            {/* PAN Verification Tab */}
            {activeTab === "verification" && (
              <form onSubmit={handleVerifyPAN} className="space-y-6">
                <div>
                  <div className="text-left mb-1">
                    <Label htmlFor="full_name_pan">Full Name as per PAN</Label>
                  </div>
                  <Input
                    id="full_name_pan"
                    type="text"
                    value={formData.full_name_pan || ""}
                    onChange={(e) =>
                      handleInputChange("full_name_pan", e.target.value)
                    }
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
                    onChange={(e) =>
                      handleInputChange("pan_number", e.target.value)
                    }
                    placeholder="Enter your 10-digit PAN number"
                    maxLength={10}
                    className="uppercase"
                  />
                </div>

                <div>
                  <div className="text-left mb-1">
                    <Label htmlFor="mobile">
                      Mobile Number (for verification)
                    </Label>
                  </div>
                  <Input
                    id="mobile"
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) =>
                      handleInputChange("mobile", e.target.value)
                    }
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
                      onCheckedChange={(checked) =>
                        setPanConsent(checked === true)
                      }
                      className="mt-1"
                    />
                    <div className="text-left mb-1">
                      <Label
                        htmlFor="pan-consent"
                        className="font-medium cursor-pointer"
                      >
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
                      <h4 className="font-medium text-blue-800">
                        Why this matters:
                      </h4>
                      <p className="text-sm text-blue-700 mt-1">
                        The 'Verified by PAN' badge helps build trust in the
                        reviews you post by showing that you're a real, unique
                        person. Your privacy and data security are our top
                        priority.
                      </p>
                    </div>
                  </div>
                </div>

                {profile?.is_verified ? (
                  <div className="bg-green-50 p-4 rounded-md border border-green-100">
                    <p className="flex items-center text-sm text-green-700">
                      <Shield className="h-5 w-5 text-green-600 mr-2" />
                      <strong>Your account is verified!</strong> This helps
                      other users trust your reviews.
                    </p>
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={
                        !formData.pan_number ||
                        !formData.mobile ||
                        !panConsent ||
                        !panFile ||
                        loading
                      }
                    >
                      {loading ? "Verifying..." : "Verify with PAN"}
                    </Button>
                  </div>
                )}
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSettings;
