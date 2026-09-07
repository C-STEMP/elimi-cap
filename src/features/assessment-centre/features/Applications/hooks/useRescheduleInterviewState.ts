"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/src/components/ui/toast";
import { useQueryClient } from "@tanstack/react-query";
import { scheduleInterviewApi } from "@/src/features/shared/applications/api/application.api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  currentDate?: string;
  currentTime?: string;
  currentMeetingLink?: string;
  currentLocation?: string;
  currentMode?: "physical" | "virtual";
  onSuccess: (data: {
    date: string;
    time: string;
    meetingLink?: string;
    location?: string;
    isRescheduled: boolean;
  }) => void;
}

export function useRescheduleInterviewState({
  isOpen,
  onClose,
  applicationId,
  currentDate = "",
  currentTime = "",
  currentMeetingLink = "www.meet.google.com",
  currentLocation = "Cstemp Centre",
  currentMode = "virtual",
  onSuccess,
}: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [meetingLink, setMeetingLink] = useState("www.meet.google.com");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (currentDate) {
        setDate(currentDate);
      } else {
        const d = new Date();
        d.setDate(d.getDate() + 7);
        setDate(d.toISOString().split("T")[0]);
      }
      setTime(currentTime || "12:00");
      setMeetingLink(currentMeetingLink || "www.meet.google.com");
    }
  }, [isOpen, currentDate, currentTime, currentMeetingLink]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      toast({
        type: "error",
        title: "Date Required",
        description: "Please specify the rescheduled interview date.",
      });
      return;
    }

    setIsSubmitting(true);

    let scheduledAtIso = new Date().toISOString();
    try {
      const timeStr = time || "12:00";
      const [h, m] = timeStr.split(":");
      const d = new Date(date);
      d.setHours(parseInt(h || "12", 10));
      d.setMinutes(parseInt(m || "0", 10));
      d.setSeconds(0);
      scheduledAtIso = d.toISOString();
    } catch {
      scheduledAtIso = new Date(`${date}T${time || "12:00"}:00`).toISOString();
    }

    const formattedMeetingLink =
      meetingLink.startsWith("http://") || meetingLink.startsWith("https://")
        ? meetingLink
        : `https://${meetingLink}`;

    if (typeof window !== "undefined" && applicationId) {
      try {
        const storedSchedule = localStorage.getItem(`elimi_interview_schedule_${applicationId}`);
        const parsed = storedSchedule ? JSON.parse(storedSchedule) : {};
        localStorage.setItem(
          `elimi_interview_schedule_${applicationId}`,
          JSON.stringify({
            ...parsed,
            scheduledAt: scheduledAtIso,
            mode: currentMode === "virtual" ? "online" : "physical",
            link: formattedMeetingLink,
            location: currentLocation || "Cstemp Centre",
            status: "scheduled",
            isRescheduled: true,
          }),
        );
      } catch (err) {
        console.warn("Storage error:", err);
      }
    }

    try {
      const isRealApp =
        applicationId && !applicationId.startsWith("mock") && !applicationId.startsWith("sample");

      if (isRealApp) {
        await scheduleInterviewApi(applicationId, {
          scheduledAt: scheduledAtIso,
          mode: currentMode === "virtual" ? "online" : "physical",
          location: currentMode === "physical" ? currentLocation : undefined,
          link: currentMode === "virtual" ? formattedMeetingLink : undefined,
        }).catch((err) => console.warn("Schedule interview API fallback:", err));
      }

      queryClient.invalidateQueries({
        queryKey: ["applications", "interview-schedule", applicationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["applications", applicationId],
      });
    } catch (err) {
      console.warn("Reschedule interview error:", err);
    } finally {
      setIsSubmitting(false);
      setIsSuccessOpen(true);
    }
  };

  const handleContinue = () => {
    setIsSuccessOpen(false);
    onSuccess({
      date,
      time,
      meetingLink,
      location: currentLocation,
      isRescheduled: true,
    });
    onClose();
  };

  return {
    date,
    setDate,
    time,
    setTime,
    meetingLink,
    setMeetingLink,
    isSubmitting,
    isSuccessOpen,
    handleSubmit,
    handleContinue,
  };
}
