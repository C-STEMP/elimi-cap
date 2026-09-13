import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/src/components/ui/toast";
import { ApiError } from "@/src/lib/api/client";
import {
  getIqamCentresApi,
  getIqamCentreApi,
  getIqamAllocationsApi,
  getIqamSamplingPlanApi,
  submitIqamSamplingPlanApi,
  patchIqamSamplingPlanApi,
  putIqamSamplingPlanUnitsApi,
  getIqamSamplingRecordApi,
  submitIqamSamplingRecordApi,
  patchIqamSamplingRecordApi,
  getIqamIvReportApi,
  patchIqamIvReportApi,
  submitIqamIvReportApi,
  getIqamAssessorOutcomesApi,
  patchIqamAssessorOutcomesApi,
  submitIqamAssessorOutcomesApi,
  getIqamFinalPortfolioApi,
  patchIqamFinalPortfolioApi,
  submitIqamFinalPortfolioApi,
} from "../api/iqam.api";
import type { IqamIvReportData, IqamAssessorOutcomesData, IqamFinalPortfolioData } from "../api/types";

export const IQAM_QUERY_KEYS = {
  centres: (params?: unknown) => ["assessor", "iqam", "centres", params] as const,
  centre: (centreId: string) => ["assessor", "iqam", "centre", centreId] as const,
  allocations: (centreId: string) => ["assessor", "iqam", "allocations", centreId] as const,
  samplingPlan: (centreId: string, tradeId: string, levelId: string) =>
    ["assessor", "iqam", "sampling-plan", centreId, tradeId, levelId] as const,
  samplingRecord: (centreId: string, tradeId: string, levelId: string) =>
    ["assessor", "iqam", "sampling-record", centreId, tradeId, levelId] as const,
  ivReport: (applicationId: string) => ["assessor", "iqam", "iv-report", applicationId] as const,
  assessorOutcomes: (applicationId: string) =>
    ["assessor", "iqam", "assessor-outcomes", applicationId] as const,
  finalPortfolio: (applicationId: string) =>
    ["assessor", "iqam", "final-portfolio", applicationId] as const,
};

function errorToast(toast: ReturnType<typeof useToast>["toast"], fallbackTitle: string, error: Error) {
  if (error instanceof ApiError) {
    toast({ type: "error", title: fallbackTitle, description: error.message });
  } else {
    toast({
      type: "error",
      title: "Network Error",
      description: "Something went wrong. Please try again.",
    });
  }
}

// ─── Centres ────────────────────────────────────────────────────────────

export function useGetIqamCentres(params?: {
  q?: string;
  sort?: "joinedAt";
  order?: "asc" | "desc";
  cursor?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: IQAM_QUERY_KEYS.centres(params),
    queryFn: () => getIqamCentresApi(params),
  });
}

export function useGetIqamCentre(centreId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: IQAM_QUERY_KEYS.centre(centreId),
    queryFn: () => getIqamCentreApi(centreId),
    enabled: Boolean(centreId) && (options?.enabled ?? true),
  });
}

// ─── CON/01 — Allocations ─────────────────────────────────────────────────

export function useGetIqamAllocations(centreId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: IQAM_QUERY_KEYS.allocations(centreId),
    queryFn: () => getIqamAllocationsApi(centreId),
    enabled: Boolean(centreId) && (options?.enabled ?? true),
  });
}

// ─── CON/02 — Sampling Plan ────────────────────────────────────────────────

export function useGetIqamSamplingPlan(
  centreId: string,
  tradeId: string,
  qualificationLevelId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: IQAM_QUERY_KEYS.samplingPlan(centreId, tradeId, qualificationLevelId),
    queryFn: () => getIqamSamplingPlanApi(centreId, tradeId, qualificationLevelId),
    enabled: Boolean(centreId && tradeId && qualificationLevelId) && (options?.enabled ?? true),
  });
}

export function useSubmitIqamSamplingPlan(centreId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: { tradeId: string; qualificationLevelId: string }) =>
      submitIqamSamplingPlanApi(centreId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: IQAM_QUERY_KEYS.samplingPlan(centreId, data.trade.id, data.qualificationLevel.id),
      });
      toast({
        type: "success",
        title: "Sampling Plan Submitted",
        description: `Stamped ${data.count} candidate ${data.count === 1 ? "row" : "rows"}.`,
      });
    },
    onError: (error: Error) => errorToast(toast, "Submit Failed", error),
  });
}

export function usePatchIqamSamplingPlan(
  centreId: string,
  tradeId: string,
  qualificationLevelId: string,
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      applicationId,
      payload,
    }: {
      applicationId: string;
      payload: { termType?: string | null; plannedDate?: string | null };
    }) => patchIqamSamplingPlanApi(applicationId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: IQAM_QUERY_KEYS.samplingPlan(centreId, tradeId, qualificationLevelId),
      });
    },
    onError: (error: Error) => errorToast(toast, "Save Failed", error),
  });
}

export function usePutIqamSamplingPlanUnits(
  centreId: string,
  tradeId: string,
  qualificationLevelId: string,
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ applicationId, unitIds }: { applicationId: string; unitIds: string[] }) =>
      putIqamSamplingPlanUnitsApi(applicationId, unitIds),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: IQAM_QUERY_KEYS.samplingPlan(centreId, tradeId, qualificationLevelId),
      });
    },
    onError: (error: Error) => errorToast(toast, "Save Failed", error),
  });
}

// ─── CON/03 — Sampling Record ──────────────────────────────────────────────

export function useGetIqamSamplingRecord(
  centreId: string,
  tradeId: string,
  qualificationLevelId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: IQAM_QUERY_KEYS.samplingRecord(centreId, tradeId, qualificationLevelId),
    queryFn: () => getIqamSamplingRecordApi(centreId, tradeId, qualificationLevelId),
    enabled: Boolean(centreId && tradeId && qualificationLevelId) && (options?.enabled ?? true),
  });
}

export function useSubmitIqamSamplingRecord(centreId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: { tradeId: string; qualificationLevelId: string }) =>
      submitIqamSamplingRecordApi(centreId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: IQAM_QUERY_KEYS.samplingRecord(centreId, data.trade.id, data.qualificationLevel.id),
      });
      toast({
        type: "success",
        title: "Sampling Record Submitted",
        description: `Stamped ${data.count} candidate ${data.count === 1 ? "row" : "rows"}.`,
      });
    },
    onError: (error: Error) => errorToast(toast, "Submit Failed", error),
  });
}

export function usePatchIqamSamplingRecord(
  centreId: string,
  tradeId: string,
  qualificationLevelId: string,
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      applicationId,
      payload,
    }: {
      applicationId: string;
      payload: { auditStatus?: string | null; process?: string | null };
    }) => patchIqamSamplingRecordApi(applicationId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: IQAM_QUERY_KEYS.samplingRecord(centreId, tradeId, qualificationLevelId),
      });
    },
    onError: (error: Error) => errorToast(toast, "Save Failed", error),
  });
}

// ─── CON/04 — IV Comprehensive Report ──────────────────────────────────────

export function useGetIqamIvReport(applicationId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: IQAM_QUERY_KEYS.ivReport(applicationId),
    queryFn: () => getIqamIvReportApi(applicationId),
    enabled: Boolean(applicationId) && (options?.enabled ?? true),
  });
}

export function usePatchIqamIvReport(applicationId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: IqamIvReportData) => patchIqamIvReportApi(applicationId, data),
    onSuccess: (data) => {
      queryClient.setQueryData(IQAM_QUERY_KEYS.ivReport(applicationId), data);
    },
    onError: (error: Error) => errorToast(toast, "Save Failed", error),
  });
}

export function useSubmitIqamIvReport(applicationId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => submitIqamIvReportApi(applicationId),
    onSuccess: (data) => {
      queryClient.setQueryData(IQAM_QUERY_KEYS.ivReport(applicationId), data);
      toast({
        type: "success",
        title: "Report Submitted",
        description: "The comprehensive internal verifier report has been submitted.",
      });
    },
    onError: (error: Error) => errorToast(toast, "Submit Failed", error),
  });
}

// ─── CON/05 — Assessor Outcomes ─────────────────────────────────────────────

export function useGetIqamAssessorOutcomes(applicationId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: IQAM_QUERY_KEYS.assessorOutcomes(applicationId),
    queryFn: () => getIqamAssessorOutcomesApi(applicationId),
    enabled: Boolean(applicationId) && (options?.enabled ?? true),
  });
}

export function usePatchIqamAssessorOutcomes(applicationId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: IqamAssessorOutcomesData) => patchIqamAssessorOutcomesApi(applicationId, data),
    onSuccess: (data) => {
      queryClient.setQueryData(IQAM_QUERY_KEYS.assessorOutcomes(applicationId), data);
    },
    onError: (error: Error) => errorToast(toast, "Save Failed", error),
  });
}

export function useSubmitIqamAssessorOutcomes(applicationId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => submitIqamAssessorOutcomesApi(applicationId),
    onSuccess: (data) => {
      queryClient.setQueryData(IQAM_QUERY_KEYS.assessorOutcomes(applicationId), data);
      toast({
        type: "success",
        title: "Checklist Submitted",
        description: "The observation & questioning checklist has been submitted.",
      });
    },
    onError: (error: Error) => errorToast(toast, "Submit Failed", error),
  });
}

// ─── CON/06 — Final Portfolio ───────────────────────────────────────────────

export function useGetIqamFinalPortfolio(applicationId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: IQAM_QUERY_KEYS.finalPortfolio(applicationId),
    queryFn: () => getIqamFinalPortfolioApi(applicationId),
    enabled: Boolean(applicationId) && (options?.enabled ?? true),
  });
}

export function usePatchIqamFinalPortfolio(applicationId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: IqamFinalPortfolioData) => patchIqamFinalPortfolioApi(applicationId, data),
    onSuccess: (data) => {
      queryClient.setQueryData(IQAM_QUERY_KEYS.finalPortfolio(applicationId), data);
    },
    onError: (error: Error) => errorToast(toast, "Save Failed", error),
  });
}

export function useSubmitIqamFinalPortfolio(applicationId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => submitIqamFinalPortfolioApi(applicationId),
    onSuccess: (data) => {
      queryClient.setQueryData(IQAM_QUERY_KEYS.finalPortfolio(applicationId), data);
      toast({
        type: "success",
        title: "Final Portfolio Submitted",
        description: "The final portfolio / award report has been submitted.",
      });
    },
    onError: (error: Error) => errorToast(toast, "Submit Failed", error),
  });
}
