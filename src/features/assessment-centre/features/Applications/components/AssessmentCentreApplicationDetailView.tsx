"use client";

import React, { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import { Avatar } from "@/src/components/ui/avatar";
import { useToast } from "@/src/components/ui/toast";
import { Loader } from "@/src/components/ui/loader";
import {
  useGetApplicationById,
  useGetApplicationStages,
  useGetApplicationHistory,
  useGetInterviewSchedule,
  useGetInterviewPanel,
} from "@/src/features/shared/applications/hooks";
import { AssignFacilitatorModal } from "./AssignFacilitatorModal";
import { AssignPanelistModal, ScheduledPanelistInfo } from "./AssignPanelistModal";
import { RescheduleInterviewModal } from "./RescheduleInterviewModal";
import { AssignVerifierModal } from "./AssignVerifierModal";
import { ReviewVerifierModal } from "./ReviewVerifierModal";
import {
  useGetCentreAssessors,
  useGetCentrePanels,
  useGetCentreInterviews,
} from "@/src/features/shared/centre/hooks";
import { PromptCreatePanelModal } from "./PromptCreatePanelModal";
import { CreatePanelModal } from "./CreatePanelModal";
import { ScheduleInterviewModal } from "./ScheduleInterviewModal";
import { UpcomingCard } from "@/features/candidate/features/Dashboard/components/UpcomingCard";

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
  const queryClient = useQueryClient();

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

  const [isAssignPanelistOpen, setIsAssignPanelistOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isRescheduledLocally, setIsRescheduledLocally] = useState(false);
  const [scheduledPanelistData, setScheduledPanelistData] =
    useState<ScheduledPanelistInfo | null>(null);

  const [isAssignVerifierOpen, setIsAssignVerifierOpen] = useState(false);
  const [isReviewVerifierOpen, setIsReviewVerifierOpen] = useState(false);
  const [activeVerifierType, setActiveVerifierType] = useState<"internal" | "external">("internal");

  const { data: interviewPanelFromApi } = useGetInterviewPanel(id);
  const { data: centreAssessors = [] } = useGetCentreAssessors({ status: "all" });
  const { data: centrePanels = [] } = useGetCentrePanels();
  const { data: centreInterviews = [] } = useGetCentreInterviews();

  const [isPromptCreatePanelOpen, setIsPromptCreatePanelOpen] = useState(false);
  const [isScheduleInterviewModalOpen, setIsScheduleInterviewModalOpen] =
    useState(false);
  const [isCreatePanelModalOpen, setIsCreatePanelModalOpen] = useState(false);

  const rawTrade =
    (appDetail as any)?.trade?.name ||
    (typeof (appDetail as any)?.trade === "string" &&
    !/^[0-9a-f-]{20,}$/i.test((appDetail as any).trade)
      ? (appDetail as any).trade
      : "") ||
    (appDetail as any)?.sector?.name ||
    "Cosmetology";

  const resolvedTradeName =
    rawTrade && !/^[0-9a-f-]{20,}$/i.test(rawTrade) ? rawTrade : "Cosmetology";

  const persistedFacilitator = React.useMemo(() => {
    if (typeof window === "undefined" || !id) return null;
    try {
      if (localStorage.getItem("elimi_assigned_facilitator_active")) {
        localStorage.removeItem("elimi_assigned_facilitator_active");
      }
      const stored = localStorage.getItem(`elimi_assigned_facilitator_${id}`);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, [id]);

  const interviewStage = useMemo(
    () =>
      stages.find(
        (s) =>
          s.stageKey === "interview" ||
          s.stageKey === "direct_observation" ||
          s.stageKey === "observation",
      ),
    [stages],
  );

  const evidenceStage = useMemo(
    () =>
      stages.find(
        (s) =>
          s.stageKey === "evidence_vault" ||
          s.stageKey === "folder_arrangement" ||
          s.stageKey === "evidence",
      ),
    [stages],
  );

  const rawApiSchedule = (interviewSchedule as any)?.data || interviewSchedule;
  const isInterviewNotStarted = !rawApiSchedule?.scheduledAt && interviewStage?.status === "not_started";

  // Clean out any stale local storage mocks
  React.useEffect(() => {
    if (typeof window !== "undefined" && id) {
      try {
        localStorage.removeItem(`elimi_interview_schedule_${id}`);
        localStorage.removeItem(`elimi_interview_panel_${id}`);
      } catch {}
    }
  }, [id]);

  const activeFacilitator =
    assignedFacilitator ||
    (appDetail as any)?.facilitator ||
    (appDetail as any)?.assessor ||
    (appDetail as any)?.metadata?.facilitator ||
    persistedFacilitator ||
    null;

  const activeInterviewSchedule = rawApiSchedule?.scheduledAt
    ? rawApiSchedule
    : null;

  const isInterviewScheduled = Boolean(
    activeInterviewSchedule?.scheduledAt ||
      interviewStage?.status === "scheduled"
  );

  const interviewDateFormatted = activeInterviewSchedule?.scheduledAt
    ? new Date(activeInterviewSchedule.scheduledAt).toLocaleDateString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const interviewTimeFormatted = activeInterviewSchedule?.scheduledAt
    ? new Date(activeInterviewSchedule.scheduledAt).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "";

  const interviewEventDateFormatted = activeInterviewSchedule?.scheduledAt
    ? new Date(activeInterviewSchedule.scheduledAt).toLocaleDateString("en-GB")
    : "";

  const interviewAssessorsList = useMemo(() => {
    // Only use panel members returned by the backend via GET /applications/{id}/interview/panel
    if (interviewPanelFromApi?.members && interviewPanelFromApi.members.length > 0) {
      const nonObserverMembers = interviewPanelFromApi.members.filter((m) => !m.isObserver);
      const membersToUse =
        nonObserverMembers.length >= 3
          ? nonObserverMembers.slice(0, 3)
          : interviewPanelFromApi.members.slice(0, 3);

      return membersToUse.map((m, i) => {
        const matched = centreAssessors.find(
          (a) =>
            a.id === m.assessorId ||
            (a as any).assessorId === m.assessorId ||
            (a as any).userId === m.assessorId
        );
        const name =
          matched?.name ||
          m.name ||
          (m.isLead ? "Lead Assessor" : `Panelist ${i + 1}`);
        const avatar =
          (matched as any)?.avatar ||
          (matched as any)?.photoUrl ||
          "/images/facilitator_ngozi.jpg";
        const role = m.isLead || i === 0 ? "Lead Panelist" : "Panel Member";
        const tags = m.sectors?.length
          ? m.sectors.map((s) => s.name)
          : matched?.sectors?.length
            ? matched.sectors.map((s) => s.name)
            : [resolvedTradeName, "RPL Coordinator"];

        return {
          id: m.assessorId || `panelist-${i}`,
          name,
          avatar,
          role,
          tags,
          isHighlighted: i === 1,
        };
      });
    }

    return [];
  }, [interviewPanelFromApi, centreAssessors, resolvedTradeName]);

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

  const handlePanelistSuccess = (panelistData: ScheduledPanelistInfo) => {
    setScheduledPanelistData(panelistData);
    setIsAssignPanelistOpen(false);
  };

  const handleRescheduleSuccess = (rescheduleData: {
    date: string;
    time: string;
    meetingLink?: string;
    location?: string;
    isRescheduled: boolean;
  }) => {
    setIsRescheduledLocally(true);
    setIsRescheduleModalOpen(false);
    if (scheduledPanelistData) {
      setScheduledPanelistData({
        ...scheduledPanelistData,
        date: rescheduleData.date,
        time: rescheduleData.time,
        meetingLink: rescheduleData.meetingLink,
        location: rescheduleData.location,
      });
    }
    toast({
      type: "success",
      title: "Interview Rescheduled",
      description: `Interview has been rescheduled to ${rescheduleData.date} at ${rescheduleData.time}.`,
    });
  };

  const isRescheduled =
    isRescheduledLocally || Boolean((activeInterviewSchedule as any)?.isRescheduled);

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
    if (s === "not started" || s === "not_started") {
      return {
        text: "Not Started",
        className: "bg-gray-100 text-gray-500",
      };
    }
    if (
      s === "approved" ||
      s === "successful" ||
      s === "marked as complete" ||
      s === "completed" ||
      s === "competent" ||
      s === "certified" ||
      s === "submitted"
    ) {
      return {
        text: statusText,
        className: "bg-[#1E7F4C]/10 text-[#1E7F4C]",
      };
    }
    if (
      s === "in progress" ||
      s === "under review" ||
      s === "scheduled" ||
      s === "awaiting interview" ||
      s === "pending review" ||
      s === "awaiting payment" ||
      s === "pending"
    ) {
      return {
        text: statusText,
        className: "bg-[#F9A825]/10 text-[#F9A825]",
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
      className: "bg-gray-100 text-gray-500",
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

  // Stage 4: Interview Stage
  const interviewStatus =
    interviewSchedule?.status === "completed" ||
    activeInterviewSchedule?.status === "completed" ||
    interviewStage?.status === "successful" ||
    isCompleted
      ? "Completed"
      : isInterviewScheduled ||
        interviewSchedule?.status === "scheduled" ||
        activeInterviewSchedule?.status === "scheduled" ||
        interviewStage?.status === "scheduled"
        ? "Scheduled"
        : interviewStage?.status === "in_progress"
          ? "In Progress"
          : "Not Started";

  const interviewDate = activeInterviewSchedule?.scheduledAt
    ? new Date(activeInterviewSchedule.scheduledAt).toLocaleDateString("en-US")
    : interviewSchedule?.scheduledAt
      ? new Date(interviewSchedule.scheduledAt).toLocaleDateString("en-US")
      : interviewStage?.enteredAt && interviewStatus !== "Not Started"
        ? new Date(interviewStage.enteredAt).toLocaleDateString("en-US")
        : interviewStatus === "Completed"
          ? submittedDate
          : "—";

  // Stage 3: Folder Arrangement
  const evidenceStatus =
    evidenceStage?.status === "successful" || isCompleted
      ? "Marked as complete"
      : evidenceStage?.status === "under_review"
        ? "Under Review"
        : evidenceStage?.status === "in_progress"
          ? "In Progress"
          : evidenceStage?.status === "not_started"
            ? "Not Started"
            : "Pending";

  const isAtInterviewStage = Boolean(
    interviewStage?.status === "scheduled" ||
    interviewStage?.status === "in_progress" ||
    interviewStage?.status === "successful" ||
    (appDetail as any)?.currentStageKey === "interview" ||
    (appDetail as any)?.currentStageKey === "direct_observation"
  );

  const evidenceDate = evidenceStage?.enteredAt
    ? new Date(evidenceStage.enteredAt).toLocaleDateString("en-US")
    : evidenceStatus === "Marked as complete"
      ? submittedDate
      : "—";


  // Stage 5: Internal Verifier
  const activeIv =
    appDetail?.internalVerifier ||
    (appDetail as any)?.frozenProfile?.internalVerifier ||
    null;

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
      : ivStage?.status === "not_started"
        ? "Not Started"
        : ivStage?.status === "in_progress" || ivStage?.status === "under_review" || activeIv
          ? "In Progress"
          : "Not Started";

  const ivDate = activeIv?.assignedAt && ivStatus !== "Not Started"
    ? new Date(activeIv.assignedAt).toLocaleDateString("en-US")
    : ivStage?.enteredAt && ivStatus !== "Not Started"
      ? new Date(ivStage.enteredAt).toLocaleDateString("en-US")
      : ivStatus === "Completed"
        ? submittedDate
        : "—";

  // Stage 6: External Verifier
  const activeEv =
    (appDetail as any)?.externalVerifier ||
    (appDetail as any)?.frozenProfile?.externalVerifier ||
    null;

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
      : evStage?.status === "not_started"
        ? "Not Started"
        : evStage?.status === "in_progress" || evStage?.status === "under_review" || activeEv
          ? "In Progress"
          : "Not Started";

  const evDate = activeEv?.assignedAt && evStatus !== "Not Started"
    ? new Date(activeEv.assignedAt).toLocaleDateString("en-US")
    : evStage?.enteredAt && evStatus !== "Not Started"
      ? new Date(evStage.enteredAt).toLocaleDateString("en-US")
      : evStatus === "Completed"
        ? submittedDate
        : "—";

  // Stage 7: Certification
  const certStage = stages.find((s) => s.stageKey === "certification");
  const certStatus =
    isCompleted || certStage?.status === "successful"
      ? "Competent"
      : certStage?.status === "not_started"
        ? "Not Started"
        : certStage?.status === "in_progress"
          ? "In Progress"
          : "Not Started";

  const certDate = certStage?.enteredAt && certStatus !== "Not Started"
    ? new Date(certStage.enteredAt).toLocaleDateString("en-US")
    : certStatus === "Competent"
      ? submittedDate
      : "—";

  if (isLoadingDetail && !appDetail) {
    return (
      <div className="w-full min-h-100 flex items-center justify-center">
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
              activeFacilitator || isAtInterviewStage || isInterviewScheduled || evidenceStatus === "Marked as complete" ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAssignFacilitatorOpen(true)}
                  className="bg-white! text-[#fbab2a]! border border-gray-200! hover:bg-gray-50! font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0 shadow-none!"
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
                {evidenceStatus === "Marked as complete" ? (
                  <span className="bg-[#E6F4EA] text-[#1E7F4C] text-xs font-semibold px-3 py-0.5 rounded-full capitalize">
                    Marked as Complete
                  </span>
                ) : evidenceStatus === "In Progress" ? (
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
              className="bg-white! text-[#fbab2a]! border border-gray-200! hover:bg-gray-50! font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl cursor-pointer shrink-0 shadow-none!"
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
                  {interviewStatus === "Completed" ? (
                    <span className="bg-[#E6F4EA] text-[#1E7F4C] text-xs font-semibold px-3 py-0.5 rounded-full capitalize">
                      Completed
                    </span>
                  ) : isInterviewScheduled ? (
                    <span className="bg-[#FEF3C7] text-[#92400E] text-xs font-semibold px-3 py-0.5 rounded-full capitalize">
                      Awaiting Interview
                    </span>
                  ) : interviewStatus === "In Progress" ? (
                    <span className="bg-[#FEF3C7] text-[#92400E] text-xs font-semibold px-3 py-0.5 rounded-full capitalize">
                      In Progress
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-3 py-0.5 rounded-full capitalize">
                      Not Started
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-xs sm:text-sm font-normal">
                  {interviewStatus === "Completed"
                    ? `Completed on: ${interviewDate}`
                    : isInterviewScheduled && interviewDateFormatted
                      ? `Scheduled for: ${interviewDateFormatted}`
                      : "Not scheduled yet"}
                </p>
              </div>

              {interviewStatus === "Completed" ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-white! text-[#fbab2a]! border border-gray-200! hover:bg-gray-50! font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl cursor-pointer shrink-0 shadow-none!"
                >
                  View
                </Button>
              ) : isInterviewScheduled ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsRescheduleModalOpen(true)}
                  className="bg-white! text-[#fbab2a]! border border-[#fbab2a]! hover:bg-[#FFFBEB]! font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl cursor-pointer shrink-0 shadow-none!"
                >
                  Reschedule Interview
                </Button>
              ) : (
                (() => {
                  const canScheduleInterview = isPaymentPaid;

                  return (
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={!canScheduleInterview}
                        onClick={() => {
                          if (canScheduleInterview) {
                            const hasPanels =
                              (centrePanels && centrePanels.length > 0) ||
                              (centreInterviews && centreInterviews.length > 0);
                            if (!hasPanels) {
                              setIsPromptCreatePanelOpen(true);
                            } else {
                              setIsScheduleInterviewModalOpen(true);
                            }
                          }
                        }}
                        title={
                          !canScheduleInterview
                            ? "Interview cannot be scheduled yet. Candidate payment must be completed before scheduling."
                            : undefined
                        }
                        className={`font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-none! shrink-0 transition-all ${
                          canScheduleInterview
                            ? "bg-[#fbab2a]! hover:bg-[#e89b1f]! text-white! cursor-pointer"
                            : "bg-gray-200! text-gray-400! border-gray-200! cursor-not-allowed opacity-60 pointer-events-auto"
                        }`}
                      >
                        Schedule Interview
                      </Button>
                      {!canScheduleInterview && (
                        <span className="text-[10px] text-gray-400 font-medium">
                          Requires completed payment
                        </span>
                      )}
                    </div>
                  );
                })()
              )}
            </div>

            {/* When Scheduled, Render YOUR ASSESORS (Image 1) */}
            {isInterviewScheduled && (
              <div className="mt-2 pt-3 border-t border-gray-100">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-3">
                  YOUR ASSESORS
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {interviewAssessorsList.slice(0, 3).map((assessor, idx) => {
                    const isMiddleOrHighlighted = idx === 1 || assessor.isHighlighted;
                    return (
                      <div
                        key={assessor.id || idx}
                        className={`bg-white rounded-2xl p-4 flex items-center gap-3.5 border transition-all ${
                          isMiddleOrHighlighted
                            ? "border-2 border-[#FBAB2A] shadow-xs"
                            : "border-gray-100 shadow-2xs"
                        }`}
                      >
                        <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-gray-100 bg-gray-50">
                          <img
                            src={assessor.avatar || "/images/facilitator_ngozi.jpg"}
                            alt={assessor.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex flex-col min-w-0">
                          <h4 className="text-black font-bold text-sm leading-snug truncate">
                            {assessor.name}
                          </h4>
                          <p className="text-gray-400 text-xs font-normal truncate mt-0.5">
                            {assessor.role || (idx === 0 ? "Lead Panelist" : "Panel Member")}
                          </p>

                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            {(assessor.tags || [resolvedTradeName, "RPL Coordinator"]).map((tag: string) => (
                              <span
                                key={tag}
                                className="bg-[#FDF2F4] text-[#A31D38] text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Stage 5: Internal Verifier */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-2xs flex items-center justify-between gap-4">
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
                {activeIv
                  ? `Assigned to: ${activeIv.name || "Assigned IV"}`
                  : ivStatus === "In Progress"
                    ? "Under review by Internal Verifier"
                    : ivStatus === "Completed"
                      ? "Internal verification completed"
                      : "---"}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-gray-400 font-bold text-sm hidden sm:inline">
                {ivDate}
              </span>
              {!activeIv && ivStatus !== "Not Started" && ivStatus !== "Completed" && (
                <Button
                  type="button"
                  variant="amber"
                  size="sm"
                  onClick={() => {
                    setActiveVerifierType("internal");
                    setIsAssignVerifierOpen(true);
                  }}
                  className="cursor-pointer text-xs"
                >
                  Assign IV
                </Button>
              )}
              {activeIv && ivStatus !== "Not Started" && ivStatus !== "Completed" && (
                <Button
                  type="button"
                  variant="amber"
                  size="sm"
                  onClick={() => {
                    setActiveVerifierType("internal");
                    setIsReviewVerifierOpen(true);
                  }}
                  className="cursor-pointer text-xs"
                >
                  Mark Competent
                </Button>
              )}
            </div>
          </div>

          {/* Stage 6: External Verifier */}
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
                {activeEv
                  ? `Assigned to: ${activeEv.name || "Assigned EV"}`
                  : evStatus === "In Progress"
                    ? "Under review by External Verifier"
                    : evStatus === "Completed"
                      ? "External verification completed"
                      : "---"}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-gray-400 font-bold text-sm hidden sm:inline">
                {evDate}
              </span>
              {!activeEv && evStatus !== "Not Started" && evStatus !== "Completed" && (
                <Button
                  type="button"
                  variant="amber"
                  size="sm"
                  onClick={() => {
                    setActiveVerifierType("external");
                    setIsAssignVerifierOpen(true);
                  }}
                  className="cursor-pointer text-xs"
                >
                  Assign EV
                </Button>
              )}
              {activeEv && evStatus !== "Not Started" && evStatus !== "Completed" && (
                <Button
                  type="button"
                  variant="amber"
                  size="sm"
                  onClick={() => {
                    setActiveVerifierType("external");
                    setIsReviewVerifierOpen(true);
                  }}
                  className="cursor-pointer text-xs"
                >
                  Mark Competent
                </Button>
              )}
            </div>
          </div>

          {/* Stage 7: Certification */}
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
                {certStatus === "Competent"
                  ? "All requirements completed. Candidate qualification certified."
                  : certStatus === "In Progress"
                    ? "Certification pending awarding body signoff"
                    : "---"}
              </p>
            </div>
            <span className="text-gray-400 font-bold text-sm shrink-0">
              {certDate}
            </span>
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
              {daysInMonth.map((day) => {
                const targetDayNumber = activeInterviewSchedule?.scheduledAt
                  ? new Date(activeInterviewSchedule.scheduledAt).getDate()
                  : null;
                const isCircled =
                  isInterviewScheduled &&
                  targetDayNumber !== null &&
                  day === targetDayNumber;

                return (
                  <span
                    key={day}
                    className={`w-6.5 h-6.5 mx-auto rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                      isCircled
                        ? "border-2 border-[#fbab2a] text-white font-bold"
                        : "hover:bg-white/15 text-gray-300"
                    }`}
                  >
                    {day}
                  </span>
                );
              })}
            </div>
          </div>

          <UpcomingCard
            interview={
              isInterviewScheduled && activeInterviewSchedule?.scheduledAt
                ? {
                    title: "Panel Interview",
                    date: interviewEventDateFormatted,
                    time: interviewTimeFormatted,
                    mode: activeInterviewSchedule.mode,
                    liveUrl: activeInterviewSchedule.link,
                    location: activeInterviewSchedule.location || "Cstemp Centre",
                    isRescheduled,
                  }
                : null
            }
          />

          {!isAtInterviewStage && (
            activeFacilitator ? (
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs flex flex-col gap-4 select-text">
                <h3 className="text-base font-extrabold text-black tracking-tight">
                  Facilitator
                </h3>
                <div className="flex items-center gap-3.5">
                  <Avatar
                    src={activeFacilitator.avatar}
                    name={activeFacilitator.name}
                    className="w-13 h-13 border border-gray-200 shrink-0"
                    alt={activeFacilitator.name}
                  />
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
            )
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

      <AssignPanelistModal
        isOpen={isAssignPanelistOpen}
        onClose={() => setIsAssignPanelistOpen(false)}
        applicationId={id}
        tradeName={
          (appDetail as any)?.trade?.name ||
          (typeof (appDetail as any)?.trade === "string"
            ? (appDetail as any)?.trade
            : "Carpentry")
        }
        initialSchedule={activeInterviewSchedule}
        initialPanel={interviewPanelFromApi}
        onSuccess={handlePanelistSuccess}
      />

      <RescheduleInterviewModal
        isOpen={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        applicationId={id}
        currentDate={
          activeInterviewSchedule?.scheduledAt
            ? new Date(activeInterviewSchedule.scheduledAt).toISOString().split("T")[0]
            : ""
        }
        currentTime={interviewTimeFormatted}
        currentMeetingLink={activeInterviewSchedule?.link || "www.meet.google.com"}
        currentLocation={activeInterviewSchedule?.location || "Cstemp Centre"}
        currentMode={activeInterviewSchedule?.mode === "online" ? "virtual" : "physical"}
        onSuccess={handleRescheduleSuccess}
      />

      <AssignVerifierModal
        isOpen={isAssignVerifierOpen}
        onClose={() => setIsAssignVerifierOpen(false)}
        applicationId={id}
        verifierType={activeVerifierType}
        tradeName={resolvedTradeName}
      />

      <ReviewVerifierModal
        isOpen={isReviewVerifierOpen}
        onClose={() => setIsReviewVerifierOpen(false)}
        applicationId={id}
        verifierType={activeVerifierType}
        verifierName={
          activeVerifierType === "internal"
            ? activeIv?.name || "Internal Verifier"
            : activeEv?.name || "External Verifier"
        }
      />

      <PromptCreatePanelModal
        isOpen={isPromptCreatePanelOpen}
        onClose={() => setIsPromptCreatePanelOpen(false)}
        onCreatePanel={() => {
          setIsPromptCreatePanelOpen(false);
          setIsCreatePanelModalOpen(true);
        }}
      />

      <CreatePanelModal
        isOpen={isCreatePanelModalOpen}
        onClose={() => setIsCreatePanelModalOpen(false)}
        onSuccess={() => {
          setIsCreatePanelModalOpen(false);
          setIsScheduleInterviewModalOpen(true);
        }}
      />

      <ScheduleInterviewModal
        isOpen={isScheduleInterviewModalOpen}
        onClose={() => setIsScheduleInterviewModalOpen(false)}
        initialApplicationId={id}
        initialCandidateName={candidateName}
        initialTradeName={resolvedTradeName}
        onSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: ["applications", "interview-schedule", id],
          });
          queryClient.invalidateQueries({
            queryKey: ["applications", "interview-panel", id],
          });
          queryClient.invalidateQueries({
            queryKey: ["applications", "stages", id],
          });
          queryClient.invalidateQueries({
            queryKey: ["centre", "applications", "detail", id],
          });
          queryClient.invalidateQueries({
            queryKey: ["applications", id],
          });
          queryClient.invalidateQueries({
            queryKey: ["applications"],
          });
          setIsScheduleInterviewModalOpen(false);
        }}
      />
    </div>
  );
};
