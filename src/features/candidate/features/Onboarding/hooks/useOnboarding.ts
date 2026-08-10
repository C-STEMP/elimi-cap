import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/src/components/ui/toast";
import { ApiError } from "@/src/lib/api/client";
import {
  saveCandidateOnboardingApi,
  getCandidateOnboardingApi,
  submitCandidateOnboardingApi,
  type CandidateOnboardingPayload,
} from "../api/onboarding.api";
import { ONBOARDING_QUERY_KEYS } from "@/src/features/shared/onboarding/hooks";

export function useGetOnboarding() {
  return useQuery({
    queryKey: ONBOARDING_QUERY_KEYS.persona("candidate"),
    queryFn: () => getCandidateOnboardingApi(),
  });
}

export function useSaveOnboarding() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: CandidateOnboardingPayload) =>
      saveCandidateOnboardingApi(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ONBOARDING_QUERY_KEYS.persona("candidate"),
      });
      toast({
        type: "success",
        title: "Progress Saved",
        description: "Your onboarding details have been saved successfully.",
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
    mutationFn: () => submitCandidateOnboardingApi(),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ONBOARDING_QUERY_KEYS.mine });
      toast({
        type: "success",
        title: "Onboarding Complete!",
        description: "Your candidate profile has been submitted.",
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

/**
 * Composite useOnboarding hook for Candidate Onboarding
 */
export function useOnboarding() {
  const getOnboarding = useGetOnboarding();
  const saveOnboarding = useSaveOnboarding();
  const submitOnboarding = useSubmitOnboarding();

  return {
    getOnboarding,
    saveOnboarding,
    submitOnboarding,
  };
}
