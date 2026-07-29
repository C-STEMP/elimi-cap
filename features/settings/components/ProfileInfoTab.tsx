"use client";

import React from "react";
import Image from "next/image";
import { saveIcon } from "@/assets";
import { ProfileFormData } from "../types/settings.types";
import { PersonalDetailsSection } from "./PersonalDetailsSection";
import { ContactInfoSection } from "./ContactInfoSection";
import { ResidentialAddressSection } from "./ResidentialAddressSection";
import { AccessibilitySection } from "./AccessibilitySection";
import { NotificationPrefSection } from "./NotificationPrefSection";
import { Button } from "@/components/ui/button";

interface ProfileInfoTabProps {
  formData: ProfileFormData;
  onChange: (field: keyof ProfileFormData, value: any) => void;
  onSave: () => void;
}

export const ProfileInfoTab: React.FC<ProfileInfoTabProps> = ({
  formData,
  onChange,
  onSave,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-[20px] p-6 lg:p-8 shadow-sm border border-gray-100/80 flex flex-col gap-8 w-full"
    >
      <PersonalDetailsSection formData={formData} onChange={onChange} />
      <hr className="border-gray-100 my-1" />
      <ContactInfoSection formData={formData} onChange={onChange} />
      <hr className="border-gray-100 my-1" />
      <ResidentialAddressSection formData={formData} onChange={onChange} />
      <hr className="border-gray-100 my-1" />
      <AccessibilitySection formData={formData} onChange={onChange} />
      <hr className="border-gray-100 my-1" />
      <NotificationPrefSection formData={formData} onChange={onChange} />

      {/* Submit Button */}
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          size="sm"
          className="bg-[#fbab2a]! hover:bg-[#e89b1f]! active:scale-95 text-white font-semibold px-8 py-3 rounded-xl flex items-center gap-2.5 shadow-sm transition-all cursor-pointer text-sm"
        >
          <span>Save</span>
          <Image
            src={saveIcon}
            alt="Save"
            width={18}
            height={18}
            className="brightness-0 invert"
          />
        </Button>
      </div>
    </form>
  );
};
