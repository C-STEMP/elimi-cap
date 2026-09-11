"use client";

import React from "react";
import { AssessorApplicationStageCard } from "./AssessorApplicationStageCard";
import type {
  ApplicationStageItem,
  AssessorApplicationRecord,
} from "../../types/applications.types";

import { ASSETS_URL } from "@/src/assets";
import { Avatar } from "@/src/components/ui/avatar";
import {
  useGetInterviewPanel,
  useGetApplicationStages,
} from "@/src/features/shared/applications/hooks";
import type { AssessorPanelMember } from "../../types/applications.types";

interface AssessorApplicationStagesListProps {
  application: AssessorApplicationRecord;
  onViewApplicationForm: () => void;
  onOpenEvidenceVault?: () => void;
  onMarkCompetent?: () => void;
  onMarkEvCompetent?: () => void;
  onMarkCandidateCompetent?: () => void;
  onMarkCandidateIncompetent?: () => void;
  onMarkCandidateInconclusive?: () => void;
  onScheduleObservation?: () => void;
  interviewOutcome?:
    | "ongoing"
    | "competent"
    | "incompetent"
    | "inconclusive"
    | "awaiting_signature";
  interviewFeedback?: {
    title?: string;
    reason: string;
    recommendation: string;
  } | null;
}

export const AssessorApplicationStagesList: React.FC<
  AssessorApplicationStagesListProps
> = ({
  application,
  onViewApplicationForm,
  onOpenEvidenceVault,
  onMarkCompetent,
  onMarkEvCompetent,
  onMarkCandidateCompetent,
  onMarkCandidateIncompetent,
  onMarkCandidateInconclusive,
  onScheduleObservation,
  interviewOutcome = "ongoing",
  interviewFeedback,
}) => {
  const { data: stagesData } = useGetApplicationStages(application.id);
  const isInterviewStage = Boolean(
    application.currentStageKey === "interview" ||
    (application as any).stage === "interview" ||
    stagesData?.some(
      (s) =>
        (s.stageKey === "interview" || s.stageKey === "direct_observation") &&
        (s.status === "scheduled" || s.status === "in_progress" || s.status === "successful")
    )
  );
  const { data: panelData } = useGetInterviewPanel(application.id, { enabled: isInterviewStage });

  const panelMembers: AssessorPanelMember[] = React.useMemo(() => {
    if (!panelData?.members || !Array.isArray(panelData.members)) return [];
    const sorted = [...panelData.members].sort((a, b) => {
      if (a.isLead) return -1;
      if (b.isLead) return 1;
      if (a.isObserver) return 1;
      if (b.isObserver) return -1;
      return 0;
    });

    return sorted.map((m, idx) => {
      const role = m.isLead
        ? "Lead Panelist"
        : m.isObserver
        ? "Internal Verifier"
        : "Panel Member";
      const name =
        m.name ||
        (m.isLead
          ? "Lead Assessor"
          : m.isObserver
          ? "Internal Verifier"
          : `Panel Member ${idx + 1}`);
      const avatar =
        (m as any)?.photo?.url ||
        (m as any)?.avatar ||
        (m as any)?.photoUrl ||
        undefined;
      const tags = m.sectors?.length
        ? m.sectors.map((s: any) => s.name || s)
        : [application.trade || "Carpentry", "RPL Coordinator"];
      return {
        id: m.assessorId,
        name,
        role,
        avatar,
        tags,
        isHighlighted: Boolean(m.isLead),
      };
    });
  }, [panelData, application.trade]);

  const isCompleted = application.status === "Completed";
  const folderStageRow = stagesData?.find(
    (s) =>
      s.stageKey === "folder_arrangement" ||
      s.stageKey === "evidence_vault" ||
      s.stageKey === "evidence",
  );
  const isFolderDone = Boolean(
    folderStageRow?.status === "successful" ||
    (folderStageRow?.status as string) === "completed" ||
    stagesData?.some(
      (s) =>
        (s.stageKey === "interview" || s.stageKey === "direct_observation") &&
        (s.status === "scheduled" || s.status === "in_progress" || s.status === "successful")
    ) ||
    isCompleted,
  );

  const interviewStageRow = stagesData?.find(
    (s) =>
      s.stageKey === "interview" ||
      s.stageKey === "direct_observation" ||
      s.stageKey === "observation",
  );
  const isInterviewDone = Boolean(
    (interviewStageRow?.status === "successful" || interviewOutcome === "competent") &&
    interviewOutcome !== "awaiting_signature" &&
    interviewOutcome !== "incompetent" &&
    interviewOutcome !== "inconclusive"
  );

  const ivStageRow = stagesData?.find(
    (s) =>
      s.stageKey === "internal_verification" ||
      s.stageKey === "internal_verifier" ||
      s.stageKey === "iv_review" ||
      s.stageKey === "iv",
  );
  const isIvDone = Boolean(
    ivStageRow?.status === "successful" ||
    (ivStageRow?.status as string) === "completed" ||
    (isCompleted && (!stagesData || stagesData.length === 0 || stagesData.every((s) => s.status === "successful" || (s.status as string) === "completed")))
  );

  const evStageRow = stagesData?.find(
    (s) =>
      s.stageKey === "external_verification" ||
      s.stageKey === "external_verifier" ||
      s.stageKey === "eqa" ||
      s.stageKey === "ev",
  );
  const isEvDone = Boolean(
    evStageRow?.status === "successful" ||
    (evStageRow?.status as string) === "completed" ||
    (isCompleted && (!stagesData || stagesData.length === 0 || stagesData.every((s) => s.status === "successful" || (s.status as string) === "completed")))
  );

  const isUserIv = application.role === "Internal Verifier";
  const isUserEv = application.role === "External Verifier";
  const isIvActive = isInterviewDone || isUserIv;
  const isEvActive = isIvDone || isUserEv;

  const currentInterviewStatus = isInterviewDone
    ? "Competent"
    : interviewOutcome === "incompetent"
      ? "Incompetent"
      : interviewOutcome === "inconclusive"
        ? "Inconclusive"
        : interviewOutcome === "awaiting_signature"
          ? "Awaiting Signature"
          : "Ongoing";

  const currentInterviewBadgeType = isInterviewDone
    ? "competent"
    : interviewOutcome === "incompetent"
      ? "incompetent"
      : interviewOutcome === "inconclusive"
        ? "inconclusive"
        : interviewOutcome === "awaiting_signature"
          ? "awaiting_signature"
          : "ongoing";

  const formatFriendlyDate = (dateStr?: string | null): string => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-GB");
    } catch {
      return dateStr || "";
    }
  };

  const appFormStageRow = stagesData?.find(
    (s) =>
      s.stageKey === "application_form" ||
      s.stageKey === "application_review" ||
      s.stageKey === "application",
  );
  const paymentStageRow = stagesData?.find(
    (s) => s.stageKey === "payment" || s.stageKey === "payment_quote",
  );

  const rawApprovedDate =
    appFormStageRow?.enteredAt ||
    (appFormStageRow as any)?.updatedAt ||
    application.submittedAt ||
    (application as any).createdAt;
  const formattedApprovedDate = formatFriendlyDate(rawApprovedDate);

  const rawPaidDate =
    paymentStageRow?.enteredAt ||
    (paymentStageRow as any)?.updatedAt ||
    application.submittedAt ||
    (application as any).createdAt;
  const formattedPaidDate = formatFriendlyDate(rawPaidDate);

  const stages: ApplicationStageItem[] = [
    {
      id: "application_form",
      title: "Application Form",
      status: "Approved",
      badgeType: "approved",
      badgeText: "Approved",
      dateText: formattedApprovedDate
        ? `Approved on: ${formattedApprovedDate}`
        : "—",
      actionButton: {
        label: "View",
        variant: "view",
        onClick: onViewApplicationForm,
      },
    },
    {
      id: "payment",
      title: "Payment",
      status: "Successful",
      badgeType: "successful",
      badgeText: "Successful",
      dateText: formattedPaidDate
        ? `Paid on: ${formattedPaidDate}`
        : "—",
    },
    {
      id: "folder_arrangement",
      title: "Folder Arrangement",
      status: isFolderDone ? "Marked as complete" : "In Progress",
      badgeType: isFolderDone ? "completed" : "ongoing",
      badgeText: isFolderDone ? "Marked as complete" : "In Progress",
      dateText: application.assignedAt
        ? `Started on: ${formatFriendlyDate(application.assignedAt)}`
        : folderStageRow?.enteredAt
          ? `Started on: ${formatFriendlyDate(folderStageRow.enteredAt)}`
          : "—",
      actionButton: {
        label: "Evidence Vault",
        variant: "evidence_vault",
        onClick: onOpenEvidenceVault,
      },
    },
    {
      id: "interview_stage",
      title: "Interview Stage",
      status: currentInterviewStatus,
      badgeType: currentInterviewBadgeType,
      badgeText: currentInterviewStatus,
      dateText: "—",
      isCollapsible: false,
      isCollapsed: false,
      assessors: panelMembers,
      inconclusiveDetails: interviewFeedback || undefined,
      menuActions: isInterviewDone ? [] : [
        {
          label: "Competent",
          onClick: onMarkCandidateCompetent || (() => {}),
        },
        {
          label: "Incompetent",
          onClick: onMarkCandidateIncompetent || (() => {}),
        },
        {
          label: "Inconclusive",
          onClick: onMarkCandidateInconclusive || (() => {}),
        },
        {
          label: "Schedule Observation",
          onClick: onScheduleObservation || (() => {}),
        },
      ],
    },
    {
      id: "internal_verifier",
      title: "Internal Verifier",
      status: isIvDone ? "Completed" : isIvActive ? "Under Review" : "Not Started",
      badgeType: isIvDone ? "completed" : isIvActive ? "under_review" : "not_started",
      badgeText: isIvDone ? "Completed" : isIvActive ? "Under Review" : "Not Started",
      dateText: isIvDone
        ? (ivStageRow?.enteredAt ? `Completed on: ${formatFriendlyDate(ivStageRow.enteredAt)}` : `Started on: ${formatFriendlyDate(application.submittedAt || "2026-07-23")}`)
        : isIvActive
          ? `Started on: ${formatFriendlyDate(application.submittedAt || "2026-07-23")}`
          : "---",
      actionButton:
        !isIvDone && isUserIv && onMarkCompetent
          ? {
              label: "Mark as Competent",
              variant: "amber",
              onClick: onMarkCompetent,
            }
          : undefined,
    },
    {
      id: "external_verifier",
      title: "External Verifier",
      status: isEvDone ? "Completed" : (isEvActive && isIvDone) ? "Under Review" : "Not Started",
      badgeType: isEvDone ? "completed" : (isEvActive && isIvDone) ? "under_review" : "not_started",
      badgeText: isEvDone ? "Completed" : (isEvActive && isIvDone) ? "Under Review" : "Not Started",
      dateText: isEvDone
        ? (evStageRow?.enteredAt ? `Completed on: ${formatFriendlyDate(evStageRow.enteredAt)}` : `Started on: ${formatFriendlyDate(application.submittedAt || "2026-08-15")}`)
        : (isEvActive && isIvDone)
          ? `Started on: ${formatFriendlyDate(application.submittedAt || "2026-08-15")}`
          : "---",
      actionButton:
        !isEvDone && isUserEv && isIvDone && onMarkEvCompetent
          ? {
              label: "Mark as Competent",
              variant: "amber",
              onClick: onMarkEvCompetent,
            }
          : undefined,
    },
    {
      id: "certification",
      title: "Certification",
      status: isCompleted ? "Competent" : isEvDone ? "Under Review" : "Not Started",
      badgeType: isCompleted ? "competent" : isEvDone ? "under_review" : "not_started",
      badgeText: isCompleted ? "Competent" : isEvDone ? "Under Review" : "Not Started",
      dateText: isCompleted ? (application.submittedAt ? `Completed on: ${formatFriendlyDate(application.submittedAt)}` : "—") : "---",
    },
  ];

  return (
    <div className="flex flex-col gap-4 w-full">
      {stages.map((stage) => (
        <AssessorApplicationStageCard
          key={stage.id}
          stage={stage}
          onViewApplicationForm={onViewApplicationForm}
          onOpenEvidenceVault={onOpenEvidenceVault}
        />
      ))}
    </div>
  );
};
