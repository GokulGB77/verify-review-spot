import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Shield, User } from "lucide-react";

interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  email: string | null;
  pan_number: string | null;  // Changed from aadhaar_number
  mobile: string | null;      // Changed from aadhaar_mobile
  is_verified: boolean | null;
}

const ProfileSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    pan_number: "",    // Changed from aadhaar_number
    mobile: "",        // Changed from aadhaar_mobile
  });

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

      setProfile({
        ...data,
        pan_number: (data as any).pan_number ?? data.aadhaar_number ?? null,
        mobile: (data as any).mobile ?? data.aadhaar_mobile ?? null,
      });
      setFormData({
        full_name: data.full_name || "",
        username: data.username || "",
        pan_number: (data as any).pan_number  || "",
        mobile: (data as any).mobile || "",
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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          username: formData.username,
          pan_number: formData.pan_number || null,   // Changed from aadhaar_number
          mobile: formData.mobile || null,           // Changed from aadhaar_mobile
          is_verified:
            formData.pan_number && formData.mobile   // Changed condition
              ? true
              : profile?.is_verified,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });

      fetchProfile(); // Refresh profile data
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
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
              <User className="h-5 w-5" />
              Profile Settings
              {profile?.is_verified && (
                <Badge variant="secondary" className="ml-2">
                  <Shield className="h-3 w-3 mr-1" />
                  Verified User
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div>
                <div className="text-left mb-1">
                  <Label htmlFor="email">Email Address</Label>
                </div>
                <Input
                  id="email"
                  type="email"
                  value={profile?.email || ""}
                  disabled
                  className="bg-gray-100"
                />
                <div className="text-left mb-1">
                <p className="text-sm text-gray-500 mt-1">
                  Email cannot be changed
                </p>
                  </div>
              </div>

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

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Verification Details
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Add your PAN Card details to get verified user status and
                  display verified badge on your reviews.
                </p>

                <div className="space-y-4">
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
                    <Label htmlFor="mobile">Mobile Number</Label>
                  </div>
                    <Input
                      id="mobile"
                      type="tel"
                      value={formData.mobile}
                      onChange={(e) =>
                        handleInputChange("mobile", e.target.value)
                      }
                      placeholder="Enter your mobile number"
                      maxLength={10}
                    />
                  </div>

                  {formData.pan_number && formData.mobile && (
                    <div className="bg-green-50 p-3 rounded-md">
                      <p className="text-sm text-green-700">
                        ✓ Once you save, you'll receive verified user status!
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Updating..." : "Update Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSettings;
