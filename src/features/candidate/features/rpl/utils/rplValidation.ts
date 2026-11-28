import type { MeProfile } from "@/src/features/shared/account/api";
import type { ApplicationDetail } from "@/src/features/shared/applications/api";
import type {
  PersonalInfoState,
  RPLExperienceTradeState,
} from "@/store/slices/onboardingSlice";

export interface RplIncompleteSection {
  step: 1 | 2 | 3;
  title: string;
  route: string;
  missingFields: string[];
}

export interface RplCompletionReport {
  personalInfoCompleted: boolean;
  personalInfoMissing: string[];
  expCompleted: boolean;
  expMissing: string[];
  identityVerified: boolean;
  identityMissing: string[];
  incompleteSections: RplIncompleteSection[];
  isAllSectionsComplete: boolean;
}

const hasText = (value: unknown): boolean =>
  typeof value === "string" ? value.trim().length > 0 : false;

const hasNumberOrText = (value: unknown): boolean => {
  if (typeof value === "number") return !Number.isNaN(value);
  if (typeof value === "string") return value.trim().length > 0;
  return false;
};

interface OnboardingDataShape {
  personalDetails?: {
    firstName?: string;
    lastName?: string;
    dob?: string;
    gender?: string;
    nationality?: string;
  };
  contactInformation?: {
    phoneNumber?: { number?: string };
    emailAddress?: string;
  };
  residentialAddress?: {
    state?: string;
    address?: string;
    country?: string;
    lga?: string;
  };
  currentOccupation?: {
    occupation?: string;
    yearsOfExperience?: number | string;
    reasonForSeekingRPL?: string;
  };
  rplExperienceTrade?: {
    assessmentType?: string;
    occupation?: string;
    yearsOfExperience?: number | string;
    reasonRPL?: string;
  };
  reasonForSeekingRPL?: string;
}

export function evaluateRplCompletion(params: {
  personalInfo: PersonalInfoState;
  rplExp: RPLExperienceTradeState;
  rplIdentity?: { isVerified?: boolean } | null;
  user?: { isVerified?: boolean; email?: string | null } | null;
  candidateProfile?: { identityVerified?: boolean } | null;
  meProfile?: MeProfile | null;
  obData?: OnboardingDataShape | null;
  appDetail?: ApplicationDetail | null;
}): RplCompletionReport {
  const {
    personalInfo,
    rplExp,
    rplIdentity,
    user,
    candidateProfile,
    meProfile,
    obData,
    appDetail,
  } = params;

  const obPd = obData?.personalDetails;
  const obCi = obData?.contactInformation;
  const obRa = obData?.residentialAddress;
  const appPd = appDetail?.personalInformation?.personalDetails;
  const appCi = appDetail?.personalInformation?.contactInformation;
  const appRa = appDetail?.personalInformation?.residentialAddress;
  const mePd = meProfile?.personalDetails;
  const meCi = meProfile?.contactInformation;
  const meRa = meProfile?.residentialAddress;

  const personalInfoMissing: string[] = [];
  if (
    !hasText(personalInfo.firstName) &&
    !hasText(obPd?.firstName) &&
    !hasText(appPd?.firstName) &&
    !hasText(mePd?.firstName)
  ) {
    personalInfoMissing.push("First Name");
  }
  if (
    !hasText(personalInfo.lastName) &&
    !hasText(obPd?.lastName) &&
    !hasText(appPd?.lastName) &&
    !hasText(mePd?.lastName)
  ) {
    personalInfoMissing.push("Last Name");
  }
  if (
    !hasText(personalInfo.dob) &&
    !hasText(obPd?.dob) &&
    !hasText(appPd?.dob) &&
    !hasText(mePd?.dob)
  ) {
    personalInfoMissing.push("Date of Birth");
  }
  if (
    !hasText(personalInfo.gender) &&
    !hasText(obPd?.gender) &&
    !hasText(appPd?.gender) &&
    !hasText(mePd?.gender)
  ) {
    personalInfoMissing.push("Gender");
  }
  if (
    !hasText(personalInfo.nationality) &&
    !hasText(obPd?.nationality) &&
    !hasText(appPd?.nationality) &&
    !hasText(mePd?.nationality)
  ) {
    personalInfoMissing.push("Nationality");
  }
  if (
    !hasText(personalInfo.phoneNumber) &&
    !hasText(obCi?.phoneNumber?.number) &&
    !hasText(appCi?.phoneNumber?.number) &&
    !hasText(meCi?.phoneNumber?.number)
  ) {
    personalInfoMissing.push("Phone Number");
  }
  if (
    !hasText(personalInfo.state) &&
    !hasText(obRa?.state) &&
    !hasText(appRa?.state) &&
    !hasText(meRa?.state)
  ) {
    personalInfoMissing.push("State of Residence");
  }
  if (
    !hasText(personalInfo.streetAddress) &&
    !hasText(obRa?.address) &&
    !hasText(appRa?.address) &&
    !hasText(meRa?.address)
  ) {
    personalInfoMissing.push("Residential Address");
  }

  const obOcc = obData?.currentOccupation;
  const obRpl = obData?.rplExperienceTrade;
  const appOcc = appDetail?.currentOccupation;
  const meOcc = meProfile?.currentOccupation;

  const appUnitIds = Array.isArray(appDetail?.unitIds) ? appDetail.unitIds : [];
  const hasSavedAppExpData = Boolean(
    appOcc ||
      appUnitIds.length > 0 ||
      hasText(appDetail?.reasonForSeekingRPL) ||
      appDetail?.evidenceCandidateCanProvide,
  );
  const derivedAppAssessmentType =
    appUnitIds.length > 0
      ? "Modular Assessment"
      : hasSavedAppExpData
        ? "Full Qualification Assessment"
        : "";
  const effectiveAssessmentType =
    rplExp.assessmentType?.trim() ||
    obRpl?.assessmentType?.trim() ||
    derivedAppAssessmentType;

  const effectiveUnits =
    Array.isArray(rplExp.individualUnit) && rplExp.individualUnit.length > 0
      ? rplExp.individualUnit
      : appUnitIds;

  const hasOccupation =
    hasText(rplExp.occupation) ||
    hasText(obOcc?.occupation) ||
    hasText(obRpl?.occupation) ||
    hasText(appOcc?.occupation) ||
    hasText(meOcc?.occupation);

  const hasYearsOfExperience =
    hasNumberOrText(rplExp.yearsOfExperience) ||
    hasNumberOrText(obOcc?.yearsOfExperience) ||
    hasNumberOrText(obRpl?.yearsOfExperience) ||
    hasNumberOrText(appOcc?.yearsOfExperience) ||
    hasNumberOrText(meOcc?.yearsOfExperience);

  const hasReasonRPL =
    hasText(rplExp.reasonRPL) ||
    hasText(appDetail?.reasonForSeekingRPL) ||
    hasText(obRpl?.reasonRPL) ||
    hasText(obOcc?.reasonForSeekingRPL) ||
    hasText(obData?.reasonForSeekingRPL);

  const expMissing: string[] = [];
  if (!effectiveAssessmentType) {
    expMissing.push("Assessment Type");
  } else if (
    effectiveAssessmentType === "Modular Assessment" &&
    effectiveUnits.length === 0
  ) {
    expMissing.push("Individual Unit");
  }
  if (!hasOccupation) {
    expMissing.push("Occupation");
  }
  if (!hasYearsOfExperience) {
    expMissing.push("Years of Experience");
  }
  if (!hasReasonRPL) {
    expMissing.push("Reason for Seeking RPL");
  }

  const identityVerified = Boolean(
    rplIdentity?.isVerified ||
      user?.isVerified ||
      candidateProfile?.identityVerified ||
      meProfile?.identityVerified ||
      appDetail?.identityVerified,
  );
  const identityMissing = identityVerified ? [] : ["NIN Verification"];

  const personalInfoCompleted = personalInfoMissing.length === 0;
  const expCompleted = expMissing.length === 0;

  const incompleteSections: RplIncompleteSection[] = [];
  if (!personalInfoCompleted) {
    incompleteSections.push({
      step: 1,
      title: "Personal Information",
      route: "/rpl/personal-info",
      missingFields: personalInfoMissing,
    });
  }
  if (!expCompleted) {
    incompleteSections.push({
      step: 2,
      title: "Experience & Trade",
      route: "/rpl/experience-trade",
      missingFields: expMissing,
    });
  }
  if (!identityVerified) {
    incompleteSections.push({
      step: 3,
      title: "Identity Verification (NIN)",
      route: "/rpl/verify-identity",
      missingFields: identityMissing,
    });
  }

  return {
    personalInfoCompleted,
    personalInfoMissing,
    expCompleted,
    expMissing,
    identityVerified,
    identityMissing,
    incompleteSections,
    isAllSectionsComplete: incompleteSections.length === 0,
  };
}

export function buildIncompleteApplicationMessage(
  incompleteSections: RplIncompleteSection[],
): string {
  if (incompleteSections.length === 0) return "";
  if (incompleteSections.length === 1) {
    const sec = incompleteSections[0];
    return `${sec.title} is incomplete (missing: ${sec.missingFields.join(", ")}). Please open ${sec.title} to complete it before submitting.`;
  }
  const summary = incompleteSections
    .map((sec) => `${sec.title}: ${sec.missingFields.join(", ")}`)
    .join("; ");
  return `Please complete all required sections before submitting — ${summary}.`;
}

const BACKEND_FIELD_LABELS: Record<string, string> = {
  reasonForSeekingRPL: "Reason for Seeking RPL (Experience & Trade)",
  "experienceAndTrade.reasonForSeekingRPL":
    "Reason for Seeking RPL (Experience & Trade)",
  currentOccupation: "Current Occupation (Experience & Trade)",
  "experienceAndTrade.currentOccupation":
    "Current Occupation (Experience & Trade)",
  "currentOccupation.occupation": "Occupation (Experience & Trade)",
  "experienceAndTrade.currentOccupation.occupation":
    "Occupation (Experience & Trade)",
  "currentOccupation.yearsOfExperience":
    "Years of Experience (Experience & Trade)",
  "experienceAndTrade.currentOccupation.yearsOfExperience":
    "Years of Experience (Experience & Trade)",
  "currentOccupation.employmentHistory":
    "Employment History (Experience & Trade)",
  "experienceAndTrade.currentOccupation.employmentHistory":
    "Employment History (Experience & Trade)",
  evidenceCandidateCanProvide: "Evidence Summary (Experience & Trade)",
  "experienceAndTrade.evidenceCandidateCanProvide":
    "Evidence Summary (Experience & Trade)",
  unitIds: "Selected Units (Experience & Trade)",
  "experienceAndTrade.unitIds": "Selected Units (Experience & Trade)",
  qualificationLevelId: "Qualification Level (Experience & Trade)",
  "experienceAndTrade.qualificationLevelId":
    "Qualification Level (Experience & Trade)",
  personalDetails: "Personal Details (Personal Information)",
  "personalInformation.personalDetails":
    "Personal Details (Personal Information)",
  "personalDetails.firstName": "First Name (Personal Information)",
  "personalInformation.personalDetails.firstName":
    "First Name (Personal Information)",
  "personalDetails.lastName": "Last Name (Personal Information)",
  "personalInformation.personalDetails.lastName":
    "Last Name (Personal Information)",
  "personalDetails.dob": "Date of Birth (Personal Information)",
  "personalInformation.personalDetails.dob":
    "Date of Birth (Personal Information)",
  "personalDetails.gender": "Gender (Personal Information)",
  "personalInformation.personalDetails.gender": "Gender (Personal Information)",
  "personalDetails.nationality": "Nationality (Personal Information)",
  "personalInformation.personalDetails.nationality":
    "Nationality (Personal Information)",
  contactInformation: "Contact Information (Personal Information)",
  "personalInformation.contactInformation":
    "Contact Information (Personal Information)",
  "contactInformation.phoneNumber": "Phone Number (Personal Information)",
  "personalInformation.contactInformation.phoneNumber":
    "Phone Number (Personal Information)",
  "contactInformation.emailAddress": "Email Address (Personal Information)",
  "personalInformation.contactInformation.emailAddress":
    "Email Address (Personal Information)",
  residentialAddress: "Residential Address (Personal Information)",
  "personalInformation.residentialAddress":
    "Residential Address (Personal Information)",
  "residentialAddress.state": "State of Residence (Personal Information)",
  "personalInformation.residentialAddress.state":
    "State of Residence (Personal Information)",
  "residentialAddress.address": "Residential Address (Personal Information)",
  "personalInformation.residentialAddress.address":
    "Residential Address (Personal Information)",
  identityVerified: "Identity Verification (NIN)",
  assessmentDeclaration: "Assessment Declaration (Review & Submit)",
};

function humanizeFieldPath(rawField: string): string {
  const cleaned = rawField.trim().replace(/^body\./, "");
  if (BACKEND_FIELD_LABELS[cleaned]) {
    return BACKEND_FIELD_LABELS[cleaned];
  }
  const leaf = cleaned.split(".").pop() || cleaned;
  if (BACKEND_FIELD_LABELS[leaf]) {
    return BACKEND_FIELD_LABELS[leaf];
  }
  return leaf
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

interface ErrorDetailItem {
  field?: string;
  path?: string | string[];
  issue?: string;
  message?: string;
}

interface SubmissionErrorLike {
  message?: string;
  details?: Array<string | ErrorDetailItem>;
}

export function formatRplSubmissionError(
  err: unknown,
  fallbackMessage = "Failed to submit application. Please review your sections and try again.",
): string {
  const errObj =
    err && typeof err === "object" ? (err as SubmissionErrorLike) : undefined;
  const details = Array.isArray(errObj?.details) ? errObj.details : [];
  if (details.length > 0) {
    const formatted = details
      .map((d) => {
        if (typeof d === "string") return d.trim();
        const rawField =
          typeof d?.field === "string"
            ? d.field
            : Array.isArray(d?.path)
              ? d.path.join(".")
              : typeof d?.path === "string"
                ? d.path
                : "";
        const issue = (d?.issue || d?.message || "").trim();
        if (rawField && issue) {
          const label = humanizeFieldPath(rawField);
          if (issue.toLowerCase().includes(label.toLowerCase())) {
            return issue;
          }
          return `${label}: ${issue}`;
        }
        if (rawField) {
          return `${humanizeFieldPath(rawField)} is required`;
        }
        return issue;
      })
      .filter(Boolean);

    const unique = Array.from(new Set(formatted));
    if (unique.length > 0) {
      return unique.join(". ");
    }
  }

  if (typeof errObj?.message === "string" && errObj.message.trim().length > 0) {
    let msg = errObj.message.trim();
    for (const [key, label] of Object.entries(BACKEND_FIELD_LABELS)) {
      if (msg.includes(key)) {
        msg = msg.replaceAll(key, label);
      }
    }
    return msg;
  }

  return fallbackMessage;
}
