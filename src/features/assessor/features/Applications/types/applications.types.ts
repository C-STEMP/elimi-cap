export type AssessorApplicationStatus =
  | "Pending"
  | "Ongoing"
  | "Completed"
  | "Archived";

export type AssessorRole =
  | "Facilitator"
  | "Panelist"
  | "Internal Verifier"
  | "External Verifier";

export interface AssessorApplicationRecord {
  id: string;
  role?: AssessorRole | string;
  candidateName: string;
  trade: string;
  assessmentType: "RPL" | "NSQ" | string;
  status: AssessorApplicationStatus;
  assignedAt?: string;
  submittedAt: string;
}

export interface AssessorApplicationStats {
  total: number;
  pending: number;
  completed: number;
  archived: number;
}

export interface AssessorFilterCriteria {
  trade: string;
  assessmentType: string;
  status: string;
}

import type { StaticImageData } from "next/image";

export interface AssessorPanelMember {
  id: string;
  name: string;
  role: string;
  avatar?: string | StaticImageData;
  tags: string[];
  isHighlighted?: boolean;
}

export interface ApplicationStageMenuAction {
  label: string;
  onClick: () => void;
}

export interface ApplicationStageFormToSign {
  id: string;
  title: string;
  description?: string;
  signed?: boolean;
}

export interface ApplicationStageItem {
  id: string;
  title: string;
  status: string;
  badgeType?:
    | "approved"
    | "successful"
    | "days_left"
    | "not_started"
    | "ongoing"
    | "completed"
    | "under_review"
    | "awaiting_interview"
    | "interview_scheduled"
    | "marked_as_complete"
    | "competent"
    | "incompetent"
    | "inconclusive"
    | "awaiting_signature";
  badgeText?: string;
  dateText?: string;
  actionButton?: {
    label: string;
    variant: "view" | "evidence_vault" | "primary" | "amber";
    onClick?: () => void;
  };
  menuActions?: ApplicationStageMenuAction[];
  isCollapsible?: boolean;
  isCollapsed?: boolean;
  assessors?: AssessorPanelMember[];
  formsToSign?: ApplicationStageFormToSign[];
  onAppendSignature?: (formId: string) => void;
  inconclusiveDetails?: {
    title?: string;
    reason: string;
    recommendation: string;
  };
}
