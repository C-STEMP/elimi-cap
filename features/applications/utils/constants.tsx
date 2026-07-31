import Image from "next/image";
import { ASSETS_URL } from "@/assets";
import {
  ApplicationFormState,
  Assessor,
  FolderStatus,
  FormItem,
  StageConfig,
} from "../types";
import type { FacilitatorData } from "@/features/dashboard/components/FacilitatorCard";

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
      status: "Pending",
      statusBg: "bg-[#F9A8251A]",
      statusText: "text-[#D97706]",
    },
    attention: {
      status: "Attention Required",
      statusBg: "bg-[#B3261E1A]",
      statusText: "text-[#B3261E]",
    },
  };

  return (
    statusMap[formState as keyof typeof statusMap] || {
      status: "Approved",
      statusBg: "bg-[#1E7F4C1A]",
      statusText: "text-[#1E7F4C]",
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
  demoVerifierState?: "under_review" | "attention_required" | "completed";
  demoStage?:
    | "draft"
    | "payment_pending"
    | "payment_completed"
    | "folder_arrangement"
    | "evidence_upload"
    | "interview_completed"
    | "internal_verifier_completed"
    | "external_verifier_completed"
    | "certification_competent";
}

export const getStagesConfig = ({
  formState,
  isVaultActive,
  folderStatus,
  formStatus,
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
  demoVerifierState,
  demoStage,
}: GetStagesConfigParams): StageConfig[] => {
  const isFigmaState =
    formState.startsWith("figma_") ||
    formState.startsWith("vault_") ||
    isVaultActive;

  let interviewConfig: StageConfig = {
    id: "interview-stage",
    title: "Interview Stage",
    status: "Not Started",
    statusBg: "bg-[#E5E7EB]",
    statusText: "text-[#6B7280]",
    subtext: "---",
    isCollapsible: false,
    isCollapsed: false,
    onToggleCollapse: onToggleInterviewCollapse,
    assessors: undefined,
    inconclusiveBanner: null,
    formsBannerMessage: null,
    formsToSign: undefined,
    onOpenSignatureModal,
  };

  if (formState === "figma_screen_1") {
    interviewConfig = {
      ...interviewConfig,
      status: "Rescheduled",
      statusBg: "bg-[#FEF3C7]",
      statusText: "text-[#D97706]",
      subtext: "Scheduled for: 8/15/2026",
      isCollapsible: true,
      isCollapsed: isInterviewCollapsed,
      onToggleCollapse: onToggleInterviewCollapse,
      assessors: MOCK_ASSESSORS,
      inconclusiveBanner: null,
    };
  } else if (formState === "figma_screen_2") {
    interviewConfig = {
      ...interviewConfig,
      status: "Awaiting Interview",
      statusBg: "bg-[#FEF3C7]",
      statusText: "text-[#D97706]",
      subtext: "Scheduled for: 8/15/2026",
      isCollapsible: true,
      isCollapsed: isInterviewCollapsed,
      onToggleCollapse: onToggleInterviewCollapse,
      assessors: MOCK_ASSESSORS,
      inconclusiveBanner: null,
    };
  } else if (formState === "figma_screen_3") {
    interviewConfig = {
      ...interviewConfig,
      status: "Ongoing",
      statusBg: "bg-[#FEF3C7]",
      statusText: "text-[#D97706]",
      subtext: "Scheduled for: 8/15/2026",
      isCollapsible: true,
      isCollapsed: isInterviewCollapsed,
      onToggleCollapse: onToggleInterviewCollapse,
      assessors: MOCK_ASSESSORS,
      inconclusiveBanner: null,
    };
  } else if (formState === "figma_screen_4") {
    interviewConfig = {
      ...interviewConfig,
      status: "Inconclusive",
      statusBg: "bg-primary/10",
      statusText: "text-primary",
      subtext: "Scheduled for: 8/15/2026",
      isCollapsible: true,
      isCollapsed: isInterviewCollapsed,
      onToggleCollapse: onToggleInterviewCollapse,
      assessors: MOCK_ASSESSORS,
      inconclusiveBanner: {
        title: "Interview Inconclusive",
        description:
          "Recommended: Complete Elimi's 'Advanced Joinery Finishing' and 'Workshop Safety Documentation' modules before re-attempting the interview",
        onAppeal,
        onTakeCourse,
      },
    };
  } else if (formState === "figma_screen_5") {
    interviewConfig = {
      ...interviewConfig,
      status: "Scheduled",
      statusBg: "bg-[#FEF3C7]",
      statusText: "text-[#D97706]",
      subtext: "Scheduled for: 8/15/2026",
      isCollapsible: true,
      isCollapsed: isInterviewCollapsed,
      onToggleCollapse: onToggleInterviewCollapse,
      assessors: MOCK_ASSESSORS_LEAD,
      inconclusiveBanner: null,
    };
  } else if (formState === "figma_completed_no_events") {
    interviewConfig = {
      ...interviewConfig,
      status: "Completed",
      statusBg: "bg-[#1E7F4C1A]",
      statusText: "text-[#1E7F4C]",
      subtext: "Scheduled for: 8/15/2026",
      isCollapsible: true,
      isCollapsed: isInterviewCollapsed,
      onToggleCollapse: onToggleInterviewCollapse,
      assessors: undefined,
    };
  } else if (formState === "figma_completed_with_events") {
    interviewConfig = {
      ...interviewConfig,
      status: "Completed",
      statusBg: "bg-[#1E7F4C1A]",
      statusText: "text-[#1E7F4C]",
      subtext: "Scheduled for: 8/15/2026",
      isCollapsible: true,
      isCollapsed: isInterviewCollapsed,
      onToggleCollapse: onToggleInterviewCollapse,
      assessors: MOCK_ASSESSORS,
    };
  } else if (formState === "figma_awaiting_signature") {
    interviewConfig = {
      ...interviewConfig,
      status: "Awaiting Signature",
      statusBg: "bg-[#FEF3C7]",
      statusText: "text-[#D97706]",
      subtext: "Scheduled for: 8/15/2026",
      isCollapsible: true,
      isCollapsed: isInterviewCollapsed,
      onToggleCollapse: onToggleInterviewCollapse,
      assessors: MOCK_ASSESSORS,
      formsBannerMessage:
        "The panel has completed and filled out 3 forms following your interview. Review each and append your signature. All 3 must be signed for this stage to be marked complete.",
      formsToSign: MOCK_FORMS_TO_SIGN,
      onOpenSignatureModal,
    };
  } else if (
    formState === "figma_internal_verifier_attention" ||
    formState === "figma_internal_verifier_completed" ||
    formState === "figma_internal_verifier_under_review" ||
    formState === "figma_external_verifier_under_review" ||
    formState === "figma_certification_competent"
  ) {
    interviewConfig = {
      ...interviewConfig,
      status: "Completed",
      statusBg: "bg-[#1E7F4C1A]",
      statusText: "text-[#1E7F4C]",
      subtext: "Scheduled for: 8/15/2026",
      isCollapsible: true,
      isCollapsed: true,
      onToggleCollapse: onToggleInterviewCollapse,
    };
  }

  let internalVerifierStatus: StageConfig = {
    id: "internal-verifier",
    title: "Internal Verifier",
    status: "Not Started",
    statusBg: "bg-[#E5E7EB]",
    statusText: "text-[#6B7280]",
    subtext: "---",
    alertMessage: null,
    isCollapsible: false,
    isCollapsed: true,
  };

  if (demoVerifierState === "under_review") {
    internalVerifierStatus = {
      ...internalVerifierStatus,
      status: "Under Review",
      statusBg: "bg-[#FEF3C7]",
      statusText: "text-[#D97706]",
      subtext: "Started on: 7/23/2026",
      alertMessage: null,
      isCollapsible: true,
      isCollapsed: true,
    };
  } else if (demoVerifierState === "attention_required") {
    internalVerifierStatus = {
      ...internalVerifierStatus,
      status: "Attention Required",
      statusBg: "bg-[#FEE2E2]",
      statusText: "text-[#DC2626]",
      subtext: "Started on: 7/23/2026",
      alertMessage:
        "Note: Send back to panel — clarify PC 1.4 authenticity concern raised at interview.",
      isCollapsible: true,
      isCollapsed: false,
    };
  } else if (demoVerifierState === "completed") {
    internalVerifierStatus = {
      ...internalVerifierStatus,
      status: "Completed",
      statusBg: "bg-[#1E7F4C1A]",
      statusText: "text-[#1E7F4C]",
      subtext: "Started on: 7/23/2026",
      alertMessage: null,
      isCollapsible: true,
      isCollapsed: false,
    };
  } else if (formState === "figma_internal_verifier_attention") {
    internalVerifierStatus = {
      ...internalVerifierStatus,
      status: "Attention Required",
      statusBg: "bg-[#FEE2E2]",
      statusText: "text-[#DC2626]",
      subtext: "Started on: 7/23/2026",
      alertMessage:
        "Note: Send back to panel — clarify PC 1.4 authenticity concern raised at interview.",
      isCollapsible: true,
      isCollapsed: false,
    };
  } else if (formState === "figma_internal_verifier_under_review") {
    internalVerifierStatus = {
      ...internalVerifierStatus,
      status: "Under Review",
      statusBg: "bg-[#FEF3C7]",
      statusText: "text-[#D97706]",
      subtext: "Started on: 7/23/2026",
      alertMessage: null,
      isCollapsible: true,
      isCollapsed: true,
    };
  } else if (
    formState === "figma_internal_verifier_completed" ||
    formState === "figma_external_verifier_under_review" ||
    formState === "figma_certification_competent"
  ) {
    internalVerifierStatus = {
      ...internalVerifierStatus,
      status: "Completed",
      statusBg: "bg-[#1E7F4C1A]",
      statusText: "text-[#1E7F4C]",
      subtext: "Started on: 7/23/2026",
      alertMessage: null,
      isCollapsible: true,
      isCollapsed: true,
      actionText: "Proceed to External Verifier",
      actionVariant: "amber",
      actionSize: "sm",
      onActionClick: onProceedToExternalVerifier,
    };
  }

  let externalVerifierStatus: StageConfig = {
    id: "external-verifier",
    title: "External Verifier",
    status: "Not Started",
    statusBg: "bg-[#E5E7EB]",
    statusText: "text-[#6B7280]",
    subtext: "---",
  };

  if (formState === "figma_external_verifier_under_review") {
    externalVerifierStatus = {
      ...externalVerifierStatus,
      status: "Under Review",
      statusBg: "bg-[#FEF3C7]",
      statusText: "text-[#D97706]",
      subtext: "Started on: 7/23/2026",
    };
  } else if (formState === "figma_certification_competent") {
    externalVerifierStatus = {
      ...externalVerifierStatus,
      status: "Completed",
      statusBg: "bg-[#1E7F4C1A]",
      statusText: "text-[#1E7F4C]",
      subtext: "Started on: 7/23/2026",
      actionText: "Proceed to Certification",
      actionVariant: "amber",
      actionSize: "sm",
      onActionClick: onProceedToCertification,
    };
  }

  let certificationStatus = {
    status: "Not Started",
    statusBg: "bg-[#E5E7EB]",
    statusText: "text-[#6B7280]",
    subtext: "---",
    isCollapsible: false,
    isCollapsed: true,
    competentBanner: null as {
      title: string;
      subtitle: string;
      description: string;
    } | null,
  };

  if (formState === "figma_certification_competent") {
    certificationStatus = {
      status: "Competent",
      statusBg: "bg-[#1E7F4C1A]",
      statusText: "text-[#1E7F4C]",
      subtext: "Started on: 7/23/2026",
      isCollapsible: true,
      isCollapsed: false,
      competentBanner: {
        title: "You've been marked Competent",
        subtitle: "Started on: 7/23/2026 · Carpentry · Level 3 · 18 July 2026",
        description:
          "The Awarding Body has confirmed your competency. Your physical NSQ certificate is ready for collection — please visit your assessment centre (Lagos State Skills Assessment Centre) with a valid ID to receive it.",
      },
    };
  }

  // Determine statuses based on demoStage
  const getAppFormStatus = () => {
    if (demoStage === "draft")
      return {
        status: "Pending",
        statusBg: "bg-[#F9A8251A]",
        statusText: "text-[#D97706]",
      };
    return {
      status: "Approved",
      statusBg: "bg-[#1E7F4C1A]",
      statusText: "text-[#1E7F4C]",
    };
  };

  const getPaymentStatus = () => {
    if (demoStage === "draft" || demoStage === "payment_pending") {
      return demoStage === "payment_pending"
        ? {
            status: "Pending",
            statusBg: "bg-[#F9A8251A]",
            statusText: "text-[#D97706]",
            showDetails: true,
          }
        : {
            status: "Not Started",
            statusBg: "bg-[#E5E7EB]",
            statusText: "text-[#6B7280]",
            showDetails: false,
          };
    }
    return {
      status: "Successful",
      statusBg: "bg-[#1E7F4C1A]",
      statusText: "text-[#1E7F4C]",
      showDetails: false,
    };
  };

  const getFolderArrangementStatus = () => {
    if (
      demoStage === "draft" ||
      demoStage === "payment_pending" ||
      demoStage === "payment_completed"
    ) {
      return {
        status: "Not Started",
        statusBg: "bg-[#E5E7EB]",
        statusText: "text-[#6B7280]",
      };
    }
    if (demoStage === "folder_arrangement") {
      return {
        status: "3 Days Left",
        statusBg: "bg-primary/10",
        statusText: "text-primary",
      };
    }
    return {
      status: "Marked as complete",
      statusBg: "bg-[#1E7F4C1A]",
      statusText: "text-[#1E7F4C]",
    };
  };

  const getInterviewStatus = () => {
    if (
      demoStage === "draft" ||
      demoStage === "payment_pending" ||
      demoStage === "payment_completed" ||
      demoStage === "folder_arrangement"
    ) {
      return {
        status: "Not Started",
        statusBg: "bg-[#E5E7EB]",
        statusText: "text-[#6B7280]",
      };
    }
    if (demoStage === "evidence_upload") {
      return {
        status: "Ongoing",
        statusBg: "bg-[#FEF3C7]",
        statusText: "text-[#D97706]",
      };
    }
    return {
      status: "Completed",
      statusBg: "bg-[#1E7F4C1A]",
      statusText: "text-[#1E7F4C]",
    };
  };

  const getInternalVerifierStatus = () => {
    if (
      demoStage === "draft" ||
      demoStage === "payment_pending" ||
      demoStage === "payment_completed" ||
      demoStage === "folder_arrangement" ||
      demoStage === "evidence_upload"
    ) {
      return {
        status: "Not Started",
        statusBg: "bg-[#E5E7EB]",
        statusText: "text-[#6B7280]",
      };
    }
    if (demoVerifierState === "under_review") {
      return {
        status: "Under Review",
        statusBg: "bg-[#F9A8251A]",
        statusText: "text-[#F9A825]",
      };
    }
    if (demoVerifierState === "attention_required") {
      return {
        status: "Attention Required",
        statusBg: "bg-[#B3261E1A]",
        statusText: "text-[#B3261E]",
      };
    }
    return {
      status: "Completed",
      statusBg: "bg-[#1E7F4C1A]",
      statusText: "text-[#1E7F4C]",
    };
  };

  const getExternalVerifierStatus = () => {
    if (
      demoStage === "draft" ||
      demoStage === "payment_pending" ||
      demoStage === "payment_completed" ||
      demoStage === "folder_arrangement" ||
      demoStage === "evidence_upload" ||
      demoStage === "interview_completed"
    ) {
      return {
        status: "Not Started",
        statusBg: "bg-[#E5E7EB]",
        statusText: "text-[#6B7280]",
      };
    }
    if (demoStage === "internal_verifier_completed") {
      return {
        status: "Under Review",
        statusBg: "bg-[#F9A8251A]",
        statusText: "text-[#F9A825]",
      };
    }
    return {
      status: "Completed",
      statusBg: "bg-[#1E7F4C1A]",
      statusText: "text-[#1E7F4C]",
    };
  };

  const getCertificationStatus = () => {
    if (demoStage === "certification_competent") {
      return {
        status: "Competent",
        statusBg: "bg-[#1E7F4C1A]",
        statusText: "text-[#1E7F4C]",
        showBanner: true,
      };
    }
    return {
      status: "Not Started",
      statusBg: "bg-[#E5E7EB]",
      statusText: "text-[#6B7280]",
      showBanner: false,
    };
  };

  const appFormStatus = getAppFormStatus();
  const paymentStatusObj = getPaymentStatus();
  const folderStatusObj = getFolderArrangementStatus();
  const interviewStatusObj = getInterviewStatus();
  const internalVerifierStatusObj = getInternalVerifierStatus();
  const externalVerifierStatusObj = getExternalVerifierStatus();
  const certificationStatusObj = getCertificationStatus();

  return [
    {
      id: "app-form",
      title: "Application Form",
      status: appFormStatus.status,
      statusBg: appFormStatus.statusBg,
      statusText: appFormStatus.statusText,
      subtext: "Submitted on: 7/21/2026",
      actionText: "View",
      actionVariant: "outline",
      actionSize: "sm",
      onActionClick: onOpenFormModal,
    },
    {
      id: "payment",
      title: "Payment",
      status: paymentStatusObj.status,
      statusBg: paymentStatusObj.statusBg,
      statusText: paymentStatusObj.statusText,
      subtext:
        paymentStatusObj.status === "Not Started" ? "--" : "Paid On: 7/22/2026",
      showPaymentDetails: paymentStatusObj.showDetails,
      actionText:
        paymentStatusObj.status === "Successful"
          ? "Receipt"
          : paymentStatusObj.status === "Pending"
            ? "Make Payment"
            : "Make Payment",
      actionVariant:
        paymentStatusObj.status === "Successful" ? "outline" : "amber",
      actionSize: "sm",
      actionLeftIcon:
        paymentStatusObj.status === "Successful" ? (
          <Image
            src={ASSETS_URL.downloadIcon2}
            alt="Download Receipt"
            width={20}
            height={20}
            className="w-5 h-5 object-contain"
            style={{ width: "auto", height: "auto" }}
          />
        ) : undefined,
      onActionClick:
        paymentStatusObj.status === "Successful"
          ? onDownloadReceipt
          : onMakePayment,
    },
    {
      id: "folder-arrangement",
      title: "Folder Arrangement",
      status: folderStatusObj.status,
      statusBg: folderStatusObj.statusBg,
      statusText: folderStatusObj.statusText,
      subtext:
        folderStatusObj.status === "Not Started"
          ? "---"
          : "Started on: 7/23/2026",
      actionText:
        folderStatusObj.status === "Marked as complete"
          ? "Evidence Vault"
          : undefined,
      actionVariant: "amber",
      actionSize: "sm",
      onActionClick: onNavigateToVault,
    },
    {
      id: "interview-stage",
      title: "Interview Stage",
      status: interviewStatusObj.status,
      statusBg: interviewStatusObj.statusBg,
      statusText: interviewStatusObj.statusText,
      subtext:
        interviewStatusObj.status === "Not Started"
          ? "---"
          : "Scheduled for: 8/15/2026",
      isCollapsible: interviewStatusObj.status !== "Not Started",
      isCollapsed: true,
      onToggleCollapse: onToggleInterviewCollapse,
    },
    {
      id: "internal-verifier",
      title: "Internal Verifier",
      status: internalVerifierStatusObj.status,
      statusBg: internalVerifierStatusObj.statusBg,
      statusText: internalVerifierStatusObj.statusText,
      subtext:
        internalVerifierStatusObj.status === "Not Started"
          ? "---"
          : "Started on: 7/23/2026",
      alertMessage:
        demoVerifierState === "attention_required"
          ? "Note: Send back to panel — clarify PC 1.4 authenticity concern raised at interview."
          : null,
      isCollapsible: internalVerifierStatusObj.status !== "Not Started",
      isCollapsed: demoVerifierState !== "attention_required",
      onToggleCollapse: onToggleInterviewCollapse,
    },
    {
      id: "external-verifier",
      title: "External Verifier",
      status: externalVerifierStatusObj.status,
      statusBg: externalVerifierStatusObj.statusBg,
      statusText: externalVerifierStatusObj.statusText,
      subtext:
        externalVerifierStatusObj.status === "Not Started"
          ? "---"
          : "Started on: 7/23/2026",
    },
    {
      id: "certification",
      title: "Certification",
      status: certificationStatusObj.status,
      statusBg: certificationStatusObj.statusBg,
      statusText: certificationStatusObj.statusText,
      subtext:
        certificationStatusObj.status === "Not Started"
          ? "---"
          : "Started on: 7/23/2026",
      isCollapsible: certificationStatusObj.showBanner,
      isCollapsed: !certificationStatusObj.showBanner,
      onToggleCollapse: onToggleInterviewCollapse,
      competentBanner: certificationStatusObj.showBanner
        ? {
            title: "You've been marked Competent",
            subtitle:
              "Started on: 7/23/2026 · Carpentry · Level 3 · 18 July 2026",
            description:
              "The Awarding Body has confirmed your competency. Your physical NSQ certificate is ready for collection — please visit your assessment centre (Lagos State Skills Assessment Centre) with a valid ID to receive it.",
          }
        : null,
    },
  ];
};
