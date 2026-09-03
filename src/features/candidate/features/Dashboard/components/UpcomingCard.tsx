"use client";

import React from "react";
import { FiCalendar } from "react-icons/fi";

export interface InterviewData {
  title?: string;
  date?: string;
  time?: string;
  mode?: "online" | "physical" | "virtual" | string;
  liveUrl?: string;
  location?: string;
  isRescheduled?: boolean;
  countdownTimer?: string;
}

interface UpcomingCardProps {
  interview?: InterviewData | null;
  className?: string;
}

export const UpcomingCard: React.FC<UpcomingCardProps> = ({
  interview,
  className = "",
}) => {
  const showEvents = Boolean(interview && (interview.date || interview.time));
  const isOnline =
    interview?.mode === "online" ||
    interview?.mode === "virtual" ||
    Boolean(interview?.liveUrl && !interview?.location);

  return (
    <div
      className={`bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs flex flex-col items-center justify-center text-center gap-3 py-6 w-full ${className}`}
    >
      <h3 className="text-base font-extrabold text-black self-start tracking-tight mb-1">
        Upcoming Events
      </h3>

      {showEvents && interview ? (
        <div className="w-full bg-[#F9FAFB] rounded-xl p-4 border border-gray-100 text-left border-l-4 border-l-[#A31D38] flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-bold text-gray-900">
              {interview.title || "Panel Interview"}
            </h4>
            {interview.isRescheduled && (
              <span className="bg-[#FCE8EB] text-[#A31D38] text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0">
                Rescheduled
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                TIME
              </span>
              <span className="text-xs font-bold text-gray-900 mt-0.5">
                {interview.time || "12:00PM"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                DATE
              </span>
              <span className="text-xs font-bold text-gray-900 mt-0.5">
                {interview.date || "22/03/2026"}
              </span>
            </div>
          </div>

          <div className="flex flex-col pt-0.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              {isOnline ? "Meeting Link" : "Address"}
            </span>
            {isOnline && interview.liveUrl ? (
              <a
                href={interview.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-primary hover:underline truncate mt-0.5"
              >
                {interview.liveUrl}
              </a>
            ) : (
              <span className="text-xs font-bold text-gray-900 mt-0.5 truncate">
                {interview.location || "Cstemp Centre"}
              </span>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="w-12 h-12 rounded-full bg-[#fde8ec] text-[#a31d38] flex items-center justify-center mt-2">
            <FiCalendar className="w-6 h-6 stroke-2" />
          </div>

          <div className="flex flex-col gap-1 mt-1">
            <span className="text-xs sm:text-sm font-bold text-black">
              No upcoming events
            </span>
            <span className="text-xs text-gray-400 font-normal">
              Your scheduled events will appear here
            </span>
          </div>
        </>
      )}
    </div>
  );
};
