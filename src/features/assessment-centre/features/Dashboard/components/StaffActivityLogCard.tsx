"use client";

import React from "react";
import { MOCK_STAFF_LOGS } from "@/features/assessment-centre/utils/constants";

export const StaffActivityLogCard: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-2xs border border-gray-100/80 flex flex-col gap-4 select-none">
      <h3 className="text-lg font-medium text-black tracking-tight mb-4">
        Staff Activity Log
      </h3>

      <div className="flex flex-col gap-3">
        {MOCK_STAFF_LOGS.map((log) => (
          <div
            key={log.id}
            className="bg-[#F5FAF8] hover:bg-[#F3F4F6] rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-colors border border-gray-100/70"
          >
            <div className="flex flex-col shrink-0 min-w-25">
              <span className="text-xs sm:text-sm font-medium text-black truncate">
                {log.name}
              </span>
              <span className="text-xs text-black/69 text-[10px] font-normal mt-0.5">
                {log.role}
              </span>
            </div>

            <span className="text-xs lg:text-sm text-black/69 text-left flex-1 px-2 line-clamp-1">
              {log.action}
            </span>

            <span className="text-xs lg:text-sm text-black/69 shrink-0">
              {log.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
