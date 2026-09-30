"use client";

import React, { useState, useMemo } from "react";
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

export interface CalendarActivityItem {
  id?: string;
  title?: string;
  name?: string;
  date?: string | Date | null;
  eventAt?: string | Date | null;
  scheduledAt?: string | Date | null;
  occurredAt?: string | Date | null;
  createdAt?: string | Date | null;
  time?: string;
  eventType?: "interview" | "observation" | "assessment" | "other" | string;
  type?: string;
  status?: string;
  link?: string | null;
  location?: string | null;
  description?: string;
}

export interface CalendarWidgetProps {
  panelInterviewDate?: string | Date | null;
  events?: (CalendarActivityItem | Record<string, unknown>)[];
  onSelectDate?: (date: Date) => void;
  className?: string;
}

/**
 * Robustly parses various date formats (ISO string, YYYY-MM-DD, DD/MM/YYYY, Date, timestamp).
 */
export function parseCalendarDate(dateInput?: string | Date | number | null): Date | null {
  if (!dateInput) return null;
  if (dateInput instanceof Date) {
    return isNaN(dateInput.getTime()) ? null : dateInput;
  }
  if (typeof dateInput === "number") {
    const d = new Date(dateInput);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof dateInput === "string") {
    const trimmed = dateInput.trim();
    if (!trimmed) return null;

    // Check if ISO or standard date string
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      return d;
    }

    // Try custom formats: DD/MM/YYYY or DD-MM-YYYY
    const dmyMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
    if (dmyMatch) {
      const day = parseInt(dmyMatch[1], 10);
      const month = parseInt(dmyMatch[2], 10) - 1;
      const year = parseInt(dmyMatch[3], 10);
      const customDate = new Date(year, month, day);
      if (!isNaN(customDate.getTime())) return customDate;
    }

    // Try YYYY-MM-DD fallback
    const ymdMatch = trimmed.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
    if (ymdMatch) {
      const year = parseInt(ymdMatch[1], 10);
      const month = parseInt(ymdMatch[2], 10) - 1;
      const day = parseInt(ymdMatch[3], 10);
      const customDate = new Date(year, month, day);
      if (!isNaN(customDate.getTime())) return customDate;
    }
  }
  return null;
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  panelInterviewDate,
  events = [],
  onSelectDate,
  className = "",
}) => {
  const [today] = useState(() => new Date());

  // Parse directly passed panelInterviewDate
  const propInterviewDate = useMemo(() => {
    return parseCalendarDate(panelInterviewDate);
  }, [panelInterviewDate]);

  // Determine the ONE most recent scheduled interview date
  const singleInterviewDate = useMemo<Date | null>(() => {
    if (propInterviewDate) return propInterviewDate;

    if (!events || !Array.isArray(events) || events.length === 0) return null;

    // Extract all candidate dates from events
    const interviewDates: Date[] = [];
    const allActivityDates: Date[] = [];

    events.forEach((item) => {
      if (!item) return;
      const evt = item as Record<string, unknown>;
      const rawDate = (evt.date ||
        evt.eventAt ||
        evt.scheduledAt ||
        evt.occurredAt ||
        evt.createdAt) as string | Date | number | null | undefined;
      const parsed = parseCalendarDate(rawDate);
      if (!parsed) return;

      allActivityDates.push(parsed);

      const eventType = String(evt.eventType || evt.type || "").toLowerCase();
      const rawName = String(evt.title || evt.name || "").toLowerCase();
      if (
        eventType === "interview" ||
        rawName.includes("interview")
      ) {
        interviewDates.push(parsed);
      }
    });

    const targetPool = interviewDates.length > 0 ? interviewDates : allActivityDates;
    if (targetPool.length === 0) return null;

    const baseTime = today.getTime();
    // 1. Upcoming interview (within 24h grace or in the future), closest to now
    const upcoming = targetPool
      .filter((d) => d.getTime() >= baseTime - 24 * 60 * 60 * 1000)
      .sort((a, b) => a.getTime() - b.getTime())[0];
    if (upcoming) return upcoming;

    // 2. Otherwise the latest scheduled interview in the past
    return targetPool.sort((a, b) => b.getTime() - a.getTime())[0];
  }, [propInterviewDate, events, today]);

  // The primary date to display initially
  const initialViewDate = singleInterviewDate || today;

  const interviewKey = singleInterviewDate
    ? `${singleInterviewDate.getFullYear()}-${singleInterviewDate.getMonth()}-${singleInterviewDate.getDate()}`
    : "";

  // State: current month and year being displayed
  const [currentDate, setCurrentDate] = useState<Date>(() => initialViewDate);
  // State: currently selected day for user interaction
  const [selectedDay, setSelectedDay] = useState<number | null>(() => {
    return singleInterviewDate ? singleInterviewDate.getDate() : null;
  });
  const [prevInterviewKey, setPrevInterviewKey] = useState<string>(interviewKey);

  // Synchronize state during render when a new interviewKey arrives (React official pattern)
  if (interviewKey !== prevInterviewKey) {
    setPrevInterviewKey(interviewKey);
    if (singleInterviewDate) {
      setCurrentDate(
        new Date(singleInterviewDate.getFullYear(), singleInterviewDate.getMonth(), 1),
      );
      setSelectedDay(singleInterviewDate.getDate());
    }
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Day calculations for the active month grid
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
  const totalDays = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  const handleSelectDay = (day: number) => {
    setSelectedDay(day);
    const chosenDate = new Date(year, month, day);
    onSelectDate?.(chosenDate);
  };

  // Is the single interview date in this currently displayed month?
  const isInterviewInThisMonth =
    Boolean(singleInterviewDate) &&
    singleInterviewDate?.getFullYear() === year &&
    singleInterviewDate?.getMonth() === month;
  const interviewDayNum = isInterviewInThisMonth
    ? singleInterviewDate?.getDate()
    : null;

  const isTodayMonth =
    today.getFullYear() === year && today.getMonth() === month;
  const todayDayNum = isTodayMonth ? today.getDate() : null;

  // Build grid padding nulls + day numbers
  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= totalDays; d++) {
    calendarCells.push(d);
  }

  return (
    <div
      className={`bg-[#18181b] rounded-3xl p-5 sm:p-6 text-white shadow-md flex flex-col gap-4 select-none ${className}`}
    >
      {/* Month Navigation Header */}
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={handlePrevMonth}
          aria-label="Previous Month"
          className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-gray-400 hover:text-white"
        >
          <FiChevronLeft className="w-5 h-5" />
        </button>

        <span className="font-bold text-sm sm:text-base tracking-wide text-white">
          {MONTH_NAMES[month]} {year}
        </span>

        <button
          type="button"
          onClick={handleNextMonth}
          aria-label="Next Month"
          className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-gray-400 hover:text-white"
        >
          <FiChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Weekday Column Headers */}
      <div className="grid grid-cols-7 text-center text-[10px] font-bold text-gray-400">
        {DAYS_OF_WEEK.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      {/* Calendar Days Grid */}
      <div className="grid grid-cols-7 text-center gap-y-2 text-xs font-semibold text-gray-200">
        {calendarCells.map((dateNum, idx) => {
          if (dateNum === null) {
            return <div key={`empty-${idx}`} className="w-7 h-7 mx-auto" />;
          }

          const isInterview = dateNum === interviewDayNum;
          const isSelected = selectedDay === dateNum;
          const isToday = todayDayNum === dateNum;

          // Determine button style:
          // 1. Single scheduled interview date (yellow/gold highlight)
          // 2. User selected day (white ring/fill for checking other days)
          // 3. Today (subtle background)
          // 4. Default day
          let cellStyle = "text-gray-300 hover:bg-white/15";

          if (isInterview) {
            cellStyle = "bg-[#fbab2a] text-black font-extrabold shadow-sm scale-105";
          } else if (isSelected) {
            cellStyle = "border-2 border-white bg-white/20 text-white font-bold";
          } else if (isToday) {
            cellStyle = "bg-white/10 text-white font-medium hover:bg-white/20";
          }

          return (
            <button
              key={dateNum}
              type="button"
              onClick={() => handleSelectDay(dateNum)}
              aria-label={`Day ${dateNum}`}
              className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center transition-all cursor-pointer ${cellStyle}`}
            >
              {dateNum}
            </button>
          );
        })}
      </div>
    </div>
  );
};
