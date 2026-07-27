"use client";

import React from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export const CalendarWidget: React.FC = () => {
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  // July 2026 dates layout (July 1st 2026 is Wednesday, so 3 empty slots)
  const calendarDays = [
    null,
    null,
    null,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
    25,
    26,
    27,
    28,
    29,
    30,
    31,
  ];

  return (
    <div className="bg-[#1b1e26] rounded-[22px] p-5 text-white shadow-sm flex flex-col justify-between select-none h-75">
      {/* Month Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <button
          type="button"
          aria-label="Previous Month"
          className="text-gray-400 hover:text-white transition-colors cursor-pointer p-1"
        >
          <FiChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-bold text-sm text-white">July</span>
        <button
          type="button"
          aria-label="Next Month"
          className="text-gray-400 hover:text-white transition-colors cursor-pointer p-1"
        >
          <FiChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {daysOfWeek.map((day) => (
          <span
            key={day}
            className="text-[9px] xl:text-[10px] font-semibold text-gray-400 tracking-wider"
          >
            {day}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center items-center">
        {calendarDays.map((dateNum, idx) => {
          if (dateNum === null) {
            return <div key={`empty-${idx}`} className="h-7 w-7" />;
          }

          const isAmberHighlight = dateNum === 10;
          const isRedHighlight = dateNum === 13;

          return (
            <div
              key={dateNum}
              className="flex items-center justify-center h-7 w-7 mx-auto"
            >
              {isAmberHighlight ? (
                <div className="w-6 h-6 rounded-full bg-[#fbab2a] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {dateNum}
                </div>
              ) : isRedHighlight ? (
                <div className="w-6 h-6 rounded-full bg-[#e11d48] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {dateNum}
                </div>
              ) : (
                <span className="text-xs font-medium text-gray-300 hover:text-white transition-colors cursor-pointer">
                  {dateNum}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
