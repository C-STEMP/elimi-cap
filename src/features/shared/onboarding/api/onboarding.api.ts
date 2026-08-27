import { capFetch } from "@/src/lib/api/cap";

export type PersonaType = "candidate" | "assessor" | "centre" | "awarding_body";

export interface OnboardingSummary {
  onboardingId: string;
  persona: PersonaType;
  status: "draft" | "completed";
  createdAt: string;
  lastUpdatedAt?: string;
  completedAt?: string | null;
}

export interface OnboardingRecord extends OnboardingSummary {
  data: Record<string, unknown>;
}

export interface StartOnboardingPayload {
  persona: PersonaType;
}

export async function startOnboardingApi(
  payload: StartOnboardingPayload,
): Promise<OnboardingSummary> {
  return capFetch<OnboardingSummary>("/onboarding/start", {
    method: "POST",
    data: payload,
  });
}

export interface OnboardingMineResponse {
  onboardings: OnboardingSummary[];
}

export function parseOnboardingMine(res: any): {
  isOnboarded: boolean;
  persona: PersonaType | null;
  activeRecord: OnboardingSummary | null;
} {
  if (!res) return { isOnboarded: false, persona: null, activeRecord: null };
  const list: OnboardingSummary[] = Array.isArray(res?.onboardings)
    ? res.onboardings
    : Array.isArray(res)
    ? res
    : res?.persona
    ? [res]
    : [];

  const completed = list.find((o) => o.status === "completed");
  if (completed) {
    return {
      isOnboarded: true,
      persona: completed.persona || null,
      activeRecord: completed,
    };
  }

  const draft = list.find((o) => o.status === "draft") || list[0];
  return {
    isOnboarded: false,
    persona: draft?.persona || null,
    activeRecord: draft || null,
  };
}

export async function getOnboardingMineApi(): Promise<OnboardingMineResponse> {
  return capFetch<OnboardingMineResponse>("/onboarding/mine", {
    method: "GET",
  });
}

export async function getOnboardingPersonaApi(
  persona: PersonaType,
): Promise<OnboardingRecord> {
  try {
    return await capFetch<OnboardingRecord>(`/onboarding/${persona}`, {
      method: "GET",
    });
  } catch (error: any) {
    const isNotFound =
      error?.code === "onboarding.not_found" ||
      error?.statusCode === 404 ||
      error?.message?.toLowerCase()?.includes("not found");

    if (isNotFound) {
      try {
        await startOnboardingApi({ persona });
        return await capFetch<OnboardingRecord>(`/onboarding/${persona}`, {
          method: "GET",
        });
      } catch {
        return {
          onboardingId: "",
          persona,
          status: "draft",
          createdAt: new Date().toISOString(),
          data: {},
        };
      }
    }
    throw error;
  }
}

export interface SaveOnboardingPayload {
  persona: PersonaType;
  data: Record<string, unknown>;
}

export async function saveOnboardingApi(
  payload: SaveOnboardingPayload,
): Promise<OnboardingRecord> {
  try {
    return await capFetch<OnboardingRecord>(`/onboarding/${payload.persona}/save`, {
      method: "PATCH",
      data: payload.data,
    });
  } catch (error: any) {
    const isNotFound =
      error?.code === "onboarding.not_found" ||
      error?.statusCode === 404 ||
      error?.message?.toLowerCase()?.includes("not found");

    if (isNotFound) {
      try {
        await startOnboardingApi({ persona: payload.persona });
        return await capFetch<OnboardingRecord>(
          `/onboarding/${payload.persona}/save`,
          {
            method: "PATCH",
            data: payload.data,
          },
        );
      } catch (retryError) {
        throw retryError;
      }
    }
    throw error;
  }
}

export interface SubmitOnboardingResponse {
  status: "completed";
  completedAt: string;
}

export async function submitOnboardingApi(
  persona: PersonaType,
): Promise<SubmitOnboardingResponse> {
  try {
    return await capFetch<SubmitOnboardingResponse>(`/onboarding/${persona}/submit`, {
      method: "POST",
    });
  } catch (error: any) {
    const isNotFound =
      error?.code === "onboarding.not_found" ||
      error?.statusCode === 404 ||
      error?.message?.toLowerCase()?.includes("not found");

    if (isNotFound) {
      try {
        await startOnboardingApi({ persona });
        return await capFetch<SubmitOnboardingResponse>(
          `/onboarding/${persona}/submit`,
          {
            method: "POST",
          },
        );
      } catch (retryError) {
        throw retryError;
      }
    }
    throw error;
  }
}

export interface IdentityVerificationPayload {
  type: "nin";
  identificationNumber: string;
}

export interface IdentityVerificationResponse {
  verified: boolean;
  verifiedAt: string | null;
}

export async function verifyIdentityApi(
  payload: IdentityVerificationPayload,
): Promise<IdentityVerificationResponse> {
  return capFetch<IdentityVerificationResponse>("/identity-verification", {
    method: "POST",
    data: payload,
  });
}

export interface CandidateProfile {
  name: string;
  identityVerified: boolean;
  createdAt: string;
}

export async function getCandidateProfileApi(): Promise<CandidateProfile> {
  return capFetch<CandidateProfile>("/candidate/profile", {
    method: "GET",
  });
}

export interface CandidateProfileSignature {
  assetId: string | null;
  url: string | null;
}

export async function getCandidateProfileSignatureApi(): Promise<CandidateProfileSignature> {
  return capFetch<CandidateProfileSignature>("/candidate/profile/signature", {
    method: "GET",
  });
}

export async function putCandidateProfileSignatureApi(payload: {
  assetId: string;
}): Promise<void> {
  await capFetch<void>("/candidate/profile/signature", {
    method: "PUT",
    data: payload,
  });
}

export interface ApplicationsSummary {
  active: number;
  completed: number;
}

export async function getApplicationsSummaryApi(): Promise<ApplicationsSummary> {
  return capFetch<ApplicationsSummary>("/applications/summary", {
    method: "GET",
  });
}

export interface ApplicationEvent {
  id: string;
  applicationId: string;
  name: string;
  eventAt: string;
  link?: string | null;
  location?: string | null;
  eventType: "interview" | "other";
}

export async function getCandidateEventsApi(): Promise<ApplicationEvent[]> {
  return capFetch<ApplicationEvent[]>("/candidate/events", {
    method: "GET",
  });
}
