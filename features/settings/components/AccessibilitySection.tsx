"use client";

import React, { useState } from "react";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
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
  const [otherImpairment, setOtherImpairment] = useState(
    formData.impairment && !IMPAIRMENT_OPTIONS.includes(formData.impairment)
      ? formData.impairment
      : ""
  );

  const selectedValue = IMPAIRMENT_OPTIONS.includes(formData.impairment)
    ? formData.impairment
    : formData.impairment
    ? "Other"
    : "";

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg lg:text-2xl font-extrabold text-neutral-primary flex items-center gap-1.5">
        Accessibility <InfoIcon sectionName="Accessibility" />
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:gap-5">
        <Select
          label={
            <span>
              Do you have any impairment?
              <span className="text-primary-solid ml-0.5">*</span>
            </span>
          }
          value={selectedValue}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "Other") {
              onChange("impairment", otherImpairment || "Other");
            } else {
              onChange("impairment", val);
            }
          }}
          placeholder="Select"
          options={IMPAIRMENT_OPTIONS}
        />

        {selectedValue === "Other" && (
          <Input
            label={
              <span>
                Specify Impairment
                <span className="text-primary-solid ml-0.5">*</span>
              </span>
            }
            value={otherImpairment}
            onChange={(e) => {
              const val = e.target.value;
              setOtherImpairment(val);
              onChange("impairment", val || "Other");
            }}
            placeholder="Please specify your impairment"
          />
        )}
      </div>
    </div>
  );
};
