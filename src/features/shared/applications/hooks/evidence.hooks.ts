import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/src/components/ui/toast";
import { ApiError } from "@/src/lib/api/client";
import {
  getEvidenceVaultApi,
  uploadApplicationCvApi,
  createGeneralEvidenceApi,
  patchGeneralEvidenceApi,
  reviewGeneralEvidenceApi,
  deleteGeneralEvidenceApi,
  getThirdPartyReportApi,
  uploadThirdPartyReportApi,
} from "../api";
import { APPLICATION_QUERY_KEYS } from "./queryKeys";

export function useGetEvidenceVault(
  id: string,
  params?: { cursor?: string; limit?: number },
) {
  return useQuery({
    queryKey: APPLICATION_QUERY_KEYS.evidence(id, params),
    queryFn: () => getEvidenceVaultApi(id, params),
    enabled: Boolean(id),
  });
}

export function useUploadApplicationCv(
  applicationId: string,
  options?: { showToast?: boolean },
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (assetId: string) => uploadApplicationCvApi(applicationId, assetId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.detail(applicationId),
      });
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.portfolio(applicationId),
      });
      queryClient.invalidateQueries({
        queryKey: ["applications", "evidence", applicationId],
      });
      if (options?.showToast !== false) {
        toast({
          type: "success",
          title: "CV Uploaded",
          description: "Your CV/Resume has been uploaded successfully.",
        });
      }
    },

    onError: (error: Error) => {
      if (error instanceof ApiError) {
        toast({
          type: "error",
          title: "CV Upload Failed",
          description: error.message,
        });
      } else {
        toast({
          type: "error",
          title: "Network Error",
          description: "Unable to upload CV. Please try again.",
        });
      }
    },
  });
}

export function useCreateGeneralEvidence(
  applicationId: string,
  options?: { showToast?: boolean },
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: {
      documentName: string;
      evidenceType: string;
      assetId?: string;
      formData?: Record<string, unknown>;
      textValue?: string;
    }) => createGeneralEvidenceApi(applicationId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["applications", "evidence", applicationId],
      });
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.detail(applicationId),
      });
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.portfolio(applicationId),
      });
      if (options?.showToast !== false) {
        toast({
          type: "success",
          title: "Evidence Uploaded",
          description: "Your evidence has been uploaded successfully.",
        });
      }
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
          description: "Unable to upload evidence. Please try again.",
        });
      }
    },
  });
}

export function usePatchGeneralEvidence(applicationId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      evidenceId,
      payload,
    }: {
      evidenceId: string;
      payload: {
        documentName?: string;
        evidenceType?: string;
        assetId?: string | null;
        formData?: Record<string, unknown> | null;
        textValue?: string | null;
      };
    }) => patchGeneralEvidenceApi(applicationId, evidenceId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["applications", "evidence", applicationId],
      });
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.detail(applicationId),
      });
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.portfolio(applicationId),
      });
      toast({
        type: "success",
        title: "Evidence Updated",
        description: "Your evidence has been updated and queued for review.",
      });
    },

    onError: (error: Error) => {
      if (error instanceof ApiError) {
        toast({
          type: "error",
          title: "Update Failed",
          description: error.message,
        });
      } else {
        toast({
          type: "error",
          title: "Network Error",
          description: "Unable to update evidence. Please try again.",
        });
      }
    },
  });
}

export function useReviewGeneralEvidence(applicationId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      evidenceId,
      decision,
      comment,
    }: {
      evidenceId: string;
      decision: "approve" | "reject";
      comment?: string;
    }) =>
      reviewGeneralEvidenceApi(applicationId, evidenceId, {
        decision,
        ...(comment ? { comment } : {}),
      }),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["applications", "evidence", applicationId],
      });
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.detail(applicationId),
      });
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.portfolio(applicationId),
      });
      toast({
        type: "success",
        title:
          variables.decision === "approve"
            ? "Evidence Approved"
            : "Evidence Rejected",
        description:
          variables.decision === "approve"
            ? "Evidence item has been approved."
            : "Evidence item has been rejected with feedback.",
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
          description: "Unable to submit evidence review. Please try again.",
        });
      }
    },
  });
}

export function useDeleteGeneralEvidence(applicationId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (evidenceId: string) =>
      deleteGeneralEvidenceApi(applicationId, evidenceId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["applications", "evidence", applicationId],
      });
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.detail(applicationId),
      });
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.portfolio(applicationId),
      });
      toast({
        type: "success",
        title: "Evidence Deleted",
        description: "Your evidence was deleted successfully.",
      });
    },

    onError: (error: Error) => {
      if (error instanceof ApiError) {
        toast({
          type: "error",
          title: "Delete Failed",
          description: error.message,
        });
      } else {
        toast({
          type: "error",
          title: "Network Error",
          description: "Unable to delete evidence. Please try again.",
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
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.portfolio(id),
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
