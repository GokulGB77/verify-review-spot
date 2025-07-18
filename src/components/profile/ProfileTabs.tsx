
import React from "react";
import { UserCircle, Shield, CreditCard } from "lucide-react";

interface Profile {
  is_verified: boolean | null;
  aadhaar_number?: string | null;
}

interface ProfileTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  profile: Profile | null;
}

const ProfileTabs = ({ activeTab, setActiveTab, profile }: ProfileTabsProps) => {
  return (
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
        {/* <button
          onClick={() => setActiveTab("aadhaar")}
          className={`flex items-center gap-2 text-sm px-4 h-full border-b-2 transition-all ${
            activeTab === "aadhaar"
              ? "bg-white shadow-none border-blue-600 rounded-none"
              : "border-transparent"
          }`}
        >
          <CreditCard className="h-4 w-4" />
          Aadhaar Verification
          {profile?.aadhaar_number && (
            <div className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></div>
          )}
        </button> */}
      </div>
    </div>
  );
};

export default ProfileTabs;
