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
  const [mode, setMode] = useState<"physical" | "virtual">(currentMode);
  const [location, setLocation] = useState("");
  const [useCentreAddress, setUseCentreAddress] = useState(true);
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
      setMode(currentMode);
      setLocation(currentLocation || "");
      // Default to the centre address when no explicit location was provided.
      setUseCentreAddress(!currentLocation);
    }
  }, [isOpen, currentDate, currentTime, currentMeetingLink, currentMode, currentLocation]);

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

    if (mode === "virtual" && !meetingLink.trim()) {
      toast({
        type: "error",
        title: "Meeting Link Required",
        description: "Please provide a meeting link for the online interview.",
      });
      return;
    }

    if (mode === "physical" && !useCentreAddress && !location.trim()) {
      toast({
        type: "error",
        title: "Location Required",
        description:
          "Please provide the interview location or use the centre address.",
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

    const apiMode = mode === "virtual" ? "online" : "physical";
    const resolvedLocation =
      mode === "physical"
        ? useCentreAddress
          ? undefined
          : location.trim()
        : undefined;

    if (typeof window !== "undefined" && applicationId) {
      try {
        const storedSchedule = localStorage.getItem(`elimi_interview_schedule_${applicationId}`);
        const parsed = storedSchedule ? JSON.parse(storedSchedule) : {};
        localStorage.setItem(
          `elimi_interview_schedule_${applicationId}`,
          JSON.stringify({
            ...parsed,
            scheduledAt: scheduledAtIso,
            mode: apiMode,
            link: mode === "virtual" ? formattedMeetingLink : undefined,
            location: resolvedLocation || (useCentreAddress ? "Centre Address" : ""),
            useCentreAddress: mode === "physical" ? useCentreAddress : undefined,
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
          mode: apiMode,
          location: resolvedLocation,
          useCentreAddress: mode === "physical" ? useCentreAddress : undefined,
          link: mode === "virtual" ? formattedMeetingLink : undefined,
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
      meetingLink: mode === "virtual" ? meetingLink : undefined,
      location:
        mode === "physical"
          ? useCentreAddress
            ? currentLocation
            : location
          : undefined,
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
    mode,
    setMode,
    location,
    setLocation,
    useCentreAddress,
    setUseCentreAddress,
    isSubmitting,
    isSuccessOpen,
    handleSubmit,
    handleContinue,
  };
}
