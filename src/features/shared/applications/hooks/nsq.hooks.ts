import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/src/components/ui/toast";
import { ApiError } from "@/src/lib/api/client";
import {
  getSelfAssessmentApi,
  saveSelfAssessmentApi,
  getInductionFormApi,
  submitInductionFormApi,
  getUnitCriteriaApi,
  submitUnitEvidenceApi,
  reviewUnitEvidenceApi,
  submitUnitSignoffApi,
  assignUnitAssessorApi,
  assignNsqAssessorApi,
  getDirectObservationListApi,
  getDirectObservationSessionApi,
  scheduleDirectObservationApi,
  reviewDirectObservationApi,
  saveDirectObservationFormApi,
  signDirectObservationApi,
  getCentreIqamSamplingPlanApi,
  getCentreIqamSamplingRecordApi,
  getCentreIqamIvReportApi,
  getCentreIqamAssessorOutcomesApi,
  getCentreIqamFinalPortfolioApi,
  type SaveSelfAssessmentPayload,
  type PostUnitEvidencePayload,
  type PostUnitSignoffPayload,
  type ReviewUnitEvidencePayload,
  type InductionFormWritePayload,
  type ScheduleObservationPayload,
  type ReviewObservationPayload,
  type SaveObservationFormPayload,
  type SignObservationPayload,
} from "../api";
import { APPLICATION_QUERY_KEYS } from "./queryKeys";

// ==========================================
// 1. Induction Form Hooks
// ==========================================

export function useGetInductionForm(
  applicationId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: APPLICATION_QUERY_KEYS.inductionForm(applicationId),
    queryFn: () => getInductionFormApi(applicationId),
    enabled: Boolean(applicationId) && (options?.enabled ?? true),
  });
}

export function useSubmitInductionForm(applicationId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: InductionFormWritePayload | Record<string, unknown>) =>
      submitInductionFormApi(applicationId, payload),

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.inductionForm(applicationId),
      });
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.detail(applicationId),
      });
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.stages(applicationId),
      });
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.all,
      });

      if (data?.submittedAt) {
        toast({
          type: "success",
          title: "Induction Form Submitted",
          description: "Your induction form has been recorded successfully.",
        });
      } else {
        toast({
          type: "success",
          title: "Induction Draft Saved",
          description: "Your induction form draft has been saved.",
        });
      }
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
          description: "Unable to submit induction form. Please try again.",
        });
      }
    },
  });
}

// ==========================================
// 2. Unit Criteria & Evidence Hooks
// ==========================================

export function useGetUnitCriteria(
  applicationId: string,
  unitId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: APPLICATION_QUERY_KEYS.unitCriteria(applicationId, unitId),
    queryFn: () => getUnitCriteriaApi(applicationId, unitId),
    enabled: Boolean(applicationId && unitId) && (options?.enabled ?? true),
  });
}

export function useSubmitUnitEvidence(applicationId: string, unitId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: PostUnitEvidencePayload) =>
      submitUnitEvidenceApi(applicationId, unitId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.unitCriteria(applicationId, unitId),
      });
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.detail(applicationId),
      });
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.stages(applicationId),
      });
      toast({
        type: "success",
        title: "Evidence Recorded",
        description: "Performance criteria evidence recorded successfully.",
      });
    },

    onError: (error: Error) => {
      if (error instanceof ApiError) {
        toast({
          type: "error",
          title: "Upload Failed",
          description: error.message,
        });
      } else {
        toast({
          type: "error",
          title: "Network Error",
          description: "Unable to submit unit evidence. Please try again.",
        });
      }
    },
  });
}

export function useReviewUnitEvidence(applicationId: string, unitId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      evidenceId,
      payload,
    }: {
      evidenceId: string;
      payload: ReviewUnitEvidencePayload;
    }) => reviewUnitEvidenceApi(applicationId, unitId, evidenceId, payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.unitCriteria(applicationId, unitId),
      });
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.detail(applicationId),
      });
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.stages(applicationId),
      });
      toast({
        type: "success",
        title:
          variables.payload.decision === "approve"
            ? "Evidence Approved"
            : "Evidence Rejected",
        description: `Evidence has been ${
          variables.payload.decision === "approve" ? "approved" : "rejected"
        }.`,
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
          description: "Unable to complete evidence review. Please try again.",
        });
      }
    },
  });
}

export function useSubmitUnitSignoff(applicationId: string, unitId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: PostUnitSignoffPayload) =>
      submitUnitSignoffApi(applicationId, unitId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.unitCriteria(applicationId, unitId),
      });
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.detail(applicationId),
      });
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.stages(applicationId),
      });
      toast({
        type: "success",
        title: "Unit Signed Off",
        description: "Unit sign-off recorded successfully.",
      });
    },

    onError: (error: Error) => {
      if (error instanceof ApiError) {
        toast({
          type: "error",
          title: "Sign-off Failed",
          description: error.message,
        });
      } else {
        toast({
          type: "error",
          title: "Network Error",
          description: "Unable to record unit sign-off. Please try again.",
        });
      }
    },
  });
}

export function useAssignUnitAssessor(applicationId: string, unitId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (assessorId: string) =>
      assignUnitAssessorApi(applicationId, unitId, assessorId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.detail(applicationId),
      });
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.stages(applicationId),
      });
      toast({
        type: "success",
        title: "Unit Assessor Assigned",
        description: "QAA unit assessor assigned successfully.",
      });
    },

    onError: (error: Error) => {
      if (error instanceof ApiError) {
        toast({
          type: "error",
          title: "Assignment Failed",
          description: error.message,
        });
      } else {
        toast({
          type: "error",
          title: "Network Error",
          description: "Unable to assign unit assessor. Please try again.",
        });
      }
    },
  });
}

export function useAssignNsqAssessor(applicationId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (assessorId: string) =>
      assignNsqAssessorApi(applicationId, assessorId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.detail(applicationId),
      });
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.stages(applicationId),
      });
      toast({
        type: "success",
        title: "Assessor Assigned",
        description: "QAA Assessor assigned successfully.",
      });
    },

    onError: (error: Error) => {
      if (error instanceof ApiError) {
        toast({
          type: "error",
          title: "Assignment Failed",
          description: error.message,
        });
      } else {
        toast({
          type: "error",
          title: "Network Error",
          description: "Unable to assign assessor. Please try again.",
        });
      }
    },
  });
}

// ==========================================
// 3. Direct Observation Hooks
// ==========================================

export function useGetDirectObservations(
  applicationId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: APPLICATION_QUERY_KEYS.directObservations(applicationId),
    queryFn: () => getDirectObservationListApi(applicationId),
    enabled: Boolean(applicationId) && (options?.enabled ?? true),
  });
}

export function useGetDirectObservationSession(
  applicationId: string,
  sessionId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: APPLICATION_QUERY_KEYS.directObservationSession(
      applicationId,
      sessionId,
    ),
    queryFn: () => getDirectObservationSessionApi(applicationId, sessionId),
    enabled:
      Boolean(applicationId && sessionId) && (options?.enabled ?? true),
  });
}

export function useScheduleDirectObservation(applicationId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: ScheduleObservationPayload | string) =>
      scheduleDirectObservationApi(applicationId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.directObservations(applicationId),
      });
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.detail(applicationId),
      });
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.stages(applicationId),
      });
      toast({
        type: "success",
        title: "Observation Scheduled",
        description: "Direct observation session scheduled successfully.",
      });
    },

    onError: (error: Error) => {
      if (error instanceof ApiError) {
        toast({
          type: "error",
          title: "Scheduling Failed",
          description: error.message,
        });
      } else {
        toast({
          type: "error",
          title: "Network Error",
          description: "Unable to schedule observation. Please try again.",
        });
      }
    },
  });
}

export function useReviewDirectObservation(
  applicationId: string,
  sessionId: string,
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: ReviewObservationPayload) =>
      reviewDirectObservationApi(applicationId, sessionId, payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.directObservations(applicationId),
      });
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.directObservationSession(
          applicationId,
          sessionId,
        ),
      });
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.detail(applicationId),
      });
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.stages(applicationId),
      });
      toast({
        type: "success",
        title:
          variables.decision === "accept"
            ? "Observation Request Accepted"
            : "Observation Request Rejected",
        description: `Observation sitting has been ${
          variables.decision === "accept" ? "accepted" : "rejected"
        }.`,
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
          description: "Unable to complete observation review. Please try again.",
        });
      }
    },
  });
}

export function useSaveDirectObservationForm(
  applicationId: string,
  sessionId: string,
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: SaveObservationFormPayload) =>
      saveDirectObservationFormApi(applicationId, sessionId, payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.directObservationSession(
          applicationId,
          sessionId,
        ),
      });
      toast({
        type: "success",
        title: variables.submit ? "Observation Form Submitted" : "Observation Form Saved",
        description: variables.submit
          ? "Observation form has been submitted successfully."
          : "Observation form draft has been saved.",
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
          description: "Unable to save observation form. Please try again.",
        });
      }
    },
  });
}

export function useSignDirectObservation(
  applicationId: string,
  sessionId: string,
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: SignObservationPayload) =>
      signDirectObservationApi(applicationId, sessionId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.directObservationSession(
          applicationId,
          sessionId,
        ),
      });
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.directObservations(applicationId),
      });
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.detail(applicationId),
      });
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.stages(applicationId),
      });
      toast({
        type: "success",
        title: "Observation Signed",
        description: "Observation sitting signed successfully.",
      });
    },

    onError: (error: Error) => {
      if (error instanceof ApiError) {
        toast({
          type: "error",
          title: "Signature Failed",
          description: error.message,
        });
      } else {
        toast({
          type: "error",
          title: "Network Error",
          description: "Unable to record observation signature. Please try again.",
        });
      }
    },
  });
}

// ==========================================
// 4. Centre IQAM Hooks
// ==========================================

export function useGetCentreIqamSamplingPlan(
  applicationId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: APPLICATION_QUERY_KEYS.centreIqam(applicationId, "sampling-plan"),
    queryFn: () => getCentreIqamSamplingPlanApi(applicationId),
    enabled: Boolean(applicationId) && (options?.enabled ?? true),
  });
}

export function useGetCentreIqamSamplingRecord(
  applicationId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: APPLICATION_QUERY_KEYS.centreIqam(
      applicationId,
      "sampling-record",
    ),
    queryFn: () => getCentreIqamSamplingRecordApi(applicationId),
    enabled: Boolean(applicationId) && (options?.enabled ?? true),
  });
}

export function useGetCentreIqamIvReport(
  applicationId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: APPLICATION_QUERY_KEYS.centreIqam(applicationId, "iv-report"),
    queryFn: () => getCentreIqamIvReportApi(applicationId),
    enabled: Boolean(applicationId) && (options?.enabled ?? true),
  });
}

export function useGetCentreIqamAssessorOutcomes(
  applicationId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: APPLICATION_QUERY_KEYS.centreIqam(
      applicationId,
      "assessor-outcomes",
    ),
    queryFn: () => getCentreIqamAssessorOutcomesApi(applicationId),
    enabled: Boolean(applicationId) && (options?.enabled ?? true),
  });
}

export function useGetCentreIqamFinalPortfolio(
  applicationId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: APPLICATION_QUERY_KEYS.centreIqam(
      applicationId,
      "final-portfolio",
    ),
    queryFn: () => getCentreIqamFinalPortfolioApi(applicationId),
    enabled: Boolean(applicationId) && (options?.enabled ?? true),
  });
}

// ==========================================
// 5. Legacy Self-Assessment Hooks
// ==========================================

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
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.stages(applicationId),
      });
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.all,
      });
      if (data?.submittedAt) {
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

