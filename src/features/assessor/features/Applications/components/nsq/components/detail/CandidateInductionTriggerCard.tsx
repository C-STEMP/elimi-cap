"use client";

import React from "react";

interface CandidateInductionTriggerCardProps {
  onView: () => void;
}

export const CandidateInductionTriggerCard: React.FC<
  CandidateInductionTriggerCardProps
> = ({ onView }) => {
  return (
    <div
      onClick={onView}
      className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 flex items-center justify-between gap-4 select-text cursor-pointer group"
    >
      <span className="text-sm sm:text-base font-extrabold text-neutral-primary group-hover:text-primary transition-colors tracking-tight">
        Candidate Induction Form
      </span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onView();
        }}
        className="px-6 sm:px-7 py-2 text-[#fbab2a] hover:bg-amber-50/40 font-bold text-xs sm:text-sm rounded-xl border border-gray-100/90 shadow-xs bg-white transition-colors cursor-pointer"
      >
        View
      </button>
    </div>
  );
};
