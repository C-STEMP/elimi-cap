import type { ApplicationFormState } from "../types";
import { setCurrentApplication } from "@/store/slices/applicationSlice";
import { setPersonalInfo, setRPLExperienceTrade } from "@/store/slices/onboardingSlice";
import { getStagesConfig } from "./constants";
import type { ApplicationDetail } from "@/src/features/shared/applications/api";

export const isRawId = (str?: string): boolean => {
  if (!str) return false;
  return /^[0-9A-Z]{20,}$/.test(str) || /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(str);
};

export const statusToFormState = (
  status: string,
  selfAssessmentCompleted: boolean,
  paymentCompleted: boolean,
): ApplicationFormState => {
  if (status === "draft" || status === "submitted") return "pending";
  if (status === "in_progress") {
    if (!paymentCompleted) return "pending";
    if (!selfAssessmentCompleted) return "figma_screen_1";
    return "figma_screen_5";
  }
  if (["application_form", "payment", "self_assessment"].includes(status)) return "pending";
  if (status === "evidence_upload") return "figma_screen_1";
  if (status === "interview_scheduled") return "figma_screen_5";
  if (status === "interview_completed") return "figma_completed_no_events";
  if (status === "certification") return "figma_certification_competent";
  return "figma_screen_1";
};

export const resolveTradeName = (rawTrade: any, fallbackType = "RPL"): string => {
  const name = rawTrade?.name || (typeof rawTrade === "string" ? rawTrade : "");
  return name && !isRawId(name) ? name : fallbackType;
};

export const resolveSectorName = (rawSector: any): string => {
  const name = rawSector?.name || (typeof rawSector === "string" ? rawSector : "");
  return name && !isRawId(name) ? name : "";
};

export const buildFacilitatorData = (rawFacilitator: any, resolvedTrade: string) => {
  if (!rawFacilitator) return null;
  return {
    name: rawFacilitator.name || `${rawFacilitator.firstName || ""} ${rawFacilitator.lastName || ""}`.trim() || "Assigned Facilitator",
    avatar: rawFacilitator.photo?.url || rawFacilitator.photoUrl || rawFacilitator.avatar || null,
    role: rawFacilitator.role || `Facilitator · ${rawFacilitator.trade || resolvedTrade || "Coordinator"}`,
    tags: Array.isArray(rawFacilitator.tags) && rawFacilitator.tags.length > 0
      ? rawFacilitator.tags
      : [rawFacilitator.trade || resolvedTrade || "RPL", "RPL Coordinator"],
  };
};

export const buildInterviewAssessors = (panelData: any, resolvedTrade: string) => {
  if (!panelData?.members || !Array.isArray(panelData.members) || panelData.members.length === 0) return undefined;
  const nonObserver = panelData.members.filter((m: any) => !m.isObserver);
  const toUse = nonObserver.length >= 3 ? nonObserver.slice(0, 3) : panelData.members.slice(0, 3);
  return toUse.map((m: any, i: number) => ({
    id: m.assessorId || `assessor-${i}`,
    name: m.name || (m.isLead ? "Lead Assessor" : `Panelist ${i + 1}`),
    avatar: m.photo?.url || m.avatar || m.photoUrl || undefined,
    role: m.isLead || i === 0 ? "Lead Panelist" : "Panel Member",
    tags: m.sectors?.length ? m.sectors.map((s: any) => s.name) : [resolvedTrade, "RPL Coordinator"],
    isHighlighted: i === 1,
  }));
};

export const buildTransactionReceipt = (
  receiptData: any,
  application: any,
  apiApp: any,
  authUser: any,
  paymentQuote: any,
  paymentStage: any,
) => {
  const amountMinor = receiptData?.amount?.amountMinorUnits || paymentQuote?.amountMinorUnits || paymentStage?.amountMinorUnits;
  const amountPaid = amountMinor ? `₦${(Number(amountMinor) / 100).toLocaleString()}` : "—";
  return {
    id: receiptData?.paymentId || (application?.id ? "TXN_" + application.id.slice(0, 8) : "TXN_PENDING"),
    candidateName: receiptData?.candidateName || apiApp?.candidate?.name || authUser?.fullName || "Candidate",
    assessmentType: apiApp?.type || "RPL",
    description: "Recognition of prior learning",
    amountPaid,
    date: receiptData?.paidAt ? new Date(receiptData.paidAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    paymentMethod: receiptData?.provider || "Paystack",
    status: "Paid" as const,
    transactionId: receiptData?.paymentId || (application?.id ? "TXN_" + application.id.replace(/-/g, "").slice(0, 10).toUpperCase() : "TXN_PENDING"),
  };
};

export const populateOnboardingFromAppDetail = (dispatch: any, applicationId: string, apiApp: any) => {
  dispatch(setCurrentApplication(applicationId));
  const detailApp = apiApp as unknown as ApplicationDetail | undefined;
  if (detailApp?.personalInformation?.personalDetails) {
    const p = detailApp.personalInformation.personalDetails;
    const c = detailApp.personalInformation.contactInformation;
    const r = detailApp.personalInformation.residentialAddress;
    dispatch(setPersonalInfo({
      firstName: p.firstName || "", lastName: p.lastName || "", middleName: p.middleName || "",
      dob: p.dob || "", gender: p.gender || "", nationality: p.nationality || "",
      email: c?.emailAddress || "", phoneNumber: c?.phoneNumber?.number || "",
      country: r?.country || "", state: r?.state || "", lga: r?.lga || "", streetAddress: r?.address || "",
      impairment: "", passportFileName: "", passportAssetId: "", passportUrl: "",
    }));
  }
  if (detailApp?.currentOccupation) {
    dispatch(setRPLExperienceTrade({
      occupation: detailApp.currentOccupation.occupation || "",
      yearsOfExperience: String(detailApp.currentOccupation.yearsOfExperience || 1),
      employments: (detailApp.currentOccupation.employmentHistory || []).map((emp, i) => ({
        id: `emp-${i + 1}`, companyName: emp.company || "", jobTitle: emp.jobTitle || "",
        employmentType: emp.employmentType || "Full-time", startDate: emp.startDate || "",
        endDate: emp.endDate || "", responsibilities: emp.keyResponsibilities || "",
      })),
      qualificationTitle: (detailApp as any).trade?.name || "", qualificationCode: "",
      completedBefore: "no", previousAssessmentDetails: "", assessmentType: "rpl",
      individualUnit: (detailApp as any).unitIds || [], reasonRPL: (detailApp as any).reasonForSeekingRPL || "",
      selectedEvidence: [], otherEvidenceText: "",
    }));
  }
};
