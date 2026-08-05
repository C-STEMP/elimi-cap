"use client";

import React, { useState } from "react";
import { Select } from "@/components/ui/select";
import { MOCK_STAGES_DATA } from "../utils/constants";

export const AssessmentStageCard: React.FC = () => {
  const [assessmentType, setAssessmentType] = useState("RPL");

  return (
    <div className="bg-white rounded-3xl p-6 shadow-2xs border border-gray-100/80 flex flex-col justify-between h-full select-none">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-6">
        <h3 className="text-lg font-bold text-neutral-primary tracking-tight">
          Candidate By Assessment Stage
        </h3>

        <Select
          size="sm"
          showPlaceholderOption={false}
          containerClassName="w-24"
          value={assessmentType}
          onChange={(e) => setAssessmentType(e.target.value)}
          options={["RPL", "NSQ"]}
        />
      </div>

      {/* Stage Progress Rows */}
      <div className="flex flex-col gap-4">
        {MOCK_STAGES_DATA.map((item) => (
          <div key={item.stage} className="flex items-center justify-between gap-4">
            <span className="w-36 text-xs sm:text-sm font-semibold text-neutral-primary shrink-0 truncate">
              {item.stage}
            </span>

            {/* Progress Bar Track */}
            <div className="flex-1 bg-[#F3F4F6] rounded-full h-2.5 overflow-hidden">
              <div
                style={{ width: `${item.percentage * 2.5}%` }}
                className="bg-[#3b82f6] h-full rounded-full transition-all duration-500 ease-out"
              />
            </div>

            {/* Percentage Label */}
            <span className="w-10 text-right text-xs font-bold text-neutral-primary shrink-0">
              {item.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
