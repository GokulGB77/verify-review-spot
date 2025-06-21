
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Profile {
  pseudonym_set: boolean | null;
}

interface FormData {
  full_name: string;
  pseudonym: string;
  phone: string;
}

interface BasicDetailsFormProps {
  formData: FormData;
  handleInputChange: (field: string, value: string) => void;
  handleUpdateProfile: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
  profile: Profile | null;
}

const BasicDetailsForm = ({
  formData,
  handleInputChange,
  handleUpdateProfile,
  isSubmitting,
  profile,
}: BasicDetailsFormProps) => {
  return (
    <form onSubmit={handleUpdateProfile} className="space-y-6">
      <div>
        <div className="text-left mb-1">
          <Label htmlFor="full_name">Full Name</Label>
        </div>
        <Input
          id="full_name"
          type="text"
          value={formData.full_name}
          onChange={(e) => handleInputChange("full_name", e.target.value)}
          placeholder="Enter your full name"
        />
      </div>

      <div>
        <div className="text-left mb-1">
          <Label htmlFor="pseudonym">
            Pseudonym
            {profile?.pseudonym_set && (
              <span className="text-sm text-gray-500 ml-2">
                (Cannot be changed)
              </span>
            )}
          </Label>
        </div>
        <Input
          id="pseudonym"
          type="text"
          value={formData.pseudonym}
          onChange={(e) => handleInputChange("pseudonym", e.target.value)}
          placeholder="Enter your pseudonym (letters, numbers, _, - only)"
          disabled={profile?.pseudonym_set || false}
        />
        <p className="text-sm text-gray-500 mt-1">
          This name will be used for your reviews to keep your real name private.
          Only letters, numbers, underscores, and hyphens allowed. No spaces.
          {profile?.pseudonym_set && " This cannot be changed once set."}
        </p>
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
  );
};

export default BasicDetailsForm;
