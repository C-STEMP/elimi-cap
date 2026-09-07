"use client";

import React, { useState, useMemo } from "react";
import { useToast } from "@/src/components/ui/toast";
import {
  useGetApplicationById,
  useGetApplicationStages,
  useGetApplicationHistory,
  useGetInterviewSchedule,
  useGetInterviewPanel,
} from "@/src/features/shared/applications/hooks";
import {
  useGetCentreAssessors,
  useGetCentrePanels,
  useGetCentreInterviews,
} from "@/src/features/shared/centre/hooks";
import { ScheduledPanelistInfo } from "../components/AssignPanelistModal";
import { computeStageCalculations } from "../utils/detailHelpers";

export function useApplicationDetailState(id: string, candidateNameProp = "Candidate") {
  const { toast } = useToast();

  const { data: appDetail, isLoading: isLoadingDetail } = useGetApplicationById(id);
  const { data: stages = [] } = useGetApplicationStages(id);

  const isInterviewStage = Boolean(
    appDetail?.currentStageKey === "interview" ||
    (appDetail as any)?.interviewScheduled ||
    stages.some(
      (s) =>
        (s.stageKey === "interview" ||
          s.stageKey === "observation" ||
          s.stageKey === "direct_observation") &&
        s.status !== "not_started"
    ) ||
    (appDetail?.status &&
      ["interview_scheduled", "interview_completed", "certification"].includes(
        appDetail.status
      ))
  );

  const { data: interviewSchedule } = useGetInterviewSchedule(id, {
    enabled: Boolean(id && isInterviewStage),
  });
  const { data: appHistory = [] } = useGetApplicationHistory(id);
  const { data: interviewPanelFromApi } = useGetInterviewPanel(id, {
    enabled: Boolean(id && isInterviewStage),
  });
  const { data: centreAssessors = [] } = useGetCentreAssessors({ status: "all" });
  const { data: centrePanels = [] } = useGetCentrePanels();
  const { data: centreInterviews = [] } = useGetCentreInterviews();

  // Modals
  const [isAssignFacilitatorOpen, setIsAssignFacilitatorOpen] = useState(false);
  const [assignedFacilitator, setAssignedFacilitator] = useState<{ id: string; name: string; avatar?: string; trade?: string } | null>(null);
  const [isAssignPanelistOpen, setIsAssignPanelistOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isRescheduledLocally, setIsRescheduledLocally] = useState(false);
  const [scheduledPanelistData, setScheduledPanelistData] = useState<ScheduledPanelistInfo | null>(null);
  const [isAssignVerifierOpen, setIsAssignVerifierOpen] = useState(false);
  const [isReviewVerifierOpen, setIsReviewVerifierOpen] = useState(false);
  const [activeVerifierType, setActiveVerifierType] = useState<"internal" | "external">("internal");
  const [isPromptCreatePanelOpen, setIsPromptCreatePanelOpen] = useState(false);
  const [isScheduleInterviewModalOpen, setIsScheduleInterviewModalOpen] = useState(false);
  const [isCreatePanelModalOpen, setIsCreatePanelModalOpen] = useState(false);

  // Calendar
  const [currentMonth, setCurrentMonth] = useState("July");
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  const handlePrevMonth = () => setCurrentMonth(months[(months.indexOf(currentMonth) - 1 + 12) % 12]);
  const handleNextMonth = () => setCurrentMonth(months[(months.indexOf(currentMonth) + 1) % 12]);

  const rawTrade =
    (appDetail as any)?.trade?.name ||
    (typeof (appDetail as any)?.trade === "string" && !/^[0-9a-f-]{20,}$/i.test((appDetail as any).trade) ? (appDetail as any).trade : "") ||
    (appDetail as any)?.sector?.name ||
    "Cosmetology";
  const resolvedTradeName = rawTrade && !/^[0-9a-f-]{20,}$/i.test(rawTrade) ? rawTrade : "Cosmetology";

  const rawApiSchedule = (interviewSchedule as any)?.data || interviewSchedule;
  const activeInterviewSchedule = rawApiSchedule?.scheduledAt ? rawApiSchedule : null;

  const interviewAssessorsList = useMemo(() => {
    if (interviewPanelFromApi?.members && interviewPanelFromApi.members.length > 0) {
      const nonObserver = interviewPanelFromApi.members.filter((m) => !m.isObserver);
      const membersToUse = nonObserver.length >= 3 ? nonObserver.slice(0, 3) : interviewPanelFromApi.members.slice(0, 3);
      return membersToUse.map((m, i) => {
        const matched = centreAssessors.find((a) => a.id === m.assessorId || (a as any).assessorId === m.assessorId || (a as any).userId === m.assessorId);
        return {
          id: m.assessorId || `panelist-${i}`,
          name: matched?.name || m.name || (m.isLead ? "Lead Assessor" : `Panelist ${i + 1}`),
          avatar: (matched as any)?.photo?.url || (matched as any)?.avatar || (matched as any)?.photoUrl || undefined,
          role: m.isLead || i === 0 ? "Lead Panelist" : "Panel Member",
          tags: m.sectors?.length ? m.sectors.map((s) => s.name) : matched?.sectors?.length ? matched.sectors.map((s) => s.name) : [resolvedTradeName, "RPL Coordinator"],
          isHighlighted: i === 1,
        };
      });
    }
    return [];
  }, [interviewPanelFromApi, centreAssessors, resolvedTradeName]);

  const resolvedCandidateName =
    appDetail?.candidate?.name ||
    `${appDetail?.personalInformation?.personalDetails?.firstName || ""} ${appDetail?.personalInformation?.personalDetails?.lastName || ""}`.trim() ||
    candidateNameProp;

  const submittedDate = appDetail?.submittedAt
    ? new Date(appDetail.submittedAt).toLocaleDateString("en-US")
    : appDetail?.createdAt
      ? new Date(appDetail.createdAt).toLocaleDateString("en-US")
      : "Pending";

  const stageCalculations = useMemo(
    () => computeStageCalculations(stages, appDetail, interviewSchedule, activeInterviewSchedule, submittedDate),
    [stages, appDetail, interviewSchedule, activeInterviewSchedule, submittedDate]
  );

  const interviewDateFormatted = activeInterviewSchedule?.scheduledAt
    ? new Date(activeInterviewSchedule.scheduledAt).toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" })
    : "";
  const interviewTimeFormatted = activeInterviewSchedule?.scheduledAt
    ? new Date(activeInterviewSchedule.scheduledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
    : "";
  const interviewEventDateFormatted = activeInterviewSchedule?.scheduledAt
    ? new Date(activeInterviewSchedule.scheduledAt).toLocaleDateString("en-GB")
    : "";

  const activeFacilitator = assignedFacilitator || (appDetail as any)?.facilitator || (appDetail as any)?.assessor || null;

  const handleOpenScheduleModal = () => {
    const hasPanels = (centrePanels && centrePanels.length > 0) || (centreInterviews && centreInterviews.length > 0);
    if (!hasPanels) setIsPromptCreatePanelOpen(true);
    else setIsScheduleInterviewModalOpen(true);
  };

  const handleFacilitatorSuccess = (facilitator: { id: string; name: string }) => {
    setAssignedFacilitator(facilitator);
    setIsAssignFacilitatorOpen(false);
    toast({ type: "success", title: "Facilitator Assigned", description: `${facilitator.name} has been assigned.` });
  };

  const handlePanelistSuccess = (panelistData: ScheduledPanelistInfo) => {
    setScheduledPanelistData(panelistData);
    setIsAssignPanelistOpen(false);
  };

  const handleRescheduleSuccess = (rescheduleData: any) => {
    setIsRescheduledLocally(true);
    setIsRescheduleModalOpen(false);
    toast({ type: "success", title: "Interview Rescheduled", description: `Rescheduled to ${rescheduleData.date} at ${rescheduleData.time}.` });
  };

  return {
    appDetail,
    stages,
    appHistory,
    interviewSchedule,
    interviewPanelFromApi,
    isLoadingDetail,
    resolvedTradeName,
    resolvedCandidateName,
    candidatePhotoUrl:
      appDetail?.candidate?.photo?.url ||
      (appDetail as any)?.candidate?.photoAssetId ||
      (appDetail as any)?.personalInformation?.personalDetails?.photoUrl ||
      (appDetail as any)?.candidate?.avatar ||
      null,
    submittedDate,
    interviewAssessorsList,
    activeInterviewSchedule,
    isRescheduled: isRescheduledLocally || Boolean((activeInterviewSchedule as any)?.isRescheduled),
    interviewDateFormatted,
    interviewTimeFormatted,
    interviewEventDateFormatted,
    activeFacilitator,
    ...stageCalculations,
    currentMonth,
    daysOfWeek,
    daysInMonth,
    handlePrevMonth,
    handleNextMonth,
    scheduledPanelistData,
    isAssignFacilitatorOpen,
    setIsAssignFacilitatorOpen,
    isAssignPanelistOpen,
    setIsAssignPanelistOpen,
    isRescheduleModalOpen,
    setIsRescheduleModalOpen,
    isAssignVerifierOpen,
    setIsAssignVerifierOpen,
    isReviewVerifierOpen,
    setIsReviewVerifierOpen,
    activeVerifierType,
    setActiveVerifierType,
    isPromptCreatePanelOpen,
    setIsPromptCreatePanelOpen,
    isScheduleInterviewModalOpen,
    setIsScheduleInterviewModalOpen,
    isCreatePanelModalOpen,
    setIsCreatePanelModalOpen,
    handleOpenScheduleModal,
    handleFacilitatorSuccess,
    handlePanelistSuccess,
    handleRescheduleSuccess,
  };
}
