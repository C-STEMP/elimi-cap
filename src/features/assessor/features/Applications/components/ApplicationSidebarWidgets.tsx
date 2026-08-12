"use client";

import React from "react";
import { FiCalendar } from "react-icons/fi";

interface ApplicationSidebarWidgetsProps {
  isFacilitatorAssigned?: boolean;
  facilitatorName?: string;
  tradeName?: string;
}

export const ApplicationSidebarWidgets: React.FC<
  ApplicationSidebarWidgetsProps
> = ({
  isFacilitatorAssigned = false,
  facilitatorName = "Ngozi Eze",
  tradeName = "Carpentry",
}) => {
  return (
    <div className="flex flex-col gap-6 select-text">
      {/* Dark Calendar Card */}
      <div className="bg-[#1A1A1A] text-white rounded-3xl p-5 shadow-md flex flex-col gap-4">
        <div className="flex items-center justify-between font-bold text-sm">
          <span>&lt;</span>
          <span>July</span>
          <span>&gt;</span>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center text-xs text-gray-400 font-semibold">
          <span>SUN</span>
          <span>MON</span>
          <span>TUE</span>
          <span>WED</span>
          <span>THU</span>
          <span>FRI</span>
          <span>SAT</span>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center text-xs text-white font-medium">
          {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
            <span
              key={day}
              className={`py-1.5 rounded-lg ${
                day === 22 ? "bg-amber-500 text-white font-bold" : ""
              }`}
            >
              {day}
            </span>
          ))}
        </div>
      </div>

      {/* Upcoming Events Card */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center min-h-40">
        <div className="w-10 h-10 rounded-full bg-[#FDF2F4] text-[#a31d38] flex items-center justify-center mb-2">
          <FiCalendar className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-bold text-neutral-primary">
          No upcoming events
        </h4>
        <p className="text-xs text-neutral-secondary mt-0.5">
          Your scheduled events will appear here
        </p>
      </div>

      {/* Facilitator Card */}
      {!isFacilitatorAssigned ? (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col gap-2 text-left">
          <h4 className="text-sm font-bold text-neutral-primary">
            No facilitator assigned yet
          </h4>
          <p className="text-xs text-neutral-secondary leading-relaxed">
            A coordinator will be assigned to guide you once your first application is created.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3 text-left">
          <h4 className="text-sm font-bold text-neutral-primary">
            Facilitator
          </h4>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-rose-100 border border-rose-200 shrink-0 flex items-center justify-center font-bold text-rose-800 text-base">
              NE
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-bold text-neutral-primary">
                {facilitatorName}
              </span>
              <span className="text-xs text-gray-500">
                Facilitator · {tradeName} (Level 3)
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {tradeName}
                </span>
                <span className="bg-pink-100 text-pink-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  RPL Coordinator
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
