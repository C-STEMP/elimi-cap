import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/src/components/ui/toast";
import { ApiError } from "@/src/lib/api/client";
import {
  getOnboardingPersonaApi,
  saveOnboardingApi,
  submitOnboardingApi,
  startOnboardingApi,
} from "@/src/features/shared/onboarding/api";
import { ONBOARDING_QUERY_KEYS } from "@/src/features/shared/onboarding/hooks";

export function useGetAssessorOnboarding() {
  return useQuery({
    queryKey: ONBOARDING_QUERY_KEYS.persona("assessor"),
    queryFn: () => getOnboardingPersonaApi("assessor"),
    retry: 1,
  });
}

export function useStartAssessorOnboarding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => startOnboardingApi({ persona: "assessor" }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ONBOARDING_QUERY_KEYS.persona("assessor"),
      });
      queryClient.invalidateQueries({
        queryKey: ONBOARDING_QUERY_KEYS.mine,
      });
    },
  });
}

export function useSaveAssessorOnboarding() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      saveOnboardingApi({ persona: "assessor", data }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ONBOARDING_QUERY_KEYS.persona("assessor"),
      });
      toast({
        type: "success",
        title: "Progress Saved",
        description: "Your assessor onboarding details have been saved.",
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

export function useSubmitAssessorOnboarding() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => submitOnboardingApi("assessor"),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ONBOARDING_QUERY_KEYS.mine });
      toast({
        type: "success",
        title: "Onboarding Submitted!",
        description: "Your assessor onboarding profile has been submitted.",
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

export function useAssessorOnboarding() {
  return {
    getOnboarding: useGetAssessorOnboarding(),
    startOnboarding: useStartAssessorOnboarding(),
    saveOnboarding: useSaveAssessorOnboarding(),
    submitOnboarding: useSubmitAssessorOnboarding(),
  };
}
