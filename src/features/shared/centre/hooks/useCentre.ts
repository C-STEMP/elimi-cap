import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/src/components/ui/toast";
import { ApiError } from "@/src/lib/api/client";
import {
  getCentreStaffApi,
  addCentreStaffApi,
  patchCentreStaffBulkApi,
  getCentreStaffSummaryApi,
  getCentreStaffDetailApi,
  getCentreStaffApplicationsApi,
  getCentreDashboardApi,
  getCentreApplicationsSummaryApi,
  getCentreAssessorsApi,
  getCentreAssessorsSummaryApi,
  getCentreAssessorDetailApi,
  getCentreAssessorApplicationsApi,
  getCentreRetainedRequestsApi,
  patchCentreRetainedRequestsBulkApi,
  getCentreRetainedRequestDetailApi,
  approveRetainedRequestApi,
  rejectRetainedRequestApi,
  revokeRetainedRequestApi,
  getCentreJobPostingsApi,
  createCentreJobPostingApi,
  patchCentreJobPostingsBulkApi,
  getCentreJobPostingDetailApi,
  patchCentreJobPostingApi,
  deleteCentreJobPostingApi,
  getCentreJobPostingApplicationsApi,
  patchCentreJobPostingApplicationsBulkApi,
  getCentreJobPostingApplicationDetailApi,
  patchCentreJobPostingApplicationDecisionApi,
  getCentrePricingApi,
  postCentrePricingApi,
  putCentrePricingBatchApi,
  getCentrePaymentsSummaryApi,
  getCentrePaymentsApi,
  getCentreWalletApi,
  withdrawCentreWalletApi,
  getCentreProfileApi,
  patchCentreProfileApi,
  getCentreNotificationPolicyApi,
  putCentreNotificationPolicyApi,
  patchCentreNotificationPolicyApi,
  getDirectoryApi,
  type AddCentreStaffPayload,
  type CreateJobPostingPayload,
  type RetainedRequestStatus,
  type SetCentrePricingPayload,
  type WithdrawPayload,
  type CentreProfilePatch,
  type CentreNotificationPolicy,
  type CentreStaffStatus,
  type AssessorQualification,
  type JobPostingStatus,
} from "../api/centre.api";

export const CENTRE_QUERY_KEYS = {
  staff: (params?: unknown) => ["centre", "staff", params] as const,
  staffSummary: ["centre", "staff-summary"] as const,
  staffDetail: (id: string) => ["centre", "staff-detail", id] as const,
  staffApplications: (id: string, params?: unknown) =>
    ["centre", "staff-applications", id, params] as const,
  dashboard: (params?: unknown) => ["centre", "dashboard", params] as const,
  applicationsSummary: ["centre", "applications-summary"] as const,
  assessors: (params?: unknown) => ["centre", "assessors", params] as const,
  assessorsSummary: ["centre", "assessors-summary"] as const,
  assessorDetail: (id: string) => ["centre", "assessor-detail", id] as const,
  assessorApplications: (id: string, params?: unknown) =>
    ["centre", "assessor-applications", id, params] as const,
  retainedRequests: (params?: unknown) =>
    ["centre", "retained-requests", params] as const,
  retainedRequestDetail: (id: string) =>
    ["centre", "retained-request-detail", id] as const,
  jobPostings: (params?: unknown) => ["centre", "job-postings", params] as const,
  jobPostingDetail: (id: string) => ["centre", "job-posting-detail", id] as const,
  jobPostingApplications: (id: string, params?: unknown) =>
    ["centre", "job-posting-applications", id, params] as const,
  jobPostingApplicationDetail: (id: string, applicationId: string) =>
    ["centre", "job-posting-application-detail", id, applicationId] as const,
  pricing: ["centre", "pricing"] as const,
  paymentsSummary: ["centre", "payments-summary"] as const,
  payments: (params?: unknown) => ["centre", "payments", params] as const,
  wallet: ["centre", "wallet"] as const,
  profile: ["centre", "profile"] as const,
  notificationPolicy: ["centre", "notification-policy"] as const,
  directory: (params?: unknown) => ["centre", "directory", params] as const,
};

// ─── Staff Hooks ─────────────────────────────────────────────────────────────
export function useGetCentreStaff(params?: {
  status?: CentreStaffStatus;
  q?: string;
  sort?: string;
  order?: "asc" | "desc";
  cursor?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: CENTRE_QUERY_KEYS.staff(params),
    queryFn: () => getCentreStaffApi(params),
  });
}

export function useAddCentreStaff() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: AddCentreStaffPayload) => addCentreStaffApi(payload),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["centre", "staff"] });
      queryClient.invalidateQueries({ queryKey: CENTRE_QUERY_KEYS.staffSummary });
      toast({
        type: "success",
        title: "Staff Added",
        description: `Staff member ${data.name || data.email} added successfully.`,
      });
    },

    onError: (error: Error) => {
      if (error instanceof ApiError) {
        if (error.statusCode === 409) {
          toast({
            type: "error",
            title: "Staff Already Exists",
            description: "User is already staff at this centre.",
          });
        } else {
          toast({
            type: "error",
            title: "Failed to Add Staff",
            description: error.message,
          });
        }
      } else {
        toast({
          type: "error",
          title: "Network Error",
          description: "Unable to add staff member. Please try again.",
        });
      }
    },
  });
}

export function usePatchCentreStaffBulk() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: { ids: string[]; status: "active" | "inactive" }) =>
      patchCentreStaffBulkApi(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["centre", "staff"] });
      queryClient.invalidateQueries({ queryKey: CENTRE_QUERY_KEYS.staffSummary });
      toast({
        type: "success",
        title: "Staff Status Updated",
        description: `Staff status updated to ${variables.status}.`,
      });
    },
    onError: (err: Error) => {
      toast({
        type: "error",
        title: "Update Failed",
        description: err.message || "Failed to update staff status.",
      });
    },
  });
}

export function useGetCentreStaffSummary() {
  return useQuery({
    queryKey: CENTRE_QUERY_KEYS.staffSummary,
    queryFn: () => getCentreStaffSummaryApi(),
  });
}

export function useGetCentreStaffDetail(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: CENTRE_QUERY_KEYS.staffDetail(id),
    queryFn: () => getCentreStaffDetailApi(id),
    enabled: options?.enabled ?? !!id,
  });
}

export function useGetCentreStaffApplications(
  id: string,
  params?: {
    q?: string;
    tradeId?: string;
    type?: "RPL" | "NSQ";
    status?: string;
    queue?: "pending" | "requires_attention";
    sort?: string;
    order?: "asc" | "desc";
    cursor?: string;
    limit?: number;
  },
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: CENTRE_QUERY_KEYS.staffApplications(id, params),
    queryFn: () => getCentreStaffApplicationsApi(id, params),
    enabled: options?.enabled ?? !!id,
  });
}

// ─── Dashboard & Overview Hooks ──────────────────────────────────────────────
export function useGetCentreDashboard(params?: {
  year?: number;
  applicationType?: "RPL" | "NSQ";
}) {
  return useQuery({
    queryKey: CENTRE_QUERY_KEYS.dashboard(params),
    queryFn: () => getCentreDashboardApi(params),
  });
}

export function useGetCentreApplicationsSummary() {
  return useQuery({
    queryKey: CENTRE_QUERY_KEYS.applicationsSummary,
    queryFn: () => getCentreApplicationsSummaryApi(),
  });
}

// ─── Assessors & Retained Requests Hooks ─────────────────────────────────────
export function useGetCentreAssessors(params?: {
  qualification?: AssessorQualification;
  q?: string;
  status?: "pending" | "approved" | "revoked" | "all";
  cursor?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: CENTRE_QUERY_KEYS.assessors(params),
    queryFn: () => getCentreAssessorsApi(params),
  });
}

export function useGetCentreAssessorsSummary() {
  return useQuery({
    queryKey: CENTRE_QUERY_KEYS.assessorsSummary,
    queryFn: () => getCentreAssessorsSummaryApi(),
  });
}

export function useGetCentreAssessorDetail(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: CENTRE_QUERY_KEYS.assessorDetail(id),
    queryFn: () => getCentreAssessorDetailApi(id),
    enabled: options?.enabled ?? !!id,
  });
}

export function useGetCentreAssessorApplications(
  id: string,
  params?: {
    q?: string;
    tradeId?: string;
    type?: "RPL" | "NSQ";
    status?: string;
    sort?: string;
    order?: "asc" | "desc";
    cursor?: string;
    limit?: number;
  },
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: CENTRE_QUERY_KEYS.assessorApplications(id, params),
    queryFn: () => getCentreAssessorApplicationsApi(id, params),
    enabled: options?.enabled ?? !!id,
  });
}

export function useGetRetainedRequests(params?: {
  status?: RetainedRequestStatus;
  q?: string;
  sort?: string;
  order?: "asc" | "desc";
  cursor?: string;
  limit?: number;
} | RetainedRequestStatus) {
  const normalizedParams =
    typeof params === "string" ? { status: params } : params;
  return useQuery({
    queryKey: CENTRE_QUERY_KEYS.retainedRequests(normalizedParams),
    queryFn: () => getCentreRetainedRequestsApi(normalizedParams),
  });
}

export function useGetRetainedRequestDetail(
  id: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: CENTRE_QUERY_KEYS.retainedRequestDetail(id),
    queryFn: () => getCentreRetainedRequestDetailApi(id),
    enabled: options?.enabled ?? !!id,
  });
}

export function useApproveRetainedRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => approveRetainedRequestApi(id),

    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["centre", "retained-requests"] });
      queryClient.invalidateQueries({ queryKey: CENTRE_QUERY_KEYS.retainedRequestDetail(id) });
      queryClient.invalidateQueries({ queryKey: ["centre", "assessors"] });
      queryClient.invalidateQueries({ queryKey: CENTRE_QUERY_KEYS.assessorsSummary });
      toast({
        type: "success",
        title: "Request Approved",
        description: "Retained assessor request approved.",
      });
    },

    onError: (error: Error) => {
      toast({
        type: "error",
        title: "Approval Failed",
        description: error.message || "Unable to approve request.",
      });
    },
  });
}

export function useRejectRetainedRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => rejectRetainedRequestApi(id),

    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["centre", "retained-requests"] });
      queryClient.invalidateQueries({ queryKey: CENTRE_QUERY_KEYS.retainedRequestDetail(id) });
      queryClient.invalidateQueries({ queryKey: ["centre", "assessors"] });
      toast({
        type: "success",
        title: "Request Rejected",
        description: "Retained assessor request rejected.",
      });
    },

    onError: (error: Error) => {
      toast({
        type: "error",
        title: "Rejection Failed",
        description: error.message || "Unable to reject request.",
      });
    },
  });
}

export function useRevokeRetainedRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => revokeRetainedRequestApi(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["centre", "retained-requests"] });
      queryClient.invalidateQueries({ queryKey: ["centre", "assessors"] });
      queryClient.invalidateQueries({ queryKey: CENTRE_QUERY_KEYS.assessorsSummary });
      toast({
        type: "success",
        title: "Relationship Revoked",
        description: "Retained assessor relationship revoked.",
      });
    },

    onError: (error: Error) => {
      toast({
        type: "error",
        title: "Revocation Failed",
        description: error.message || "Unable to revoke retained assessor relationship.",
      });
    },
  });
}

// ─── Job Postings Hooks ──────────────────────────────────────────────────────
export function useGetJobPostings(params?: {
  q?: string;
  status?: JobPostingStatus;
  sort?: string;
  order?: "asc" | "desc";
  cursor?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: CENTRE_QUERY_KEYS.jobPostings(params),
    queryFn: () => getCentreJobPostingsApi(params),
  });
}

export function useCreateJobPosting() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: CreateJobPostingPayload) =>
      createCentreJobPostingApi(payload),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["centre", "job-postings"] });
      toast({
        type: "success",
        title: "Job Posting Published",
        description: `Job posting "${data.title}" published successfully.`,
      });
    },

    onError: (error: Error) => {
      toast({
        type: "error",
        title: "Job Posting Failed",
        description: error.message || "Unable to publish job posting.",
      });
    },
  });
}

export function usePatchJobPostingsBulk() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: { ids: string[]; status: "closed" }) =>
      patchCentreJobPostingsBulkApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["centre", "job-postings"] });
      toast({
        type: "success",
        title: "Postings Closed",
        description: "Selected job postings have been closed.",
      });
    },
    onError: (err: Error) => {
      toast({
        type: "error",
        title: "Close Failed",
        description: err.message || "Failed to close postings.",
      });
    },
  });
}

export function useGetJobPostingDetail(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: CENTRE_QUERY_KEYS.jobPostingDetail(id),
    queryFn: () => getCentreJobPostingDetailApi(id),
    enabled: options?.enabled ?? !!id,
  });
}

export function usePatchJobPosting() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { status: "closed" } }) =>
      patchCentreJobPostingApi(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["centre", "job-postings"] });
      queryClient.invalidateQueries({
        queryKey: CENTRE_QUERY_KEYS.jobPostingDetail(variables.id),
      });
      toast({
        type: "success",
        title: "Posting Updated",
        description: "Job posting closed.",
      });
    },
    onError: (err: Error) => {
      toast({
        type: "error",
        title: "Update Failed",
        description: err.message || "Failed to update job posting.",
      });
    },
  });
}

export function useDeleteJobPosting() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => deleteCentreJobPostingApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["centre", "job-postings"] });
      toast({
        type: "success",
        title: "Posting Deleted",
        description: "Job posting deleted successfully.",
      });
    },
    onError: (err: Error) => {
      toast({
        type: "error",
        title: "Delete Failed",
        description: err.message || "Failed to delete posting.",
      });
    },
  });
}

export function useGetJobPostingApplications(
  id: string,
  params?: {
    q?: string;
    status?: "applied" | "accepted" | "rejected" | "withdrawn";
    sort?: string;
    order?: "asc" | "desc";
    cursor?: string;
    limit?: number;
  },
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: CENTRE_QUERY_KEYS.jobPostingApplications(id, params),
    queryFn: () => getCentreJobPostingApplicationsApi(id, params),
    enabled: options?.enabled ?? !!id,
  });
}

export function useGetJobPostingApplicationDetail(
  id: string,
  applicationId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: CENTRE_QUERY_KEYS.jobPostingApplicationDetail(id, applicationId),
    queryFn: () => getCentreJobPostingApplicationDetailApi(id, applicationId),
    enabled: options?.enabled ?? (!!id && !!applicationId),
  });
}

export function usePatchJobPostingApplicationsBulk() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { ids: string[]; decision: "shortlist" | "reject" };
    }) => patchCentreJobPostingApplicationsBulkApi(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: CENTRE_QUERY_KEYS.jobPostingApplications(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: CENTRE_QUERY_KEYS.jobPostingDetail(variables.id),
      });
      toast({
        type: "success",
        title: "Applicants Updated",
        description: `Applicants updated with decision: ${variables.payload.decision}.`,
      });
    },
    onError: (err: Error) => {
      toast({
        type: "error",
        title: "Update Failed",
        description: err.message || "Failed to update applicants.",
      });
    },
  });
}

export function usePatchJobPostingApplicationDecision() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      id,
      applicationId,
      decision,
    }: {
      id: string;
      applicationId: string;
      decision: "shortlist" | "reject";
    }) =>
      patchCentreJobPostingApplicationDecisionApi(id, applicationId, { decision }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: CENTRE_QUERY_KEYS.jobPostingApplications(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: CENTRE_QUERY_KEYS.jobPostingDetail(variables.id),
      });
      toast({
        type: "success",
        title: "Applicant Decision Recorded",
        description: `Applicant ${variables.decision === "shortlist" ? "shortlisted" : "rejected"}.`,
      });
    },
    onError: (err: Error) => {
      toast({
        type: "error",
        title: "Decision Failed",
        description: err.message || "Failed to record decision.",
      });
    },
  });
}

// ─── Pricing, Wallet & Payments Hooks ────────────────────────────────────────
export function useGetCentrePricing() {
  return useQuery({
    queryKey: CENTRE_QUERY_KEYS.pricing,
    queryFn: () => getCentrePricingApi(),
  });
}

export function useSetCentrePricing() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: SetCentrePricingPayload) => postCentrePricingApi(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CENTRE_QUERY_KEYS.pricing });
      toast({
        type: "success",
        title: "Pricing Updated",
        description: "Centre pricing updated successfully.",
      });
    },

    onError: (error: Error) => {
      toast({
        type: "error",
        title: "Pricing Update Failed",
        description: error.message || "Unable to update pricing.",
      });
    },
  });
}

export function usePutCentrePricingBatch() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: { items: SetCentrePricingPayload[] }) =>
      putCentrePricingBatchApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CENTRE_QUERY_KEYS.pricing });
      toast({
        type: "success",
        title: "Pricing Batch Updated",
        description: "All prices updated successfully.",
      });
    },
    onError: (err: Error) => {
      toast({
        type: "error",
        title: "Pricing Batch Failed",
        description: err.message || "Failed to update pricing batch.",
      });
    },
  });
}

export function useGetCentrePaymentsSummary() {
  return useQuery({
    queryKey: CENTRE_QUERY_KEYS.paymentsSummary,
    queryFn: () => getCentrePaymentsSummaryApi(),
  });
}

export function useGetCentrePayments(params?: {
  cursor?: string;
  limit?: number;
  q?: string;
  status?: "pending" | "completed" | "failed";
  sort?: "paidAt" | "initiatedAt";
  order?: "asc" | "desc";
}) {
  return useQuery({
    queryKey: CENTRE_QUERY_KEYS.payments(params),
    queryFn: () => getCentrePaymentsApi(params),
  });
}

export function useGetCentreWallet() {
  return useQuery({
    queryKey: CENTRE_QUERY_KEYS.wallet,
    queryFn: () => getCentreWalletApi(),
  });
}

export function useWithdrawCentreWallet() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: WithdrawPayload) => withdrawCentreWalletApi(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CENTRE_QUERY_KEYS.wallet });
      queryClient.invalidateQueries({ queryKey: CENTRE_QUERY_KEYS.paymentsSummary });
      toast({
        type: "success",
        title: "Withdrawal Requested",
        description: "Withdrawal request submitted successfully.",
      });
    },

    onError: (error: Error) => {
      toast({
        type: "error",
        title: "Withdrawal Failed",
        description: error.message || "Unable to request withdrawal.",
      });
    },
  });
}

// ─── Profile & Policy Hooks ──────────────────────────────────────────────────
export function useGetCentreProfile() {
  return useQuery({
    queryKey: CENTRE_QUERY_KEYS.profile,
    queryFn: () => getCentreProfileApi(),
  });
}

export function usePatchCentreProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: CentreProfilePatch) => patchCentreProfileApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CENTRE_QUERY_KEYS.profile });
      toast({
        type: "success",
        title: "Profile Updated",
        description: "Centre profile updated successfully.",
      });
    },
    onError: (err: Error) => {
      toast({
        type: "error",
        title: "Update Failed",
        description: err.message || "Failed to update centre profile.",
      });
    },
  });
}

export function useGetCentreNotificationPolicy() {
  return useQuery({
    queryKey: CENTRE_QUERY_KEYS.notificationPolicy,
    queryFn: () => getCentreNotificationPolicyApi(),
  });
}

export function usePutCentreNotificationPolicy() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: CentreNotificationPolicy) =>
      putCentreNotificationPolicyApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CENTRE_QUERY_KEYS.notificationPolicy,
      });
      toast({
        type: "success",
        title: "Notification Policy Updated",
        description: "Policy replaced successfully.",
      });
    },
    onError: (err: Error) => {
      toast({
        type: "error",
        title: "Policy Update Failed",
        description: err.message || "Failed to update notification policy.",
      });
    },
  });
}

export function usePatchCentreNotificationPolicy() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: Partial<CentreNotificationPolicy>) =>
      patchCentreNotificationPolicyApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CENTRE_QUERY_KEYS.notificationPolicy,
      });
      toast({
        type: "success",
        title: "Notification Policy Updated",
        description: "Policy updated successfully.",
      });
    },
    onError: (err: Error) => {
      toast({
        type: "error",
        title: "Policy Update Failed",
        description: err.message || "Failed to update notification policy.",
      });
    },
  });
}

// ─── Directory Hook ──────────────────────────────────────────────────────────
export function useGetDirectory(params?: {
  q?: string;
  kinds?: string;
  cursor?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: CENTRE_QUERY_KEYS.directory(params),
    queryFn: () => getDirectoryApi(params),
  });
}

// ─── Composite Hook ──────────────────────────────────────────────────────────
export function useCentre() {
  const addStaff = useAddCentreStaff();
  const createJobPosting = useCreateJobPosting();
  const approveRetainedRequest = useApproveRetainedRequest();
  const rejectRetainedRequest = useRejectRetainedRequest();
  const setPricing = useSetCentrePricing();
  const withdrawWallet = useWithdrawCentreWallet();

  return {
    addStaff,
    createJobPosting,
    approveRetainedRequest,
    rejectRetainedRequest,
    setPricing,
    withdrawWallet,
  };
}
