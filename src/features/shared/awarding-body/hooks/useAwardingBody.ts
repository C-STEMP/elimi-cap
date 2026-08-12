import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/src/components/ui/toast";
import { ApiError } from "@/src/lib/api/client";
import {
  getAwardingBodyApplicationsApi,
  addAwardingBodyStaffApi,
  assignExternalVerifierApi,
  reviewExternalVerifierApi,
  issueCertificateApi,
  type AddAwardingBodyStaffPayload,
  type AssignEvPayload,
  type EvReviewDecisionPayload,
  type IssueCertificatePayload,
} from "../api/awarding-body.api";

export const AWARDING_BODY_QUERY_KEYS = {
  applications: ["awarding-body", "applications"] as const,
};

export function useGetAwardingBodyApplications() {
  return useQuery({
    queryKey: AWARDING_BODY_QUERY_KEYS.applications,
    queryFn: () => getAwardingBodyApplicationsApi(),
  });
}

export function useAddAwardingBodyStaff() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: AddAwardingBodyStaffPayload) =>
      addAwardingBodyStaffApi(payload),

    onSuccess: () => {
      toast({
        type: "success",
        title: "Staff Invited",
        description: "Awarding Body staff invited successfully.",
      });
    },

    onError: (error: Error) => {
      if (error instanceof ApiError) {
        toast({
          type: "error",
          title: "Invitation Failed",
          description: error.message,
        });
      } else {
        toast({
          type: "error",
          title: "Network Error",
          description: "Unable to invite staff. Please try again.",
        });
      }
    },
  });
}

export function useAssignExternalVerifier() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      applicationId,
      payload,
    }: {
      applicationId: string;
      payload: AssignEvPayload;
    }) => assignExternalVerifierApi(applicationId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: AWARDING_BODY_QUERY_KEYS.applications,
      });
      toast({
        type: "success",
        title: "EV Assigned",
        description: "External Verifier assigned to application.",
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
          description: "Unable to assign EV. Please try again.",
        });
      }
    },
  });
}

export function useReviewExternalVerifier() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      applicationId,
      payload,
    }: {
      applicationId: string;
      payload: EvReviewDecisionPayload;
    }) => reviewExternalVerifierApi(applicationId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: AWARDING_BODY_QUERY_KEYS.applications,
      });
      toast({
        type: "success",
        title: "EV Review Recorded",
        description: "External verification review recorded.",
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
          description: "Unable to record review. Please try again.",
        });
      }
    },
  });
}

export function useIssueCertificate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      applicationId,
      payload,
    }: {
      applicationId: string;
      payload: IssueCertificatePayload;
    }) => issueCertificateApi(applicationId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: AWARDING_BODY_QUERY_KEYS.applications,
      });
      toast({
        type: "success",
        title: "Certificate Issued",
        description: "Certificate issued successfully for this candidate.",
      });
    },

    onError: (error: Error) => {
      if (error instanceof ApiError) {
        toast({
          type: "error",
          title: "Certificate Issuance Failed",
          description: error.message,
        });
      } else {
        toast({
          type: "error",
          title: "Network Error",
          description: "Unable to issue certificate. Please try again.",
        });
      }
    },
  });
}

/**
 * Composite hook grouping Awarding Body operations
 */
export function useAwardingBody() {
  const addStaff = useAddAwardingBodyStaff();
  const assignEV = useAssignExternalVerifier();
  const reviewEV = useReviewExternalVerifier();
  const issueCertificate = useIssueCertificate();

  return {
    addStaff,
    assignEV,
    reviewEV,
    issueCertificate,
  };
}
