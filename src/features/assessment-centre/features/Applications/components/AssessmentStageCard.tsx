"use client";

import React, { useState } from "react";
import { Select } from "@/src/components/ui/select";
import { useGetCentreDashboard } from "@/src/features/shared/centre/hooks";

const DEFAULT_STAGES = [
  { label: "Stage 1 - Profile & Verification", percentage: 0, count: 0 },
  { label: "Stage 2 - Document Upload", percentage: 0, count: 0 },
  { label: "Stage 3 - Assessor Review", percentage: 0, count: 0 },
  { label: "Stage 4 - Certification", percentage: 0, count: 0 },
];

export const AssessmentStageCard: React.FC = () => {
  const [assessmentType, setAssessmentType] = useState<"RPL" | "NSQ">("RPL");

  const { data: dashboardData } = useGetCentreDashboard({
    applicationType: assessmentType,
  });

  const rawStages = dashboardData?.candidatesByStage || [];
  const totalCount = rawStages.reduce((acc, s) => acc + (s.count || 0), 0);

  const stageItems =
    rawStages.length > 0
      ? rawStages.map((s) => ({
          label: s.label || s.stageKey,
          percentage:
            totalCount > 0 ? Math.round((s.count / totalCount) * 100) : 0,
          count: s.count,
        }))
      : DEFAULT_STAGES;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-2xs flex flex-col gap-4 h-full select-none">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-6">
        <h3 className="text-lg font-medium text-black tracking-tight">
          Candidate By Assessment Stage
        </h3>

        <Select
          size="sm"
          showPlaceholderOption={false}
          containerClassName="w-24!"
          value={assessmentType}
          onChange={(e) => setAssessmentType(e.target.value as "RPL" | "NSQ")}
          options={["RPL", "NSQ"]}
        />
      </div>

      {/* Stage Progress Rows */}
      <div className="flex flex-col gap-4 lg:gap-8">
        {stageItems.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between gap-4"
          >
            <span className="w-44 text-xs sm:text-sm font-semibold text-neutral-primary shrink-0 truncate">
              {item.label}
            </span>

            {/* Progress Bar Track */}
            <div className="flex-1 bg-[#F3F4F6] rounded-full h-2.5 overflow-hidden">
              <div
                style={{ width: `${Math.min(item.percentage, 100)}%` }}
                className="bg-[#3b82f6] h-full rounded-full transition-all duration-500 ease-out"
              />
            </div>

            {/* Percentage Label */}
            <span className="w-12 text-right text-xs font-bold text-neutral-primary shrink-0">
              {item.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
