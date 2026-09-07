import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/src/components/ui/toast";
import { ApiError } from "@/src/lib/api/client";
import {
  createApplicationApi,
  patchApplicationDraftApi,
  getApplicationsApi,
  getApplicationByIdApi,
  submitApplicationApi,
  getApplicationHistoryApi,
  getApplicationStagesApi,
  reviewApplicationApi,
  type CreateApplicationPayload,
  type ReviewDecisionPayload,
  type ApplicationStatus,
} from "../api";
import { APPLICATION_QUERY_KEYS } from "./queryKeys";
import { useInitiateApplicationPayment } from "./payment.hooks";

export function useCreateApplication() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: CreateApplicationPayload) =>
      createApplicationApi(payload),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: APPLICATION_QUERY_KEYS.all });
      toast({
        type: "success",
        title: "Application Created",
        description: `Draft ${data.type} application created successfully.`,
      });
    },

    onError: (error: Error) => {
      const msg = error.message?.toLowerCase() || "";
      if (
        msg.includes("already has a draft") ||
        msg.includes("in-progress application") ||
        (error instanceof ApiError && error.statusCode === 409)
      ) {
        return;
      }

      if (error instanceof ApiError) {
        toast({
          type: "error",
          title: "Application Creation Failed",
          description: error.message,
        });
      } else {
        toast({
          type: "error",
          title: "Network Error",
          description: "Unable to create application. Please try again.",
        });
      }
    },
  });
}

export function useGetApplications(
  status?: ApplicationStatus,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: APPLICATION_QUERY_KEYS.list(status),
    queryFn: () => getApplicationsApi({ status }),
    enabled: options?.enabled ?? true,
  });
}

export function useGetApplicationById(id: string) {
  return useQuery({
    queryKey: APPLICATION_QUERY_KEYS.detail(id),
    queryFn: () => getApplicationByIdApi(id),
    enabled: Boolean(id),
  });
}

export function useSubmitApplication() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => submitApplicationApi(id),

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.detail(data.id),
      });
      queryClient.invalidateQueries({ queryKey: APPLICATION_QUERY_KEYS.all });
      toast({
        type: "success",
        title: "Application Submitted",
        description: "Your application has been submitted for review.",
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
          description: "Unable to submit application. Please try again.",
        });
      }
    },
  });
}

export function usePatchApplicationDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Record<string, unknown>;
    }) => patchApplicationDraftApi(id, payload),

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.detail(data.id),
      });
      queryClient.invalidateQueries({ queryKey: APPLICATION_QUERY_KEYS.all });
    },
  });
}

export function useGetApplicationHistory(id: string) {
  return useQuery({
    queryKey: APPLICATION_QUERY_KEYS.history(id),
    queryFn: () => getApplicationHistoryApi(id),
    enabled: Boolean(id),
  });
}

export function useGetApplicationStages(id: string) {
  return useQuery({
    queryKey: APPLICATION_QUERY_KEYS.stages(id),
    queryFn: () => getApplicationStagesApi(id),
    enabled: Boolean(id),
  });
}

export function useReviewApplication() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ReviewDecisionPayload;
    }) => reviewApplicationApi(id, payload),

    onSuccess: (data, variables) => {
      const appId = variables.id || data?.id;
      if (appId) {
        queryClient.invalidateQueries({
          queryKey: APPLICATION_QUERY_KEYS.detail(appId),
        });
        queryClient.invalidateQueries({
          queryKey: APPLICATION_QUERY_KEYS.stages(appId),
        });
        queryClient.invalidateQueries({
          queryKey: APPLICATION_QUERY_KEYS.history(appId),
        });
      }
      queryClient.invalidateQueries({ queryKey: APPLICATION_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["centre"] });
      queryClient.invalidateQueries({ queryKey: ["assessor"] });

      const isApprove = variables.payload.decision === "approve";
      toast({
        type: "success",
        title: isApprove ? "Application Approved" : "Decision Recorded",
        description: isApprove
          ? "Application has been approved and moved to the next stage."
          : "Application decision has been recorded.",
      });
    },

    onError: (error: Error) => {
      if (error instanceof ApiError) {
        toast({
          type: "error",
          title: "Review Failed",
          description: error.message,
        });
      } else {
        toast({
          type: "error",
          title: "Network Error",
          description: "Unable to record decision. Please try again.",
        });
      }
    },
  });
}

export function useApplication() {
  const createApplication = useCreateApplication();
  const submitApplication = useSubmitApplication();
  const reviewApplication = useReviewApplication();
  const initiatePayment = useInitiateApplicationPayment();

  return {
    createApplication,
    submitApplication,
    reviewApplication,
    initiatePayment,
  };
}
