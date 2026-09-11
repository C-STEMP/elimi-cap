"use client";

import React from "react";
import { CalendarWidget } from "@/features/candidate/features/Dashboard/components/CalendarWidget";
import {
  UpcomingCard,
  FormToSignItem,
} from "@/features/candidate/features/Dashboard/components/UpcomingCard";
import {
  FacilitatorCard,
  FacilitatorData,
} from "@/features/candidate/features/Dashboard/components/FacilitatorCard";

interface InterviewScheduleInfo {
  scheduledAt?: string;
  mode?: "physical" | "online" | string;
  location?: string;
  link?: string;
  isRescheduled?: boolean;
}

interface ApplicationDetailsSidebarProps {
  activeInterviewSchedule?: InterviewScheduleInfo | null;
  isInterviewScheduled: boolean;
  isAtInterviewStage: boolean;
  facilitatorData: FacilitatorData | null;
  onRequestCall: () => void;
  formsToSign?: FormToSignItem[];
  onOpenForm?: (formId: string) => void;
}

export const ApplicationDetailsSidebar: React.FC<ApplicationDetailsSidebarProps> = ({
  activeInterviewSchedule,
  isInterviewScheduled,
  isAtInterviewStage,
  facilitatorData,
  onRequestCall,
  formsToSign,
  onOpenForm,
}) => {
  const upcomingInterview =
    isInterviewScheduled && activeInterviewSchedule?.scheduledAt
      ? {
          title: "Panel Interview",
          date: new Date(activeInterviewSchedule.scheduledAt).toLocaleDateString("en-GB"),
          time: new Date(activeInterviewSchedule.scheduledAt).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          mode: activeInterviewSchedule.mode,
          liveUrl:
            activeInterviewSchedule.mode === "online" || activeInterviewSchedule.mode === "virtual"
              ? activeInterviewSchedule.link
              : undefined,
          location: activeInterviewSchedule.location || "Cstemp Centre",
          isRescheduled: Boolean(activeInterviewSchedule.isRescheduled),
        }
      : null;

  return (
    <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6">
      <CalendarWidget
        panelInterviewDate={activeInterviewSchedule?.scheduledAt || undefined}
      />
      <UpcomingCard
        interview={upcomingInterview}
        forms={isAtInterviewStage ? formsToSign : undefined}
        onOpenForm={onOpenForm}
      />
      {!isAtInterviewStage && (
        <FacilitatorCard
          facilitator={facilitatorData}
          onRequestCall={onRequestCall}
        />
      )}
    </div>
  );
};
