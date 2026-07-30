import { ASSETS_URL } from "@/assets";
import { FacilitatorData } from "@/features/dashboard/components/FacilitatorCard";
import { ApplicationFormState, FolderStatus } from "../types";

export const MOCK_FACILITATOR: FacilitatorData = {
  name: "Ngozi Eze",
  avatar: ASSETS_URL.userAvatar,
  role: "Facilitator · Carpentry (Level 3)",
  tags: ["Carpentry", "RPL Coordinator"],
};

export const getFolderArrangementStatus = (
  isVaultActive: boolean,
  formState: ApplicationFormState
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
      bg: "bg-[#FCE7F3]",
      textColor: "text-[#BE185D]",
    },
    vault_ongoing: {
      text: "Ongoing",
      bg: "bg-[#FEF3C7]",
      textColor: "text-[#D97706]",
    },
    vault_delayed: {
      text: "23 days gone",
      bg: "bg-[#FCE7F3]",
      textColor: "text-[#BE185D]",
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
      statusText: "text-[#BE185D]",
    },
  };

  return (
    statusMap[formState as keyof typeof statusMap] || {
      status: "Approved",
      statusBg: "bg-[#B3261E]",
      statusText: "text-[#047857]",
    }
  );
};
