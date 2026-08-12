"use client";

import React from "react";
import { FiClipboard } from "react-icons/fi";

export const AssessmentCentreEmptyView: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl p-12 sm:p-16 flex flex-col items-center justify-center text-center shadow-2xs border border-gray-100/80 min-h-112.5 w-full select-none">
      <div className="w-20 h-20 bg-[#F5FAF8] text-primary rounded-full flex items-center justify-center border-2 border-primary/12 mb-4 shadow-2xs">
        <FiClipboard className="w-9 h-9 stroke-[1.8]" />
      </div>

      <h3 className="text-xl lg:text-2xl font-semibold text-primary tracking-tight">
        No Activity Yet
      </h3>

      <p className="text-black/50 text-xs sm:text-sm lg:text-base font-normal mt-2.5 max-w-sm leading-relaxed">
        Your dashboard will populate once applications start coming in.
      </p>
    </div>
  );
};
