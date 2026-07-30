"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
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
        <Input
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={(e) => onChange("email", e.target.value)}
          placeholder="yourname@email.com"
        />
        <PhoneInput
          label="Phone Number"
          value={formData.phone}
          onChange={(val) => onChange("phone", val)}
          country="ng"
          preferredCountries={["ng", "gh", "ke", "za"]}
        />
      </div>
    </div>
  );
};
