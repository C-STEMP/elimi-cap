"use client";

import React, { useState } from "react";
import { FiChevronLeft, FiChevronRight, FiCalendar } from "react-icons/fi";
import { Avatar } from "@/src/components/ui/avatar";

interface Props {
  activeFacilitator: any;
  appDetail: any;
}

export const EvidenceSidebarWidgets: React.FC<Props> = ({
  activeFacilitator,
  appDetail,
}) => {
  const [currentMonth, setCurrentMonth] = useState("July");
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  const handlePrevMonth = () => {
    const idx = months.indexOf(currentMonth);
    setCurrentMonth(months[(idx - 1 + 12) % 12]);
  };

  const handleNextMonth = () => {
    const idx = months.indexOf(currentMonth);
    setCurrentMonth(months[(idx + 1) % 12]);
  };

  return (
    <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6">
      {/* 1. Dark Calendar Widget */}
      <div className="bg-[#18181b] text-white rounded-3xl p-5 sm:p-6 shadow-md flex flex-col gap-4 select-none">
        <div className="flex items-center justify-between text-white px-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            aria-label="Previous Month"
          >
            <FiChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-sm sm:text-base tracking-wide">{currentMonth}</span>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            aria-label="Next Month"
          >
            <FiChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 text-center text-[10px] font-bold text-gray-400">
          {daysOfWeek.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 text-center gap-y-2 text-xs font-semibold text-gray-200">
          {daysInMonth.map((day) => (
            <span key={day} className="p-1 rounded-full hover:bg-white/15 cursor-pointer transition-colors">
              {day}
            </span>
          ))}
        </div>
      </div>

      {/* 2. Upcoming Events Card */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs flex flex-col items-center justify-center text-center gap-3 py-8">
        <h3 className="text-base font-extrabold text-black self-start tracking-tight mb-2">
          Upcoming Events
        </h3>
        <div className="w-12 h-12 rounded-full bg-[#fde8ec] text-[#b3261e] flex items-center justify-center">
          <FiCalendar className="w-6 h-6 stroke-[2]" />
        </div>
        <div className="flex flex-col gap-1 mt-1">
          <span className="text-xs sm:text-sm font-bold text-black">No upcoming events</span>
          <span className="text-xs text-gray-400 font-normal">Your scheduled events will appear here</span>
        </div>
      </div>

      {/* 3. Facilitator Card */}
      {activeFacilitator ? (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs flex flex-col gap-4">
          <h3 className="text-sm sm:text-base font-extrabold text-black tracking-tight">Facilitator</h3>
          <div className="flex items-center gap-3 bg-[#F8F9FA] rounded-2xl p-3 border border-gray-100">
            <Avatar
              src={activeFacilitator.avatar}
              name={activeFacilitator.name}
              className="w-12 h-12 border border-gray-200 shrink-0"
              alt={activeFacilitator.name}
            />
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-xs sm:text-sm font-extrabold text-black truncate">
                {activeFacilitator.name || "Assigned Facilitator"}
              </span>
              <span className="text-[10px] sm:text-xs text-gray-500 font-medium truncate">
                Facilitator · {activeFacilitator.trade || (appDetail as any)?.trade?.name || "RPL"} (Level 3)
              </span>
              <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                <span className="bg-[#FCE8EB] text-[#A31D38] text-[9px] font-bold px-2 py-0.5 rounded-full">
                  {activeFacilitator.trade || (appDetail as any)?.trade?.name || "RPL"}
                </span>
                <span className="bg-[#FCE8EB] text-[#A31D38] text-[9px] font-bold px-2 py-0.5 rounded-full">
                  RPL Coordinator
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs flex flex-col gap-2">
          <h3 className="text-sm sm:text-base font-extrabold text-black tracking-tight">Facilitator</h3>
          <p className="text-xs text-gray-400 font-normal leading-relaxed">
            No facilitator assigned to this candidate yet.
          </p>
        </div>
      )}
    </div>
  );
};
