"use client";

import React from "react";
import { Input } from "@/src/components/ui/input";
import { PhoneInput } from "@/src/components/ui/phone-input";
import { InfoIcon } from "@/src/components/ui/info-icon";
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
      <h2 className="text-lg lg:text-2xl font-extrabold text-neutral-primary flex items-center gap-1.5">
        Contact Information <InfoIcon sectionName="Contact Information" />
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:gap-5">
        <Input
          label={
            <span>
              Email Address<span className="text-primary-solid ml-0.5">*</span>
            </span>
          }
          type="email"
          value={formData.email}
          onChange={(e) => onChange("email", e.target.value)}
          placeholder="yourname@email.com"
        />
        <PhoneInput
          label={
            <span>
              Phone Number<span className="text-primary-solid ml-0.5">*</span>
            </span>
          }
          value={formData.phone}
          onChange={(val) => onChange("phone", val)}
          onCountryChange={(cName) => onChange("country", cName)}
          defaultCountry="NG"
        />
      </div>
    </div>
  );
};
