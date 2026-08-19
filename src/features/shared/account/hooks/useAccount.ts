import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMeApi,
  getMeProfileApi,
  patchMeProfileApi,
  getMeDeletionEligibilityApi,
  type MeProfilePatch,
} from "../api/account.api";
import { useToast } from "@/src/components/ui/toast";

export const ACCOUNT_QUERY_KEYS = {
  me: ["account", "me"] as const,
  profile: ["account", "profile"] as const,
  deletionEligibility: ["account", "deletion-eligibility"] as const,
};

export function useGetMe(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ACCOUNT_QUERY_KEYS.me,
    queryFn: () => getMeApi(),
    enabled: options?.enabled,
  });
}

export function useGetMeProfile(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ACCOUNT_QUERY_KEYS.profile,
    queryFn: () => getMeProfileApi(),
    enabled: options?.enabled,
  });
}

export function usePatchMeProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: MeProfilePatch) => patchMeProfileApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.profile });
      toast({
        type: "success",
        title: "Profile Updated",
        description: "Your personal profile has been updated successfully.",
      });
    },
    onError: (err: Error) => {
      toast({
        type: "error",
        title: "Update Failed",
        description: err.message || "Failed to update profile.",
      });
    },
  });
}

export function useGetDeletionEligibility() {
  return useQuery({
    queryKey: ACCOUNT_QUERY_KEYS.deletionEligibility,
    queryFn: () => getMeDeletionEligibilityApi(),
  });
}
