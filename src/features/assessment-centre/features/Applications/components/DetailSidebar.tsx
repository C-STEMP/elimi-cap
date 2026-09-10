"use client";

import React from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Avatar } from "@/src/components/ui/avatar";
import { UpcomingCard } from "@/features/candidate/features/Dashboard/components/UpcomingCard";

interface DetailSidebarProps {
  currentMonth: string;
  daysOfWeek: string[];
  daysInMonth: number[];
  handlePrevMonth: () => void;
  handleNextMonth: () => void;
  isInterviewScheduled: boolean;
  activeInterviewSchedule: any;
  interviewEventDateFormatted: string;
  interviewTimeFormatted: string;
  isRescheduled: boolean;
  isAtInterviewStage: boolean;
  activeFacilitator: any;
  tradeName: string;
}

export const DetailSidebar: React.FC<DetailSidebarProps> = ({
  currentMonth,
  daysOfWeek,
  daysInMonth,
  handlePrevMonth,
  handleNextMonth,
  isInterviewScheduled,
  activeInterviewSchedule,
  interviewEventDateFormatted,
  interviewTimeFormatted,
  isRescheduled,
  isAtInterviewStage,
  activeFacilitator,
  tradeName,
}) => {
  return (
    <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6">
      {/* Calendar */}
      <div className="bg-[#18181b] text-white rounded-3xl p-5 sm:p-6 shadow-md flex flex-col gap-4 select-none">
        <div className="flex items-center justify-between text-white px-1">
          <button type="button" onClick={handlePrevMonth} className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
            <FiChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-sm sm:text-base tracking-wide">{currentMonth}</span>
          <button type="button" onClick={handleNextMonth} className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
            <FiChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 text-center text-[10px] font-bold text-gray-400">
          {daysOfWeek.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 text-center gap-y-2 text-xs font-semibold text-gray-200">
          {daysInMonth.map((day) => {
            const targetDayNumber = activeInterviewSchedule?.scheduledAt
              ? new Date(activeInterviewSchedule.scheduledAt).getDate()
              : null;
            const isCircled = isInterviewScheduled && targetDayNumber !== null && day === targetDayNumber;

            return (
              <span
                key={day}
                className={`w-6.5 h-6.5 mx-auto rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                  isCircled ? "border-2 border-[#fbab2a] text-white font-bold" : "hover:bg-white/15 text-gray-300"
                }`}
              >
                {day}
              </span>
            );
          })}
        </div>
      </div>

      {/* Upcoming interview card */}
      <UpcomingCard
        interview={
          isInterviewScheduled && activeInterviewSchedule?.scheduledAt
            ? {
                title: "Panel Interview",
                date: interviewEventDateFormatted,
                time: interviewTimeFormatted,
                mode: activeInterviewSchedule.mode,
                liveUrl: activeInterviewSchedule.link,
                location: activeInterviewSchedule.location || "Cstemp Centre",
                isRescheduled,
              }
            : null
        }
      />

      {/* Facilitator Card */}
      {!isAtInterviewStage && (
        activeFacilitator ? (
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs flex flex-col gap-4 select-text">
            <h3 className="text-base font-extrabold text-black tracking-tight">Facilitator</h3>
            <div className="flex items-center gap-3.5">
              <Avatar
                src={activeFacilitator.photo?.url || activeFacilitator.photoUrl || activeFacilitator.avatar}
                name={activeFacilitator.name}
                className="w-13 h-13 border border-gray-200 shrink-0"
                alt={activeFacilitator.name}
              />
              <div className="flex flex-col gap-0.5 min-w-0">
                <h4 className="text-sm font-bold text-black truncate">{activeFacilitator.name}</h4>
                <p className="text-[11px] text-gray-500 font-normal truncate">
                  Facilitator · {activeFacilitator.trade || tradeName} (Level 3)
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs flex flex-col gap-2 select-text">
            <h3 className="text-base font-extrabold text-black tracking-tight">No facilitator assigned yet</h3>
            <p className="text-xs text-gray-400 font-normal leading-relaxed">
              A coordinator will be assigned to guide you once your first application is created.
            </p>
          </div>
        )
      )}
    </div>
  );
};
