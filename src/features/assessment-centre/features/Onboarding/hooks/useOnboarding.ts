import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/src/components/ui/toast";
import { ApiError } from "@/src/lib/api/client";
import {
  saveCentreOnboardingApi,
  getCentreOnboardingApi,
  submitCentreOnboardingApi,
  type CentreOnboardingPayload,
} from "../api/onboarding.api";
import {
  ONBOARDING_QUERY_KEYS,
  useVerifyIdentity,
} from "@/src/features/shared/onboarding/hooks";

export function useGetOnboarding() {
  return useQuery({
    queryKey: ONBOARDING_QUERY_KEYS.persona("centre"),
    queryFn: () => getCentreOnboardingApi(),
  });
}

export function useSaveOnboarding() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: CentreOnboardingPayload) =>
      saveCentreOnboardingApi(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ONBOARDING_QUERY_KEYS.persona("centre"),
      });
      toast({
        type: "success",
        title: "Centre Details Saved",
        description: "Your assessment centre onboarding details have been saved.",
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
          description: "Unable to save centre details. Please try again.",
        });
      }
    },
  });
}

export function useSubmitOnboarding() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => submitCentreOnboardingApi(),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ONBOARDING_QUERY_KEYS.mine });
      toast({
        type: "success",
        title: "Onboarding Submitted!",
        description: "Your assessment centre profile has been submitted for review.",
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
 * Composite useOnboarding hook for Assessment Centre Onboarding
 */
export function useOnboarding() {
  const getOnboarding = useGetOnboarding();
  const saveOnboarding = useSaveOnboarding();
  const submitOnboarding = useSubmitOnboarding();
  const verifyIdentity = useVerifyIdentity();

  return {
    getOnboarding,
    saveOnboarding,
    submitOnboarding,
    verifyIdentity,
  };
}
