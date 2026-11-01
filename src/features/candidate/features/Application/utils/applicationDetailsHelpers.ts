import type { ApplicationFormState } from "../types";
import { setCurrentApplication } from "@/store/slices/applicationSlice";
import {
  setPersonalInfo,
  setRPLExperienceTrade,
  setStartApplication,
} from "@/store/slices/onboardingSlice";
import { getStagesConfig } from "./constants";
import type {
  ApplicationDetail,
  ApplicationStage,
} from "@/src/features/shared/applications/api";
import { formatCurrency } from "@/src/utils/currency";

/**
 * Determines whether a candidate is allowed to withdraw an application
 * per OpenAPI `POST /applications/{id}/withdraw`:
 * - Self-pay only (`!organizationId`)
 * - Allowed while `status` is `draft`, OR `status` is `in_progress` on `application_form`
 *   (still pending centre review, before centre approval / payment).
 */
export const canCandidateWithdrawApplication = (
  apiApp?: any,
  stagesData?: ApplicationStage[],
): boolean => {
  if (!apiApp?.id) return false;
  if (apiApp?.organizationId) return false;

  const status = String(apiApp?.status || "").toLowerCase();
  if (
    status === "withdrawn" ||
    status === "certified" ||
    status === "rejected"
  ) {
    return false;
  }

  if (status === "draft") {
    return true;
  }

  if (
    status === "in_progress" ||
    status === "submitted" ||
    status === "pending"
  ) {
    const currentStageKey = String(
      apiApp?.currentStageKey || apiApp?.stageKey || "",
    ).toLowerCase();

    const appFormStage = stagesData?.find(
      (s) =>
        s.stageKey === "application_form" ||
        s.stageKey === "application_review" ||
        s.stageKey === "application",
    );
    const isAppFormApproved = Boolean(
      appFormStage?.status === "successful" ||
        (appFormStage?.status as string) === "approved" ||
        (appFormStage?.status as string) === "completed",
    );

    const paymentStage = stagesData?.find(
      (s) => s.stageKey === "payment" || s.stageKey === "payment_quote",
    );
    const isPaymentPaid = Boolean(
      paymentStage?.status === "successful" ||
        (paymentStage?.status as string) === "completed" ||
        (paymentStage?.status as string) === "approved" ||
        apiApp?.paymentCompleted,
    );

    const isAtApplicationFormStage =
      !currentStageKey ||
      currentStageKey === "application_form" ||
      currentStageKey === "application_review" ||
      currentStageKey === "draft" ||
      currentStageKey === "submitted";

    return isAtApplicationFormStage && !isAppFormApproved && !isPaymentPaid;
  }

  return false;
};

export const isRawId = (str?: string): boolean => {
  if (!str) return false;
  return /^[0-9A-Z]{20,}$/.test(str) || /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(str);
};

export const formatIsoToDisplayDate = (
  dateStr?: string | null,
  shortYear = false,
): string => {
  if (!dateStr || typeof dateStr !== "string") return "";
  const trimmed = dateStr.trim();
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, yyyy, mm, dd] = isoMatch;
    const yr = shortYear ? yyyy.slice(-2) : yyyy;
    return `${dd}/${mm}/${yr}`;
  }
  const slashMatch = trimmed.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/);
  if (slashMatch) {
    const [, d, m, y] = slashMatch;
    const dd = d.padStart(2, "0");
    const mm = m.padStart(2, "0");
    let yr = y;
    if (shortYear && y.length === 4) yr = y.slice(-2);
    if (!shortYear && y.length === 2) {
      const yNum = parseInt(y, 10);
      yr = String(yNum < 40 ? 2000 + yNum : 1900 + yNum);
    }
    return `${dd}/${mm}/${yr}`;
  }
  return trimmed;
};

export const normalizeGenderForForm = (gender?: string | null): string => {
  if (!gender) return "";
  const lower = gender.trim().toLowerCase();
  if (lower === "male") return "Male";
  if (lower === "female") return "Female";
  if (lower.includes("prefer")) return "Prefer not to say";
  return gender;
};

export const mapEvidenceFlagsToLabels = (
  ev?: Record<string, any> | null,
): string[] => {
  if (!ev || typeof ev !== "object") return [];
  const selected: string[] = [];
  if (ev.resume) selected.push("Resume / CV");
  if (ev.workSamples) selected.push("Work Samples");
  if (ev.employmentLetter) selected.push("Employment Letter");
  if (ev.certificates) selected.push("Certificates / Statements of Attainment");
  if (ev.statementsOfAttainment) selected.push("Statements of Attainment");
  if (ev.thirdPartyReportsOrReferences) {
    selected.push("References / Third-Party Reports");
  }
  if (ev.jobDescriptions) selected.push("Job Descriptions");
  if (ev.photosOrVideosOfWork) selected.push("Photos / Videos of Work");
  if (ev.other) selected.push("Other");
  return selected;
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
    name: rawFacilitator.name || `${rawFacilitator.firstName || ""} ${rawFacilitator.lastName || ""}`.trim(),
    avatar: rawFacilitator.photo?.url || rawFacilitator.photoUrl || rawFacilitator.avatar || null,
    role: rawFacilitator.role || ["Facilitator", rawFacilitator.trade || resolvedTrade].filter(Boolean).join(" · "),
    tags: Array.isArray(rawFacilitator.tags) && rawFacilitator.tags.length > 0
      ? rawFacilitator.tags
      : [rawFacilitator.trade || resolvedTrade].filter(Boolean),
  };
};

export const buildInterviewAssessors = (panelData: any, resolvedTrade: string) => {
  if (!panelData?.members || !Array.isArray(panelData.members) || panelData.members.length === 0) return undefined;
  const sorted = [...panelData.members].sort((a: any, b: any) => {
    if (a.isLead) return -1;
    if (b.isLead) return 1;
    if (a.isObserver) return 1;
    if (b.isObserver) return -1;
    return 0;
  });

  return sorted.slice(0, 3).map((m: any, i: number) => {
    const role = m.isLead
      ? "Lead Panelist"
      : m.isObserver
        ? "Internal Verifier"
        : "Panel Member";

    return {
      id: m.assessorId || `assessor-${i}`,
      name: m.name || role,
      avatar: m.photo?.url || m.avatar || m.photoUrl || undefined,
      role,
      tags: m.isObserver
        ? ["Internal Verifier", "RPL Quality"]
        : m.sectors?.length
          ? m.sectors.map((s: any) => s.name)
          : [resolvedTrade, m.isLead ? "Lead Assessor" : "Assessor"],
      isHighlighted: Boolean(m.isLead),
    };
  });
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
  const currency = receiptData?.amount?.currency || paymentQuote?.currency || paymentStage?.currency || "NGN";
  const amountPaid = amountMinor ? formatCurrency(amountMinor, currency) : "—";
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
  if (detailApp) {
    const centreId =
      detailApp.centreId ||
      (typeof detailApp.centre === "object" ? detailApp.centre?.id : "") ||
      "";
    const sectorId =
      detailApp.sectorId ||
      (typeof detailApp.sector === "object" ? detailApp.sector?.id : "") ||
      "";
    const tradeId =
      detailApp.tradeId ||
      (typeof detailApp.trade === "object" ? detailApp.trade?.id : "") ||
      "";
    const qLevelId =
      detailApp.qualificationLevelId ||
      detailApp.qualificationLevel?.id ||
      (detailApp as any)?.appliedQualificationLevel?.id ||
      "";
    const qLevelNum =
      detailApp.qualificationLevel?.level ??
      (detailApp as any)?.appliedQualificationLevel?.level;

    if (centreId || sectorId || tradeId) {
      dispatch(
        setStartApplication({
          ...(centreId ? { assessmentCenter: centreId } : {}),
          ...(sectorId ? { sector: sectorId } : {}),
          ...(tradeId ? { trade: tradeId } : {}),
          ...(detailApp.centre?.name ? { centreName: detailApp.centre.name } : {}),
          ...(detailApp.sector?.name ? { sectorName: detailApp.sector.name } : {}),
          ...(detailApp.trade?.name ? { tradeName: detailApp.trade.name } : {}),
          ...(qLevelId ? { qualificationLevelId: qLevelId } : {}),
          ...(qLevelNum !== undefined
            ? { level: String(qLevelNum), levelNumber: qLevelNum }
            : {}),
        }),
      );
    }
  }
  if (detailApp?.personalInformation?.personalDetails) {
    const p = detailApp.personalInformation.personalDetails;
    const c = detailApp.personalInformation.contactInformation;
    const r = detailApp.personalInformation.residentialAddress;
    dispatch(
      setPersonalInfo({
        firstName: p.firstName || "",
        lastName: p.lastName || "",
        middleName: p.middleName || "",
        dob: formatIsoToDisplayDate(p.dob, false),
        gender: normalizeGenderForForm(p.gender),
        nationality: p.nationality || "",
        email: c?.emailAddress || "",
        phoneNumber: c?.phoneNumber?.number || "",
        country: r?.country || "Nigeria",
        state: r?.state || "",
        lga: r?.lga || "",
        streetAddress: r?.address || "",
      }),
    );
  }
  if (detailApp) {
    const occ = detailApp.currentOccupation;
    const unitIds = Array.isArray((detailApp as any).unitIds)
      ? (detailApp as any).unitIds
      : [];
    const mappedEvidence = mapEvidenceFlagsToLabels(
      (detailApp as any).evidenceCandidateCanProvide,
    );
    const hasSavedExpData = Boolean(
      occ ||
        unitIds.length > 0 ||
        (detailApp as any).reasonForSeekingRPL ||
        (detailApp as any).evidenceCandidateCanProvide,
    );
    const resolvedTradeTitle =
      detailApp.trade?.name && !isRawId(detailApp.trade.name)
        ? detailApp.trade.name
        : "";
    const decl = (detailApp as any).assessmentDeclaration;

    dispatch(
      setRPLExperienceTrade({
        ...(resolvedTradeTitle ? { qualificationTitle: resolvedTradeTitle } : {}),
        ...(occ?.occupation ? { occupation: occ.occupation } : {}),
        ...(occ?.yearsOfExperience !== undefined
          ? { yearsOfExperience: String(occ.yearsOfExperience) }
          : {}),
        ...(Array.isArray(occ?.employmentHistory) &&
        occ.employmentHistory.length > 0
          ? {
              employments: occ.employmentHistory.map((emp, i) => ({
                id: `emp-${i + 1}`,
                companyName: emp.company || "",
                jobTitle: emp.jobTitle || "",
                employmentType: emp.employmentType || "Full-time",
                startDate: formatIsoToDisplayDate(emp.startDate, true),
                endDate: formatIsoToDisplayDate(emp.endDate, true),
                responsibilities: emp.keyResponsibilities || "",
              })),
            }
          : {}),
        ...(hasSavedExpData
          ? {
              assessmentType:
                unitIds.length > 0
                  ? "Modular Assessment"
                  : "Full Qualification Assessment",
            }
          : {}),
        individualUnit: unitIds,
        ...(typeof (detailApp as any).reasonForSeekingRPL === "string"
          ? { reasonRPL: (detailApp as any).reasonForSeekingRPL }
          : {}),
        ...(mappedEvidence.length > 0
          ? { selectedEvidence: mappedEvidence }
          : {}),
        ...(decl
          ? {
              declarations: {
                trueAndAccurate: Boolean(decl.infoProvidedIsAccurate ?? true),
                noGuarantee: Boolean(
                  decl.understandsDoesNotGuaranteeCertification,
                ),
                sufficientEvidence: Boolean(
                  decl.understandsThatNeedsToProvideSufficientEvidenceToDemonstrateCompetence,
                ),
                agreeTerms: Boolean(decl.agreesToTermsAndPrivacyPolicy),
              },
            }
          : {}),
      }),
    );
  }
};
