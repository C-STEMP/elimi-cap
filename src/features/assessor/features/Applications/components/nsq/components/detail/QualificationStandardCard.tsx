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
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-4 select-text">
      <div className="flex items-center gap-2">
        <span className="px-2.5 py-0.5 bg-rose-50 text-rose-700 font-bold text-[10px] rounded-md border border-rose-100">
          Mandatory
        </span>
      </div>

      <h2 className="text-base sm:text-lg font-extrabold text-neutral-primary">
        {tradeName} National Occupational Standard
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-gray-100">
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            QUALIFICATION CODE
          </span>
          <span className="text-xs font-bold text-neutral-primary mt-0.5 block">
            {qualificationCode}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            EVIDENCE TYPE
          </span>
          <span className="text-xs font-bold text-neutral-primary mt-0.5 block">
            {evidenceTypes}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            SECTOR
          </span>
          <span className="text-xs font-bold text-neutral-primary mt-0.5 block">
            {sector}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            LEVEL
          </span>
          <span className="text-xs font-bold text-neutral-primary mt-0.5 block">
            {level}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            MANDATORY UNIT SCORE
          </span>
          <span className="text-sm font-extrabold text-neutral-primary mt-0.5 block">
            {mandatoryScore}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            OPTIONAL UNIT SCORE
          </span>
          <span className="text-sm font-extrabold text-neutral-primary mt-0.5 block">
            {optionalScore}
          </span>
        </div>
      </div>
    </div>
  );
};
