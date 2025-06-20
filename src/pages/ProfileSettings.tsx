
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Shield, User } from 'lucide-react';

interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  email: string | null;
  aadhaar_number: string | null;
  aadhaar_mobile: string | null;
  is_verified: boolean | null;
}

const ProfileSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    aadhaar_number: '',
    aadhaar_mobile: ''
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
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setFormData({
        full_name: data.full_name || '',
        username: data.username || '',
        aadhaar_number: data.aadhaar_number || '',
        aadhaar_mobile: data.aadhaar_mobile || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile data.',
        variant: 'destructive',
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          username: formData.username,
          aadhaar_number: formData.aadhaar_number || null,
          aadhaar_mobile: formData.aadhaar_mobile || null,
          is_verified: formData.aadhaar_number && formData.aadhaar_mobile ? true : profile?.is_verified
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });

      fetchProfile(); // Refresh profile data
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
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
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Enter your username"
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Verification Details
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Add your Aadhaar details to get verified user status and display verified badge on your reviews.
                </p>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="aadhaar_number">Aadhaar Number</Label>
                    <Input
                      id="aadhaar_number"
                      type="text"
                      value={formData.aadhaar_number}
                      onChange={(e) => handleInputChange('aadhaar_number', e.target.value)}
                      placeholder="Enter your 12-digit Aadhaar number"
                      maxLength={12}
                    />
                  </div>

                  <div>
                    <Label htmlFor="aadhaar_mobile">Aadhaar Linked Mobile</Label>
                    <Input
                      id="aadhaar_mobile"
                      type="tel"
                      value={formData.aadhaar_mobile}
                      onChange={(e) => handleInputChange('aadhaar_mobile', e.target.value)}
                      placeholder="Enter your Aadhaar linked mobile number"
                      maxLength={10}
                    />
                  </div>

                  {formData.aadhaar_number && formData.aadhaar_mobile && (
                    <div className="bg-green-50 p-3 rounded-md">
                      <p className="text-sm text-green-700">
                        ✓ Once you save, you'll receive verified user status!
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Updating...' : 'Update Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSettings;
