import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/src/components/ui/toast";
import { ApiError } from "@/src/lib/api/client";
import {
  resolveAppealApi,
  getRecommendationsApi,
  closeRecommendationsApi,
} from "../api";
import { APPLICATION_QUERY_KEYS } from "./queryKeys";

export function useResolveAppeal(id: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      appealId,
      decision,
      comment,
    }: {
      appealId: string;
      decision: "reopen" | "dismiss";
      comment?: string;
    }) => resolveAppealApi(id, appealId, { decision, comment }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.detail(id),
      });
      toast({
        type: "success",
        title: "Appeal Resolved",
        description: "Appeal decision has been recorded.",
      });
    },

    onError: (error: Error) => {
      if (error instanceof ApiError) {
        toast({
          type: "error",
          title: "Appeal Resolution Failed",
          description: error.message,
        });
      } else {
        toast({
          type: "error",
          title: "Network Error",
          description: "Unable to resolve appeal. Please try again.",
        });
      }
    },
  });
}

export function useGetRecommendations(id: string) {
  return useQuery({
    queryKey: ["applications", "recommendations", id],
    queryFn: () => getRecommendationsApi(id),
    enabled: Boolean(id),
  });
}

export function useCloseRecommendations(id: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => closeRecommendationsApi(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.detail(id),
      });
      toast({
        type: "success",
        title: "Application Closed",
        description: "Application closed with GAP_TRAINING.",
      });
    },

    onError: (error: Error) => {
      if (error instanceof ApiError) {
        toast({
          type: "error",
          title: "Close Failed",
          description: error.message,
        });
      } else {
        toast({
          type: "error",
          title: "Network Error",
          description: "Unable to close application. Please try again.",
        });
      }
    },
  });
}
