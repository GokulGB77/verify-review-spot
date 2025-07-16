
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Profile {
  pseudonym_set: boolean | null;
}

interface FormData {
  full_name: string;
  pseudonym: string;
  phone: string;
  display_name_preference: string;
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
          disabled
          className="bg-muted"
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
        <div className="text-left mb-3">
          <Label>Display Name in Reviews</Label>
          <p className="text-sm text-gray-500 mt-1">
            Choose how your name appears when you write reviews
          </p>
        </div>
        <RadioGroup
          value={formData.display_name_preference}
          onValueChange={(value) => handleInputChange("display_name_preference", value)}
          className="grid grid-cols-1 gap-4"
        >
          <div className="flex items-center space-x-2 p-3 border rounded-lg">
            <RadioGroupItem value="pseudonym" id="pseudonym-option" />
            <div className="flex-1">
              <Label htmlFor="pseudonym-option" className="font-medium">
                Pseudonym (Recommended)
              </Label>
              <p className="text-sm text-gray-500">
                Use your pseudonym to keep your identity private
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 p-3 border rounded-lg">
            <RadioGroupItem value="full_name" id="full-name-option" />
            <div className="flex-1">
              <Label htmlFor="full-name-option" className="font-medium">
                Full Name
              </Label>
              <p className="text-sm text-gray-500">
                Use your real name (publicly visible)
              </p>
            </div>
          </div>
        </RadioGroup>
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
