"use client";

import React from "react";
import { Input } from "@/src/components/ui/input";
import { Select, SelectOption } from "@/src/components/ui/select";

export const LEVEL_OPTIONS: SelectOption[] = [
  { label: "Level 1", value: "Level 1" },
  { label: "Level 2", value: "Level 2" },
  { label: "Level 3", value: "Level 3" },
  { label: "Level 4", value: "Level 4" },
  { label: "Level 5", value: "Level 5" },
];

export const ASSESSMENT_TYPE_OPTIONS: SelectOption[] = [
  { label: "Specialized", value: "Specialized" },
  { label: "Modular", value: "Modular" },
  { label: "Full Qualification", value: "Full Qualification" },
];

interface InductionPersonalFieldsProps {
  firstName: string;
  setFirstName: (val: string) => void;
  lastName: string;
  setLastName: (val: string) => void;
  middleName: string;
  setMiddleName: (val: string) => void;
  registrationNo: string;
  setRegistrationNo: (val: string) => void;
  tradeId: string;
  setTradeId: (val: string) => void;
  tradeOptions: SelectOption[];
  level: string;
  setLevel: (val: string) => void;
  assessmentType: string;
  setAssessmentType: (val: string) => void;
  courseStartDate: string;
  setCourseStartDate: (val: string) => void;
}

export const InductionPersonalFields: React.FC<InductionPersonalFieldsProps> = ({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  middleName,
  setMiddleName,
  registrationNo,
  setRegistrationNo,
  tradeId,
  setTradeId,
  tradeOptions,
  level,
  setLevel,
  assessmentType,
  setAssessmentType,
  courseStartDate,
  setCourseStartDate,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Input
        label={<span>First Name<span className="text-primary-solid ml-0.5">*</span></span>}
        placeholder="First name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
      />
      <Input
        label={<span>Last Name<span className="text-primary-solid ml-0.5">*</span></span>}
        placeholder="Surname"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
      />
      <Input
        label="Middle Name"
        placeholder="Other names"
        value={middleName}
        onChange={(e) => setMiddleName(e.target.value)}
      />
      <Input
        label="Registration No."
        placeholder="Type here"
        value={registrationNo}
        onChange={(e) => setRegistrationNo(e.target.value)}
      />
      <Select
        label={<span>Trade<span className="text-primary-solid ml-0.5">*</span></span>}
        placeholder="Select"
        options={tradeOptions}
        value={tradeId}
        onChange={(e) => setTradeId(e.target.value)}
      />
      <Select
        label={<span>Level<span className="text-primary-solid ml-0.5">*</span></span>}
        placeholder="Select"
        options={LEVEL_OPTIONS}
        value={level}
        onChange={(e) => setLevel(e.target.value)}
      />
      <Select
        label={<span>Assessment Type<span className="text-primary-solid ml-0.5">*</span></span>}
        placeholder="Select"
        options={ASSESSMENT_TYPE_OPTIONS}
        value={assessmentType}
        onChange={(e) => setAssessmentType(e.target.value)}
      />
      <div className="flex flex-col gap-1.5">
        <label className="text-text-dark font-medium text-xs leading-[1.4] select-none">
          Course Start Date<span className="text-primary-solid ml-0.5">*</span>
        </label>
        <input
          type="date"
          value={courseStartDate}
          onChange={(e) => setCourseStartDate(e.target.value)}
          className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-[#f8f9fa] text-xs font-semibold text-neutral-primary focus:outline-none focus:ring-2 focus:ring-[#fbab2a]/30 focus:border-[#fbab2a] transition-all cursor-pointer"
        />
      </div>
    </div>
  );
};
