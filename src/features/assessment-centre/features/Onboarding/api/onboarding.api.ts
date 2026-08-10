import {
  saveOnboardingApi,
  submitOnboardingApi,
  getOnboardingPersonaApi,
  type OnboardingRecord,
} from "@/src/features/shared/onboarding/api";

export interface CentreInformationPayload {
  name: string;
  registrationNo: string;
  logoAssetId?: string;
}

export interface CentreResidentialAddressPayload {
  country: string;
  state: string;
  lga?: string;
  address: string;
}

export interface CentreSupportInformationPayload {
  emailAddress: string;
  phoneNumber: {
    countryCode: string;
    number: string;
  };
}

export interface CentreAccountDetailsPayload {
  bank: string;
  accountNo: string;
  nameOfAccount?: string;
}

export interface CentreOwnerPayload {
  personalDetails?: {
    firstName: string;
    lastName: string;
    middleName?: string;
    dob: string;
    gender: string;
    nationality: string;
  };
  contactInformation?: CentreSupportInformationPayload;
  residentialAddress?: CentreResidentialAddressPayload;
}

export interface CentreOnboardingPayload {
  centre?: {
    centreInformation?: CentreInformationPayload;
    centreResidentialAddress?: CentreResidentialAddressPayload;
    centreSupportInformation?: CentreSupportInformationPayload;
    centreAccountDetails?: CentreAccountDetailsPayload;
  };
  owner?: CentreOwnerPayload;
}

export async function saveCentreOnboardingApi(
  payload: CentreOnboardingPayload,
): Promise<OnboardingRecord> {
  return saveOnboardingApi({
    persona: "centre",
    data: payload as unknown as Record<string, unknown>,
  });
}

export async function getCentreOnboardingApi(): Promise<OnboardingRecord> {
  return getOnboardingPersonaApi("centre");
}

export async function submitCentreOnboardingApi() {
  return submitOnboardingApi("centre");
}
