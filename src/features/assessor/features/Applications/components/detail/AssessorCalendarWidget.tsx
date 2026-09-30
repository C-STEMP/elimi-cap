"use client";

import React, { useMemo, useState } from "react";
import { useGetAssessorEvents } from "@/src/features/shared/assessor/hooks";
import { CalendarWidget } from "@/features/candidate/features/Dashboard/components/CalendarWidget";

interface AssessorCalendarWidgetProps {
  panelInterviewDate?: string | Date;
  highlightedDays?: number[];
  defaultDate?: Date;
  onSelectDate?: (date: Date) => void;
  className?: string;
}

export const AssessorCalendarWidget: React.FC<AssessorCalendarWidgetProps> = ({
  panelInterviewDate,
  defaultDate,
  onSelectDate,
  className = "",
}) => {
  const [today] = useState(() => new Date());
  const { data: eventsData } = useGetAssessorEvents();

  // Find the single most recent interview date
  const mostRecentInterviewDate = useMemo(() => {
    if (panelInterviewDate) return panelInterviewDate;
    if (!eventsData || !Array.isArray(eventsData) || eventsData.length === 0) {
      return defaultDate || undefined;
    }

    const interviewEvents = eventsData.filter((evt) => {
      const e = evt as unknown as Record<string, unknown>;
      const name = String(e.name || e.title || "").toLowerCase();
      const type = String(e.eventType || e.type || "").toLowerCase();
      const isInterview = type === "interview" || name.includes("interview");
      return isInterview && (e.eventAt || e.scheduledAt || e.createdAt || e.date);
    });

    const targetList = interviewEvents.length > 0 ? interviewEvents : eventsData;
    const dates = targetList
      .map((evt) => {
        const e = evt as unknown as Record<string, unknown>;
        const raw = e.eventAt || e.scheduledAt || e.createdAt || e.date;
        return typeof raw === "string" || raw instanceof Date ? new Date(raw) : null;
      })
      .filter((d): d is Date => d !== null && !isNaN(d.getTime()));

    if (dates.length === 0) return defaultDate || undefined;

    const baseTime = today.getTime();
    // Upcoming interview first (within 24h grace buffer)
    const upcoming = dates
      .filter((d) => d.getTime() >= baseTime - 24 * 60 * 60 * 1000)
      .sort((a, b) => a.getTime() - b.getTime())[0];
    if (upcoming) return upcoming;

    // Otherwise the latest scheduled interview in the past
    return dates.sort((a, b) => b.getTime() - a.getTime())[0];
  }, [panelInterviewDate, eventsData, defaultDate, today]);

  return (
    <CalendarWidget
      panelInterviewDate={mostRecentInterviewDate}
      onSelectDate={onSelectDate}
      className={className}
    />
  );
};
