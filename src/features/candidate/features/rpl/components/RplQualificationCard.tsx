"use client";

import React from "react";
import { Input } from "@/src/components/ui/input";
import { Select } from "@/src/components/ui/select";
import { InfoIcon } from "@/src/components/ui/info-icon";

interface RplQualificationCardProps {
  form: any;
  errors: Record<string, string>;
  update: (field: string, val: any) => void;
  isUnitsLoading: boolean;
  unitOptions: any[];
}

export const RplQualificationCard: React.FC<RplQualificationCardProps> = ({
  form,
  errors,
  update,
  isUnitsLoading,
  unitOptions,
}) => {
  return (
    <div className="flex flex-col gap-4 lg:gap-6 mt-1">
      <h2 className="text-lg xl:text-2xl font-extrabold tracking-tight text-neutral-primary flex items-center gap-1.5">
        Qualification Applying For <InfoIcon sectionName="Qualification Applying For" />
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Input
            label={<span>Qualification Title<span className="text-primary-solid ml-0.5">*</span></span>}
            type="text"
            placeholder="Enter qualification title"
            value={form.qualificationTitle}
            error={errors.qualificationTitle}
            onChange={(e) => update("qualificationTitle", e.target.value)}
          />
        </div>

        <Select
          label={<span>Have you completed an assessment before?<span className="text-primary-solid ml-0.5">*</span></span>}
          placeholder="Select"
          options={["Yes", "No"]}
          value={form.completedBefore}
          onChange={(e) => {
            const val = e.target.value;
            update("completedBefore", val);
            if (val === "No") update("previousAssessmentDetails", "");
          }}
        />

        <Input
          label="Previous Assessment / Certification Details"
          type="text"
          placeholder={form.completedBefore === "No" ? "Disabled (Selected 'No' above)" : "Enter details of your previous assessment"}
          value={form.previousAssessmentDetails}
          disabled={form.completedBefore === "No"}
          onChange={(e) => update("previousAssessmentDetails", e.target.value)}
        />

        <Select
          label={<span>Assessment Type<span className="text-primary-solid ml-0.5">*</span></span>}
          placeholder="Select"
          options={["Full Qualification Assessment", "Modular Assessment"]}
          value={form.assessmentType}
          error={errors.assessmentType}
          onChange={(e) => {
            const val = e.target.value;
            update("assessmentType", val);
            if (val === "Full Qualification Assessment") update("individualUnit", []);
          }}
        />

        <Select
          label={
            <span>
              Individual Unit{" "}
              <span className="text-gray-400 font-normal text-xs">(Multiple Selection)</span>
            </span>
          }
          placeholder={isUnitsLoading ? "Loading units..." : "Select units"}
          loading={isUnitsLoading}
          multiple={true}
          disabled={form.assessmentType === "Full Qualification Assessment"}
          options={unitOptions}
          value={form.individualUnit}
          error={errors.individualUnit}
          notFoundContent={isUnitsLoading ? "Loading units..." : "No units for this assessment type"}
          helperText={isUnitsLoading ? "Fetching available modular units for this trade..." : undefined}
          onChange={(e) => update("individualUnit", e.target.value)}
        />
      </div>
    </div>
  );
};
