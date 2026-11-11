import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/src/components/ui/toast";
import { ApiError } from "@/src/lib/api/client";
import {
  createApplicationApi,
  patchApplicationDraftApi,
  getApplicationsApi,
  getApplicationByIdApi,
  submitApplicationApi,
  withdrawApplicationApi,
  getApplicationHistoryApi,
  getApplicationStagesApi,
  reviewApplicationApi,
  getApplicationAssessmentMappingApi,
  getApplicationPortfolioApi,
  type CreateApplicationPayload,
  type ReviewDecisionPayload,
  type ApplicationStatus,
  type Application,
  type ApplicationDetail,
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
  options?: {
    enabled?: boolean;
    refetchInterval?: number | false;
    refetchOnWindowFocus?: boolean | "always";
    staleTime?: number;
  },
) {
  return useQuery({
    queryKey: APPLICATION_QUERY_KEYS.list(status),
    queryFn: () => getApplicationsApi({ status }),
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? "always",
    staleTime: options?.staleTime ?? 0,
  });
}

export function useGetApplicationById(
  id: string,
  options?: {
    refetchInterval?: number | false;
    enabled?: boolean;
    refetchOnWindowFocus?: boolean | "always";
    staleTime?: number;
  },
) {
  return useQuery({
    queryKey: APPLICATION_QUERY_KEYS.detail(id),
    queryFn: () => getApplicationByIdApi(id),
    enabled: Boolean(id) && (options?.enabled ?? true),
    refetchInterval: options?.refetchInterval,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? "always",
    staleTime: options?.staleTime ?? 0,
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
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.stages(data.id),
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

export function useWithdrawApplication(options?: { suppressToast?: boolean }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const applyWithdrawnStatusToCache = (
    appId: string,
    updatedApp?: Application | ApplicationDetail,
  ) => {
    if (!appId) return;
    queryClient.setQueryData<ApplicationDetail | undefined>(
      APPLICATION_QUERY_KEYS.detail(appId),
      (old) =>
        old
          ? ({ ...old, ...(updatedApp || {}), status: "withdrawn" } as ApplicationDetail)
          : updatedApp
            ? ({ ...updatedApp, status: "withdrawn" } as ApplicationDetail)
            : old,
    );
    queryClient.setQueriesData<unknown>(
      { queryKey: APPLICATION_QUERY_KEYS.all },
      (old: unknown) => {
        if (Array.isArray(old)) {
          return old.map((item: Application) =>
            item?.id === appId
              ? { ...item, ...(updatedApp || {}), status: "withdrawn" }
              : item,
          );
        }
        return old;
      },
    );
  };

  return useMutation({
    mutationFn: (id: string) => withdrawApplicationApi(id),

    onMutate: async (id: string) => {
      if (!options?.suppressToast && id) {
        applyWithdrawnStatusToCache(id);
      }
    },

    onSuccess: (data, id) => {
      const appId = data?.id || id;
      if (appId) {
        applyWithdrawnStatusToCache(appId, data);
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
      queryClient.invalidateQueries({ queryKey: ["candidate"] });

      if (!options?.suppressToast) {
        toast({
          type: "success",
          title: "Application Withdrawn",
          description:
            "Your application has been withdrawn. You can now create a new application.",
        });
      }
    },

    onError: (error: Error) => {
      if (options?.suppressToast) return;
      if (error instanceof ApiError) {
        const code = (error as ApiError & { code?: string }).code || "";
        const friendlyDescription =
          code === "application.sponsored_not_withdrawable"
            ? "Organisation-sponsored applications cannot be withdrawn."
            : code === "application.already_withdrawn"
              ? "This application has already been withdrawn."
              : code === "application.not_withdrawable"
                ? "This application has moved past the initial review stage and can no longer be withdrawn."
                : error.message;

        toast({
          type: "error",
          title: "Withdrawal Failed",
          description: friendlyDescription,
        });
      } else {
        toast({
          type: "error",
          title: "Network Error",
          description: "Unable to withdraw application. Please try again.",
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

export function useGetApplicationStages(
  id: string,
  options?: {
    refetchInterval?: number | false;
    enabled?: boolean;
    refetchOnWindowFocus?: boolean | "always";
    staleTime?: number;
  },
) {
  return useQuery({
    queryKey: APPLICATION_QUERY_KEYS.stages(id),
    queryFn: () => getApplicationStagesApi(id),
    enabled: Boolean(id) && (options?.enabled ?? true),
    refetchInterval: options?.refetchInterval,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? "always",
    staleTime: options?.staleTime ?? 0,
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
      /** When true, the caller owns error messaging and the hook stays silent on error. */
      suppressErrorToast?: boolean;
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

    onError: (error: Error, variables) => {
      // The caller (e.g. a modal that retries) may own error messaging.
      if (variables?.suppressErrorToast) return;
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

export function useGetApplicationAssessmentMapping(
  id: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: APPLICATION_QUERY_KEYS.assessmentMapping(id),
    queryFn: () => getApplicationAssessmentMappingApi(id),
    enabled: Boolean(id) && (options?.enabled ?? true),
  });
}

export function useGetApplicationPortfolio(
  id: string,
  options?: { enabled?: boolean; refetchInterval?: number | false },
) {
  return useQuery({
    queryKey: APPLICATION_QUERY_KEYS.portfolio(id),
    queryFn: () => getApplicationPortfolioApi(id),
    enabled: Boolean(id) && (options?.enabled ?? true),
    refetchInterval: options?.refetchInterval,
  });
}

export function useApplication() {
  const createApplication = useCreateApplication();
  const submitApplication = useSubmitApplication();
  const withdrawApplication = useWithdrawApplication();
  const reviewApplication = useReviewApplication();
  const initiatePayment = useInitiateApplicationPayment();

  return {
    createApplication,
    submitApplication,
    withdrawApplication,
    reviewApplication,
    initiatePayment,
  };
}
