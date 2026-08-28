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
  getPaymentQuoteApi,
  getApplicationReceiptApi,
  getSelfAssessmentApi,
  saveSelfAssessmentApi,
  getEvidenceVaultApi,
  getInterviewPanelApi,
  getInterviewScheduleApi,
  evaluateInterviewApi,
  getInterviewFormsApi,
  updateInterviewFormApi,
  signoffInterviewFormApi,
  getInterviewObserverCommentsApi,
  postInterviewObserverCommentApi,
  getThirdPartyReportApi,
  uploadThirdPartyReportApi,
  resolveAppealApi,
  getRecommendationsApi,
  closeRecommendationsApi,
  submitInductionFormApi,
  scheduleDirectObservationApi,
  submitUnitEvidenceApi,
  submitUnitSignoffApi,
  assignUnitAssessorApi,
  type Application,
  type CreateApplicationPayload,
  type ReviewDecisionPayload,
  type ApplicationStatus,
  type SaveSelfAssessmentPayload,
  type PostUnitEvidencePayload,
  type PostUnitSignoffPayload,
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
      if (data?.checkoutUrl) {
        toast({
          type: "success",
          title: "Redirecting to Paystack",
          description: "Redirecting to secure payment checkout...",
        });
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

export function useGetPaymentQuote(id: string) {
  return useQuery({
    queryKey: ["applications", "payment-quote", id],
    queryFn: () => getPaymentQuoteApi(id),
    enabled: Boolean(id),
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

export function useGetEvidenceVault(
  id: string,
  params?: { cursor?: string; limit?: number },
) {
  return useQuery({
    queryKey: ["applications", "evidence", id, params],
    queryFn: () => getEvidenceVaultApi(id, params),
    enabled: Boolean(id),
  });
}

export function useGetInterviewPanel(id: string) {
  return useQuery({
    queryKey: ["applications", "interview-panel", id],
    queryFn: () => getInterviewPanelApi(id),
    enabled: Boolean(id),
  });
}

export function useGetInterviewSchedule(id: string) {
  return useQuery({
    queryKey: ["applications", "interview-schedule", id],
    queryFn: () => getInterviewScheduleApi(id),
    enabled: Boolean(id),
  });
}

export function useEvaluateInterview(id: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: {
      feedback: string;
      signatureAssetId: string;
      decision?: "approve" | "reject";
      outcome?: "unsuccessful" | "inconclusive";
    }) => evaluateInterviewApi(id, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.stages(id),
      });
      queryClient.invalidateQueries({
        queryKey: ["applications", "interview-forms", id],
      });
      toast({
        type: "success",
        title: "Evaluation Submitted",
        description: "Your interview evaluation has been recorded successfully.",
      });
    },

    onError: (error: Error) => {
      if (error instanceof ApiError) {
        toast({
          type: "error",
          title: "Evaluation Failed",
          description: error.message,
        });
      } else {
        toast({
          type: "error",
          title: "Network Error",
          description: "Unable to submit evaluation. Please try again.",
        });
      }
    },
  });
}

export function useGetInterviewForms(id: string) {
  return useQuery({
    queryKey: ["applications", "interview-forms", id],
    queryFn: () => getInterviewFormsApi(id),
    enabled: Boolean(id),
  });
}

export function useUpdateInterviewForm(id: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      formType,
      data,
    }: {
      formType: "records" | "assessment_grid" | "practical_observation";
      data: Record<string, unknown>;
    }) => updateInterviewFormApi(id, formType, { data }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["applications", "interview-forms", id],
      });
      toast({
        type: "success",
        title: "Form Saved",
        description: "Interview assessment form updated successfully.",
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
          description: "Unable to save interview form. Please try again.",
        });
      }
    },
  });
}

export function useSignoffInterviewForm(id: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      formType,
      payload,
    }: {
      formType: "records" | "assessment_grid" | "practical_observation";
      payload: {
        signatureMode: "upload" | "default" | "typed";
        signatureAssetId?: string;
        typedName?: string;
      };
    }) => signoffInterviewFormApi(id, formType, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["applications", "interview-forms", id],
      });
      toast({
        type: "success",
        title: "Form Signed",
        description: "Form signed off successfully.",
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
          description: "Unable to sign form. Please try again.",
        });
      }
    },
  });
}

export function useGetInterviewObserverComments(id: string) {
  return useQuery({
    queryKey: ["applications", "interview-observer-comments", id],
    queryFn: () => getInterviewObserverCommentsApi(id),
    enabled: Boolean(id),
  });
}

export function usePostInterviewObserverComment(id: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (content: string) =>
      postInterviewObserverCommentApi(id, content),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["applications", "interview-observer-comments", id],
      });
      toast({
        type: "success",
        title: "Comment Posted",
        description: "Observer comment recorded.",
      });
    },

    onError: (error: Error) => {
      if (error instanceof ApiError) {
        toast({
          type: "error",
          title: "Comment Failed",
          description: error.message,
        });
      } else {
        toast({
          type: "error",
          title: "Network Error",
          description: "Unable to post comment. Please try again.",
        });
      }
    },
  });
}

export function useGetThirdPartyReport(id: string) {
  return useQuery({
    queryKey: ["applications", "third-party-report", id],
    queryFn: () => getThirdPartyReportApi(id),
    enabled: Boolean(id),
  });
}

export function useUploadThirdPartyReport(id: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (assetId: string) => uploadThirdPartyReportApi(id, assetId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["applications", "third-party-report", id],
      });
      queryClient.invalidateQueries({
        queryKey: ["applications", "evidence", id],
      });
      toast({
        type: "success",
        title: "Report Uploaded",
        description: "Signed third-party report uploaded successfully.",
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
          description: "Unable to upload third-party report. Please try again.",
        });
      }
    },
  });
}

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

export function useSubmitInductionForm(applicationId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      submitInductionFormApi(applicationId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.detail(applicationId),
      });
      toast({
        type: "success",
        title: "Induction Form Submitted",
        description: "Your induction form has been recorded successfully.",
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
          description: "Unable to submit induction form. Please try again.",
        });
      }
    },
  });
}

export function useScheduleDirectObservation(applicationId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (scheduledAt: string) =>
      scheduleDirectObservationApi(applicationId, scheduledAt),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.detail(applicationId),
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

export function useSubmitUnitEvidence(applicationId: string, unitId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: PostUnitEvidencePayload) =>
      submitUnitEvidenceApi(applicationId, unitId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.detail(applicationId),
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

export function useSubmitUnitSignoff(applicationId: string, unitId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: PostUnitSignoffPayload) =>
      submitUnitSignoffApi(applicationId, unitId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.detail(applicationId),
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
