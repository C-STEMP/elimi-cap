"use client";

import React, { useState } from "react";
import { Input } from "@/src/components/ui/input";
import { InfoIcon } from "@/src/components/ui/info-icon";
import { ProfileFormData } from "../types/settings.types";
import { IMPAIRMENT_OPTIONS, parseImpairmentString } from "@/features/candidate/utils";
import { FiCheck } from "react-icons/fi";

interface AccessibilitySectionProps {
  formData: ProfileFormData;
  onChange: (field: keyof ProfileFormData, value: any) => void;
}

export const AccessibilitySection: React.FC<AccessibilitySectionProps> = ({
  formData,
  onChange,
}) => {
  const parsedImpairments = React.useMemo(() => {
    return parseImpairmentString(formData.impairment);
  }, [formData.impairment]);

  const currentImpairments = parsedImpairments.list;

  const [otherImpairment, setOtherImpairment] = useState(() => {
    return parsedImpairments.otherText;
  });

  React.useEffect(() => {
    if (parsedImpairments.otherText && parsedImpairments.otherText !== otherImpairment) {
      setOtherImpairment(parsedImpairments.otherText);
    }
  }, [parsedImpairments.otherText]);

  const handleToggle = (option: string) => {
    let next: string[];
    const isExclusive =
      option === "None / No impairment" || option === "Prefer not to say";

    if (isExclusive) {
      next = [option];
      setOtherImpairment("");
    } else {
      const withoutExclusive = currentImpairments.filter(
        (x) =>
          x !== "None / No impairment" &&
          x !== "Prefer not to say" &&
          x !== "None" &&
          x !== "No",
      );
      if (withoutExclusive.includes(option)) {
        next = withoutExclusive.filter((x) => x !== option);
        if (next.length === 0) next = ["None / No impairment"];
      } else {
        next = [...withoutExclusive, option];
      }
    }

    const resolved = next
      .map((imp) =>
        imp === "Other" && otherImpairment.trim()
          ? `Other: ${otherImpairment.trim()}`
          : imp,
      )
      .join(", ");

    onChange("impairment", resolved);
  };

  const handleOtherChange = (val: string) => {
    setOtherImpairment(val);
    const next = currentImpairments
      .map((imp) =>
        imp === "Other" || imp.startsWith("Other:")
          ? val.trim()
            ? `Other: ${val.trim()}`
            : "Other"
          : imp,
      )
      .join(", ");
    onChange("impairment", next);
  };

  const isOtherSelected = currentImpairments.some(
    (x) => x === "Other" || x.startsWith("Other:"),
  );

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg lg:text-2xl font-extrabold text-neutral-primary flex items-center gap-1.5">
        Accessibility <InfoIcon sectionName="Accessibility" />
      </h2>

      <div className="flex flex-col gap-2.5">
        <label className="text-xs sm:text-sm font-medium text-text-dark">
          Do you have any impairment? (Select all that apply)
          <span className="text-primary-solid ml-0.5">*</span>
        </label>

        <div className="flex flex-wrap gap-2.5 w-full">
          {IMPAIRMENT_OPTIONS.map((opt) => {
            const isSelected =
              currentImpairments.includes(opt) ||
              (opt === "Other" && isOtherSelected);

            return (
              <button
                key={opt}
                type="button"
                onClick={() => handleToggle(opt)}
                className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer border text-left leading-snug break-words ${
                  isSelected
                    ? "bg-[#a31d38] text-white border-[#a31d38] shadow-xs"
                    : "bg-white text-neutral-primary border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? "bg-white text-[#a31d38] border-white"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {isSelected && <FiCheck className="w-3 h-3 stroke-[3]" />}
                </div>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>

        {isOtherSelected && (
          <div className="mt-2 max-w-md">
            <Input
              label={
                <span>
                  Specify Other Impairment
                  <span className="text-primary-solid ml-0.5">*</span>
                </span>
              }
              type="text"
              placeholder="Please specify your impairment"
              value={otherImpairment}
              onChange={(e) => handleOtherChange(e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
