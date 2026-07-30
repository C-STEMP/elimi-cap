import { FiDownload } from "react-icons/fi";
import Image from "next/image";
import { ASSETS_URL } from "@/assets";
import { FacilitatorData } from "@/features/dashboard/components/FacilitatorCard";
import { ApplicationFormState, FolderStatus, StageConfig } from "../types";

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
      bg: "bg-black/10",
      textColor: "text-black",
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

export interface GetStagesConfigParams {
  formState: ApplicationFormState;
  isVaultActive: boolean;
  folderStatus: FolderStatus;
  formStatus: { status: string; statusBg: string; statusText: string };
  onOpenFormModal: () => void;
  onMakePayment: () => void;
  onDownloadReceipt: () => void;
  onNavigateToVault: () => void;
}

export const getStagesConfig = ({
  formState,
  isVaultActive,
  folderStatus,
  formStatus,
  onOpenFormModal,
  onMakePayment,
  onDownloadReceipt,
  onNavigateToVault,
}: GetStagesConfigParams): StageConfig[] => [
  {
    id: "app-form",
    title: "Application Form",
    status: formStatus.status,
    statusBg: formStatus.statusBg,
    statusText: formStatus.statusText,
    subtext: "Submitted on: 7/21/2026",
    actionText:
      formState === "pending" || formState === "approved" || isVaultActive
        ? "View"
        : "Edit",
    actionVariant:
      formState === "pending" || formState === "approved" || isVaultActive
        ? "outline"
        : "amber",
    actionSize: "sm",
    alertMessage:
      formState === "attention"
        ? "Lorem Ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor"
        : null,
    onActionClick: onOpenFormModal,
  },
  {
    id: "payment",
    title: "Payment",
    status: isVaultActive ? "Successful" : "Not Started",
    statusBg: isVaultActive ? "bg-[#1E7F4C1A]" : "bg-black/10",
    statusText: isVaultActive ? "text-[#1E7F4C]" : "text-black",
    subtext: isVaultActive ? "Paid On: 7/22/2026" : "--",
    showPaymentDetails: formState === "approved" && !isVaultActive,
    actionText: isVaultActive ? "Receipt" : "Make Payement",
    actionVariant: isVaultActive ? "outline" : "amber",
    actionSize: "sm",
    actionLeftIcon: isVaultActive ? (
      <Image
        src={ASSETS_URL.downloadIcon2}
        alt="Download Receipt"
        width={20}
        height={20}
        className="w-5 h-5 object-contain"
        style={{ width: "auto", height: "auto" }}
      />
    ) : undefined,
    onActionClick: isVaultActive ? onDownloadReceipt : onMakePayment,
  },
  {
    id: "folder-arrangement",
    title: "Folder Arrangement",
    status: folderStatus.text,
    statusBg: folderStatus.bg,
    statusText: folderStatus.textColor,
    subtext: isVaultActive ? "Started on: 7/23/2026" : "---",
    actionText: isVaultActive ? "Evidence Vault" : undefined,
    actionVariant: "amber",
    actionSize: "sm",
    onActionClick: onNavigateToVault,
  },
  {
    id: "interview-stage",
    title: "Interview Stage",
    status: "Not Started",
    statusBg: "bg-black/10",
    statusText: "text-black",
    subtext: "---",
    delayedMessage:
      formState === "vault_delayed"
        ? "Your interview has been delayed as your folder arrangement was not completed within the required 14-day timeframe. Please complete the necessary arrangements to proceed with the next interview schedule."
        : null,
  },
  {
    id: "internal-verifier",
    title: "Internal Verifier",
    status: "Not Started",
    statusBg: "bg-[#E5E7EB]",
    statusText: "text-[#6B7280]",
    subtext: "---",
  },
  {
    id: "external-verifier",
    title: "External Verifier",
    status: "Not Started",
    statusBg: "bg-[#E5E7EB]",
    statusText: "text-[#6B7280]",
    subtext: "---",
  },
  {
    id: "certification",
    title: "Certification",
    status: "Not Started",
    statusBg: "bg-[#E5E7EB]",
    statusText: "text-[#6B7280]",
    subtext: "---",
  },
];

export interface EvidenceRecord {
  id: string;
  name: string;
  size: string;
  status: "Approved" | "Attention Required" | "Pending";
  statusBg: string;
  statusText: string;
  issues?: string[];
}

export interface ResourceRecord {
  id: string;
  name: string;
  size: string;
}

export const INITIAL_EVIDENCES: EvidenceRecord[] = [
  {
    id: "ev-1",
    name: "CV/Resume",
    size: "60 kb / 5 mb",
    status: "Approved",
    statusBg: "bg-[#D1FAE5]",
    statusText: "text-[#047857]",
  },
  {
    id: "ev-2",
    name: "CV/Resume",
    size: "60 kb / 5 mb",
    status: "Approved",
    statusBg: "bg-[#D1FAE5]",
    statusText: "text-[#047857]",
  },
  {
    id: "ev-3",
    name: "CV/Resume",
    size: "60 kb / 5 mb",
    status: "Approved",
    statusBg: "bg-[#D1FAE5]",
    statusText: "text-[#047857]",
  },
  {
    id: "ev-4",
    name: "CV/Resume",
    size: "60 kb / 5 mb",
    status: "Approved",
    statusBg: "bg-[#D1FAE5]",
    statusText: "text-[#047857]",
  },
  {
    id: "ev-5",
    name: "CV/Resume",
    size: "60 kb / 5 mb",
    status: "Approved",
    statusBg: "bg-[#D1FAE5]",
    statusText: "text-[#047857]",
  },
];

export const RESOURCES_LIST: ResourceRecord[] = [
  {
    id: "res-1",
    name: "Self-Assessment Form Template",
    size: "5 mb",
  },
  {
    id: "res-2",
    name: "Third Party Reports",
    size: "5 mb",
  },
];
