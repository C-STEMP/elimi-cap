"use client";

import React, { useMemo } from "react";
import {
  UpcomingCard,
  InterviewData,
} from "@/features/candidate/features/Dashboard/components/UpcomingCard";
import { useGetAssessorEvents } from "@/src/features/shared/assessor/hooks";

export interface AssessorUpcomingEvent {
  title?: string;
  time?: string;
  date?: string;
  address?: string;
  location?: string;
  mode?: string;
  liveUrl?: string;
  isRescheduled?: boolean;
}

interface AssessorUpcomingEventsWidgetProps {
  event?: AssessorUpcomingEvent | null;
}

export const AssessorUpcomingEventsWidget: React.FC<
  AssessorUpcomingEventsWidgetProps
> = ({ event: propEvent }) => {
  const { data: eventsData } = useGetAssessorEvents();

  const interview: InterviewData | null = useMemo(() => {
    if (propEvent !== undefined) {
      if (!propEvent) return null;
      return {
        title: propEvent.title || "Panel Interview",
        time: propEvent.time,
        date: propEvent.date,
        location: propEvent.location || propEvent.address || "Cstemp Centre",
        mode: propEvent.mode,
        liveUrl: propEvent.liveUrl,
        isRescheduled: propEvent.isRescheduled,
      };
    }
    if (eventsData && eventsData.length > 0) {
      const first = eventsData[0];
      return {
        title: first.action
          ? first.action.replace(/_/g, " ")
          : first.stageKey
            ? first.stageKey.replace(/_/g, " ")
            : "Scheduled Event",
        time: first.createdAt
          ? new Date(first.createdAt).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })
          : "—",
        date: first.createdAt
          ? new Date(first.createdAt).toLocaleDateString("en-GB")
          : "—",
        location: "Cstemp Centre",
      };
    }
    return null;
  }, [propEvent, eventsData]);

  return <UpcomingCard interview={interview} />;
};
