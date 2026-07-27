"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ProfileFormData } from "../types/settings.types";

interface ResidentialAddressSectionProps {
  formData: ProfileFormData;
  onChange: (field: keyof ProfileFormData, value: any) => void;
}

const STATE_OPTIONS = ["Lagos", "Abuja (FCT)", "Enugu", "Rivers", "Oyo", "Kano"];
const LGA_OPTIONS = ["Ikeja", "Enugu North", "Port Harcourt", "Municipal", "Ibadan North"];

export const ResidentialAddressSection: React.FC<
  ResidentialAddressSectionProps
> = ({ formData, onChange }) => {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg lg:text-xl font-bold text-[#1e1e1e]">
        Residential Address
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:gap-5">
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
      </div>
      <div className="w-full mt-1">
        <Input
          label="Residential Address"
          required
          value={formData.residentialAddress}
          onChange={(e) => onChange("residentialAddress", e.target.value)}
          placeholder="Street Address"
        />
      </div>
    </div>
  );
};
