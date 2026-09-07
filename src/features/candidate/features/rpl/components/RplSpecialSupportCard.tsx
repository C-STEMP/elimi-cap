"use client";

import React from "react";
import { FiCheck } from "react-icons/fi";
import { Input } from "@/src/components/ui/input";
import { InfoIcon } from "@/src/components/ui/info-icon";
import { IMPAIRMENT_OPTIONS } from "@/features/candidate/utils";

interface RplSpecialSupportCardProps {
  form: any;
  errors: Record<string, string>;
  update: (field: any, val: string) => void;
  selectedImpairments: string[];
  otherImpairment: string;
  setOtherImpairment: (val: string) => void;
  handleToggleImpairment: (option: string) => void;
}

export const RplSpecialSupportCard: React.FC<RplSpecialSupportCardProps> = ({
  form,
  errors,
  update,
  selectedImpairments,
  otherImpairment,
  setOtherImpairment,
  handleToggleImpairment,
}) => {
  return (
    <>
      <div className="flex flex-col gap-4 mt-2">
        <h2 className="text-base sm:text-lg font-bold text-text-dark flex items-center gap-1.5">
          Have You Completed An Assessment Before <InfoIcon sectionName="Have You Completed An Assessment Before" />
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-text-dark font-medium text-xs xl:text-sm">
              Select An Option<span className="text-primary-solid ml-0.5">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3 h-11 xl:h-12">
              <button
                type="button"
                onClick={() => update("completedBefore", "yes")}
                className={`flex items-center justify-between px-4 h-full rounded-radius-200 border transition-all text-xs xl:text-sm font-medium cursor-pointer ${
                  form.completedBefore === "yes" ? "bg-input-bg border-primary-solid text-text-dark" : "bg-input-bg border-transparent text-text-dark/70 hover:text-text-dark"
                }`}
              >
                <span>Yes</span>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${form.completedBefore === "yes" ? "border-primary-solid bg-primary-solid" : "border-gray-400"}`}>
                  {form.completedBefore === "yes" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  update("completedBefore", "no");
                  update("learnerId", "");
                }}
                className={`flex items-center justify-between px-4 h-full rounded-radius-200 border transition-all text-xs xl:text-sm font-medium cursor-pointer ${
                  form.completedBefore === "no" ? "bg-input-bg border-primary-solid text-text-dark" : "bg-input-bg border-transparent text-text-dark/70 hover:text-text-dark"
                }`}
              >
                <span>No</span>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${form.completedBefore === "no" ? "border-primary-solid bg-primary-solid" : "border-gray-400"}`}>
                  {form.completedBefore === "no" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </button>
            </div>
          </div>

          {form.completedBefore === "yes" && (
            <Input
              label={<span>If Yes, Enter Unique Learner ID<span className="text-primary-solid ml-0.5">*</span></span>}
              placeholder="000000000"
              value={form.learnerId}
              error={errors.learnerId}
              onChange={(e) => update("learnerId", e.target.value)}
            />
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-2">
        <h2 className="text-base sm:text-lg font-bold text-text-dark flex items-center gap-1.5">
          Accessibility <InfoIcon sectionName="Accessibility" />
        </h2>

        <div className="flex flex-col gap-2.5">
          <label className="text-xs sm:text-sm font-medium text-text-dark">
            Do you have any impairment? (Select all that apply)<span className="text-primary-solid ml-0.5">*</span>
          </label>

          <div className="flex flex-wrap gap-2.5 w-full">
            {IMPAIRMENT_OPTIONS.map((opt) => {
              const isSelected = selectedImpairments.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleToggleImpairment(opt)}
                  className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer border text-left leading-snug wrap-break-word ${
                    isSelected ? "bg-[#a31d38] text-white border-[#a31d38] shadow-xs" : "bg-white text-neutral-primary border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${isSelected ? "bg-white text-[#a31d38] border-white" : "border-gray-300 bg-white"}`}>
                    {isSelected && <FiCheck className="w-3 h-3 stroke-3" />}
                  </div>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>

          {errors.impairment && (
            <span className="text-primary-solid text-xs font-semibold mt-1">{errors.impairment}</span>
          )}

          {selectedImpairments.includes("Other") && (
            <div className="mt-2 max-w-md">
              <Input
                label={<span>Specify Other Impairment<span className="text-primary-solid ml-0.5">*</span></span>}
                type="text"
                placeholder="Please specify your impairment"
                value={otherImpairment}
                error={errors.otherImpairment}
                onChange={(e) => {
                  setOtherImpairment(e.target.value);
                  update("impairment", selectedImpairments.map((x) => (x === "Other" ? `Other: ${e.target.value}` : x)).join(", "));
                }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};
