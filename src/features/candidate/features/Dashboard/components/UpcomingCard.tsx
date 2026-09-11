"use client";

import React from "react";
import { FiCalendar, FiCheck, FiEdit3 } from "react-icons/fi";

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

export interface FormToSignItem {
  id: string;
  title: string;
  description?: string;
  signed?: boolean;
}

interface UpcomingCardProps {
  interview?: InterviewData | null;
  className?: string;
  forms?: FormToSignItem[];
  onOpenForm?: (formId: string) => void;
}

export const UpcomingCard: React.FC<UpcomingCardProps> = ({
  interview,
  className = "",
  forms,
  onOpenForm,
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

      {forms && forms.length > 0 && (
        <div className="w-full flex flex-col gap-2.5 pt-3 border-t border-gray-100 text-left mt-1">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
            Assessment Forms
          </span>
          <div className="flex flex-col gap-2">
            {forms.map((form) => (
              <div
                key={form.id}
                onClick={() => onOpenForm?.(form.id)}
                className="bg-[#F9FAFB] hover:bg-gray-50 rounded-xl p-3 border border-gray-100/90 hover:border-[#8A1538]/30 flex items-center justify-between gap-2 shadow-2xs cursor-pointer transition-all group"
              >
                <div className="flex flex-col min-w-0 pr-1">
                  <span className="text-xs font-bold text-gray-900 truncate group-hover:text-[#8A1538] transition-colors">
                    {form.title}
                  </span>
                  {form.description && (
                    <span className="text-[10px] text-gray-400 truncate mt-0.5">
                      {form.description}
                    </span>
                  )}
                </div>

                {form.signed ? (
                  <span className="shrink-0 bg-[#E6F4EA] text-[#1E7F4C] border border-[#1E7F4C]/20 text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 select-none">
                    <FiCheck className="w-3 h-3" /> Signed
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenForm?.(form.id);
                    }}
                    className="shrink-0 bg-[#FFF8EB] border border-[#FBAB2A] hover:bg-[#FDEED5] text-[#FBAB2A] text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <FiEdit3 className="w-3 h-3" /> View &amp; Sign
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
