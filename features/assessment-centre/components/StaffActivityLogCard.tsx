"use client";

import React from "react";
import { MOCK_STAFF_LOGS } from "../utils/constants";

export const StaffActivityLogCard: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-2xs border border-gray-100/80 flex flex-col justify-between h-full select-none">
      {/* Header */}
      <h3 className="text-lg font-bold text-neutral-primary tracking-tight mb-4">
        Staff Activity Log
      </h3>

      {/* Activity List */}
      <div className="flex flex-col gap-3">
        {MOCK_STAFF_LOGS.map((log) => (
          <div
            key={log.id}
            className="bg-[#F8F9FA] hover:bg-[#F3F4F6] rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-colors border border-gray-100/70"
          >
            {/* Staff Info */}
            <div className="flex flex-col shrink-0 min-w-[100px]">
              <span className="text-xs sm:text-sm font-extrabold text-neutral-primary truncate">
                {log.name}
              </span>
              <span className="text-[10px] text-gray-400 font-normal mt-0.5">
                {log.role}
              </span>
            </div>

            {/* Action Description */}
            <span className="text-xs sm:text-sm text-neutral-secondary font-medium text-left flex-1 px-2 line-clamp-1">
              {log.action}
            </span>

            {/* Timestamp */}
            <span className="text-[11px] text-gray-400 font-semibold shrink-0">
              {log.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
