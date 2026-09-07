"use client";

import React from "react";
import { FiMapPin, FiVideo } from "react-icons/fi";
import { type InterviewRowData } from "./ViewInterviewDetailModal";

interface Props {
  interview: InterviewRowData;
  interviewDetail: any;
  centreProfile: any;
}

export const SittingMetadataCard: React.FC<Props> = ({
  interview,
  interviewDetail,
  centreProfile,
}) => {
  const isOnline =
    (interviewDetail?.mode || interview.mode).toLowerCase() === "online";

  const sched = interviewDetail?.scheduledAt || interview.scheduledAt;
  const dateFormatted = sched
    ? (() => {
        const d = new Date(sched);
        return `${d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })} - ${d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
      })()
    : "—";

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-2xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Title</span>
          <span className="text-sm sm:text-base font-bold text-gray-950">
            {interviewDetail?.name || interview.title || "Interview Sitting"}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Interview Mode</span>
          <span className="text-sm sm:text-base font-bold text-gray-950 flex items-center gap-1.5">
            {isOnline ? (
              <>
                <FiVideo className="w-4 h-4 text-[#A31D38]" />
                <span>Online</span>
              </>
            ) : (
              <>
                <FiMapPin className="w-4 h-4 text-emerald-600" />
                <span>Physical</span>
              </>
            )}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Interview Date &amp; Time</span>
          <span className="text-sm sm:text-base font-bold text-gray-950">{dateFormatted}</span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Country</span>
          <span className="text-sm sm:text-base font-bold text-gray-950">
            {centreProfile?.address?.country || "Nigeria"}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">State</span>
          <span className="text-sm sm:text-base font-bold text-gray-950">
            {centreProfile?.address?.state || "—"}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
            {isOnline ? "Meeting Link" : "Street Address"}
          </span>
          {isOnline ? (
            <a
              href={interviewDetail?.link || interview.link || "#"}
              target="_blank"
              rel="noreferrer"
              className="text-sm sm:text-base font-bold text-[#A31D38] hover:underline truncate"
            >
              {interviewDetail?.link || interview.link || "—"}
            </a>
          ) : (
            <span className="text-sm sm:text-base font-bold text-gray-950 truncate">
              {interviewDetail?.location ||
                interview.location ||
                centreProfile?.formattedAddress ||
                centreProfile?.address?.address ||
                "—"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
