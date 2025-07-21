import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";
import BasicDetailsForm from "@/components/profile/BasicDetailsForm";
import PANVerificationForm from "@/components/profile/PANVerificationForm";
import AadhaarVerificationForm from "@/components/profile/AadhaarVerificationForm";

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  pseudonym: string | null;
  pseudonym_set: boolean | null;
  display_name_preference: string | null;
  is_verified: boolean | null;
  main_badge: string | null;
  pan_number: string | null;
  pan_image_url: string | null;
  mobile: string | null;
  phone: string | null;
  full_name_pan: string | null;
  rejection_reason: string | null;
  aadhaar_number?: string | null;
  aadhaar_mobile?: string | null;
  tokens?: number;
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
    display_name_preference: "pseudonym",
    aadhaar_number: "",
    aadhaar_mobile: "",
  });
  const [panConsent, setPanConsent] = useState(false);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [panFileName, setPanFileName] = useState<string>("");
  const [activeTab, setActiveTab] = useState("details");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Aadhaar-related state
  const [aadhaarConsent, setAadhaarConsent] = useState(false);
  const [aadhaarFiles, setAadhaarFiles] = useState<{front: File | null; back: File | null}>({
    front: null,
    back: null
  });

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
      // Get full name from user metadata (Google auth) or fallback to profile data
      const fullNameFromAuth = user.user_metadata?.full_name || user.user_metadata?.name || "";
      
      setFormData({
        full_name: fullNameFromAuth || data.full_name || "",
        phone: data.phone || "",
        pan_number: "", // Don't populate PAN number for security
        mobile: data.mobile || "",
        full_name_pan: data.full_name_pan || "",
        pseudonym: data.pseudonym || "",
        display_name_preference: data.display_name_preference || "pseudonym",
        aadhaar_number: data.aadhaar_number || "",
        aadhaar_mobile: data.aadhaar_mobile || "",
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
    const file = e.target.files?.[0];
    
    if (!file) {
      // File was cleared
      setPanFile(null);
      setPanFileName("");
      return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "PAN card image must be less than 2MB",
        variant: "destructive",
      });
      // Clear the input
      e.target.value = "";
      return;
    }

    // Check file type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG or PDF file",
        variant: "destructive",
      });
      // Clear the input
      e.target.value = "";
      return;
    }

    console.log("File selected:", file.name, "Size:", file.size, "Type:", file.type);
    setPanFile(file);
    setPanFileName(file.name);
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
        display_name_preference: formData.display_name_preference,
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
      // Upload PAN image if file is provided
      let panImageUrl = null;
      if (panFile) {
        console.log("Uploading PAN image:", panFile.name);
        
        const fileExt = panFile.name.split(".").pop();
        const fileName = `${user.id}-pan-${Date.now()}.${fileExt}`;
        
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
            description: "Failed to upload PAN card image. Please try again.",
            variant: "destructive",
          });
          return;
        } else {
          // Get public URL
          const { data } = supabase.storage
            .from("verification-docs")
            .getPublicUrl(fileName);

          if (data) {
            panImageUrl = data.publicUrl;
            console.log("File uploaded successfully:", panImageUrl);
          }
        }
      }

      // Check if PAN number already exists
      const { data: existingPan, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("pan_number", formData.pan_number.toUpperCase())
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
        pan_number: formData.pan_number.toUpperCase(),
        mobile: formData.mobile.trim(),
        pan_image_url: panImageUrl,
        is_verified: false, // Set to false initially, will be verified manually
        rejection_reason: null, // Clear any previous rejection reason
        main_badge: 'Unverified User', // Reset badge status
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
          ? "Your verification details and PAN card image have been submitted successfully. Verification is under process."
          : "Your verification details have been submitted successfully. You can upload your PAN card image later if needed.",
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

  const handleVerifyAadhaar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      console.error("No user found");
      return;
    }

    // Validate required fields
    if (!formData.aadhaar_number.replace(/\s/g, '').trim() || formData.aadhaar_number.replace(/\s/g, '').length !== 12) {
      toast({
        title: "Invalid Aadhaar Number",
        description: "Please enter a valid 12-digit Aadhaar number.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.aadhaar_mobile.trim() || formData.aadhaar_mobile.length !== 10) {
      toast({
        title: "Invalid Mobile Number",
        description: "Please enter a valid 10-digit mobile number.",
        variant: "destructive",
      });
      return;
    }

    // Check consent
    if (!aadhaarConsent) {
      toast({
        title: "Consent Required",
        description: "Please agree to the Aadhaar verification consent to continue.",
        variant: "destructive",
      });
      return;
    }

    console.log("Starting Aadhaar verification");
    setLoading(true);

    try {
      // Upload Aadhaar images if files are provided
      let aadhaarImageUrls = { front: null, back: null };
      
      if (aadhaarFiles.front || aadhaarFiles.back) {
        for (const [side, file] of Object.entries(aadhaarFiles)) {
          if (file) {
            console.log(`Uploading Aadhaar ${side} image:`, file.name);
            
            const fileExt = file.name.split(".").pop();
            const fileName = `${user.id}-aadhaar-${side}-${Date.now()}.${fileExt}`;
            
            const { error: uploadError, data: fileData } = await supabase.storage
              .from("verification-docs")
              .upload(fileName, file, {
                upsert: true,
                cacheControl: "3600",
              });

            if (uploadError) {
              console.error(`Aadhaar ${side} upload error:`, uploadError);
              toast({
                title: "Upload Failed",
                description: `Failed to upload Aadhaar ${side} image. Please try again.`,
                variant: "destructive",
              });
              return;
            } else {
              const { data } = supabase.storage
                .from("verification-docs")
                .getPublicUrl(fileName);

              if (data) {
                aadhaarImageUrls[side as keyof typeof aadhaarImageUrls] = data.publicUrl;
                console.log(`Aadhaar ${side} uploaded successfully:`, data.publicUrl);
              }
            }
          }
        }
      }

      // Check if Aadhaar number already exists
      const cleanAadhaarNumber = formData.aadhaar_number.replace(/\s/g, '');
      const { data: existingAadhaar, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("aadhaar_number", cleanAadhaarNumber)
        .neq("id", user.id)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Aadhaar check error:", checkError);
        throw checkError;
      }

      if (existingAadhaar) {
        toast({
          title: "Aadhaar Already Registered",
          description: "This Aadhaar number is already associated with another account.",
          variant: "destructive",
        });
        return;
      }

      // Update profile with Aadhaar verification data
      const verificationData = {
        aadhaar_number: cleanAadhaarNumber,
        aadhaar_mobile: formData.aadhaar_mobile.trim(),
        // Note: You can add image URLs here when backend is ready
        // aadhaar_front_url: aadhaarImageUrls.front,
        // aadhaar_back_url: aadhaarImageUrls.back,
      };

      console.log("Updating Aadhaar verification data:", verificationData);

      const { error } = await supabase
        .from("profiles")
        .update(verificationData)
        .eq("id", user.id);

      if (error) {
        console.error("Aadhaar verification update error:", error);
        throw error;
      }

      console.log("Aadhaar verification data submitted successfully");
      
      // Clear form data
      setFormData(prev => ({
        ...prev,
        aadhaar_number: "",
        aadhaar_mobile: "",
      }));
      setAadhaarFiles({ front: null, back: null });
      setAadhaarConsent(false);

      toast({
        title: "Verification Submitted",
        description: "Your Aadhaar verification details have been submitted successfully. Verification is under process.",
      });

      // Refresh profile data
      await fetchProfile();
    } catch (error) {
      console.error("Error submitting Aadhaar verification:", error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit Aadhaar verification details. Please try again.",
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
            {activeTab === "aadhaar" && (
              <AadhaarVerificationForm
                formData={formData}
                handleInputChange={handleInputChange}
                handleVerifyAadhaar={handleVerifyAadhaar}
                loading={loading}
                aadhaarConsent={aadhaarConsent}
                setAadhaarConsent={setAadhaarConsent}
                aadhaarFiles={aadhaarFiles}
                setAadhaarFiles={setAadhaarFiles}
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
