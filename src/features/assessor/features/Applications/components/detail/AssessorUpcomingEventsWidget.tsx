"use client";

import React, { useMemo } from "react";
import {
  UpcomingCard,
  InterviewData,
} from "@/features/candidate/features/Dashboard/components/UpcomingCard";
import { useGetAssessorEvents } from "@/src/features/shared/assessor/hooks";
import { useGetInterviewSchedule } from "@/src/features/shared/applications/hooks";

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
  applicationId?: string;
}

export const AssessorUpcomingEventsWidget: React.FC<
  AssessorUpcomingEventsWidgetProps
> = ({ event: propEvent, applicationId }) => {
  const { data: eventsData } = useGetAssessorEvents();
  const { data: interviewSchedule } = useGetInterviewSchedule(
    applicationId || "",
    {
      enabled: Boolean(applicationId),
    },
  );

  const interview: InterviewData | null = useMemo(() => {
    if (propEvent !== undefined) {
      if (!propEvent) return null;
      const hasValidDate =
        Boolean(propEvent.date) &&
        propEvent.date !== "—" &&
        propEvent.date?.trim() !== "";
      const hasValidTime =
        Boolean(propEvent.time) &&
        propEvent.time !== "—" &&
        propEvent.time?.trim() !== "";

      if (!hasValidDate || !hasValidTime) return null;

      return {
        title: propEvent.title || "Panel Interview",
        time: propEvent.time,
        date: propEvent.date,
        location: propEvent.location || propEvent.address || "",
        mode: propEvent.mode,
        liveUrl: propEvent.liveUrl,
        isRescheduled: propEvent.isRescheduled,
      };
    }

    // Check application's interview schedule if applicationId is provided
    if (
      interviewSchedule?.scheduledAt &&
      interviewSchedule.status === "scheduled"
    ) {
      const schDate = new Date(interviewSchedule.scheduledAt);
      if (!isNaN(schDate.getTime()) && schDate.getTime() >= Date.now()) {
        return {
          title: "Panel Interview",
          time: schDate.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          date: schDate.toLocaleDateString("en-GB"),
          location: interviewSchedule.location || "",
          mode: interviewSchedule.mode,
          liveUrl:
            interviewSchedule.mode === "online"
              ? interviewSchedule.link
              : undefined,
        };
      }
    }

    // Filter eventsData for upcoming events (must be in the future)
    if (eventsData && eventsData.length > 0) {
      const now = Date.now();
      const upcomingEvents = eventsData
        .filter((e) => {
          if (
            applicationId &&
            e.applicationId &&
            e.applicationId !== applicationId
          ) {
            return false;
          }
          const rawDate =
            e.eventAt || (e as any).scheduledAt || (e as any).createdAt;
          if (!rawDate) return false;
          const d = new Date(rawDate);
          return !isNaN(d.getTime()) && d.getTime() >= now;
        })
        .sort((a, b) => {
          const da = new Date(
            a.eventAt || (a as any).scheduledAt || (a as any).createdAt,
          ).getTime();
          const db = new Date(
            b.eventAt || (b as any).scheduledAt || (b as any).createdAt,
          ).getTime();
          return da - db;
        });

      if (upcomingEvents.length > 0) {
        const first = upcomingEvents[0];
        const eventDate = new Date(
          first.eventAt ||
            (first as any).scheduledAt ||
            (first as any).createdAt,
        );
        return {
          title: first.name || (first as any).title || "Panel Interview",
          time: eventDate.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          date: eventDate.toLocaleDateString("en-GB"),
          location: first.location || "",
          mode: (first as any).mode || (first.link ? "online" : "physical"),
          liveUrl: first.link || undefined,
        };
      }
    }

    return null;
  }, [propEvent, eventsData, interviewSchedule, applicationId]);

  return <UpcomingCard interview={interview} />;
};
