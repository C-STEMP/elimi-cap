"use client";

import React, { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const DAYS_OF_WEEK = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export interface CalendarWidgetProps {
  panelInterviewDate?: string | Date;
}

function parseInterviewDate(dateInput?: string | Date): Date {
  if (!dateInput) return new Date();
  if (dateInput instanceof Date) return dateInput;

  if (typeof dateInput === "string" && dateInput.includes("-")) {
    const parts = dateInput.split("-");
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        return new Date(
          parseInt(parts[0], 10),
          parseInt(parts[1], 10) - 1,
          parseInt(parts[2], 10),
        );
      } else {
        // DD-MM-YYYY
        return new Date(
          parseInt(parts[2], 10),
          parseInt(parts[1], 10) - 1,
          parseInt(parts[0], 10),
        );
      }
    }
  }

  const parsed = new Date(dateInput);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  panelInterviewDate,
}) => {
  const parsedInterviewDate = panelInterviewDate ? parseInterviewDate(panelInterviewDate) : null;
  const today = new Date();

  const [currentDate, setCurrentDate] = useState(() => parsedInterviewDate || today);
  const [selectedDate, setSelectedDate] = useState<number | null>(
    parsedInterviewDate ? parsedInterviewDate.getDate() : null,
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const isInterviewMonth =
    parsedInterviewDate &&
    parsedInterviewDate.getFullYear() === year &&
    parsedInterviewDate.getMonth() === month;
  const interviewDayNum = parsedInterviewDate?.getDate();

  // First day of month (0 = Sun, 1 = Mon, ...)
  const firstDayIndex = new Date(year, month, 1).getDay();
  // Total days in month
  const totalDays = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const isCurrentMonthToday =
    today.getFullYear() === year && today.getMonth() === month;

  // Build grid items (padding nulls + 1..totalDays)
  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= totalDays; d++) {
    calendarCells.push(d);
  }

  return (
    <div className="bg-[#1b1e26] rounded-[22px] p-5 text-white shadow-lg flex flex-col justify-between select-none min-h-75">
      {/* Month Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <button
          type="button"
          onClick={handlePrevMonth}
          aria-label="Previous Month"
          className="text-gray-400 hover:text-white transition-colors cursor-pointer p-1 rounded-md hover:bg-white/10"
        >
          <FiChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-bold text-sm text-white">
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          type="button"
          onClick={handleNextMonth}
          aria-label="Next Month"
          className="text-gray-400 hover:text-white transition-colors cursor-pointer p-1 rounded-md hover:bg-white/10"
        >
          <FiChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {DAYS_OF_WEEK.map((day) => (
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
        {calendarCells.map((dateNum, idx) => {
          if (dateNum === null) {
            return <div key={`empty-${idx}`} className="h-7 w-7" />;
          }

          const isInterviewDate =
            isInterviewMonth && interviewDayNum !== undefined && dateNum === interviewDayNum;
          const isToday = isCurrentMonthToday && dateNum === today.getDate();
          const isSelected =
            selectedDate === dateNum && !isInterviewDate && !isToday;

          return (
            <div
              key={dateNum}
              className="flex items-center justify-center h-7 w-7 mx-auto"
            >
              {isInterviewDate ? (
                <button
                  type="button"
                  onClick={() => setSelectedDate(dateNum)}
                  title="Panel Interview Date"
                  className="w-6.5 h-6.5 rounded-full border-2 border-[#fbab2a] text-white font-bold text-xs flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                >
                  {dateNum}
                </button>
              ) : isToday ? (
                <button
                  type="button"
                  onClick={() => setSelectedDate(dateNum)}
                  className="w-6 h-6 rounded-full bg-white/10 text-white font-medium text-xs flex items-center justify-center shadow-xs cursor-pointer hover:scale-105 transition-transform"
                >
                  {dateNum}
                </button>
              ) : isSelected ? (
                <button
                  type="button"
                  onClick={() => setSelectedDate(dateNum)}
                  className="w-6 h-6 rounded-full bg-[#e11d48] text-white font-bold text-xs flex items-center justify-center shadow-xs cursor-pointer hover:scale-105 transition-transform"
                >
                  {dateNum}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setSelectedDate(dateNum)}
                  className="text-xs font-medium text-gray-300 hover:text-white hover:bg-white/10 w-6 h-6 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                >
                  {dateNum}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
