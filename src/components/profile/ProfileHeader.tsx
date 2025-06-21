
import React from "react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, UserCircle } from "lucide-react";

interface Profile {
  is_verified: boolean | null;
}

interface ProfileHeaderProps {
  profile: Profile | null;
}

const ProfileHeader = ({ profile }: ProfileHeaderProps) => {
  return (
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
  );
};

export default ProfileHeader;
