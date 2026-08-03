"use client";

import React from "react";
import { FiClipboard } from "react-icons/fi";

export const AssessmentCentreEmptyView: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl p-12 sm:p-16 flex flex-col items-center justify-center text-center shadow-2xs border border-gray-100/80 min-h-[450px] w-full select-none">
      <div className="w-20 h-20 bg-red-50 text-[#a31d38] rounded-full flex items-center justify-center border-4 border-red-100/70 mb-4 shadow-2xs">
        <FiClipboard className="w-9 h-9 stroke-[1.8]" />
      </div>

      <h3 className="text-xl sm:text-2xl font-extrabold text-[#a31d38] tracking-tight">
        No Activity Yet
      </h3>

      <p className="text-neutral-secondary text-xs sm:text-sm font-normal mt-2.5 max-w-sm leading-relaxed">
        Your dashboard will populate once applications start coming in.
      </p>
    </div>
  );
};
