"use client";

import React from "react";
import { FiCalendar, FiExternalLink } from "react-icons/fi";

export interface InterviewData {
  title?: string;
  date?: string;
  time?: string;
  liveUrl?: string;
  isRescheduled?: boolean;
  countdownTimer?: string;
}

interface UpcomingCardProps {
  interview?: InterviewData | null;
}

export const UpcomingCard: React.FC<UpcomingCardProps> = ({ interview }) => {
  const showEvents = interview !== null && interview !== undefined;

  const handleJoinNow = () => {
    if (interview?.liveUrl) {
      window.open(interview.liveUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="bg-white rounded-[22px] p-5 sm:p-6 shadow-lg border border-gray-100/80 flex flex-col justify-between h-full">
      <h3 className="text-[#1A1A1A] font-bold text-lg tracking-tight mb-4">
        Upcoming Events
      </h3>

      {!showEvents ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
          <div className="w-12 h-12 rounded-full bg-[#fdf2f5] text-[#8a1538] flex items-center justify-center mb-3 shrink-0">
            <FiCalendar className="w-6 h-6 stroke-[1.8]" />
          </div>
          <h4 className="text-sm lg:text-base font-bold text-[#1A1A1A] mb-1">
            No upcoming events
          </h4>
          <p className="text-[#757575] text-xs lg:text-[13px] font-normal max-w-50">
            Your scheduled events will appear here
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5 w-full">
          {/* Event 1: Interview/Event */}
          <div className="bg-[#F3F5F9] rounded-2xl p-4 flex items-stretch gap-3.5 w-full">
            {/* Inside Vertical Line Bar */}
            <span className="w-1.5 bg-[#FBAB2A] rounded-full shrink-0 my-0.5" />

            <div className="flex flex-col flex-1 w-full justify-between gap-2">
              {/* Top Row: Title + Optional Rescheduled Badge */}
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm sm:text-base font-bold text-[#1A1A1A] leading-tight">
                  {interview?.title || "Panel Interview"}
                </h4>
                {interview?.isRescheduled && (
                  <span className="bg-[#FEE2E2] text-[#DC2626] text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                    Rescheduled
                  </span>
                )}
              </div>

              {/* Bottom Row: Date/Time on Left, Join Now or Countdown Button on Right */}
              <div className="flex items-end justify-between w-full mt-0.5">
                <div className="flex flex-col">
                  <span className="text-[11px] font-medium text-[#757575]">
                    {interview?.date || "TBD"}
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-[#1A1A1A] mt-0.5">
                    {interview?.time || "TBD"}
                  </span>
                </div>

                {interview?.countdownTimer ? (
                  <div className="bg-[#FFF8EB] border border-[#FDE68A] text-[#FBAB2A] font-extrabold text-xs px-4 py-2 rounded-xl shrink-0 select-none">
                    {interview.countdownTimer}
                  </div>
                ) : interview?.liveUrl ? (
                  <button
                    type="button"
                    onClick={handleJoinNow}
                    className="bg-[#FBAB2A] hover:bg-[#E89B1F] active:scale-95 text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-2 rounded-xl transition-all shadow-xs cursor-pointer shrink-0 flex items-center gap-1.5"
                  >
                    Join Now
                    <FiExternalLink className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="bg-[#F3F4F6] text-[#6B7280] font-bold text-xs sm:text-sm px-4 sm:px-5 py-2 rounded-xl shrink-0 select-none">
                    Scheduled
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
