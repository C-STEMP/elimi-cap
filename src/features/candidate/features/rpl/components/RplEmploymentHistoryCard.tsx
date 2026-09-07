"use client";

import React from "react";
import { Input } from "@/src/components/ui/input";
import { Select } from "@/src/components/ui/select";
import { DatePicker } from "@/src/components/ui/date-picker";
import { InfoIcon } from "@/src/components/ui/info-icon";

interface RplEmploymentHistoryCardProps {
  employments: any[];
  errors: Record<string, string>;
  updateEmployment: (id: string, field: string, val: any) => void;
  addEmployment: () => void;
  removeEmployment: (id: string) => void;
}

export const RplEmploymentHistoryCard: React.FC<RplEmploymentHistoryCardProps> = ({
  employments,
  errors,
  updateEmployment,
  addEmployment,
  removeEmployment,
}) => {
  return (
    <div className="flex flex-col gap-4 lg:gap-6 mt-2">
      <h2 className="text-lg xl:text-2xl font-extrabold tracking-tight text-neutral-primary flex items-center gap-1.5">
        Employment History <InfoIcon sectionName="Employment History" />
      </h2>

      {employments.map((emp, idx) => (
        <div key={emp.id} className="flex flex-col gap-4 relative">
          {employments.length > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-xs xl:text-sm font-bold text-primary-solid">
                Employment #{idx + 1}
              </span>
              <button
                type="button"
                onClick={() => removeEmployment(emp.id)}
                className="text-xs text-red-500 hover:text-red-700 font-medium cursor-pointer"
              >
                Remove
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Company/Business Name"
              type="text"
              placeholder="Type here"
              value={emp.companyName}
              onChange={(e) => updateEmployment(emp.id, "companyName", e.target.value)}
            />

            <Input
              label="Job Title"
              type="text"
              placeholder="Type here"
              value={emp.jobTitle}
              onChange={(e) => updateEmployment(emp.id, "jobTitle", e.target.value)}
            />

            <Select
              label="Employment Type"
              placeholder="Select"
              options={["Full-time", "Part-time", "Self-Employed / Freelance", "Contract"]}
              value={emp.employmentType}
              onChange={(e) => updateEmployment(emp.id, "employmentType", e.target.value)}
            />

            <div className="flex flex-col gap-1.5 w-full">
              <label className="font-sans text-text-dark font-medium text-xs xl:text-sm leading-[1.4] select-none">
                Start and End Date
              </label>
              <div className="grid grid-cols-2 gap-2">
                <DatePicker
                  placeholder="dd/mm/yy"
                  value={emp.startDate}
                  onChange={(val) => updateEmployment(emp.id, "startDate", val)}
                  align="left"
                />
                <DatePicker
                  placeholder="dd/mm/yy"
                  value={emp.endDate}
                  error={errors[`empDate_${emp.id}`]}
                  onChange={(val) => updateEmployment(emp.id, "endDate", val)}
                  align="right"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="font-sans text-text-dark font-medium text-xs xl:text-sm leading-[1.4] select-none">
              Key Responsibilities
            </label>
            <textarea
              placeholder="Type here"
              rows={3}
              value={emp.responsibilities}
              onChange={(e) => updateEmployment(emp.id, "responsibilities", e.target.value)}
              className="w-full p-3.5 bg-input-bg text-text-dark font-normal text-sm border border-transparent rounded-radius-200 outline-none focus:border-primary-solid/40 focus:ring-2 focus:ring-primary-solid/10 placeholder:text-gray-400 transition-all resize-none"
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addEmployment}
        className="self-start text-xs xl:text-sm font-bold text-primary-solid hover:underline flex items-center gap-1 cursor-pointer mt-1"
      >
        + Add Another Employment
      </button>
    </div>
  );
};
