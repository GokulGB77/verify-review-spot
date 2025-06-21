import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";
import BasicDetailsForm from "@/components/profile/BasicDetailsForm";
import PANVerificationForm from "@/components/profile/PANVerificationForm";
import crypto from 'crypto';

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  pan_number: string | null;
  mobile: string | null;
  full_name_pan: string | null;
  phone: string | null;
  is_verified: boolean | null;
  pan_image_url: string | null;
  pseudonym: string | null;
  pseudonym_set: boolean | null;
}

const ProfileSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    full_name_pan: "",
    pan_number: "",
    mobile: "",
    pseudonym: "",
  });
  const [panConsent, setPanConsent] = useState(false);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [panFileName, setPanFileName] = useState<string>("");
  const [activeTab, setActiveTab] = useState("details");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hash PAN number using Web Crypto API for security
  const hashPanNumber = async (panNumber: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(panNumber.toUpperCase());
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Fetch profile error:", error);
        throw error;
      }

      console.log("Fetched profile:", data);
      setProfile(data);
      setFormData({
        full_name: data.full_name || "",
        phone: data.phone || "",
        pan_number: "", // Don't populate PAN number for security
        mobile: data.mobile || "",
        full_name_pan: data.full_name_pan || "",
        pseudonym: data.pseudonym || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const validatePseudonym = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return true; // Allow empty pseudonym
    
    // Check format: only letters, numbers, underscore, and hyphen
    const isValidFormat = /^[a-zA-Z0-9_-]+$/.test(trimmed);
    return isValidFormat;
  };

  const handleInputChange = (field: string, value: string) => {
    console.log(`Updating ${field} to:`, value);
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
    
    if (!user) {
      console.error("No user found");
      return;
    }

    console.log("Starting profile update with data:", formData);
    setIsSubmitting(true);
    
    try {
      // Validate pseudonym format
      if (formData.pseudonym && !validatePseudonym(formData.pseudonym)) {
        toast({
          title: "Invalid pseudonym format",
          description: "Pseudonym can only contain letters, numbers, underscores, and hyphens. No spaces allowed.",
          variant: "destructive",
        });
        return;
      }

      // Check if pseudonym is being updated and if it's unique
      if (formData.pseudonym !== profile?.pseudonym && formData.pseudonym.trim()) {
        console.log("Checking pseudonym uniqueness for:", formData.pseudonym.trim());
        const { data: existingUser, error: checkError } = await supabase
          .from("profiles")
          .select("id")
          .eq("pseudonym", formData.pseudonym.trim())
          .neq("id", user.id)
          .maybeSingle();

        if (checkError && checkError.code !== 'PGRST116') {
          console.error("Pseudonym check error:", checkError);
          throw checkError;
        }

        if (existingUser) {
          console.log("Pseudonym already exists");
          toast({
            title: "Pseudonym unavailable",
            description: "This pseudonym is already taken. Please choose another one.",
            variant: "destructive",
          });
          return;
        }
      }

      const updateData: any = {
        full_name: formData.full_name.trim() || null,
        phone: formData.phone.trim() || null,
      };

      // Only update pseudonym if it hasn't been set before or if it's empty
      if (!profile?.pseudonym_set || !formData.pseudonym.trim()) {
        updateData.pseudonym = formData.pseudonym.trim() || null;
        if (formData.pseudonym.trim()) {
          updateData.pseudonym_set = true;
        }
      }

      console.log("Updating profile with data:", updateData);

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id);

      if (error) {
        console.error("Profile update error:", error);
        // Handle unique constraint violations
        if (error.code === '23505') {
          if (error.message.includes('unique_email')) {
            toast({
              title: "Email already in use",
              description: "This email is already associated with another account.",
              variant: "destructive",
            });
          } else if (error.message.includes('unique_phone')) {
            toast({
              title: "Phone number already in use",
              description: "This phone number is already associated with another account.",
              variant: "destructive",
            });
          } else if (error.message.includes('unique_pseudonym')) {
            toast({
              title: "Pseudonym unavailable",
              description: "This pseudonym is already taken. Please choose another one.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Duplicate data",
              description: "Some of the information provided is already in use.",
              variant: "destructive",
            });
          }
        } else {
          throw error;
        }
        return;
      }

      console.log("Profile updated successfully");
      toast({
        title: "Success",
        description: "Your profile has been updated.",
      });

      // Refresh profile data
      await fetchProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      console.log("Setting isSubmitting to false");
      setIsSubmitting(false);
    }
  };

  const handleVerifyPAN = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      console.error("No user found");
      return;
    }

    // Validate required fields
    if (!formData.full_name_pan.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter your full name as per PAN card.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.pan_number.trim() || formData.pan_number.length !== 10) {
      toast({
        title: "Invalid PAN Number",
        description: "Please enter a valid 10-character PAN number.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.mobile.trim() || formData.mobile.length !== 10) {
      toast({
        title: "Invalid Mobile Number",
        description: "Please enter a valid 10-digit mobile number.",
        variant: "destructive",
      });
      return;
    }

    // Check consent
    if (!panConsent) {
      toast({
        title: "Consent Required",
        description: "Please agree to the PAN verification consent to continue.",
        variant: "destructive",
      });
      return;
    }

    console.log("Starting PAN verification");
    setLoading(true);

    try {
      // Upload PAN image only if file is provided
      let panImageUrl = null;
      if (panFile) {
        const fileExt = panFileName.split(".").pop();
        const fileName = `${user.id}-pan-${Date.now()}.${fileExt}`;
        
        console.log("Uploading file:", fileName);
        
        const { error: uploadError, data: fileData } = await supabase.storage
          .from("verification-docs")
          .upload(fileName, panFile, {
            upsert: true,
            cacheControl: "3600",
          });

        if (uploadError) {
          console.error("File upload error:", uploadError);
          toast({
            title: "Upload Failed",
            description: "Failed to upload PAN card image, but continuing with verification.",
            variant: "destructive",
          });
          // Continue without image instead of returning
        } else {
          // Get public URL only if upload was successful
          const { data } = supabase.storage
            .from("verification-docs")
            .getPublicUrl(fileName);

          if (data) {
            panImageUrl = data.publicUrl;
            console.log("File uploaded successfully:", panImageUrl);
          }
        }
      }

      // Hash the PAN number for security using Web Crypto API
      const hashedPanNumber = await hashPanNumber(formData.pan_number);

      // Check if PAN number already exists (compare hashed values)
      const { data: existingPan, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("pan_number", hashedPanNumber)
        .neq("id", user.id)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error("PAN check error:", checkError);
        throw checkError;
      }

      if (existingPan) {
        toast({
          title: "PAN Already Registered",
          description: "This PAN number is already associated with another account.",
          variant: "destructive",
        });
        return;
      }

      // Update profile with verification data
      const verificationData = {
        full_name_pan: formData.full_name_pan.trim(),
        pan_number: hashedPanNumber, // Store hashed PAN number
        mobile: formData.mobile.trim(),
        pan_image_url: panImageUrl, // Will be null if upload failed
        is_verified: false, // Set to false initially, will be verified manually
      };

      console.log("Updating verification data:", verificationData);

      const { error } = await supabase
        .from("profiles")
        .update(verificationData)
        .eq("id", user.id);

      if (error) {
        console.error("Verification update error:", error);
        throw error;
      }

      console.log("Verification data submitted successfully");
      
      // Clear form data
      setFormData(prev => ({
        ...prev,
        full_name_pan: "",
        pan_number: "",
        mobile: "",
      }));
      setPanFile(null);
      setPanFileName("");
      setPanConsent(false);

      toast({
        title: "Verification Submitted",
        description: panImageUrl 
          ? "Your verification details have been submitted. Verification is under process and you will get the verified user badge once we verify the details."
          : "Your verification details have been submitted without image. You can upload your PAN card image later. Verification is under process.",
      });

      // Refresh profile data
      await fetchProfile();
    } catch (error) {
      console.error("Error submitting verification:", error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit verification details. Please try again.",
        variant: "destructive",
      });
    } finally {
      console.log("Setting loading to false");
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

  if (loading && !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <p>Loading profile...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <ProfileHeader profile={profile} />
          <ProfileTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            profile={profile}
          />
          <CardContent className="pt-6">
            {activeTab === "details" && (
              <BasicDetailsForm
                formData={formData}
                handleInputChange={handleInputChange}
                handleUpdateProfile={handleUpdateProfile}
                isSubmitting={isSubmitting}
                profile={profile}
              />
            )}
            {activeTab === "verification" && (
              <PANVerificationForm
                formData={formData}
                handleInputChange={handleInputChange}
                handleVerifyPAN={handleVerifyPAN}
                loading={loading}
                panConsent={panConsent}
                setPanConsent={setPanConsent}
                panFile={panFile}
                panFileName={panFileName}
                handlePanFileUpload={handlePanFileUpload}
                profile={profile}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSettings;
