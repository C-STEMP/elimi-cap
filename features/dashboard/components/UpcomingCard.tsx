"use client";

import React from "react";
import { FiCalendar } from "react-icons/fi";

export interface InterviewData {
  title: string;
  date: string;
  time: string;
  liveUrl?: string;
}

interface UpcomingCardProps {
  interview?: InterviewData | null;
}

export const UpcomingCard: React.FC<UpcomingCardProps> = ({ interview }) => {
  const isScheduled = !!interview;

  return (
    <div className="bg-white rounded-[22px] p-5 sm:p-6 shadow-sm border border-gray-100/80 flex flex-col justify-between h-full min-h-55">
      <h3 className="text-[#1A1A1A] font-bold text-lg tracking-tight mb-4">
        Upcoming Events
      </h3>

      {!isScheduled ? (
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
        <div className="flex flex-col gap-3 w-full">
          {/* Event 1: Panel Interview */}
          <div className="bg-[#F3F5F9] rounded-[16px] p-4 flex items-stretch gap-3 w-full">
            {/* Inside Vertical Line Bar */}
            <span className="w-1.5 bg-[#FBAB2A] rounded-full shrink-0 my-0.5" />

            <div className="flex flex-col flex-1 w-full justify-between">
              {/* Full Width Top Line Title */}
              <h4 className="text-base sm:text-lg font-medium text-[#1A1A1A] leading-tight w-full mb-1">
                {interview.title || "Panel Interview"}
              </h4>

              {/* Bottom Row: Date/Time on Left, Join Now Button on Right */}
              <div className="flex items-end justify-between w-full mt-1">
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-[#757575]">
                    {interview.date || "22-07-2026"}
                  </span>
                  <span className="text-sm font-bold text-[#1A1A1A] mt-0.5">
                    {interview.time || "12:00PM"}
                  </span>
                </div>

                <button
                  type="button"
                  className="bg-[#FBAB2A] hover:bg-[#E89B1F] active:scale-95 text-white font-bold text-xs lg:text-sm px-4 lg:px-5 py-2 rounded-[12px] transition-all shadow-xs cursor-pointer shrink-0"
                >
                  Join Now
                </button>
              </div>
            </div>
          </div>

          {/* Event 2: Physical Demonstration */}
          <div className="bg-[#F3F5F9] rounded-[16px] p-4 flex items-stretch gap-3 w-full">
            {/* Inside Vertical Line Bar */}
            <span className="w-1.5 bg-primary rounded-full shrink-0 my-0.5" />

            <div className="flex flex-col flex-1 w-full">
              <h4 className="text-base sm:text-lg font-medium text-[#1A1A1A] leading-tight w-full mb-1">
                Physical Demonstration
              </h4>
              <span className="text-xs font-medium text-[#757575]">
                22-07-2026
              </span>
              <span className="text-sm font-bold text-[#1A1A1A] mt-0.5">
                12:00PM
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
