"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { InfoIcon } from "@/components/ui/info-icon";
import { ProfileFormData } from "../types/settings.types";
import { useCountryStateCity } from "@/lib/hooks/useCountryStateCity";

interface PersonalDetailsSectionProps {
  formData: ProfileFormData;
  onChange: (field: keyof ProfileFormData, value: any) => void;
}

const GENDER_OPTIONS = ["Male", "Female", "Prefer not to say"];

export const PersonalDetailsSection: React.FC<PersonalDetailsSectionProps> = ({
  formData,
  onChange,
}) => {
  const { countries } = useCountryStateCity(
    formData.country,
    formData.stateOfResidence,
  );

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg lg:text-2xl font-extrabold text-neutral-primary flex items-center gap-1.5">
        Personal Details <InfoIcon sectionName="Personal Details" />
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:gap-5">
        <Input
          label={
            <span>
              First Name<span className="text-primary-solid ml-0.5">*</span>
            </span>
          }
          value={formData.firstName}
          onChange={(e) => onChange("firstName", e.target.value)}
          placeholder="First name"
        />
        <Input
          label={
            <span>
              Last Name<span className="text-primary-solid ml-0.5">*</span>
            </span>
          }
          value={formData.lastName}
          onChange={(e) => onChange("lastName", e.target.value)}
          placeholder="Surname"
        />
        <Input
          label="Middle Name"
          value={formData.middleName}
          onChange={(e) => onChange("middleName", e.target.value)}
          placeholder="Other names"
        />
        <DatePicker
          label={
            <span>
              Date Of Birth
              <span className="text-primary-solid ml-0.5">*</span>
            </span>
          }
          placeholder="dd/mm/yyyy"
          maxYear={new Date().getFullYear() - 18}
          value={formData.dateOfBirth}
          onChange={(val) => onChange("dateOfBirth", val)}
        />
        <Select
          label={
            <span>
              Gender<span className="text-primary-solid ml-0.5">*</span>
            </span>
          }
          value={formData.gender}
          onChange={(e) => onChange("gender", e.target.value)}
          options={GENDER_OPTIONS}
          placeholder="Select"
        />
        <Select
          label={
            <span>
              Nationality<span className="text-primary-solid ml-0.5">*</span>
            </span>
          }
          value={formData.nationality}
          onChange={(e) => onChange("nationality", e.target.value)}
          options={countries}
          placeholder="Select"
        />
      </div>
    </div>
  );
};
