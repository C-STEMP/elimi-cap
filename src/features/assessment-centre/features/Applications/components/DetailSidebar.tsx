"use client";

import React from "react";
import { Avatar } from "@/src/components/ui/avatar";
import { UpcomingCard } from "@/features/candidate/features/Dashboard/components/UpcomingCard";
import { CalendarWidget } from "@/features/candidate/features/Dashboard/components/CalendarWidget";

interface DetailSidebarProps {
  currentMonth?: string;
  daysOfWeek?: string[];
  daysInMonth?: number[];
  handlePrevMonth?: () => void;
  handleNextMonth?: () => void;
  isInterviewScheduled: boolean;
  activeInterviewSchedule?: {
    scheduledAt?: string;
    mode?: "physical" | "online" | string;
    link?: string;
    location?: string;
  } | null;
  interviewEventDateFormatted: string;
  interviewTimeFormatted: string;
  isRescheduled: boolean;
  isAtInterviewStage: boolean;
  activeFacilitator?: {
    name?: string;
    avatar?: string;
    photo?: { url?: string };
    photoUrl?: string;
    trade?: string;
  } | null;
  tradeName: string;
}

export const DetailSidebar: React.FC<DetailSidebarProps> = ({
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
      <CalendarWidget
        panelInterviewDate={
          isInterviewScheduled && activeInterviewSchedule?.scheduledAt
            ? activeInterviewSchedule.scheduledAt
            : undefined
        }
      />

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
                location: activeInterviewSchedule.location || "",
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
