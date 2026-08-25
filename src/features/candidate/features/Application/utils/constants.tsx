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

export const MOCK_ASSESSORS: Assessor[] = [
  {
    id: "assessor-1",
    name: "Ngozi Eze",
    avatar: ASSETS_URL.userAvatar,
    role: "Panel Member",
    tags: ["Carpentry", "RPL Coordinator"],
    isHighlighted: false,
  },
  {
    id: "assessor-2",
    name: "Ngozi Eze",
    avatar: ASSETS_URL.userAvatar,
    role: "Panel Member",
    tags: ["Carpentry", "RPL Coordinator"],
    isHighlighted: true,
  },
  {
    id: "assessor-3",
    name: "Ngozi Eze",
    avatar: ASSETS_URL.userAvatar,
    role: "Panel Member",
    tags: ["Carpentry", "RPL Coordinator"],
    isHighlighted: false,
  },
];

export const MOCK_ASSESSORS_LEAD: Assessor[] = [
  {
    id: "assessor-1",
    name: "Ngozi Eze",
    avatar: ASSETS_URL.userAvatar,
    role: "Lead Panelist",
    tags: ["Carpentry", "RPL Coordinator"],
    isHighlighted: false,
  },
  {
    id: "assessor-2",
    name: "Ngozi Eze",
    avatar: ASSETS_URL.userAvatar,
    role: "Lead Panelist",
    tags: ["Carpentry", "RPL Coordinator"],
    isHighlighted: false,
  },
  {
    id: "assessor-3",
    name: "Ngozi Eze",
    avatar: ASSETS_URL.userAvatar,
    role: "Lead Panelist",
    tags: ["Carpentry", "RPL Coordinator"],
    isHighlighted: false,
  },
];

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
  tradeName?: string;
  paymentAmountText?: string;
  paymentCompleted?: boolean;
  evidenceUploaded?: boolean;
  interviewCompleted?: boolean;
  internalVerifierCompleted?: boolean;
  externalVerifierCompleted?: boolean;
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
  tradeName,
  paymentAmountText,
  paymentCompleted = false,
  evidenceUploaded = false,
  interviewCompleted = false,
  internalVerifierCompleted = false,
  externalVerifierCompleted = false,
}: GetStagesConfigParams): StageConfig[] => {
  const formattedSubmittedDate = submittedDate
    ? new Date(submittedDate).toLocaleDateString()
    : new Date().toLocaleDateString();

  // ─── Stage 1: Application Form ──────────────────────────────────────────────
  const appFormStage: StageConfig = {
    id: "app-form",
    title: "Application Form",
    status: isDraft ? "Draft" : "Approved",
    statusBg: isDraft ? "bg-[#FEF3C7]" : "bg-[#1E7F4C1A]",
    statusText: isDraft ? "text-[#D97706]" : "text-[#1E7F4C]",
    subtext: isDraft ? "Saved as draft" : `Submitted on: ${formattedSubmittedDate}`,
    actionText: isDraft ? "Edit" : "View",
    actionVariant: isDraft ? "amber" : "outline",
    actionSize: "sm",
    onActionClick: onOpenFormModal,
  };

  // ─── Stage 2: Payment ───────────────────────────────────────────────────────
  const isPaymentActive = !isDraft;
  const isPaymentPaid = paymentCompleted;

  const paymentStage: StageConfig = {
    id: "payment",
    title: "Payment",
    status: !isPaymentActive
      ? "Not Started"
      : isPaymentPaid
        ? "Successful"
        : "Pending",
    statusBg: !isPaymentActive
      ? "bg-[#E5E7EB]"
      : isPaymentPaid
        ? "bg-[#1E7F4C1A]"
        : "bg-[#FEF3C7]",
    statusText: !isPaymentActive
      ? "text-[#6B7280]"
      : isPaymentPaid
        ? "text-[#1E7F4C]"
        : "text-[#D97706]",
    subtext: !isPaymentActive
      ? "---"
      : isPaymentPaid
        ? `Paid on: ${formattedSubmittedDate}`
        : "--",
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
  const isFolderActive = isPaymentPaid;
  const isFolderComplete = isFolderActive && evidenceUploaded;

  const folderStage: StageConfig = {
    id: "folder-arrangement",
    title: "Folder Arrangement",
    status: !isFolderActive
      ? "Not Started"
      : isFolderComplete
        ? "Marked as complete"
        : "Ongoing",
    statusBg: !isFolderActive
      ? "bg-[#E5E7EB]"
      : isFolderComplete
        ? "bg-[#1E7F4C1A]"
        : "bg-[#FEF3C7]",
    statusText: !isFolderActive
      ? "text-[#6B7280]"
      : isFolderComplete
        ? "text-[#1E7F4C]"
        : "text-[#D97706]",
    subtext: !isFolderActive
      ? "---"
      : `Started on: ${formattedSubmittedDate}`,
    actionText: isFolderActive ? "Evidence Vault" : undefined,
    actionVariant: isFolderComplete ? "outline" : "amber",
    actionSize: "sm",
    onActionClick: onNavigateToVault,
  };

  // ─── Stage 4: Interview Stage ──────────────────────────────────────────────
  const isInterviewActive = isFolderComplete;
  const isInterviewDone = isInterviewActive && interviewCompleted;

  const interviewStage: StageConfig = {
    id: "interview-stage",
    title: "Interview Stage",
    status: !isInterviewActive
      ? "Not Started"
      : isInterviewDone
        ? "Completed"
        : "Scheduled",
    statusBg: !isInterviewActive
      ? "bg-[#E5E7EB]"
      : isInterviewDone
        ? "bg-[#1E7F4C1A]"
        : "bg-[#FEF3C7]",
    statusText: !isInterviewActive
      ? "text-[#6B7280]"
      : isInterviewDone
        ? "text-[#1E7F4C]"
        : "text-[#D97706]",
    subtext: !isInterviewActive
      ? "---"
      : `Scheduled for: ${formattedSubmittedDate}`,
    isCollapsible: isInterviewActive,
    isCollapsed: isInterviewCollapsed,
    onToggleCollapse: onToggleInterviewCollapse,
    assessors: isInterviewActive ? MOCK_ASSESSORS : undefined,
  };

  // ─── Stage 5: Internal Verifier ────────────────────────────────────────────
  const isIvActive = isInterviewDone;
  const isIvDone = isIvActive && internalVerifierCompleted;

  const internalVerifierStage: StageConfig = {
    id: "internal-verifier",
    title: "Internal Verifier",
    status: !isIvActive
      ? "Not Started"
      : isIvDone
        ? "Completed"
        : "Under Review",
    statusBg: !isIvActive
      ? "bg-[#E5E7EB]"
      : isIvDone
        ? "bg-[#1E7F4C1A]"
        : "bg-[#FEF3C7]",
    statusText: !isIvActive
      ? "text-[#6B7280]"
      : isIvDone
        ? "text-[#1E7F4C]"
        : "text-[#D97706]",
    subtext: !isIvActive ? "---" : `Started on: ${formattedSubmittedDate}`,
    isCollapsible: isIvActive,
    isCollapsed: true,
    onToggleCollapse: onToggleInterviewCollapse,
    actionText: isIvActive && !isIvDone ? "Proceed to External Verifier" : undefined,
    actionVariant: "amber",
    actionSize: "sm",
    onActionClick: onProceedToExternalVerifier,
  };

  // ─── Stage 6: External Verifier ────────────────────────────────────────────
  const isEvActive = isIvDone;
  const isEvDone = isEvActive && externalVerifierCompleted;

  const externalVerifierStage: StageConfig = {
    id: "external-verifier",
    title: "External Verifier",
    status: !isEvActive
      ? "Not Started"
      : isEvDone
        ? "Completed"
        : "Under Review",
    statusBg: !isEvActive
      ? "bg-[#E5E7EB]"
      : isEvDone
        ? "bg-[#1E7F4C1A]"
        : "bg-[#FEF3C7]",
    statusText: !isEvActive
      ? "text-[#6B7280]"
      : isEvDone
        ? "text-[#1E7F4C]"
        : "text-[#D97706]",
    subtext: !isEvActive ? "---" : `Started on: ${formattedSubmittedDate}`,
    actionText: isEvActive && !isEvDone ? "Proceed to Certification" : undefined,
    actionVariant: "amber",
    actionSize: "sm",
    onActionClick: onProceedToCertification,
  };

  // ─── Stage 7: Certification ────────────────────────────────────────────────
  const isCertActive = isEvDone;

  const certificationStage: StageConfig = {
    id: "certification",
    title: "Certification",
    status: !isCertActive ? "Not Started" : "Competent",
    statusBg: !isCertActive ? "bg-[#E5E7EB]" : "bg-[#1E7F4C1A]",
    statusText: !isCertActive ? "text-[#6B7280]" : "text-[#1E7F4C]",
    subtext: !isCertActive ? "---" : `Completed on: ${formattedSubmittedDate}`,
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
