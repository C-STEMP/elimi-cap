"use client";

import React from "react";
import { Avatar } from "@/src/components/ui/avatar";
import type { NormalizedFacilitator } from "../utils/facilitator";

interface StaffFacilitatorCardProps {
  facilitator?: NormalizedFacilitator | null;
  tradeName?: string;
  className?: string;
}

export const StaffFacilitatorCard: React.FC<StaffFacilitatorCardProps> = ({
  facilitator,
  tradeName,
  className = "",
}) => {
  const tradeTitle = facilitator?.trade || tradeName;

  if (facilitator) {
    return (
      <div
        className={`bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs flex flex-col gap-4 select-text ${className}`}
      >
        <h3 className="text-base font-extrabold text-black tracking-tight">
          Facilitator
        </h3>
        <div className="flex items-center gap-3.5 bg-[#F8F9FA] rounded-2xl p-3 border border-gray-100">
          <Avatar
            src={facilitator.photoUrl || facilitator.avatar || undefined}
            name={facilitator.name}
            className="w-13 h-13 border border-gray-200 shrink-0"
            alt={facilitator.name}
          />
          <div className="flex flex-col gap-0.5 min-w-0">
            <h4 className="text-sm font-bold text-black truncate">
              {facilitator.name}
            </h4>
            <p className="text-[11px] text-gray-500 font-normal truncate">
              {["Facilitator", tradeTitle].filter(Boolean).join(" · ")}
            </p>
            {tradeTitle && (
              <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                <span className="bg-[#FCE8EB] text-[#A31D38] text-[9px] font-bold px-2 py-0.5 rounded-full">
                  {tradeTitle}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs flex flex-col gap-2 select-text ${className}`}
    >
      <h3 className="text-base font-extrabold text-black tracking-tight">
        No facilitator assigned yet
      </h3>
      <p className="text-xs text-gray-400 font-normal leading-relaxed">
        A facilitator will appear here once assigned to this candidate.
      </p>
    </div>
  );
};
