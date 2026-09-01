"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiDownload,
  FiFileText,
} from "react-icons/fi";
import { ASSETS_URL } from "@/assets";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";
import { Loader } from "@/src/components/ui/loader";
import {
  useGetEvidenceVault,
  useGetSelfAssessment,
} from "@/src/features/shared/applications/hooks";

interface EvidenceVaultViewProps {
  id?: string;
  candidateName?: string;
  onBack: () => void;
  onOpenSelfAssessmentForm: () => void;
}

export const AssessmentCentreEvidenceVaultView: React.FC<
  EvidenceVaultViewProps
> = ({
  id = "",
  candidateName = "Candidate",
  onBack,
  onOpenSelfAssessmentForm,
}) => {
  const { toast } = useToast();
  const { data: evidenceItems = [], isLoading: isLoadingEvidence } =
    useGetEvidenceVault(id);
  const { data: selfAssessment } = useGetSelfAssessment(id);

  const [currentMonth, setCurrentMonth] = useState("July");
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  const handlePrevMonth = () => {
    const idx = months.indexOf(currentMonth);
    setCurrentMonth(months[(idx - 1 + 12) % 12]);
  };

  const handleNextMonth = () => {
    const idx = months.indexOf(currentMonth);
    setCurrentMonth(months[(idx + 1) % 12]);
  };

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-8">
          {/* Section 1: Resources */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-extrabold text-black tracking-tight">
              Resources
            </h2>

            {/* Resource Card 1: Self-Assessment Form Template */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs flex items-center justify-between gap-4 transition-all">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                  <FiFileText className="w-6 h-6 text-[#a31d38]" />
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-black tracking-tight truncate">
                    Self-Assessment Form
                  </h3>
                  <span className="text-xs text-gray-400 font-normal">
                    {selfAssessment?.submittedAt
                      ? `Submitted on ${new Date(selfAssessment.submittedAt).toLocaleDateString("en-GB")}`
                      : "Candidate Competency Self-Assessment"}
                  </span>
                </div>
              </div>

              <Button
                type="button"
                onClick={onOpenSelfAssessmentForm}
                variant="outline"
                size="sm"
                className="bg-white! text-[#fbab2a]! border border-gray-200! hover:bg-gray-50! font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-all cursor-pointer shadow-none! shrink-0"
              >
                View
              </Button>
            </div>

            {/* Resource Card 2: Third Party Reports */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs flex items-center justify-between gap-4 transition-all">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                  <FiFileText className="w-6 h-6 text-[#a31d38]" />
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-black tracking-tight truncate">
                    Third Party Reports
                  </h3>
                  <span className="text-xs text-gray-400 font-normal">
                    Employer & Supervisor References
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  toast({
                    type: "info",
                    title: "Third Party Reports",
                    description: "No third party report document attached.",
                  })
                }
                className="bg-[#F8F9FA] border border-gray-200 hover:bg-gray-100 text-gray-700 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-2xs shrink-0"
              >
                <span>Download</span>
                <FiDownload className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Section 2: Evidence */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-extrabold text-black tracking-tight">
              Evidence Items ({evidenceItems.length})
            </h2>

            {isLoadingEvidence ? (
              <div className="p-8 flex justify-center">
                <Loader tip="Loading evidence items..." />
              </div>
            ) : evidenceItems.length > 0 ? (
              evidenceItems.map((item, idx) => {
                const isApproved = item.status === "approved" || item.status === "accepted";
                const isAttention = item.status === "rejected" || item.status === "needs_attention";
                const title = item.name || item.title || item.category || `Evidence Document #${idx + 1}`;
                const fileFeedback = item.feedback || item.reviewComment;

                return (
                  <div
                    key={item.id || idx}
                    className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs flex flex-col gap-3 transition-all"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                          <FiFileText className="w-6 h-6 text-[#a31d38]" />
                        </div>
                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-base sm:text-lg font-bold text-black tracking-tight truncate">
                              {title}
                            </h3>
                            <span
                              className={`text-xs font-semibold px-3 py-0.5 rounded-full capitalize ${
                                isApproved
                                  ? "bg-[#E6F4EA] text-[#1E7F4C]"
                                  : isAttention
                                    ? "bg-[#FCE8EB] text-[#A31D38]"
                                    : "bg-[#FEF3C7] text-[#92400E]"
                              }`}
                            >
                              {item.status ? item.status.replace(/_/g, " ") : "Submitted"}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400 font-normal">
                            {item.size || "Uploaded document"}
                          </span>
                        </div>
                      </div>

                      {item.assetId && (
                        <button
                          type="button"
                          onClick={() => {
                            toast({
                              type: "info",
                              title: "Document Preview",
                              description: `Opening ${title}...`,
                            });
                          }}
                          className="bg-white border border-gray-200 hover:bg-gray-50 text-[#fbab2a] font-bold text-xs sm:text-sm px-4 py-2 rounded-xl cursor-pointer shrink-0"
                        >
                          View
                        </button>
                      )}
                    </div>

                    {fileFeedback && (
                      <div className="bg-[#FCE8EB] border border-[#F87171]/30 rounded-2xl p-4 flex flex-col gap-1 text-xs text-[#A31D38] font-medium leading-relaxed mt-1">
                        <div className="flex items-start gap-2">
                          <span className="text-sm">•</span>
                          <span>{fileFeedback}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center text-gray-400 font-normal">
                No uploaded evidence files found for this candidate.
              </div>
            )}
          </div>
        </div>

        {/* Right Column (col-span-4): Calendar + Upcoming Events + Facilitator Widget */}
        <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6">
          {/* 1. Dark Calendar Widget */}
          <div className="bg-[#18181b] text-white rounded-3xl p-5 sm:p-6 shadow-md flex flex-col gap-4 select-none">
            <div className="flex items-center justify-between text-white px-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                aria-label="Previous Month"
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>
              <span className="font-bold text-sm sm:text-base tracking-wide">
                {currentMonth}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                aria-label="Next Month"
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 text-center text-[10px] font-bold text-gray-400">
              {daysOfWeek.map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 text-center gap-y-2 text-xs font-semibold text-gray-200">
              {daysInMonth.map((day) => (
                <span
                  key={day}
                  className="p-1 rounded-full hover:bg-white/15 cursor-pointer transition-colors"
                >
                  {day}
                </span>
              ))}
            </div>
          </div>

          {/* 2. Upcoming Events Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs flex flex-col items-center justify-center text-center gap-3 py-8">
            <h3 className="text-base font-extrabold text-black self-start tracking-tight mb-2">
              Upcoming Events
            </h3>

            <div className="w-12 h-12 rounded-full bg-[#fde8ec] text-[#b3261e] flex items-center justify-center">
              <FiCalendar className="w-6 h-6 stroke-[2]" />
            </div>

            <div className="flex flex-col gap-1 mt-1">
              <span className="text-xs sm:text-sm font-bold text-black">
                No upcoming events
              </span>
              <span className="text-xs text-gray-400 font-normal">
                Your scheduled events will appear here
              </span>
            </div>
          </div>

          {/* 3. Facilitator Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs flex flex-col gap-4">
            <h3 className="text-sm sm:text-base font-extrabold text-black tracking-tight">
              Facilitator
            </h3>

            <div className="flex items-center gap-3 bg-[#F8F9FA] rounded-2xl p-3 border border-gray-100">
              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-gray-200">
                <Image
                  src={ASSETS_URL.userAvatar}
                  alt="Facilitator Avatar"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-xs sm:text-sm font-extrabold text-black truncate">
                  Ngozi Eze
                </span>
                <span className="text-[10px] sm:text-xs text-gray-500 font-medium truncate">
                  Facilitator · Carpentry (Level 3)
                </span>
                <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                  <span className="bg-[#FCE8EB] text-[#A31D38] text-[9px] font-bold px-2 py-0.5 rounded-full">
                    Carpentry
                  </span>
                  <span className="bg-[#FCE8EB] text-[#A31D38] text-[9px] font-bold px-2 py-0.5 rounded-full">
                    RPL Coordinator
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
