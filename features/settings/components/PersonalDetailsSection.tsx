"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FiCalendar } from "react-icons/fi";
import { ProfileFormData } from "../types/settings.types";

interface PersonalDetailsSectionProps {
  formData: ProfileFormData;
  onChange: (field: keyof ProfileFormData, value: any) => void;
}

const GENDER_OPTIONS = ["Male", "Female", "Other"];
const NATIONALITY_OPTIONS = ["Nigerian", "Ghanaian", "Kenyan", "Other"];

export const PersonalDetailsSection: React.FC<PersonalDetailsSectionProps> = ({
  formData,
  onChange,
}) => {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg lg:text-xl font-bold text-[#1e1e1e]">
        Personal Details
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:gap-5">
        <Input
          label="First Name"
          value={formData.firstName}
          onChange={(e) => onChange("firstName", e.target.value)}
          placeholder="Enter first name"
        />
        <Input
          label="Last Name"
          value={formData.lastName}
          onChange={(e) => onChange("lastName", e.target.value)}
          placeholder="Enter last name"
        />
        <Input
          label="Middle Name"
          value={formData.middleName}
          onChange={(e) => onChange("middleName", e.target.value)}
          placeholder="Enter middle name"
        />
        <Input
          label="Date Of Birth"
          value={formData.dateOfBirth}
          onChange={(e) => onChange("dateOfBirth", e.target.value)}
          placeholder="dd/mm/yyyy"
          suffix={<FiCalendar className="w-4 h-4 text-gray-400" />}
        />
        <Select
          label="Gender"
          required
          value={formData.gender}
          onChange={(e) => onChange("gender", e.target.value)}
          options={GENDER_OPTIONS}
          placeholder="Select"
        />
        <Select
          label="Nationality"
          required
          value={formData.nationality}
          onChange={(e) => onChange("nationality", e.target.value)}
          options={NATIONALITY_OPTIONS}
          placeholder="Select"
        />
      </div>
    </div>
  );
};
