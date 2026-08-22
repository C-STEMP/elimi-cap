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
  initiateApplicationPaymentApi,
  getApplicationReceiptApi,
  getSelfAssessmentApi,
  saveSelfAssessmentApi,
  type Application,
  type CreateApplicationPayload,
  type ReviewDecisionPayload,
  type ApplicationStatus,
  type SaveSelfAssessmentPayload,
} from "../api/application.api";

export const APPLICATION_QUERY_KEYS = {
  all: ["applications"] as const,
  list: (status?: ApplicationStatus) => ["applications", "list", status] as const,
  detail: (id: string) => ["applications", "detail", id] as const,
  history: (id: string) => ["applications", "history", id] as const,
  stages: (id: string) => ["applications", "stages", id] as const,
  receipt: (id: string) => ["applications", "receipt", id] as const,
  selfAssessment: (id: string) => ["applications", "self-assessment", id] as const,
};

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
      // Don't show toast for already existing draft/in-progress - the caller handles resuming
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

export function useGetApplications(status?: ApplicationStatus) {
  return useQuery({
    queryKey: APPLICATION_QUERY_KEYS.list(status),
    queryFn: () => getApplicationsApi({ status }),
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

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.detail(data.id),
      });
      queryClient.invalidateQueries({ queryKey: APPLICATION_QUERY_KEYS.all });
      toast({
        type: "success",
        title: "Review Decision Recorded",
        description: `Application ${data.id} updated.`,
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

export function useInitiateApplicationPayment() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => initiateApplicationPaymentApi(id),

    onSuccess: (data) => {
      toast({
        type: "success",
        title: "Redirecting to Checkout",
        description: "Payment session created.",
      });
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    },

    onError: (error: Error) => {
      if (error instanceof ApiError) {
        toast({
          type: "error",
          title: "Payment Initiation Failed",
          description: error.message,
        });
      } else {
        toast({
          type: "error",
          title: "Network Error",
          description: "Unable to initiate payment. Please try again.",
        });
      }
    },
  });
}

export function useGetApplicationReceipt(id: string) {
  return useQuery({
    queryKey: APPLICATION_QUERY_KEYS.receipt(id),
    queryFn: () => getApplicationReceiptApi(id),
    enabled: Boolean(id),
  });
}

export function useGetSelfAssessment(applicationId: string) {
  return useQuery({
    queryKey: APPLICATION_QUERY_KEYS.selfAssessment(applicationId),
    queryFn: () => getSelfAssessmentApi(applicationId),
    enabled: Boolean(applicationId),
  });
}

export function useSaveSelfAssessment(applicationId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: SaveSelfAssessmentPayload) =>
      saveSelfAssessmentApi(applicationId, payload),

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.selfAssessment(applicationId),
      });
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.detail(applicationId),
      });
      if (data.submittedAt) {
        toast({
          type: "success",
          title: "Self-Assessment Submitted",
          description: "Your self-assessment has been successfully submitted.",
        });
      } else {
        toast({
          type: "success",
          title: "Draft Saved",
          description: "Your self-assessment draft has been saved.",
        });
      }
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
          description: "Unable to save self-assessment. Please try again.",
        });
      }
    },
  });
}

/**
 * Composite hook grouping shared Application operations
 */
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
