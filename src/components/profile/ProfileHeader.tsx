
import React from "react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, UserCircle, Star } from "lucide-react";
import TokenDisplay from "@/components/ui/token-display";

interface Profile {
  is_verified: boolean | null;
  tokens?: number;
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
        <div className="flex items-center gap-2 ml-auto">
          <TokenDisplay tokens={profile?.tokens || 0} />
          {profile?.is_verified && (
            <Badge variant="secondary">
              <Shield className="h-3 w-3 mr-1" />
              Verified User
            </Badge>
          )}
        </div>
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
