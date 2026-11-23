export interface ApplicationStatusDisplay {
  label: string;
  bg: string;
  text: string;
  border: string;
  isApprovedByCentre: boolean;
}

const STAGE_DISPLAY_MAP: Record<string, ApplicationStatusDisplay> = {
  application_form: {
    label: "Awaiting Review",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    isApprovedByCentre: false,
  },
  application_review: {
    label: "Awaiting Centre Review",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    isApprovedByCentre: false,
  },
  payment: {
    label: "Approved • Payment Pending",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    isApprovedByCentre: true,
  },
  induction: {
    label: "Approved • Induction",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    isApprovedByCentre: true,
  },
  folder_arrangement: {
    label: "Approved • Portfolio Review",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    isApprovedByCentre: true,
  },
  regular_assessment: {
    label: "Approved • Assessment",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    isApprovedByCentre: true,
  },
  interview: {
    label: "Approved • Interview",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    isApprovedByCentre: true,
  },
  internal_verification: {
    label: "Internal Verification",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
    isApprovedByCentre: true,
  },
  external_verification: {
    label: "External Verification",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
    isApprovedByCentre: true,
  },
  certification: {
    label: "Certification",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    isApprovedByCentre: true,
  },
};

export function getCandidateApplicationStatusDisplay(
  status?: string,
  currentStageKey?: string | null,
): ApplicationStatusDisplay {
  const normalizedStatus = (status || "").toLowerCase();

  if (normalizedStatus === "draft") {
    return {
      label: "Draft",
      bg: "bg-gray-100",
      text: "text-gray-700",
      border: "border-gray-300",
      isApprovedByCentre: false,
    };
  }
  if (normalizedStatus === "certified") {
    return {
      label: "Certified",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      isApprovedByCentre: true,
    };
  }
  if (normalizedStatus === "rejected") {
    return {
      label: "Rejected",
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      isApprovedByCentre: false,
    };
  }
  if (normalizedStatus === "withdrawn") {
    return {
      label: "Withdrawn",
      bg: "bg-gray-100",
      text: "text-gray-600",
      border: "border-gray-200",
      isApprovedByCentre: false,
    };
  }
  if (normalizedStatus === "approved") {
    return {
      label: "Approved",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      isApprovedByCentre: true,
    };
  }

  const normalizedStage = (currentStageKey || "").toLowerCase();
  if (normalizedStage && STAGE_DISPLAY_MAP[normalizedStage]) {
    return STAGE_DISPLAY_MAP[normalizedStage];
  }

  if (normalizedStatus === "submitted" || normalizedStatus === "pending") {
    return {
      label: "Awaiting Centre Review",
      bg: "bg-[#FFF7ED]",
      text: "text-[#C2410C]",
      border: "border-[#FFEDD5]",
      isApprovedByCentre: false,
    };
  }

  if (normalizedStage) {
    const formatted = normalizedStage
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return {
      label: formatted,
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      isApprovedByCentre: true,
    };
  }

  return {
    label: normalizedStatus === "in_progress" ? "In Progress" : (status || "In Progress").replace(/_/g, " "),
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    isApprovedByCentre: false,
  };
}
