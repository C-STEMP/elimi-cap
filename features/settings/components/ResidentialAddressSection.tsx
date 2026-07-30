"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ProfileFormData } from "../types/settings.types";

interface ResidentialAddressSectionProps {
  formData: ProfileFormData;
  onChange: (field: keyof ProfileFormData, value: any) => void;
}

const COUNTRY_OPTIONS = [
  "Nigeria",
  "Ghana",
  "Kenya",
  "South Africa",
  "Other",
];

const STATE_OPTIONS = [
  "Lagos",
  "Oyo",
  "Abuja (FCT)",
  "Enugu",
  "Rivers",
  "Kano",
];
const LGA_OPTIONS = [
  "Ikeja",
  "Ibadan North",
  "Enugu North",
  "Port Harcourt",
  "Municipal",
];

export const ResidentialAddressSection: React.FC<
  ResidentialAddressSectionProps
> = ({ formData, onChange }) => {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg lg:text-2xl font-extrabold text-neutral-primary">
        Residential Address
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:gap-5">
        <Select
          label="Country"
          value={formData.country}
          onChange={(e) => onChange("country", e.target.value)}
          placeholder="Select"
          options={COUNTRY_OPTIONS}
        />
        <Select
          label="State of Residence"
          value={formData.stateOfResidence}
          onChange={(e) => onChange("stateOfResidence", e.target.value)}
          placeholder="Select"
          options={STATE_OPTIONS}
        />
        <Select
          label="Local Government Area (LGA)"
          value={formData.lga}
          onChange={(e) => onChange("lga", e.target.value)}
          placeholder="Select"
          options={LGA_OPTIONS}
        />
        <Input
          label="Street Address"
          value={formData.residentialAddress}
          onChange={(e) => onChange("residentialAddress", e.target.value)}
          placeholder="Street Address"
        />
      </div>
    </div>
  );
};
