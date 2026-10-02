"use client";

import React from "react";
import { FiCalendar } from "react-icons/fi";
import { Avatar } from "@/src/components/ui/avatar";
import { CalendarWidget } from "@/features/candidate/features/Dashboard/components/CalendarWidget";
import { StaffFacilitatorCard } from "@/src/features/shared/applications/components/StaffFacilitatorCard";
import type { NormalizedFacilitator } from "@/src/features/shared/applications/utils/facilitator";
import type { ApplicationDetail } from "@/src/features/shared/applications/api/types";

interface Props {
  activeFacilitator?: NormalizedFacilitator | {
    name?: string;
    avatar?: string | null;
    photoUrl?: string | null;
    trade?: string;
  } | null;
  appDetail?: ApplicationDetail | null;
}

export const EvidenceSidebarWidgets: React.FC<Props> = ({
  activeFacilitator,
  appDetail,
}) => {
  const scheduledInterview =
    (appDetail as { interviewSchedule?: { scheduledAt?: string } })?.interviewSchedule?.scheduledAt ||
    (appDetail as { interview?: { scheduledAt?: string } })?.interview?.scheduledAt ||
    undefined;

  const tradeTitle = activeFacilitator?.trade || (appDetail as { trade?: { name?: string } })?.trade?.name;

  return (
    <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6">
      {/* 1. Dark Calendar Widget */}
      <CalendarWidget panelInterviewDate={scheduledInterview} />

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
      <StaffFacilitatorCard
        facilitator={activeFacilitator as any}
        tradeName={tradeTitle}
      />
    </div>
  );
};
