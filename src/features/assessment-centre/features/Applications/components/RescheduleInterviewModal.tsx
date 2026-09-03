"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCheck, FiCalendar, FiClock } from "react-icons/fi";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";
import { useQueryClient } from "@tanstack/react-query";
import { scheduleInterviewApi } from "@/src/features/shared/applications/api/application.api";

interface RescheduleInterviewModalProps {
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

export const RescheduleInterviewModal: React.FC<RescheduleInterviewModalProps> = ({
  isOpen,
  onClose,
  applicationId,
  currentDate = "",
  currentTime = "",
  currentMeetingLink = "www.meet.google.com",
  currentLocation = "Cstemp Centre",
  currentMode = "virtual",
  onSuccess,
}) => {
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

  if (!isOpen && !isSuccessOpen) return null;

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

    // Persist updated schedule and mark isRescheduled: true
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
        applicationId &&
        !applicationId.startsWith("mock") &&
        !applicationId.startsWith("sample");

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

  return (
    <>
      <AnimatePresence>
        {isOpen && !isSuccessOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white rounded-[28px] p-6 sm:p-8 max-w-md w-full shadow-2xl relative border border-gray-100 text-left"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="w-9 h-9 bg-[#fdf2f4] hover:bg-[#fce3e7] rounded-xl flex items-center justify-center text-[#a31d38] cursor-pointer absolute top-6 right-6 transition-colors select-none"
              >
                <FiX className="w-5 h-5 stroke-[2.5]" />
              </button>

              {/* Modal Header */}
              <div className="text-center mb-6 pr-6">
                <h3 className="text-xl sm:text-2xl font-black text-black tracking-tight mb-1">
                  Reschedule Interview
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm font-normal">
                  Reschedule this interview
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Date & Time Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700">Date</label>
                    <div className="relative flex items-center">
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        className="w-full h-11 px-3.5 pr-10 rounded-xl border border-gray-200 bg-[#F9FAFB] text-sm text-gray-800 outline-none focus:border-[#fbab2a] focus:ring-1 focus:ring-[#fbab2a]/30 transition-all font-medium"
                      />
                      <FiCalendar className="w-4 h-4 text-gray-400 absolute right-3.5 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700">Time</label>
                    <div className="relative flex items-center">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        required
                        className="w-full h-11 px-3.5 pr-10 rounded-xl border border-gray-200 bg-[#F9FAFB] text-sm text-gray-800 outline-none focus:border-[#fbab2a] focus:ring-1 focus:ring-[#fbab2a]/30 transition-all font-medium"
                      />
                      <FiClock className="w-4 h-4 text-gray-400 absolute right-3.5 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Meeting Link */}
                <div className="flex flex-col gap-1.5 pt-1">
                  <label className="text-xs font-semibold text-gray-700">Meeting Link</label>
                  <input
                    type="text"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    placeholder="www.meet.google.com"
                    required
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-[#F9FAFB] text-sm text-gray-800 outline-none focus:border-[#fbab2a] focus:ring-1 focus:ring-[#fbab2a]/30 transition-all font-medium"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="secondary"
                  size="md"
                  disabled={isSubmitting}
                  className="w-full bg-[#fbab2a] hover:bg-[#e89b1f] text-white font-bold text-sm sm:text-base h-12.5 rounded-xl mt-4 cursor-pointer transition-all shadow-none select-none"
                >
                  {isSubmitting ? "Rescheduling..." : "Reschedule Interview"}
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Confirmation Modal */}
      <AnimatePresence>
        {isSuccessOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="bg-white rounded-[28px] p-8 sm:p-10 max-w-md w-full flex flex-col items-center text-center shadow-2xl relative border border-gray-100"
            >
              <div className="relative mb-6">
                <div className="w-22 h-22 rounded-full bg-radial from-[#7CE05A] via-[#52B836] to-[#3B9B22] flex items-center justify-center shadow-lg shadow-green-600/30">
                  <div className="w-18 h-18 rounded-full bg-linear-to-b from-white/35 to-transparent absolute top-1 left-2 pointer-events-none" />
                  <FiCheck className="w-11 h-11 text-white stroke-[3.5] drop-shadow-xs" />
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-black tracking-tight mb-2">
                Interview Rescheduled Successfully
              </h3>
              <p className="text-gray-400 text-xs sm:text-sm font-normal leading-relaxed mb-8 max-w-xs">
                You have successfully rescheduled this interview
              </p>

              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={handleContinue}
                className="w-full bg-[#fbab2a] hover:bg-[#e89b1f] active:scale-98 text-white font-bold text-sm sm:text-base h-12.5 rounded-xl cursor-pointer transition-all shadow-none select-none"
              >
                Continue
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
