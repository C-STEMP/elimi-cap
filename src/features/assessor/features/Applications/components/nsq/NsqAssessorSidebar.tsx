"use client";

import React from "react";
import Image from "next/image";
import { FiChevronRight, FiUser } from "react-icons/fi";
import { AssessorCalendarWidget } from "../detail/AssessorCalendarWidget";
import type { ObservationRequestDetails } from "./NsqAssessorObservationModal";

interface NsqAssessorSidebarProps {
  candidate: {
    name: string;
    email?: string;
    phone?: string;
    photoUrl?: string | null;
  };
  observation: ObservationRequestDetails | null;
  observationActionLabel?: string;
  onOpenObservationModal?: () => void;
  onFillObservationForm?: () => void;
}

export const NsqAssessorSidebar: React.FC<NsqAssessorSidebarProps> = ({
  candidate,
  observation,
  observationActionLabel = "View",
  onOpenObservationModal,
  onFillObservationForm,
}) => {
  return (
    <div className="w-full flex flex-col gap-6 select-text">
      {/* 1. Dark Calendar Widget (Reused from RPL Assessor) */}
      <div className="w-full">
        <AssessorCalendarWidget />
      </div>

      {/* 2. Observation Request Widget */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3">
        <h4 className="text-sm font-bold text-neutral-primary">
          Observation Request
        </h4>

        {!observation ? (
          <div className="py-6 flex flex-col items-center justify-center text-center">
            <h5 className="text-xs sm:text-sm font-bold text-neutral-primary">
              No request
            </h5>
            <p className="text-[11px] sm:text-xs text-neutral-secondary mt-0.5">
              Your scheduled events will appear here
            </p>
          </div>
        ) : observation.status === "pending" ? (
          <div
            onClick={onOpenObservationModal}
            className="border-l-4 border-amber-400 bg-gray-50/70 hover:bg-gray-100/70 p-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-between"
          >
            <div className="flex flex-col gap-1.5">
              <span className="w-fit px-2 py-0.5 bg-amber-100/80 text-amber-800 font-bold text-[10px] rounded-md">
                Pending
              </span>
              <span className="font-bold text-xs text-neutral-primary">
                Physically Observation
              </span>
              <div className="flex items-center gap-3 text-[10px] text-gray-500 font-semibold">
                <span>TIME: <strong className="text-neutral-primary">{observation.time}</strong></span>
                <span>DATE: <strong className="text-neutral-primary">{observation.date}</strong></span>
              </div>
            </div>
            <FiChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
          </div>
        ) : observation.status === "confirmed" ? (
          <div className="flex flex-col gap-3">
            <div
              onClick={onOpenObservationModal}
              className="border-l-4 border-emerald-500 bg-gray-50/70 hover:bg-gray-100/70 p-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex flex-col gap-1.5">
                <span className="w-fit px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-md">
                  Confirmed
                </span>
                <span className="font-bold text-xs text-neutral-primary">
                  Physically Observation
                </span>
                <div className="flex items-center gap-3 text-[10px] text-gray-500 font-semibold">
                  <span>TIME: <strong className="text-neutral-primary">{observation.time}</strong></span>
                  <span>DATE: <strong className="text-neutral-primary">{observation.date}</strong></span>
                </div>
              </div>
              <FiChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
            </div>

            {/* Countdown Banner */}
            <div className="w-full py-2 bg-amber-50 text-amber-600 font-extrabold text-xs tracking-wider rounded-xl text-center border border-amber-100 select-none">
              00:00:23:30
            </div>

            {/* Fill Form / View Button */}
            {onFillObservationForm && (
              <button
                type="button"
                onClick={onFillObservationForm}
                className="w-full h-11 bg-[#fbab2a] hover:bg-[#e89b1f] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center"
              >
                {observationActionLabel}
              </button>
            )}
          </div>
        ) : (
          /* Rejected State */
          <div className="flex flex-col gap-2">
            <div className="border-l-4 border-rose-500 bg-gray-50/70 p-3.5 rounded-xl flex items-center justify-between">
              <div className="flex flex-col gap-1.5">
                <span className="w-fit px-2 py-0.5 bg-rose-100 text-rose-800 font-bold text-[10px] rounded-md">
                  Rejected
                </span>
                <span className="font-bold text-xs text-neutral-primary">
                  Physically Observation
                </span>
                <div className="flex items-center gap-3 text-[10px] text-gray-500 font-semibold">
                  <span>TIME: <strong className="text-neutral-primary">{observation.time}</strong></span>
                  <span>DATE: <strong className="text-neutral-primary">{observation.date}</strong></span>
                </div>
              </div>
              <FiChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
            </div>

            <div className="text-[11px] text-neutral-secondary">
              <span className="font-bold text-neutral-primary block mb-0.5">Reason</span>
              <p className="leading-relaxed text-gray-600">
                {observation.rejectionReason || "Safety criteria and observation venue did not meet standard requirements."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3. Candidate Information Card */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3">
        <h4 className="text-sm font-bold text-neutral-primary">
          Candidate Information
        </h4>

        <div className="flex items-center gap-3.5 pt-1">
          {candidate.photoUrl ? (
            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 relative">
              <Image
                src={candidate.photoUrl}
                alt={candidate.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-rose-50 text-[#a31d38] flex items-center justify-center font-bold text-sm shrink-0">
              <FiUser className="w-6 h-6" />
            </div>
          )}

          <div className="flex flex-col min-w-0">
            <span className="font-bold text-xs sm:text-sm text-neutral-primary truncate">
              {candidate.name}
            </span>
            <span className="text-[11px] text-gray-400 truncate">
              {candidate.email || "samsondav@gmail.com"}
            </span>
            <span className="text-[11px] text-gray-400 truncate mt-0.5">
              {candidate.phone || "+2349123537212"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
