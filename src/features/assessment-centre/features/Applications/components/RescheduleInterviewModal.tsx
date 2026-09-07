"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCheck } from "react-icons/fi";
import { Button } from "@/src/components/ui/button";
import { useRescheduleInterviewState } from "../hooks/useRescheduleInterviewState";

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

export const RescheduleInterviewModal: React.FC<RescheduleInterviewModalProps> = (props) => {
  const { isOpen, onClose, currentMode = "virtual" } = props;
  const s = useRescheduleInterviewState(props);

  if (!isOpen && !s.isSuccessOpen) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && !s.isSuccessOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white rounded-[28px] p-6 sm:p-8 max-w-md w-full shadow-2xl relative border border-gray-100 text-left"
            >
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="w-9 h-9 bg-[#fdf2f4] hover:bg-[#fce3e7] rounded-xl flex items-center justify-center text-[#a31d38] cursor-pointer absolute top-6 right-6 transition-colors select-none"
              >
                <FiX className="w-5 h-5 stroke-[2.5]" />
              </button>

              <div className="text-center mb-6 pr-6">
                <h3 className="text-xl sm:text-2xl font-black text-black tracking-tight mb-1">
                  Reschedule Interview
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm font-normal">
                  Reschedule this interview
                </p>
              </div>

              <form onSubmit={s.handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700">Date</label>
                    <input
                      type="date"
                      value={s.date}
                      onChange={(e) => s.setDate(e.target.value)}
                      required
                      className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-[#F9FAFB] text-sm text-gray-800 outline-none focus:border-[#fbab2a] focus:ring-1 focus:ring-[#fbab2a]/30 transition-all font-medium cursor-pointer"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700">Time</label>
                    <input
                      type="time"
                      value={s.time}
                      onChange={(e) => s.setTime(e.target.value)}
                      required
                      className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-[#F9FAFB] text-sm text-gray-800 outline-none focus:border-[#fbab2a] focus:ring-1 focus:ring-[#fbab2a]/30 transition-all font-medium cursor-pointer"
                    />
                  </div>
                </div>

                {currentMode === "virtual" && (
                  <div className="flex flex-col gap-1.5 pt-1">
                    <label className="text-xs font-semibold text-gray-700">Meeting Link</label>
                    <input
                      type="text"
                      value={s.meetingLink}
                      onChange={(e) => s.setMeetingLink(e.target.value)}
                      placeholder="www.meet.google.com"
                      required
                      className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-[#F9FAFB] text-sm text-gray-800 outline-none focus:border-[#fbab2a] focus:ring-1 focus:ring-[#fbab2a]/30 transition-all font-medium"
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  variant="secondary"
                  size="md"
                  disabled={s.isSubmitting}
                  className="w-full bg-[#fbab2a] hover:bg-[#e89b1f] text-white font-bold text-sm sm:text-base h-12.5 rounded-xl mt-4 cursor-pointer transition-all shadow-none select-none"
                >
                  {s.isSubmitting ? "Rescheduling Interview..." : "Reschedule Interview"}
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {s.isSuccessOpen && (
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
                You have successfully rescheduled an interview for this candidate
              </p>

              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={s.handleContinue}
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
