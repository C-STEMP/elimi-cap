"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiX,
  FiClock,
  FiDownload,
  FiChevronDown,
} from "react-icons/fi";
import { ASSETS_URL } from "@/assets";
import { Button } from "@/src/components/ui/button";
import { Select } from "@/src/components/ui/select";
import { Input } from "@/src/components/ui/input";
import { useToast } from "@/src/components/ui/toast";
import { MOCK_AWARDING_BODY_INFO } from "@/features/assessment-centre/utils/constants";

interface ApplicationDetailViewProps {
  candidateName?: string;
  onBack: () => void;
  onOpenCandidateForm: () => void;
  onOpenEvidenceVault?: () => void;
}

export const AssessmentCentreApplicationDetailView: React.FC<
  ApplicationDetailViewProps
> = ({
  candidateName = "Oguntade James",
  onBack,
  onOpenCandidateForm,
  onOpenEvidenceVault,
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

  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({
    interview: false,
    verifier: false,
  });

  const toggleCard = (key: string) => {
    setExpandedCards((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePrevMonth = () => {
    const idx = months.indexOf(currentMonth);
    setCurrentMonth(months[(idx - 1 + 12) % 12]);
  };

  const handleNextMonth = () => {
    const idx = months.indexOf(currentMonth);
    setCurrentMonth(months[(idx + 1) % 12]);
  };

  const [paymentStatus] = useState<"paid" | "unpaid">("paid");
  const [hasFacilitator] = useState(true);
  const [isInterviewScheduled] = useState(true);
  const [hasInternalVerifier] = useState(true);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isAssignSuccessOpen, setIsAssignSuccessOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isScheduleSuccessOpen, setIsScheduleSuccessOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isRescheduleSuccessOpen, setIsRescheduleSuccessOpen] = useState(false);

  const [isVerifierModalOpen, setIsVerifierModalOpen] = useState(false);
  const [isVerifierSuccessOpen, setIsVerifierSuccessOpen] = useState(false);

  const [isConfirmEVOpen, setIsConfirmEVOpen] = useState(false);
  const [isEVSuccessOpen, setIsEVSuccessOpen] = useState(false);

  const [trade, setTrade] = useState("");
  const [facilitatorName, setFacilitatorName] = useState("");
  const [verifierName, setVerifierName] = useState("");

  const [interviewMode, setInterviewMode] = useState<"Physical" | "Virtual">(
    "Physical",
  );
  const [sameAsCompanyAddress, setSameAsCompanyAddress] = useState(true);

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAssignModalOpen(false);
    setIsAssignSuccessOpen(true);
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsScheduleModalOpen(false);
    setIsScheduleSuccessOpen(true);
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsRescheduleModalOpen(false);
    setIsRescheduleSuccessOpen(true);
  };

  const handleVerifierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifierModalOpen(false);
    setIsVerifierSuccessOpen(true);
  };

  const handleRequestEV = () => {
    setIsConfirmEVOpen(false);
    setIsEVSuccessOpen(true);
  };

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-2xs flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-black font-bold text-base sm:text-lg lg:text-xl tracking-tight">
                  Application Form
                </h3>
                <span className="bg-[#E6F4EA] text-[#1E7F4C] text-xs font-semibold px-3 py-0.5 rounded-full">
                  Approved
                </span>
              </div>
              <p className="text-gray-400 text-xs sm:text-sm font-normal">
                Submitted on: 7/21/2026
              </p>
            </div>

            <Button
              type="button"
              onClick={onOpenCandidateForm}
              variant="outline"
              size="sm"
              className="bg-white! text-[#fbab2a]! border border-gray-200! hover:bg-gray-50! font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl cursor-pointer shrink-0"
            >
              View
            </Button>
          </div>

          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-2xs flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-black font-bold text-base sm:text-lg lg:text-xl tracking-tight">
                  Payment
                </h3>
                <span className="bg-[#E6F4EA] text-[#1E7F4C] text-xs font-semibold px-3 py-0.5 rounded-full">
                  Successful
                </span>
              </div>
              <p className="text-gray-400 text-xs sm:text-sm font-normal">
                Paid On: 7/22/2026
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                toast({
                  type: "info",
                  title: "Receipt Downloaded",
                  description: "Payment receipt downloaded successfully.",
                })
              }
              className="bg-white border border-gray-200 hover:bg-gray-50 text-[#fbab2a] font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-2xs shrink-0"
            >
              <FiDownload className="w-4 h-4 text-[#fbab2a]" />
              <span>Receipt</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-2xs flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-black font-bold text-base sm:text-lg lg:text-xl tracking-tight">
                  Folder Arrangement
                </h3>
                <span className="bg-[#E6F4EA] text-[#1E7F4C] text-xs font-semibold px-3 py-0.5 rounded-full">
                  Marked as complete
                </span>
              </div>
              <p className="text-gray-400 text-xs sm:text-sm font-normal">
                Started on: 7/23/2026
              </p>
            </div>

            <Button
              type="button"
              onClick={() => onOpenEvidenceVault?.()}
              variant="outline"
              size="sm"
              className="bg-white! text-[#fbab2a]! border border-gray-200! hover:bg-gray-50! font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl cursor-pointer shrink-0"
            >
              Evidence Vault
            </Button>
          </div>

          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-2xs flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-black font-bold text-base sm:text-lg lg:text-xl tracking-tight">
                  Interview Stage
                </h3>
                <span className="bg-[#E6F4EA] text-[#1E7F4C] text-xs font-semibold px-3 py-0.5 rounded-full">
                  Completed
                </span>
              </div>
              <p className="text-gray-400 text-xs sm:text-sm font-normal">
                Scheduled for: 8/15/2026
              </p>
            </div>

            <button
              type="button"
              onClick={() => toggleCard("interview")}
              className="p-2 text-gray-400 hover:text-black cursor-pointer"
            >
              <FiChevronDown
                className={`w-5 h-5 transition-transform ${
                  expandedCards.interview ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {expandedCards.interview && (
            <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
              Interview stage details and notes will appear here.
            </div>
          )}

          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-2xs flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-black font-bold text-base sm:text-lg lg:text-xl tracking-tight">
                  Internal Verifier
                </h3>
                <span className="bg-[#E6F4EA] text-[#1E7F4C] text-xs font-semibold px-3 py-0.5 rounded-full">
                  Completed
                </span>
              </div>
              <p className="text-gray-400 text-xs sm:text-sm font-normal">
                Started on: 7/23/2026
              </p>
            </div>

            <button
              type="button"
              onClick={() => toggleCard("verifier")}
              className="p-2 text-gray-400 hover:text-black cursor-pointer"
            >
              <FiChevronDown
                className={`w-5 h-5 transition-transform ${
                  expandedCards.verifier ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {expandedCards.verifier && (
            <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
              Internal verifier details and notes will appear here.
            </div>
          )}

          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-2xs flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-black font-bold text-base sm:text-lg lg:text-xl tracking-tight">
                  Notify Awarding Body
                </h3>
                <span className="bg-[#E6F4EA] text-[#1E7F4C] text-xs font-semibold px-3 py-0.5 rounded-full">
                  Completed
                </span>
              </div>
              <p className="text-gray-400 text-xs sm:text-sm font-normal">
                Started on: 7/23/2026
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-2xs flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-black font-bold text-base sm:text-lg lg:text-xl tracking-tight">
                  External Verifier
                </h3>
                <span className="bg-[#E6F4EA] text-[#1E7F4C] text-xs font-semibold px-3 py-0.5 rounded-full">
                  Completed
                </span>
              </div>
              <p className="text-gray-400 text-xs sm:text-sm font-normal">
                Started on: 7/23/2026
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-2xs flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-black font-bold text-base sm:text-lg lg:text-xl tracking-tight">
                  Certification
                </h3>
                <span className="bg-[#E6F4EA] text-[#1E7F4C] text-xs font-semibold px-3 py-0.5 rounded-full">
                  Competent
                </span>
              </div>
              <p className="text-gray-400 text-xs sm:text-sm font-normal">
                ---
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6">
          <div className="bg-[#18181b] text-white rounded-3xl p-5 sm:p-6 shadow-md flex flex-col gap-4 select-none">
            <div className="flex items-center justify-between text-white px-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
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
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 text-center text-[10px] font-bold text-gray-400">
              {daysOfWeek.map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>

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
        </div>
      </div>
    </div>
  );
};
