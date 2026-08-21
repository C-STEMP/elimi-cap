import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/src/components/ui/toast";
import { ApiError } from "@/src/lib/api/client";
import {
  startOnboardingApi,
  getOnboardingMineApi,
  getOnboardingPersonaApi,
  saveOnboardingApi,
  submitOnboardingApi,
  verifyIdentityApi,
  getCandidateProfileApi,
  getCandidateProfileSignatureApi,
  putCandidateProfileSignatureApi,
  getApplicationsSummaryApi,
  getCandidateEventsApi,
  type PersonaType,
  type SaveOnboardingPayload,
  type IdentityVerificationPayload,
} from "../api/onboarding.api";

export const ONBOARDING_QUERY_KEYS = {
  mine: ["onboarding", "mine"] as const,
  persona: (persona: PersonaType) => ["onboarding", persona] as const,
  candidateProfile: ["candidate", "profile"] as const,
  candidateSignature: ["candidate", "signature"] as const,
  applicationsSummary: ["applications", "summary"] as const,
  candidateEvents: ["candidate", "events"] as const,
};

export function useStartOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (persona: PersonaType) => startOnboardingApi({ persona }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ONBOARDING_QUERY_KEYS.mine });
    },

    onError: (error: Error) => {
      // Don't show a toast here for conflict errors (409) — those are handled
      // gracefully in the caller (RoleSelection). Only log network / unknown errors.
      const apiError = error as any;
      const isConflict =
        apiError?.statusCode === 409 ||
        apiError?.message?.toLowerCase?.().includes("already") ||
        apiError?.message?.toLowerCase?.().includes("conflict");

      if (!isConflict) {
        // Re-throw so the caller's onError fires with the original error
        throw error;
      }
    },
  });
}

export function useGetOnboardingMine() {
  return useQuery({
    queryKey: ONBOARDING_QUERY_KEYS.mine,
    queryFn: () => getOnboardingMineApi(),
  });
}

export function useGetOnboardingPersona(persona: PersonaType) {
  return useQuery({
    queryKey: ONBOARDING_QUERY_KEYS.persona(persona),
    queryFn: () => getOnboardingPersonaApi(persona),
    enabled: Boolean(persona),
  });
}

export function useSaveOnboarding() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: SaveOnboardingPayload) => saveOnboardingApi(payload),

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ONBOARDING_QUERY_KEYS.persona(data.persona),
      });
      toast({
        type: "success",
        title: "Progress Saved",
        description: "Your onboarding details have been saved.",
      });
    },

    onError: (error: Error) => {
      if (error instanceof ApiError) {
        toast({
          type: "error",
          title: "Save Failed",
          description: error.message,
        });
      } else {
        toast({
          type: "error",
          title: "Network Error",
          description: "Unable to save progress. Please try again.",
        });
      }
    },
  });
}

export function useSubmitOnboarding() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (persona: PersonaType) => submitOnboardingApi(persona),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ONBOARDING_QUERY_KEYS.mine });
      toast({
        type: "success",
        title: "Onboarding Submitted",
        description: "Your onboarding request has been successfully submitted.",
      });
    },

    onError: (error: Error) => {
      if (error instanceof ApiError) {
        toast({
          type: "error",
          title: "Submission Failed",
          description: error.message,
        });
      } else {
        toast({
          type: "error",
          title: "Network Error",
          description: "Unable to submit onboarding. Please try again.",
        });
      }
    },
  });
}

import { useAppDispatch } from "@/store/hooks";
import { markVerified } from "@/store/slices/authSlice";
import {
  setRPLIdentity,
  setCentreIdentity,
  setAssessorIdentity,
} from "@/store/slices/onboardingSlice";

export function useVerifyIdentity() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: IdentityVerificationPayload) => verifyIdentityApi(payload),

    onSuccess: (_, variables) => {
      dispatch(markVerified());
      if (variables?.identificationNumber) {
        dispatch(setRPLIdentity({ nin: variables.identificationNumber, isVerified: true }));
        dispatch(setCentreIdentity({ nin: variables.identificationNumber, isVerified: true }));
        dispatch(setAssessorIdentity({ nin: variables.identificationNumber, isVerified: true }));
      } else {
        dispatch(setRPLIdentity({ isVerified: true }));
        dispatch(setCentreIdentity({ isVerified: true }));
        dispatch(setAssessorIdentity({ isVerified: true }));
      }
      queryClient.invalidateQueries({
        queryKey: ONBOARDING_QUERY_KEYS.candidateProfile,
      });
      queryClient.invalidateQueries({
        queryKey: ONBOARDING_QUERY_KEYS.mine,
      });
      toast({
        type: "success",
        title: "Identity Verified",
        description: "Your NIN has been verified successfully.",
      });
    },

    onError: (error: Error) => {
      if (error instanceof ApiError) {
        toast({
          type: "error",
          title: "Verification Failed",
          description: error.message,
        });
      } else {
        toast({
          type: "error",
          title: "Network Error",
          description: "Unable to verify identity. Please try again.",
        });
      }
    },
  });
}

export function useCandidateProfile(enabled = false) {
  return useQuery({
    queryKey: ONBOARDING_QUERY_KEYS.candidateProfile,
    queryFn: () => getCandidateProfileApi(),
    enabled,
  });
}

export function useCandidateProfileSignature(enabled = false) {
  return useQuery({
    queryKey: ONBOARDING_QUERY_KEYS.candidateSignature,
    queryFn: () => getCandidateProfileSignatureApi(),
    enabled,
  });
}

export function useSetCandidateProfileSignature() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (assetId: string) =>
      putCandidateProfileSignatureApi({ assetId }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ONBOARDING_QUERY_KEYS.candidateSignature,
      });
      toast({
        type: "success",
        title: "Signature Updated",
        description: "Your default signature has been saved.",
      });
    },

    onError: (error: Error) => {
      if (error instanceof ApiError) {
        toast({
          type: "error",
          title: "Signature Update Failed",
          description: error.message,
        });
      } else {
        toast({
          type: "error",
          title: "Network Error",
          description: "Unable to update signature. Please try again.",
        });
      }
    },
  });
}

export function useApplicationsSummary(enabled = false) {
  return useQuery({
    queryKey: ONBOARDING_QUERY_KEYS.applicationsSummary,
    queryFn: () => getApplicationsSummaryApi(),
    enabled,
  });
}

export function useCandidateEvents(enabled = false) {
  return useQuery({
    queryKey: ONBOARDING_QUERY_KEYS.candidateEvents,
    queryFn: () => getCandidateEventsApi(),
    enabled,
  });
}

/**
 * Composite useOnboarding hook grouping shared onboarding operations
 */
export function useOnboarding() {
  const startOnboarding = useStartOnboarding();
  const saveOnboarding = useSaveOnboarding();
  const submitOnboarding = useSubmitOnboarding();
  const verifyIdentity = useVerifyIdentity();
  const setCandidateSignature = useSetCandidateProfileSignature();

  return {
    startOnboarding,
    saveOnboarding,
    submitOnboarding,
    verifyIdentity,
    setCandidateSignature,
  };
}
