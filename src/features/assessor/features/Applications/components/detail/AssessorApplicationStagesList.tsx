"use client";

import React from "react";
import { AssessorApplicationStageCard } from "./AssessorApplicationStageCard";
import type {
  ApplicationStageItem,
  AssessorApplicationRecord,
  ApplicationStageFormToSign,
} from "../../types/applications.types";

import { ASSETS_URL } from "@/src/assets";
import {
  useGetInterviewPanel,
  useGetApplicationStages,
} from "@/src/features/shared/applications/hooks";
import { useGetCentreAssessors } from "@/src/features/shared/centre/hooks";
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
  onAppendSignature?: (formId: string) => void;
  formsToSign?: ApplicationStageFormToSign[];
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
  onAppendSignature,
  formsToSign,
  interviewOutcome = "ongoing",
  interviewFeedback,
}) => {
  const { data: panelData } = useGetInterviewPanel(application.id);
  const { data: stagesData } = useGetApplicationStages(application.id);
  const { data: centreAssessors = [] } = useGetCentreAssessors({ status: "all" });

  const panelMembers: AssessorPanelMember[] = React.useMemo(() => {
    if (!panelData?.members || !Array.isArray(panelData.members)) return [];
    return panelData.members.map((m, idx) => {
      const match = centreAssessors.find(
        (a) =>
          a.id === m.assessorId ||
          (a as any).assessorId === m.assessorId ||
          (a as any).userId === m.assessorId,
      );
      const name =
        match?.name ||
        m.name ||
        (idx === 0 ? "Lead Assessor" : `Panelist ${idx + 1}`);
      const avatar =
        (match as any)?.avatar ||
        (match as any)?.photoUrl ||
        ASSETS_URL.userAvatar;
      const tags = m.sectors?.length
        ? m.sectors.map((s) => s.name)
        : match?.sectors?.length
          ? match.sectors.map((s) => s.name)
          : [application.trade || "Carpentry", "RPL Coordinator"];
      return {
        id: m.assessorId,
        name,
        role: idx === 0 ? "Lead Panelist" : "Panel Member",
        avatar,
        tags,
        isHighlighted: idx === 1,
      };
    });
  }, [panelData, centreAssessors, application.trade]);

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
    interviewStageRow?.status === "successful" ||
    interviewOutcome === "competent" ||
    isCompleted,
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
    isCompleted,
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
    isCompleted,
  );

  const isInternalVerifierRole =
    application.role === "Internal Verifier" || isInterviewDone || isCompleted;

  const isExternalVerifierRole =
    application.role === "External Verifier" || isIvDone || isCompleted;

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

  const stages: ApplicationStageItem[] = [
    {
      id: "application_form",
      title: "Application Form",
      status: "Approved",
      badgeType: "approved",
      badgeText: "Approved",
      dateText: application.submittedAt
        ? `Submitted on: ${application.submittedAt}`
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
      dateText: application.submittedAt
        ? `Paid on: ${application.submittedAt}`
        : "—",
    },
    {
      id: "folder_arrangement",
      title: "Folder Arrangement",
      status: isFolderDone ? "Marked as complete" : "In Progress",
      badgeType: isFolderDone ? "completed" : "ongoing",
      badgeText: isFolderDone ? "Marked as complete" : "In Progress",
      dateText: application.assignedAt
        ? `Started on: ${application.assignedAt}`
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
      formsToSign: interviewOutcome === "awaiting_signature" ? formsToSign : undefined,
      onAppendSignature: onAppendSignature,
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
      status: isIvDone ? "Completed" : isInternalVerifierRole ? "Under Review" : "Not Started",
      badgeType: isIvDone ? "completed" : isInternalVerifierRole ? "under_review" : "not_started",
      badgeText: isIvDone ? "Completed" : isInternalVerifierRole ? "Under Review" : "Not Started",
      dateText: isIvDone
        ? (ivStageRow?.enteredAt ? `Completed on: ${new Date(ivStageRow.enteredAt).toLocaleDateString()}` : `Started on: ${application.submittedAt || "7/23/2026"}`)
        : isInternalVerifierRole
          ? `Started on: ${application.submittedAt || "7/23/2026"}`
          : "---",
      actionButton:
        !isIvDone && (application.role === "Internal Verifier" || isInternalVerifierRole) && onMarkCompetent
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
      status: isEvDone ? "Completed" : (isExternalVerifierRole && isIvDone) ? "Under Review" : "Not Started",
      badgeType: isEvDone ? "completed" : (isExternalVerifierRole && isIvDone) ? "under_review" : "not_started",
      badgeText: isEvDone ? "Completed" : (isExternalVerifierRole && isIvDone) ? "Under Review" : "Not Started",
      dateText: isEvDone
        ? (evStageRow?.enteredAt ? `Completed on: ${new Date(evStageRow.enteredAt).toLocaleDateString()}` : `Started on: ${application.submittedAt || "8/15/2026"}`)
        : (isExternalVerifierRole && isIvDone)
          ? `Started on: ${application.submittedAt || "8/15/2026"}`
          : "---",
      actionButton:
        !isEvDone && (application.role === "External Verifier" || isExternalVerifierRole) && isIvDone && onMarkEvCompetent
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
      status: isCompleted || isEvDone ? "Competent" : "Not Started",
      badgeType: isCompleted || isEvDone ? "competent" : "not_started",
      badgeText: isCompleted || isEvDone ? "Competent" : "Not Started",
      dateText: isCompleted || isEvDone ? (application.submittedAt ? `Completed on: ${application.submittedAt}` : "—") : "---",
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
