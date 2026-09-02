"use client";

import React, { useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiDownload,
  FiChevronDown,
  FiCheckCircle,
  FiClock,
  FiFlag,
} from "react-icons/fi";
import { ASSETS_URL } from "@/assets";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";
import { Loader } from "@/src/components/ui/loader";
import {
  useGetApplicationById,
  useGetApplicationStages,
  useGetApplicationHistory,
  useGetInterviewSchedule,
} from "@/src/features/shared/applications/hooks";
import { AssignFacilitatorModal } from "./AssignFacilitatorModal";

interface ApplicationDetailViewProps {
  id?: string;
  candidateName?: string;
  onBack: () => void;
  onOpenCandidateForm: () => void;
  onOpenEvidenceVault?: () => void;
}

export const AssessmentCentreApplicationDetailView: React.FC<
  ApplicationDetailViewProps
> = ({
  id = "",
  candidateName = "Candidate",
  onBack,
  onOpenCandidateForm,
  onOpenEvidenceVault,
}) => {
  const { toast } = useToast();

  const { data: appDetail, isLoading: isLoadingDetail } = useGetApplicationById(id);
  const { data: stages = [], isLoading: isLoadingStages } = useGetApplicationStages(id);
  const { data: interviewSchedule } = useGetInterviewSchedule(id);
  const { data: appHistory = [] } = useGetApplicationHistory(id);

  const [isAssignFacilitatorOpen, setIsAssignFacilitatorOpen] = useState(false);
  const [assignedFacilitator, setAssignedFacilitator] = useState<{
    id: string;
    name: string;
    avatar?: string;
    trade?: string;
  } | null>(null);

  const persistedFacilitator = React.useMemo(() => {
    if (typeof window === "undefined" || !id) return null;
    try {
      const stored =
        localStorage.getItem(`elimi_assigned_facilitator_${id}`) ||
        localStorage.getItem("elimi_assigned_facilitator_active");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, [id]);

  const activeFacilitator =
    assignedFacilitator ||
    (appDetail as any)?.facilitator ||
    (appDetail as any)?.assessor ||
    (appDetail as any)?.metadata?.facilitator ||
    persistedFacilitator ||
    null;

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

  const handleFacilitatorSuccess = (facilitator: {
    id: string;
    name: string;
  }) => {
    setAssignedFacilitator(facilitator);
    setIsAssignFacilitatorOpen(false);
    toast({
      type: "success",
      title: "Facilitator Assigned",
      description: `${facilitator.name} has been assigned as facilitator.`,
    });
  };

  const resolvedCandidateName =
    appDetail?.candidate?.name ||
    `${appDetail?.personalInformation?.personalDetails?.firstName || ""} ${appDetail?.personalInformation?.personalDetails?.lastName || ""}`.trim() ||
    candidateName;

  // Format dates
  const submittedDate = appDetail?.submittedAt
    ? new Date(appDetail.submittedAt).toLocaleDateString("en-US")
    : appDetail?.createdAt
      ? new Date(appDetail.createdAt).toLocaleDateString("en-US")
      : "Pending";

  const isCompleted = appDetail?.status === "certified";

  const getStatusBadge = (statusText: string) => {
    const s = statusText.toLowerCase();
    if (
      s === "approved" ||
      s === "successful" ||
      s === "marked as complete" ||
      s === "completed" ||
      s === "competent" ||
      s === "certified"
    ) {
      return {
        text: statusText,
        className: "bg-[#E6F4EA] text-[#1E7F4C]",
      };
    }
    if (
      s === "in progress" ||
      s === "under review" ||
      s === "scheduled" ||
      s === "pending review" ||
      s === "awaiting payment"
    ) {
      return {
        text: statusText,
        className: "bg-[#FEF3C7] text-[#92400E]",
      };
    }
    if (s === "rejected" || s === "needs attention" || s === "corrupted") {
      return {
        text: statusText,
        className: "bg-[#FCE8EB] text-[#A31D38]",
      };
    }
    return {
      text: statusText,
      className: "bg-gray-100 text-gray-600",
    };
  };

  // Stage 1: Application Form
  const appFormStage = stages.find(
    (s) =>
      s.stageKey === "application_form" ||
      s.stageKey === "application_review" ||
      s.stageKey === "application",
  );

  const isAppFormExplicitlyApproved = Boolean(
    appFormStage?.status === "successful" ||
    (appFormStage?.status as string) === "approved" ||
    (appDetail?.currentStageKey &&
      appDetail.currentStageKey !== "application_form" &&
      appDetail.currentStageKey !== "application_review" &&
      appDetail.currentStageKey !== "draft" &&
      appDetail.currentStageKey !== "submitted"),
  );

  const appFormStatus = isAppFormExplicitlyApproved || isCompleted
    ? "Approved"
    : appFormStage?.status === "rejected" || appDetail?.status === "rejected"
      ? "Rejected"
      : appDetail?.status === "draft"
        ? "Draft"
        : "Under Review";

  // Stage 2: Payment
  const paymentStage = stages.find(
    (s) => s.stageKey === "payment" || s.stageKey === "payment_quote",
  );
  const isPaymentPaid = Boolean(
    paymentStage?.status === "successful" ||
    (appDetail as any)?.paymentCompleted ||
    isCompleted,
  );

  const paymentStatus = isPaymentPaid
    ? "Successful"
    : paymentStage?.status === "awaiting_payment"
      ? "Awaiting Payment"
      : paymentStage?.status === "in_progress"
        ? "In Progress"
        : isAppFormExplicitlyApproved
          ? "Awaiting Payment"
          : "Pending";

  const paymentDate = isPaymentPaid
    ? paymentStage?.enteredAt
      ? new Date(paymentStage.enteredAt).toLocaleDateString("en-US")
      : submittedDate
    : "—";

  // Stage 3: Folder Arrangement
  const evidenceStage = stages.find(
    (s) =>
      s.stageKey === "evidence_vault" ||
      s.stageKey === "folder_arrangement" ||
      s.stageKey === "evidence",
  );
  const evidenceStatus =
    evidenceStage?.status === "successful" || isCompleted
      ? "Marked as complete"
      : evidenceStage?.status === "under_review"
        ? "Under Review"
        : evidenceStage?.status === "in_progress"
          ? "In Progress"
          : "Pending";

  const evidenceDate = evidenceStage?.enteredAt
    ? new Date(evidenceStage.enteredAt).toLocaleDateString("en-US")
    : evidenceStatus === "Marked as complete"
      ? submittedDate
      : "—";

  // Stage 4: Interview Stage
  const interviewStage = stages.find(
    (s) =>
      s.stageKey === "interview" ||
      s.stageKey === "direct_observation" ||
      s.stageKey === "observation",
  );
  const interviewStatus =
    interviewSchedule?.status === "completed" ||
    interviewStage?.status === "successful" ||
    isCompleted
      ? "Completed"
      : interviewSchedule?.status === "scheduled" ||
          interviewStage?.status === "scheduled"
        ? "Scheduled"
        : interviewStage?.status === "in_progress"
          ? "In Progress"
          : "Pending";

  const interviewDate = interviewSchedule?.scheduledAt
    ? new Date(interviewSchedule.scheduledAt).toLocaleDateString("en-US")
    : interviewStage?.enteredAt
      ? new Date(interviewStage.enteredAt).toLocaleDateString("en-US")
      : interviewStatus === "Completed"
        ? submittedDate
        : "—";

  // Stage 5: Internal Verifier
  const ivStage = stages.find(
    (s) =>
      s.stageKey === "internal_verification" ||
      s.stageKey === "internal_verifier" ||
      s.stageKey === "iv_review" ||
      s.stageKey === "iv",
  );
  const ivStatus =
    ivStage?.status === "successful" || isCompleted
      ? "Completed"
      : ivStage?.status === "in_progress" || appDetail?.internalVerifier
        ? "In Progress"
        : "Pending";

  const ivDate = appDetail?.internalVerifier?.assignedAt
    ? new Date(appDetail.internalVerifier.assignedAt).toLocaleDateString("en-US")
    : ivStage?.enteredAt
      ? new Date(ivStage.enteredAt).toLocaleDateString("en-US")
      : ivStatus === "Completed"
        ? submittedDate
        : "—";

  // Stage 6: Awarding Body
  const awardingBodyStage = stages.find(
    (s) =>
      s.stageKey === "awarding_body" ||
      s.stageKey === "notify_awarding_body",
  );
  const awardingBodyStatus =
    awardingBodyStage?.status === "successful" || isCompleted
      ? "Completed"
      : awardingBodyStage?.status === "in_progress"
        ? "In Progress"
        : "Pending";

  // Stage 7: External Verifier
  const evStage = stages.find(
    (s) =>
      s.stageKey === "external_verification" ||
      s.stageKey === "external_verifier" ||
      s.stageKey === "eqa" ||
      s.stageKey === "ev",
  );
  const evStatus =
    evStage?.status === "successful" || isCompleted
      ? "Completed"
      : evStage?.status === "in_progress"
        ? "In Progress"
        : "Pending";

  // Stage 8: Certification
  const certStage = stages.find((s) => s.stageKey === "certification");
  const certStatus =
    isCompleted || certStage?.status === "successful"
      ? "Competent"
      : certStage?.status === "in_progress"
        ? "In Progress"
        : "Pending";

  if (isLoadingDetail && !appDetail) {
    return (
      <div className="w-full min-h-[400px] flex items-center justify-center">
        <Loader tip="Loading application details..." />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-4">
          {/* Stage 1: Application Form */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-2xs flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-black font-bold text-base sm:text-lg lg:text-xl tracking-tight">
                  Application Form
                </h3>
                {(() => {
                  const b = getStatusBadge(appFormStatus);
                  return (
                    <span className={`${b.className} text-xs font-semibold px-3 py-0.5 rounded-full capitalize`}>
                      {b.text}
                    </span>
                  );
                })()}
              </div>
              <p className="text-gray-400 text-xs sm:text-sm font-normal">
                Submitted on: {submittedDate}
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

          {/* Stage 2: Payment */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-2xs flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-black font-bold text-base sm:text-lg lg:text-xl tracking-tight">
                  Payment
                </h3>
                {(() => {
                  const b = getStatusBadge(paymentStatus);
                  return (
                    <span className={`${b.className} text-xs font-semibold px-3 py-0.5 rounded-full capitalize`}>
                      {b.text}
                    </span>
                  );
                })()}
              </div>
              <p className="text-gray-400 text-xs sm:text-sm font-normal">
                {isPaymentPaid
                  ? `Paid On: ${paymentDate}`
                  : isAppFormExplicitlyApproved
                    ? "Awaiting candidate payment"
                    : "Awaiting centre approval"}
              </p>
            </div>

            {paymentStatus === "Successful" ? (
              activeFacilitator ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAssignFacilitatorOpen(true)}
                  className="bg-white! text-[#fbab2a]! border border-[#FCD34D]! hover:bg-[#FFFBEB]! font-bold text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <FiFlag className="w-4 h-4 text-[#fbab2a]" />
                  <span>Change Facilitator</span>
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsAssignFacilitatorOpen(true)}
                  className="bg-[#fbab2a]! hover:bg-[#e89b1f]! text-white! font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-none cursor-pointer shrink-0"
                >
                  Assign Facilitator
                </Button>
              )
            ) : paymentStage?.receipt?.url ? (
              <button
                type="button"
                onClick={() => {
                  window.open(paymentStage.receipt?.url || "", "_blank");
                }}
                className="bg-white border border-gray-200 hover:bg-gray-50 text-[#fbab2a] font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-2xs shrink-0"
              >
                <FiDownload className="w-4 h-4 text-[#fbab2a]" />
                <span>Receipt</span>
              </button>
            ) : null}
          </div>

          {/* Stage 3: Folder Arrangement */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-2xs flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-black font-bold text-base sm:text-lg lg:text-xl tracking-tight">
                  Folder Arrangement
                </h3>
                {activeFacilitator || evidenceStatus === "In Progress" ? (
                  <span className="bg-[#FFF4E5] text-[#B45309] border border-[#FDE6B0] text-xs font-semibold px-3 py-0.5 rounded-full capitalize">
                    14 Days Left
                  </span>
                ) : (
                  (() => {
                    const b = getStatusBadge(evidenceStatus);
                    return (
                      <span className={`${b.className} text-xs font-semibold px-3 py-0.5 rounded-full capitalize`}>
                        {b.text}
                      </span>
                    );
                  })()
                )}
              </div>
              <p className="text-gray-400 text-xs sm:text-sm font-normal">
                Started on: {evidenceDate}
              </p>
            </div>

            <Button
              type="button"
              onClick={() => onOpenEvidenceVault?.()}
              variant="outline"
              size="sm"
              className={
                activeFacilitator || evidenceStatus === "In Progress"
                  ? "bg-[#fbab2a]! hover:bg-[#e89b1f]! text-white! font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-none cursor-pointer shrink-0"
                  : "bg-white! text-[#fbab2a]! border border-gray-200! hover:bg-gray-50! font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl cursor-pointer shrink-0"
              }
            >
              Evidence Vault
            </Button>
          </div>

          {/* Stage 4: Interview Stage */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-2xs flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1.5 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-black font-bold text-base sm:text-lg lg:text-xl tracking-tight">
                    Interview Stage
                  </h3>
                  {(() => {
                    const b = getStatusBadge(interviewStatus);
                    return (
                      <span className={`${b.className} text-xs font-semibold px-3 py-0.5 rounded-full capitalize`}>
                        {b.text}
                      </span>
                    );
                  })()}
                </div>
                <p className="text-gray-400 text-xs sm:text-sm font-normal">
                  Scheduled for: {interviewDate}
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
              <div className="pt-3 border-t border-gray-100 text-xs text-gray-600 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-700">Interview Mode:</span>
                  <span className="capitalize">{interviewSchedule?.mode || "Physical Assessment"}</span>
                </div>
                {interviewSchedule?.location && (
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-700">Location:</span>
                    <span>{interviewSchedule.location}</span>
                  </div>
                )}
                {interviewSchedule?.link && (
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-700">Meeting Link:</span>
                    <a
                      href={interviewSchedule.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      Join Meeting
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Stage 5: Internal Verifier */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-2xs flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1.5 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-black font-bold text-base sm:text-lg lg:text-xl tracking-tight">
                    Internal Verifier
                  </h3>
                  {(() => {
                    const b = getStatusBadge(ivStatus);
                    return (
                      <span className={`${b.className} text-xs font-semibold px-3 py-0.5 rounded-full capitalize`}>
                        {b.text}
                      </span>
                    );
                  })()}
                </div>
                <p className="text-gray-400 text-xs sm:text-sm font-normal">
                  Started on: {ivDate}
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
              <div className="pt-3 border-t border-gray-100 text-xs text-gray-600 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-700">Assigned IV:</span>
                  <span>{appDetail?.internalVerifier?.name || "Internal Verifier Assessor"}</span>
                </div>
                {appDetail?.internalVerifier?.qualifications && (
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-700">Qualifications:</span>
                    <span>{appDetail.internalVerifier.qualifications.join(", ")}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Stage 6: Notify Awarding Body */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-2xs flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-black font-bold text-base sm:text-lg lg:text-xl tracking-tight">
                  Notify Awarding Body
                </h3>
                {(() => {
                  const b = getStatusBadge(awardingBodyStatus);
                  return (
                    <span className={`${b.className} text-xs font-semibold px-3 py-0.5 rounded-full capitalize`}>
                      {b.text}
                    </span>
                  );
                })()}
              </div>
              <p className="text-gray-400 text-xs sm:text-sm font-normal">
                {awardingBodyStatus === "Pending" ? "Not started yet" : `Started on: ${submittedDate}`}
              </p>
            </div>
          </div>

          {/* Stage 7: External Verifier */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-2xs flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-black font-bold text-base sm:text-lg lg:text-xl tracking-tight">
                  External Verifier
                </h3>
                {(() => {
                  const b = getStatusBadge(evStatus);
                  return (
                    <span className={`${b.className} text-xs font-semibold px-3 py-0.5 rounded-full capitalize`}>
                      {b.text}
                    </span>
                  );
                })()}
              </div>
              <p className="text-gray-400 text-xs sm:text-sm font-normal">
                {evStatus === "Pending" ? "Not started yet" : `Started on: ${submittedDate}`}
              </p>
            </div>
          </div>

          {/* Stage 8: Certification */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-2xs flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-black font-bold text-base sm:text-lg lg:text-xl tracking-tight">
                  Certification
                </h3>
                {(() => {
                  const b = getStatusBadge(certStatus);
                  return (
                    <span className={`${b.className} text-xs font-semibold px-3 py-0.5 rounded-full capitalize`}>
                      {b.text}
                    </span>
                  );
                })()}
              </div>
              <p className="text-gray-400 text-xs sm:text-sm font-normal">
                {certStatus === "Competent" ? "Certified" : "In Progress / Pending"}
              </p>
            </div>
          </div>
        </div>

        {/* Right Sidebar Calendar & Events */}
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

            {interviewSchedule?.scheduledAt ? (
              <div className="w-full flex items-start gap-3 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100 text-left">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <FiClock className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-xs font-bold text-gray-900 truncate">
                    Interview / Observation
                  </span>
                  <span className="text-[11px] text-gray-600">
                    {new Date(interviewSchedule.scheduledAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-[#fde8ec] text-border-secondary flex items-center justify-center">
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

          {activeFacilitator ? (
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs flex flex-col gap-4 select-text">
              <h3 className="text-base font-extrabold text-black tracking-tight">
                Facilitator
              </h3>
              <div className="flex items-center gap-3.5">
                <div className="w-13 h-13 rounded-full overflow-hidden bg-gray-100 border border-gray-200 shrink-0 relative">
                  <img
                    src={
                      activeFacilitator.avatar ||
                      (ASSETS_URL as any)?.userAvatar?.src ||
                      "/avatar-placeholder.png"
                    }
                    alt={activeFacilitator.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <h4 className="text-sm font-bold text-black truncate">
                    {activeFacilitator.name}
                  </h4>
                  <p className="text-[11px] text-gray-500 font-normal truncate">
                    Facilitator · {activeFacilitator.trade || (appDetail as any)?.trade?.name || "Carpentry"} (Level 3)
                  </p>
                  <div className="flex items-center gap-1.5 flex-wrap mt-1">
                    <span className="bg-[#fdf2f4] text-[#a31d38] text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                      {activeFacilitator.trade || (appDetail as any)?.trade?.name || "Carpentry"}
                    </span>
                    <span className="bg-[#fdf2f4] text-[#a31d38] text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                      RPL Coordinator
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs flex flex-col gap-2 select-text">
              <h3 className="text-base font-extrabold text-black tracking-tight">
                No facilitator assigned yet
              </h3>
              <p className="text-xs text-gray-400 font-normal leading-relaxed">
                A coordinator will be assigned to guide you once your first application is created.
              </p>
            </div>
          )}
        </div>
      </div>

      <AssignFacilitatorModal
        isOpen={isAssignFacilitatorOpen}
        onClose={() => setIsAssignFacilitatorOpen(false)}
        applicationId={id}
        tradeName={
          (appDetail as any)?.trade?.name ||
          (typeof (appDetail as any)?.trade === "string"
            ? (appDetail as any)?.trade
            : "Carpentry")
        }
        onSuccess={handleFacilitatorSuccess}
      />
    </div>
  );
};
