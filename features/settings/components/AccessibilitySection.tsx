"use client";

import React from "react";
import { Select } from "@/components/ui/select";
import { InfoIcon } from "@/components/ui/info-icon";
import { ProfileFormData } from "../types/settings.types";

interface AccessibilitySectionProps {
  formData: ProfileFormData;
  onChange: (field: keyof ProfileFormData, value: any) => void;
}

const IMPAIRMENT_OPTIONS = [
  "No",
  "Visual impairment",
  "Hearing impairment",
  "Mobility impairment",
  "Other",
];

export const AccessibilitySection: React.FC<AccessibilitySectionProps> = ({
  formData,
  onChange,
}) => {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg lg:text-2xl font-extrabold text-neutral-primary flex items-center gap-1.5">
        Accessibility <InfoIcon sectionName="Accessibility" />
      </h2>
      <div className="w-full">
        <Select
          label={
            <span>
              Do you have any impairment?
              <span className="text-primary-solid ml-0.5">*</span>
            </span>
          }
          value={formData.impairment}
          onChange={(e) => onChange("impairment", e.target.value)}
          placeholder="Select"
          options={IMPAIRMENT_OPTIONS}
        />
      </div>
    </div>
  );
};
