"use client";

import React from "react";
import { UpcomingCard } from "@/features/candidate/features/Dashboard/components/UpcomingCard";
import { CalendarWidget } from "@/features/candidate/features/Dashboard/components/CalendarWidget";
import { StaffFacilitatorCard } from "@/src/features/shared/applications/components/StaffFacilitatorCard";
import type { NormalizedFacilitator } from "@/src/features/shared/applications/utils/facilitator";

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
  activeFacilitator?: NormalizedFacilitator | {
    name?: string;
    avatar?: string | null;
    photo?: { url?: string | null };
    photoUrl?: string | null;
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
        <StaffFacilitatorCard
          facilitator={activeFacilitator as any}
          tradeName={tradeName}
        />
      )}
    </div>
  );
};
