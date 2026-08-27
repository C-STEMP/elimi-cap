import { capFetch } from "@/src/lib/api/cap";

export type MembershipOperableStatus = "operable" | "onboarding_required";
export type CentreStaffRole = "super_admin" | "regular_admin" | "staff";

export interface CapMeCentreMembership {
  centreId: string;
  name: string;
  role: CentreStaffRole;
  status: MembershipOperableStatus;
}

export interface CapMe {
  identityVerified: boolean;
  candidate?: {
    status: MembershipOperableStatus;
  };
  centres: CapMeCentreMembership[];
}

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

export interface Accessibility {
  hasImpairment: boolean;
  impairment?: string;
}

export interface EmploymentHistoryItem {
  company: string;
  jobTitle: string;
  employmentType: string;
  startDate: string;
  endDate?: string;
  keyResponsibilities: string;
}

export interface CurrentOccupation {
  occupation: string;
  yearsOfExperience: number;
  employmentHistory: EmploymentHistoryItem[];
}

export interface ResolvedAsset {
  assetId: string;
  url?: string | null;
}

export interface MeProfile {
  identityVerified: boolean;
  personalDetails?: PersonalDetails;
  contactInformation?: ContactInformation;
  residentialAddress?: ResidentialAddress;
  currentOccupation?: CurrentOccupation | null;
  accessibility?: Accessibility | null;
  photoAssetId?: string | null;
  photo?: ResolvedAsset | null;
}

export interface MeProfilePatch {
  personalDetails?: Partial<PersonalDetails>;
  contactInformation?: Partial<ContactInformation>;
  residentialAddress?: Partial<ResidentialAddress>;
  currentOccupation?: Partial<CurrentOccupation>;
  accessibility?: Partial<Accessibility>;
  photoAssetId?: string | null;
}

export interface DeletionEligibility {
  canDelete: boolean;
  blockers: ("last_centre_super_admin")[];
}

export async function getMeApi(): Promise<CapMe> {
  return capFetch<CapMe>("/me", {
    method: "GET",
  });
}

export async function getMeProfileApi(): Promise<MeProfile> {
  return capFetch<MeProfile>("/me/profile", {
    method: "GET",
  });
}

export async function patchMeProfileApi(payload: MeProfilePatch): Promise<MeProfile> {
  return capFetch<MeProfile>("/me/profile", {
    method: "PATCH",
    data: payload,
  });
}

export async function getMeDeletionEligibilityApi(): Promise<DeletionEligibility> {
  return capFetch<DeletionEligibility>("/me/deletion-eligibility", {
    method: "GET",
  });
}
