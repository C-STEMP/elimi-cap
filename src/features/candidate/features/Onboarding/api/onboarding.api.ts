import {
  saveOnboardingApi,
  submitOnboardingApi,
  getOnboardingPersonaApi,
  type OnboardingRecord,
} from "@/src/features/shared/onboarding/api";

export interface PersonalDetails {
  firstName: string;
  lastName: string;
  middleName?: string;
  dob: string;
  gender: string;
  nationality: string;
}

export interface ContactInformation {
  emailAddress: string;
  phoneNumber: {
    countryCode: string;
    number: string;
  };
}

export interface ResidentialAddress {
  country: string;
  state: string;
  lga?: string;
  address: string;
}

export interface CandidateOnboardingPayload {
  personalDetails?: PersonalDetails;
  contactInformation?: ContactInformation;
  residentialAddress?: ResidentialAddress;
  previousAssessmentStatus?: {
    hasCompletedPreviousAssessment: boolean;
    uniqueLearnerId?: string;
  };
  accessibility?: {
    hasImpairment: boolean;
    impairment?: string;
  };
}

export async function saveCandidateOnboardingApi(
  payload: CandidateOnboardingPayload,
): Promise<OnboardingRecord> {
  return saveOnboardingApi({
    persona: "candidate",
    data: payload as unknown as Record<string, unknown>,
  });
}

export async function getCandidateOnboardingApi(): Promise<OnboardingRecord> {
  return getOnboardingPersonaApi("candidate");
}

export async function submitCandidateOnboardingApi() {
  return submitOnboardingApi("candidate");
}
