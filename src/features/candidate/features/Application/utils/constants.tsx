import Image from "next/image";
import { ASSETS_URL } from "@/assets";
import {
  ApplicationFormState,
  Assessor,
  FolderStatus,
  FormItem,
  StageConfig,
} from "../types";
import type { FacilitatorData } from "@/features/candidate/features/Dashboard/components/FacilitatorCard";

export const MOCK_FACILITATOR: FacilitatorData = {
  name: "Ngozi Eze",
  avatar: ASSETS_URL.userAvatar,
  role: "Facilitator · Carpentry (Level 3)",
  tags: ["Carpentry", "RPL Coordinator"],
};

export const getFolderArrangementStatus = (
  isVaultActive: boolean,
  formState: ApplicationFormState,
): FolderStatus => {
  if (!isVaultActive) {
    return {
      text: "Not Started",
      bg: "bg-[#E5E7EB]",
      textColor: "text-[#6B7280]",
    };
  }

  const statusMap: Record<string, FolderStatus> = {
    vault_3days: {
      text: "3 Days Left",
      bg: "bg-primary/10",
      textColor: "text-primary",
    },
    vault_ongoing: {
      text: "Ongoing",
      bg: "bg-[#FEF3C7]",
      textColor: "text-[#D97706]",
    },
    vault_delayed: {
      text: "23 days gone",
      bg: "bg-primary/10",
      textColor: "text-primary",
    },
  };

  return (
    statusMap[formState] || {
      text: "14 Days Left",
      bg: "bg-[#FEF3C7]",
      textColor: "text-[#D97706]",
    }
  );
};

export const getFormStatus = (formState: ApplicationFormState) => {
  const statusMap = {
    pending: {
      status: "Completed",
      statusBg: "bg-[#E8F5E9]",
      statusText: "text-[#2E7D32]",
    },
    completed: {
      status: "Completed",
      statusBg: "bg-[#E8F5E9]",
      statusText: "text-[#2E7D32]",
    },
    approved: {
      status: "Approved",
      statusBg: "bg-[#1E7F4C1A]",
      statusText: "text-[#1E7F4C]",
    },
    attention: {
      status: "Attention Required",
      statusBg: "bg-[#B3261E1A]",
      statusText: "text-[#B3261E]",
    },
  };

  return (
    statusMap[formState as keyof typeof statusMap] || {
      status: "Completed",
      statusBg: "bg-[#E8F5E9]",
      statusText: "text-[#2E7D32]",
    }
  );
};

export const MOCK_FORMS_TO_SIGN: FormItem[] = [
  {
    id: "form-1",
    title: "Skills Demonstration Records Form",
    description: "Lorem ipsum dolor",
  },
  {
    id: "form-2",
    title: "Assessment Grid/Mapping Form",
    description: "Lorem ipsum dolor",
  },
  {
    id: "form-3",
    title: "Practical Observation Checklist Form",
    description: "Lorem ipsum dolor",
  },
];

import { ApplicationStage } from "@/src/features/shared/applications/api";

export interface GetStagesConfigParams {
  formState: ApplicationFormState;
  isVaultActive: boolean;
  folderStatus: FolderStatus;
  formStatus: { status: string; statusBg: string; statusText: string };
  isInterviewCollapsed?: boolean;
  onToggleInterviewCollapse?: () => void;
  onOpenFormModal: () => void;
  onMakePayment: () => void;
  onDownloadReceipt: () => void;
  onNavigateToVault: () => void;
  onAppeal?: () => void;
  onTakeCourse?: () => void;
  onOpenSignatureModal?: (formId: string) => void;
  onProceedToExternalVerifier?: () => void;
  onProceedToCertification?: () => void;
  submittedDate?: string;
  isDraft?: boolean;
  isPaymentUnlocked?: boolean;
  isAppFormApproved?: boolean;
  isAppFormUnderReview?: boolean;
  tradeName?: string;
  paymentAmountText?: string;
  paymentCompleted?: boolean;
  evidenceUploaded?: boolean;
  interviewCompleted?: boolean;
  internalVerifierCompleted?: boolean;
  externalVerifierCompleted?: boolean;
  stagesData?: ApplicationStage[];
  currentStageKey?: string;
  assessors?: Assessor[];
  interviewDateText?: string;
}

export const getStagesConfig = ({
  isInterviewCollapsed = false,
  onToggleInterviewCollapse,
  onOpenFormModal,
  onMakePayment,
  onDownloadReceipt,
  onNavigateToVault,
  onAppeal,
  onTakeCourse,
  onOpenSignatureModal,
  onProceedToExternalVerifier,
  onProceedToCertification,
  submittedDate,
  isDraft = false,
  isPaymentUnlocked = false,
  isAppFormApproved = false,
  isAppFormUnderReview = false,
  tradeName,
  paymentAmountText,
  paymentCompleted = false,
  evidenceUploaded = false,
  interviewCompleted = false,
  internalVerifierCompleted = false,
  externalVerifierCompleted = false,
  stagesData,
  currentStageKey,
  assessors,
  interviewDateText,
}: GetStagesConfigParams): StageConfig[] => {
  const formattedSubmittedDate = submittedDate
    ? new Date(submittedDate).toLocaleDateString()
    : new Date().toLocaleDateString();

  // Find backend stage rows
  const appFormStageRow = stagesData?.find(
    (s) =>
      s.stageKey === "application_form" ||
      s.stageKey === "application_review" ||
      s.stageKey === "application",
  );
  const paymentStageRow = stagesData?.find(
    (s) => s.stageKey === "payment" || s.stageKey === "payment_quote",
  );
  const folderStageRow = stagesData?.find(
    (s) =>
      s.stageKey === "folder_arrangement" ||
      s.stageKey === "evidence_vault" ||
      s.stageKey === "evidence",
  );
  const interviewStageRow = stagesData?.find(
    (s) => s.stageKey === "interview",
  );
  const ivStageRow = stagesData?.find(
    (s) => s.stageKey === "internal_verification",
  );
  const evStageRow = stagesData?.find(
    (s) => s.stageKey === "external_verification",
  );
  const certStageRow = stagesData?.find(
    (s) => s.stageKey === "certification",
  );

  // ─── Stage 1: Application Form ──────────────────────────────────────────────
  const isAppFormExplicitlyApproved =
    isAppFormApproved ||
    appFormStageRow?.status === "successful" ||
    (appFormStageRow?.status as string) === "approved";

  const appFormStatusText = isDraft
    ? "Draft"
    : isAppFormExplicitlyApproved
      ? "Approved"
      : appFormStageRow?.status === "rejected"
        ? "Rejected"
        : "Under Review";

  const appFormStatusBg = isDraft
    ? "bg-[#FEF3C7]"
    : isAppFormExplicitlyApproved
      ? "bg-[#E8F5E9]"
      : appFormStageRow?.status === "rejected"
        ? "bg-[#FEE2E2]"
        : "bg-[#FEF3C7]";

  const appFormStatusTextColor = isDraft
    ? "text-[#D97706]"
    : isAppFormExplicitlyApproved
      ? "text-[#2E7D32]"
      : appFormStageRow?.status === "rejected"
        ? "text-[#B91C1C]"
        : "text-[#D97706]";

  const appFormSubtext = isDraft
    ? "Saved as draft"
    : isAppFormExplicitlyApproved
      ? `Approved • Submitted on: ${formattedSubmittedDate}`
      : `Under review by centre • Submitted on: ${formattedSubmittedDate}`;

  const appFormStage: StageConfig = {
    id: "app-form",
    title: "Application Form",
    status: appFormStatusText,
    statusBg: appFormStatusBg,
    statusText: appFormStatusTextColor,
    subtext: appFormSubtext,
    actionText: isDraft ? "Edit" : "View",
    actionVariant: isDraft ? "amber" : "outline",
    actionSize: "sm",
    onActionClick: onOpenFormModal,
  };

  // ─── Stage 2: Payment ───────────────────────────────────────────────────────
  const isPaymentPaid =
    paymentCompleted ||
    paymentStageRow?.status === "successful" ||
    (paymentStageRow?.status as string) === "completed";
  const isPaymentActive = !isDraft && isPaymentUnlocked;

  const paymentStatus = !isPaymentUnlocked
    ? isDraft
      ? "Not Started"
      : "Awaiting Centre Approval"
    : isPaymentPaid
      ? "Successful"
      : "Pending";

  const paymentStatusBg = !isPaymentUnlocked
    ? "bg-[#F3F4F6]"
    : isPaymentPaid
      ? "bg-[#1E7F4C1A]"
      : "bg-[#FEF3C7]";

  const paymentStatusTextColor = !isPaymentUnlocked
    ? "text-[#6B7280]"
    : isPaymentPaid
      ? "text-[#1E7F4C]"
      : "text-[#D97706]";

  const paymentSubtext = !isPaymentUnlocked
    ? isDraft
      ? "---"
      : "Centre must approve application form first"
    : isPaymentPaid
      ? `Paid on: ${paymentStageRow?.enteredAt ? new Date(paymentStageRow.enteredAt).toLocaleDateString() : formattedSubmittedDate}`
      : "Application approved — Ready for payment";

  const paymentStage: StageConfig = {
    id: "payment",
    title: "Payment",
    status: paymentStatus,
    statusBg: paymentStatusBg,
    statusText: paymentStatusTextColor,
    subtext: paymentSubtext,
    showPaymentDetails: isPaymentActive && !isPaymentPaid,
    paymentDetailsText: `RPL Assessment Fee — ${tradeName || "Trade"} (Level 3)`,
    paymentAmountText: paymentAmountText || "₦45,000",
    actionText: !isPaymentActive
      ? undefined
      : isPaymentPaid
        ? "Receipt"
        : "Make Payment",
    actionVariant: isPaymentPaid ? "outline" : "amber",
    actionSize: "sm",
    actionLeftIcon:
      isPaymentPaid ? (
        <Image
          src={ASSETS_URL.downloadIcon2}
          alt="Download Receipt"
          width={20}
          height={20}
          className="w-5 h-5 object-contain"
          style={{ width: "auto", height: "auto" }}
        />
      ) : undefined,
    onActionClick: isPaymentPaid ? onDownloadReceipt : onMakePayment,
  };

  // ─── Stage 3: Folder Arrangement ───────────────────────────────────────────
  const isFolderDone = Boolean(
    folderStageRow?.status === "successful" ||
    (folderStageRow?.status as string) === "completed" ||
    (folderStageRow?.status as string) === "approved" ||
    interviewDateText ||
    interviewStageRow?.status === "scheduled" ||
    interviewStageRow?.status === "in_progress" ||
    (currentStageKey &&
      ["interview", "direct_observation", "internal_verification", "external_verification", "certification"].includes(
        currentStageKey,
      )),
  );

  const isFolderActive = Boolean(
    isFolderDone ||
    folderStageRow?.status === "in_progress" ||
    folderStageRow?.status === "under_review" ||
    isPaymentPaid ||
    currentStageKey === "folder_arrangement",
  );

  const folderStage: StageConfig = {
    id: "folder-arrangement",
    title: "Folder Arrangement",
    status: isFolderDone
      ? "Marked as complete"
      : isFolderActive
        ? "Ongoing"
        : folderStageRow?.status === "rejected"
          ? "Attention Required"
          : "Not Started",
    statusBg: isFolderDone
      ? "bg-[#1E7F4C1A]"
      : isFolderActive
        ? "bg-[#FEF3C7]"
        : folderStageRow?.status === "rejected"
          ? "bg-[#B3261E1A]"
          : "bg-[#E5E7EB]",
    statusText: isFolderDone
      ? "text-[#1E7F4C]"
      : isFolderActive
        ? "text-[#D97706]"
        : folderStageRow?.status === "rejected"
          ? "text-[#B3261E]"
          : "text-[#6B7280]",
    subtext: isFolderActive || isFolderDone
      ? `Started on: ${folderStageRow?.enteredAt ? new Date(folderStageRow.enteredAt).toLocaleDateString() : formattedSubmittedDate}`
      : "---",
    actionText: isFolderActive || isFolderDone ? "Evidence Vault" : undefined,
    actionVariant: isFolderDone ? "outline" : "amber",
    actionSize: "sm",
    onActionClick: onNavigateToVault,
  };

  // ─── Stage 4: Interview Stage ──────────────────────────────────────────────
  const isInterviewDone = Boolean(
    interviewStageRow?.status === "successful" ||
    (interviewStageRow?.status as string) === "completed" ||
    (interviewStageRow?.status as string) === "approved" ||
    interviewCompleted ||
    (currentStageKey &&
      ["internal_verification", "external_verification", "certification"].includes(
        currentStageKey,
      )),
  );

  const isInterviewActive = Boolean(
    isInterviewDone ||
    interviewStageRow?.status === "in_progress" ||
    interviewStageRow?.status === "scheduled" ||
    interviewStageRow?.status === "under_review" ||
    currentStageKey === "interview" ||
    isFolderDone,
  );

  const interviewStage: StageConfig = {
    id: "interview-stage",
    title: "Interview Stage",
    status: isInterviewDone
      ? "Completed"
      : isInterviewActive
        ? interviewStageRow?.status === "in_progress" || currentStageKey === "interview"
          ? "In Progress"
          : "Awaiting Interview"
        : interviewStageRow?.status === "rejected"
          ? "Unsuccessful"
          : "Not Started",
    statusBg: isInterviewDone
      ? "bg-[#1E7F4C1A]"
      : isInterviewActive
        ? "bg-[#FEF3C7]"
        : interviewStageRow?.status === "rejected"
          ? "bg-[#B3261E1A]"
          : "bg-[#E5E7EB]",
    statusText: isInterviewDone
      ? "text-[#1E7F4C]"
      : isInterviewActive
        ? "text-[#92400E]"
        : interviewStageRow?.status === "rejected"
          ? "text-[#B3261E]"
          : "text-[#6B7280]",
    subtext: isInterviewActive || isInterviewDone
      ? interviewDateText
        ? `Scheduled for: ${interviewDateText}`
        : interviewStageRow?.enteredAt
          ? `Scheduled for: ${new Date(interviewStageRow.enteredAt).toLocaleDateString()}`
          : "Scheduled for: 8/15/2026"
      : "---",
    isCollapsible: isInterviewActive,
    isCollapsed: isInterviewCollapsed,
    onToggleCollapse: onToggleInterviewCollapse,
    assessors: isInterviewActive && assessors && assessors.length > 0 ? assessors : undefined,
  };

  // ─── Stage 5: Internal Verifier ────────────────────────────────────────────
  const isIvDone = Boolean(
    ivStageRow?.status === "successful" ||
    (ivStageRow?.status as string) === "completed" ||
    (ivStageRow?.status as string) === "approved" ||
    internalVerifierCompleted ||
    (currentStageKey &&
      ["external_verification", "certification"].includes(currentStageKey)),
  );

  const isIvActive = Boolean(
    isIvDone ||
    ivStageRow?.status === "in_progress" ||
    ivStageRow?.status === "under_review" ||
    currentStageKey === "internal_verification" ||
    isInterviewDone,
  );

  const internalVerifierStage: StageConfig = {
    id: "internal-verifier",
    title: "Internal Verifier",
    status: isIvDone
      ? "Completed"
      : isIvActive
        ? "Under Review"
        : "Not Started",
    statusBg: isIvDone
      ? "bg-[#1E7F4C1A]"
      : isIvActive
        ? "bg-[#FEF3C7]"
        : "bg-[#E5E7EB]",
    statusText: isIvDone
      ? "text-[#1E7F4C]"
      : isIvActive
        ? "text-[#D97706]"
        : "text-[#6B7280]",
    subtext: isIvActive || isIvDone
      ? `Started on: ${ivStageRow?.enteredAt ? new Date(ivStageRow.enteredAt).toLocaleDateString() : formattedSubmittedDate}`
      : "---",
    isCollapsible: isIvActive,
    isCollapsed: true,
    onToggleCollapse: onToggleInterviewCollapse,
    actionText: isIvActive && !isIvDone ? "Proceed to External Verifier" : undefined,
    actionVariant: "amber",
    actionSize: "sm",
    onActionClick: onProceedToExternalVerifier,
  };

  // ─── Stage 6: External Verifier ────────────────────────────────────────────
  const isEvDone = Boolean(
    evStageRow?.status === "successful" ||
    (evStageRow?.status as string) === "completed" ||
    (evStageRow?.status as string) === "approved" ||
    externalVerifierCompleted ||
    currentStageKey === "certification",
  );

  const isEvActive = Boolean(
    isEvDone ||
    evStageRow?.status === "in_progress" ||
    evStageRow?.status === "under_review" ||
    currentStageKey === "external_verification" ||
    isIvDone,
  );

  const externalVerifierStage: StageConfig = {
    id: "external-verifier",
    title: "External Verifier",
    status: isEvDone
      ? "Completed"
      : isEvActive
        ? "Under Review"
        : "Not Started",
    statusBg: isEvDone
      ? "bg-[#1E7F4C1A]"
      : isEvActive
        ? "bg-[#FEF3C7]"
        : "bg-[#E5E7EB]",
    statusText: isEvDone
      ? "text-[#1E7F4C]"
      : isEvActive
        ? "text-[#D97706]"
        : "text-[#6B7280]",
    subtext: isEvActive || isEvDone
      ? `Started on: ${evStageRow?.enteredAt ? new Date(evStageRow.enteredAt).toLocaleDateString() : formattedSubmittedDate}`
      : "---",
    actionText: isEvActive && !isEvDone ? "Proceed to Certification" : undefined,
    actionVariant: "amber",
    actionSize: "sm",
    onActionClick: onProceedToCertification,
  };

  // ─── Stage 7: Certification ────────────────────────────────────────────────
  const isCertDone = Boolean(
    certStageRow?.status === "successful" ||
    (certStageRow?.status as string) === "completed" ||
    (certStageRow?.status as string) === "certified",
  );

  const isCertActive = Boolean(
    isCertDone ||
    certStageRow?.status === "in_progress" ||
    currentStageKey === "certification" ||
    isEvDone,
  );

  const certificationStage: StageConfig = {
    id: "certification",
    title: "Certification",
    status: isCertDone ? "Competent" : isCertActive ? "In Progress" : "Not Started",
    statusBg: isCertDone
      ? "bg-[#1E7F4C1A]"
      : isCertActive
        ? "bg-[#FEF3C7]"
        : "bg-[#E5E7EB]",
    statusText: isCertDone
      ? "text-[#1E7F4C]"
      : isCertActive
        ? "text-[#D97706]"
        : "text-[#6B7280]",
    subtext: isCertActive || isCertDone
      ? `Completed on: ${certStageRow?.enteredAt ? new Date(certStageRow.enteredAt).toLocaleDateString() : formattedSubmittedDate}`
      : "---",
    isCollapsible: isCertActive,
    isCollapsed: !isCertActive,
    onToggleCollapse: onToggleInterviewCollapse,
    competentBanner: isCertActive
      ? {
          title: "You've been marked Competent",
          subtitle: `Completed on: ${formattedSubmittedDate}`,
          description:
            "The Awarding Body has confirmed your competency. Your official certificate is ready.",
        }
      : null,
  };

  return [
    appFormStage,
    paymentStage,
    folderStage,
    interviewStage,
    internalVerifierStage,
    externalVerifierStage,
    certificationStage,
  ];
};
