"use client";

import React, { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

interface AssessorCalendarWidgetProps {
  highlightedDays?: number[];
}

export const AssessorCalendarWidget: React.FC<AssessorCalendarWidgetProps> = ({
  highlightedDays = [10, 13],
}) => {
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 6, 1)); // Default July 2026

  const monthName = MONTH_NAMES[currentDate.getMonth()];
  const year = currentDate.getFullYear();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Days in month calculation
  const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();
  const firstDayIndex = new Date(year, currentDate.getMonth(), 1).getDay(); // 0 is Sunday

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayIndex }, (_, i) => i);

  return (
    <div className="bg-[#1E1E1E] text-white rounded-3xl p-6 shadow-md flex flex-col gap-5 w-full select-none">
      {/* Month Navigation */}
      <div className="flex items-center justify-between font-bold text-base">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-1 text-gray-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Previous Month"
        >
          <FiChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-base font-semibold">{monthName}</span>
        <button
          type="button"
          onClick={handleNextMonth}
          className="p-1 text-gray-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Next Month"
        >
          <FiChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-gray-400 font-semibold tracking-wider">
        <span>SUN</span>
        <span>MON</span>
        <span>TUE</span>
        <span>WED</span>
        <span>THU</span>
        <span>FRI</span>
        <span>SAT</span>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-normal">
        {blanks.map((b) => (
          <span key={`blank-${b}`} className="py-2" />
        ))}
        {days.map((day) => {
          const isHighlighted = highlightedDays.includes(day);
          return (
            <div
              key={day}
              className="py-1 flex items-center justify-center"
            >
              <span
                className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors cursor-pointer text-xs ${
                  isHighlighted
                    ? "border-2 border-[#FBAB2A] text-white font-extrabold"
                    : "text-gray-200 hover:bg-white/10"
                }`}
              >
                {day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
