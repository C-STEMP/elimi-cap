"use client";

import React from "react";

interface QualificationStandardCardProps {
  tradeName: string;
  qualificationCode?: string;
  evidenceTypes?: string;
  sector?: string;
  level?: string;
  mandatoryScore?: number;
  optionalScore?: number;
}

export const QualificationStandardCard: React.FC<
  QualificationStandardCardProps
> = ({
  tradeName,
  qualificationCode = "CON/MS001/L1",
  evidenceTypes = "DO/QA/WT/WP/ASS",
  sector = "Construction",
  level = "Level 3",
  mandatoryScore = 0,
  optionalScore = 0,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 w-full select-text">
      {/* Left Card: Qualification Standard */}
      <div className="md:col-span-7 bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 flex flex-col justify-between gap-5">
        <div className="flex flex-col gap-2.5">
          <span className="w-fit px-2.5 py-0.5 bg-[#fce7f3] text-[#be185d] font-bold text-[10px] rounded-md tracking-wide">
            Mandatory
          </span>

          <h2 className="text-base sm:text-lg font-black text-neutral-primary tracking-tight">
            {tradeName} National Occupational Standard
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              QUALIFICATION CODE
            </span>
            <span className="text-xs sm:text-sm font-black text-neutral-primary mt-1 block">
              {qualificationCode}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              EVIDENCE TYPE
            </span>
            <span className="text-xs sm:text-sm font-black text-neutral-primary mt-1 block">
              {evidenceTypes}
            </span>
          </div>
        </div>
      </div>

      {/* Right Card: Sector & Metrics */}
      <div className="md:col-span-5 bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 grid grid-cols-2 gap-y-5 gap-x-4 items-center">
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            SECTOR
          </span>
          <span className="text-xs sm:text-sm font-black text-neutral-primary mt-1 block">
            {sector}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            MANDATORY UNIT SCORE
          </span>
          <span className="text-base sm:text-lg font-black text-neutral-primary mt-1 block">
            {mandatoryScore}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            LEVEL
          </span>
          <span className="text-xs sm:text-sm font-black text-neutral-primary mt-1 block">
            {level}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            OPTIONAL UNIT SCORE
          </span>
          <span className="text-base sm:text-lg font-black text-neutral-primary mt-1 block">
            {optionalScore}
          </span>
        </div>
      </div>
    </div>
  );
};
