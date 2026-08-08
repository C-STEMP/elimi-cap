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

interface EvidenceVaultViewProps {
  candidateName?: string;
  onBack: () => void;
  onOpenSelfAssessmentForm: () => void;
}

export const AssessmentCentreEvidenceVaultView: React.FC<
  EvidenceVaultViewProps
> = ({
  candidateName = "Oguntade James",
  onBack,
  onOpenSelfAssessmentForm,
}) => {
  const { toast } = useToast();
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
        {/* Left Column (col-span-8) */}
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
                    Self-Assessment Form Template
                  </h3>
                  <span className="text-xs text-gray-400 font-normal">
                    5 mb
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
                    5 mb
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  toast({
                    type: "info",
                    title: "Download Started",
                    description: "Downloading Third Party Reports PDF...",
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
              Evidence
            </h2>

            {/* Evidence Item 1: Attention Required */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs flex flex-col gap-3 transition-all">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                    <FiFileText className="w-6 h-6 text-[#a31d38]" />
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-base sm:text-lg font-bold text-black tracking-tight">
                        CV/Resume
                      </h3>
                      <span className="bg-[#FCE8EB] text-[#A31D38] text-xs font-semibold px-3 py-0.5 rounded-full">
                        Attention Required
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 font-normal">
                      60 kb / 5 mb
                    </span>
                  </div>
                </div>
              </div>

              {/* Red Warning Alert Box (Images 2) */}
              <div className="bg-[#FCE8EB] border border-[#F87171]/30 rounded-2xl p-4 flex flex-col gap-1 text-xs text-[#A31D38] font-medium leading-relaxed mt-1">
                <div className="flex items-start gap-2">
                  <span className="text-sm">•</span>
                  <span>The file is corrupted</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sm">•</span>
                  <span>
                    The CV does not show you have worked in the construction
                    sector before
                  </span>
                </div>
              </div>
            </div>

            {/* Evidence Item 2: Approved */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs flex items-center justify-between gap-4 transition-all">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                  <FiFileText className="w-6 h-6 text-[#a31d38]" />
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-base sm:text-lg font-bold text-black tracking-tight">
                      CV/Resume
                    </h3>
                    <span className="bg-[#E6F4EA] text-[#1E7F4C] text-xs font-semibold px-3 py-0.5 rounded-full">
                      Approved
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 font-normal">
                    60 kb / 5 mb
                  </span>
                </div>
              </div>
            </div>

            {/* Evidence Item 3: Approved */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs flex items-center justify-between gap-4 transition-all">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                  <FiFileText className="w-6 h-6 text-[#a31d38]" />
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-base sm:text-lg font-bold text-black tracking-tight">
                      CV/Resume
                    </h3>
                    <span className="bg-[#E6F4EA] text-[#1E7F4C] text-xs font-semibold px-3 py-0.5 rounded-full">
                      Approved
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 font-normal">
                    60 kb / 5 mb
                  </span>
                </div>
              </div>
            </div>

            {/* Evidence Item 4: Approved */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs flex items-center justify-between gap-4 transition-all">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                  <FiFileText className="w-6 h-6 text-[#a31d38]" />
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-base sm:text-lg font-bold text-black tracking-tight">
                      CV/Resume
                    </h3>
                    <span className="bg-[#E6F4EA] text-[#1E7F4C] text-xs font-semibold px-3 py-0.5 rounded-full">
                      Approved
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 font-normal">
                    60 kb / 5 mb
                  </span>
                </div>
              </div>
            </div>

            {/* Evidence Item 5: Approved */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs flex items-center justify-between gap-4 transition-all">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                  <FiFileText className="w-6 h-6 text-[#a31d38]" />
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-base sm:text-lg font-bold text-black tracking-tight">
                      CV/Resume
                    </h3>
                    <span className="bg-[#E6F4EA] text-[#1E7F4C] text-xs font-semibold px-3 py-0.5 rounded-full">
                      Approved
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 font-normal">
                    60 kb / 5 mb
                  </span>
                </div>
              </div>
            </div>
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
