"use client";

import React from "react";

interface CandidateInductionTriggerCardProps {
  onView: () => void;
}

export const CandidateInductionTriggerCard: React.FC<
  CandidateInductionTriggerCardProps
> = ({ onView }) => {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 flex items-center justify-between gap-4 select-text">
      <span className="text-xs sm:text-sm font-bold text-neutral-primary">
        Candidate Induction Form
      </span>
      <button
        type="button"
        onClick={onView}
        className="px-5 py-2 text-[#fbab2a] hover:bg-amber-50 font-bold text-xs sm:text-sm rounded-xl border border-amber-200 transition-colors cursor-pointer"
      >
        View
      </button>
    </div>
  );
};
