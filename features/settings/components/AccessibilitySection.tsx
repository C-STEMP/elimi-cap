"use client";

import React from "react";
import { Select } from "@/components/ui/select";
import { ProfileFormData } from "../types/settings.types";

interface AccessibilitySectionProps {
  formData: ProfileFormData;
  onChange: (field: keyof ProfileFormData, value: any) => void;
}

const IMPAIRMENT_OPTIONS = [
  "None",
  "Visual Impairment",
  "Hearing Impairment",
  "Mobility Impairment",
  "Other",
];

export const AccessibilitySection: React.FC<AccessibilitySectionProps> = ({
  formData,
  onChange,
}) => {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg lg:text-2xl font-extrabold text-neutral-primary">
        Accessibility
      </h2>
      <div className="w-full">
        <Select
          label="Do you have any impairment?"
          value={formData.impairment}
          onChange={(e) => onChange("impairment", e.target.value)}
          placeholder="Select"
          options={IMPAIRMENT_OPTIONS}
        />
      </div>
    </div>
  );
};
