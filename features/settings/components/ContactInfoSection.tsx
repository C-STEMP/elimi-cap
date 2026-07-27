"use client";

import React from "react";
import { Select } from "@/components/ui/select";
import { ProfileFormData } from "../types/settings.types";

interface ContactInfoSectionProps {
  formData: ProfileFormData;
  onChange: (field: keyof ProfileFormData, value: any) => void;
}

export const ContactInfoSection: React.FC<ContactInfoSectionProps> = ({
  formData,
  onChange,
}) => {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg lg:text-2xl font-extrabold text-neutral-primary">
        Contact Information
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:gap-5">
        <Select
          label="Email Address"
          value={formData.email}
          onChange={(e) => onChange("email", e.target.value)}
          placeholder="Select"
          options={[formData.email || "chidi.umeh@example.com"]}
        />
        <Select
          label="Phone Number"
          value={formData.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          placeholder="Select"
          options={[formData.phone || "+234 801 234 5678"]}
        />
      </div>
    </div>
  );
};
