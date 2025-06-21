
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";
import BasicDetailsForm from "@/components/profile/BasicDetailsForm";
import PANVerificationForm from "@/components/profile/PANVerificationForm";

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
    username: "",
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
        pseudonym: data.pseudonym || "",
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

  const validatePseudonym = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return true; // Allow empty pseudonym
    
    // Check format: only letters, numbers, underscore, and hyphen
    const isValidFormat = /^[a-zA-Z0-9_-]+$/.test(trimmed);
    return isValidFormat;
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
      // Validate pseudonym format
      if (formData.pseudonym && !validatePseudonym(formData.pseudonym)) {
        toast({
          title: "Invalid pseudonym format",
          description: "Pseudonym can only contain letters, numbers, underscores, and hyphens. No spaces allowed.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Check if pseudonym is being updated and if it's unique
      if (formData.pseudonym !== profile?.pseudonym && formData.pseudonym.trim()) {
        const { data: existingUser, error: checkError } = await supabase
          .from("profiles")
          .select("id")
          .eq("pseudonym", formData.pseudonym.trim())
          .neq("id", user.id)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError;
        }

        if (existingUser) {
          toast({
            title: "Pseudonym unavailable",
            description: "This pseudonym is already taken. Please choose another one.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      }

      const updateData: any = {
        full_name: formData.full_name,
        username: formData.username,
        phone: formData.phone,
      };

      // Only update pseudonym if it hasn't been set before or if it's empty
      if (!profile?.pseudonym_set || !formData.pseudonym.trim()) {
        updateData.pseudonym = formData.pseudonym.trim() || null;
        if (formData.pseudonym.trim()) {
          updateData.pseudonym_set = true;
        }
      }

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id);

      if (error) {
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
        setIsSubmitting(false);
        return;
      }

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

      if (error) {
        // Handle unique constraint violations
        if (error.code === '23505') {
          if (error.message.includes('unique_pan_number')) {
            toast({
              title: "PAN number already verified",
              description: "This PAN number is already associated with another verified account.",
              variant: "destructive",
            });
          } else if (error.message.includes('unique_mobile')) {
            toast({
              title: "Mobile number already in use",
              description: "This mobile number is already associated with another account.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Duplicate verification data",
              description: "Some of the verification information provided is already in use.",
              variant: "destructive",
            });
          }
        } else {
          throw error;
        }
        setLoading(false);
        return;
      }

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
