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
import type { AssessorPanelMember } from "../../types/applications.types";

interface AssessorApplicationStagesListProps {
  application: AssessorApplicationRecord;
  onViewApplicationForm: () => void;
  onOpenEvidenceVault?: () => void;
  onMarkCompetent?: () => void;
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

  const panelMembers: AssessorPanelMember[] = React.useMemo(() => {
    if (!panelData?.members || !Array.isArray(panelData.members)) return [];
    return panelData.members.map((m) => ({
      id: m.assessorId,
      name: m.name || "Assessor",
      role: m.isLead
        ? "Lead Panelist"
        : m.isObserver
          ? "Observer / IV"
          : "Panel Member",
      avatar: ASSETS_URL.userAvatar,
      tags: (m.sectors || []).map((s) => s.name),
      isHighlighted: Boolean(m.isLead),
    }));
  }, [panelData]);

  const isCompleted = application.status === "Completed";
  const isInternalVerifierRole =
    application.role === "Internal Verifier" || isCompleted;

  const currentInterviewStatus =
    interviewOutcome === "competent" || isCompleted
      ? "Competent"
      : interviewOutcome === "incompetent"
        ? "Incompetent"
        : interviewOutcome === "inconclusive"
          ? "Inconclusive"
          : interviewOutcome === "awaiting_signature"
            ? "Awaiting Signature"
            : "Ongoing";

  const currentInterviewBadgeType =
    interviewOutcome === "competent" || isCompleted
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
      status: isCompleted ? "Complete" : "In Progress",
      badgeType: isCompleted ? "completed" : "ongoing",
      badgeText: isCompleted ? "Complete" : "In Progress",
      dateText: application.assignedAt
        ? `Assigned on: ${application.assignedAt}`
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
      menuActions: [
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
      status: isInternalVerifierRole ? "Under Review" : "Not Started",
      badgeType: isInternalVerifierRole ? "under_review" : "not_started",
      badgeText: isInternalVerifierRole ? "Under Review" : "Not Started",
      dateText: isInternalVerifierRole ? "Started on: 7/23/2026" : "---",
      actionButton:
        isInternalVerifierRole && onMarkCompetent
          ? {
              label: "Mark as Competent",
              variant: "amber",
              onClick: onMarkCompetent,
            }
          : undefined,
    },
    {
      id: "notify_awarding_body",
      title: "Notify Awarding Body",
      status: "Not Started",
      badgeType: "not_started",
      badgeText: "Not Started",
      dateText: "---",
    },
    {
      id: "external_verifier",
      title: "External Verifier",
      status: "Not Started",
      badgeType: "not_started",
      badgeText: "Not Started",
      dateText: "---",
    },
    {
      id: "certification",
      title: "Certification",
      status: "Not Started",
      badgeType: "not_started",
      badgeText: "Not Started",
      dateText: "---",
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
