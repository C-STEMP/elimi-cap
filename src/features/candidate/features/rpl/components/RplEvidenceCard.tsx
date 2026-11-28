"use client";

import React from "react";
import { FiCheck } from "react-icons/fi";
import { Input } from "@/src/components/ui/input";
import { InfoIcon } from "@/src/components/ui/info-icon";
import { EVIDENCE_OPTIONS } from "../hooks/useRplExperienceState";

interface RplEvidenceCardProps {
  reasonRPL: string;
  selectedEvidence: string[];
  otherEvidenceText: string;
  errors?: Record<string, string>;
  update: (field: string, val: any) => void;
  toggleEvidence: (item: string) => void;
}

export const RplEvidenceCard: React.FC<RplEvidenceCardProps> = ({
  reasonRPL,
  selectedEvidence,
  otherEvidenceText,
  errors = {},
  update,
  toggleEvidence,
}) => {
  return (
    <>
      {/* Section: Why are you applying for RPL? */}
      <div className="flex flex-col gap-4 lg:gap-6 mt-2">
        <h2 className="text-lg xl:text-2xl font-extrabold tracking-tight text-neutral-primary flex items-center gap-1.5">
          Why are you applying for RPL? <InfoIcon sectionName="Why are you applying for RPL?" />
        </h2>

        <div className="flex flex-col gap-1.5 w-full">
          <label className="font-sans text-text-dark font-medium text-xs xl:text-sm leading-[1.4] select-none">
            Reason for Seeking RPL
            <span className="text-primary-solid ml-0.5">*</span>
          </label>
          <textarea
            placeholder="Explain why you are seeking Recognition of Prior Learning and what you hope to achieve after certification."
            rows={4}
            value={reasonRPL}
            aria-required="true"
            aria-invalid={Boolean(errors.reasonRPL)}
            onChange={(e) => update("reasonRPL", e.target.value)}
            className={`w-full p-3.5 bg-input-bg text-text-dark font-normal text-sm border rounded-radius-200 outline-none placeholder:text-gray-400 transition-all resize-none ${
              errors.reasonRPL
                ? "border-primary-solid ring-2 ring-border-secondary"
                : "border-transparent focus:border-primary-solid/40 focus:ring-2 focus:ring-primary-solid/10"
            }`}
          />
          {errors.reasonRPL && (
            <span className="text-primary-solid text-xs font-semibold leading-[1.4] transition-all duration-200 animate-fadeIn">
              {errors.reasonRPL}
            </span>
          )}
        </div>
      </div>

      {/* Section: Evidence Summary */}
      <div className="flex flex-col gap-4 lg:gap-6 mt-2">
        <h2 className="text-lg xl:text-2xl font-extrabold tracking-tight text-neutral-primary flex items-center gap-1.5">
          Evidence Summary <InfoIcon sectionName="Evidence Summary" />
        </h2>
        <p className="text-neutral-secondary text-xs sm:text-sm font-normal">
          Which evidence can you provide? (Multiple Selection)
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
          {EVIDENCE_OPTIONS.map((item) => {
            const isChecked = selectedEvidence.includes(item);
            return (
              <div
                key={item}
                onClick={() => toggleEvidence(item)}
                className={`flex items-center justify-between p-3.5 h-20 bg-input-bg rounded-xl border cursor-pointer select-none transition-all duration-200 ${
                  isChecked ? "border-secondary bg-white ring-1 ring-secondary/40 shadow-xs" : "border-[#D9D9D980] hover:border-gray-300"
                }`}
              >
                <span className="text-xs xl:text-sm font-medium text-text-dark leading-tight pr-2">
                  {item}
                </span>

                <div
                  className={`w-5 h-5 rounded border flex items-center justify-center transition-all shrink-0 ${
                    isChecked ? "bg-secondary border-secondary text-white" : "border-border-gray bg-inherit"
                  }`}
                >
                  {isChecked && <FiCheck className="w-3 h-3 stroke-3" />}
                </div>
              </div>
            );
          })}
        </div>

        {selectedEvidence.includes("Other") && (
          <div className="mt-3 w-full animate-fadeIn">
            <Input
              label="Specify Other Evidence"
              type="text"
              placeholder="Type details of your other evidence..."
              value={otherEvidenceText}
              onChange={(e) => update("otherEvidenceText", e.target.value)}
            />
          </div>
        )}
      </div>
    </>
  );
};
