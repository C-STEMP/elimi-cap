import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/src/components/ui/toast";
import { ApiError } from "@/src/lib/api/client";
import {
  getAssessorSummaryApi,
  getAssessorEventsApi,
  getAssessorApplicationsApi,
  getAssessorCentresApi,
  getAssessorCentreApplicationsApi,
  getAssessorJobPostingsApi,
  getAssessorMarketplaceApi,
  getAssessorMarketplaceJobDetailApi,
  applyToJobPostingApi,
  getAssessorRetainedRequestsApi,
  requestRetainedAssessorApi,
  getAssessorProfileApi,
  patchAssessorProfileApi,
  getAssessorProfileSectorsApi,
  updateAssessorProfileSectorsApi,
  type AssessorSelfProfilePatch,
  type RequestRetainedAssessorPayload,
} from "../api/assessor.api";
import type { ApplicationStatus, ApplicationType } from "@/src/features/shared/applications/api";

export const ASSESSOR_QUERY_KEYS = {
  summary: ["assessor", "summary"] as const,
  events: (params?: unknown) => ["assessor", "events", params] as const,
  applications: (params?: unknown) => ["assessor", "applications", params] as const,
  centres: (params?: unknown) => ["assessor", "centres", params] as const,
  centreApplications: (centreId: string, params?: unknown) =>
    ["assessor", "centre-applications", centreId, params] as const,
  jobPostings: (params?: unknown) => ["assessor", "job-postings", params] as const,
  marketplace: (params?: unknown) => ["assessor", "marketplace", params] as const,
  marketplaceDetail: (id: string) => ["assessor", "marketplace-detail", id] as const,
  retainedRequests: (params?: unknown) => ["assessor", "retained-requests", params] as const,
  profile: ["assessor", "profile"] as const,
  sectors: ["assessor", "profile", "sectors"] as const,
};

// ─── 1. Assessor Summary Hook ────────────────────────────────────────────────
export function useGetAssessorSummary() {
  return useQuery({
    queryKey: ASSESSOR_QUERY_KEYS.summary,
    queryFn: () => getAssessorSummaryApi(),
  });
}

// ─── 2. Assessor Events Hook ─────────────────────────────────────────────────
export function useGetAssessorEvents(params?: {
  cursor?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ASSESSOR_QUERY_KEYS.events(params),
    queryFn: () => getAssessorEventsApi(params),
  });
}

// ─── 3. Assessor Applications Hook ───────────────────────────────────────────
export function useGetAssessorApplications(params?: {
  q?: string;
  tradeId?: string;
  type?: ApplicationType;
  status?: ApplicationStatus;
  sort?: string;
  order?: "asc" | "desc";
  cursor?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ASSESSOR_QUERY_KEYS.applications(params),
    queryFn: () => getAssessorApplicationsApi(params),
  });
}

// ─── 4. Assessor Centres Hook ────────────────────────────────────────────────
export function useGetAssessorCentres(params?: {
  status?: "pending" | "approved" | "revoked" | "rejected" | "all";
  q?: string;
  sort?: "joinedAt" | "requestedAt";
  order?: "asc" | "desc";
  cursor?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ASSESSOR_QUERY_KEYS.centres(params),
    queryFn: () => getAssessorCentresApi(params),
  });
}

// ─── 5. Assessor Centre Applications Hook ────────────────────────────────────
export function useGetAssessorCentreApplications(
  centreId: string,
  params?: {
    q?: string;
    tradeId?: string;
    type?: ApplicationType;
    status?: ApplicationStatus;
    sort?: string;
    order?: "asc" | "desc";
    cursor?: string;
    limit?: number;
  },
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ASSESSOR_QUERY_KEYS.centreApplications(centreId, params),
    queryFn: () => getAssessorCentreApplicationsApi(centreId, params),
    enabled: options?.enabled ?? !!centreId,
  });
}

// ─── 6. Assessor Job Postings Hook ───────────────────────────────────────────
export function useGetAssessorJobPostings(params?: {
  cursor?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ASSESSOR_QUERY_KEYS.jobPostings(params),
    queryFn: () => getAssessorJobPostingsApi(params),
  });
}

// ─── 7. Assessor Marketplace Hook ───────────────────────────────────────────
export function useGetAssessorMarketplace(params?: {
  cursor?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ASSESSOR_QUERY_KEYS.marketplace(params),
    queryFn: () => getAssessorMarketplaceApi(params),
  });
}

// ─── 8. Assessor Marketplace Detail Hook ─────────────────────────────────────
export function useGetAssessorMarketplaceDetail(
  id: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ASSESSOR_QUERY_KEYS.marketplaceDetail(id),
    queryFn: () => getAssessorMarketplaceJobDetailApi(id),
    enabled: options?.enabled ?? !!id,
  });
}

// ─── 9. Apply to Job Posting Hook ────────────────────────────────────────────
export function useApplyToJobPosting() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (jobPostingId: string) => applyToJobPostingApi(jobPostingId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessor", "job-postings"] });
      queryClient.invalidateQueries({ queryKey: ["assessor", "marketplace"] });
      toast({
        type: "success",
        title: "Application Submitted",
        description: "Applied to job posting successfully.",
      });
    },

    onError: (error: Error) => {
      if (error instanceof ApiError) {
        toast({
          type: "error",
          title: "Application Failed",
          description: error.message,
        });
      } else {
        toast({
          type: "error",
          title: "Network Error",
          description: "Unable to apply for job posting. Please try again.",
        });
      }
    },
  });
}

// ─── 10. Retained Requests Hook ──────────────────────────────────────────────
export function useGetAssessorRetainedRequests(params?: {
  cursor?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ASSESSOR_QUERY_KEYS.retainedRequests(params),
    queryFn: () => getAssessorRetainedRequestsApi(params),
  });
}

// ─── 11. Request Retained Assessor Hook ──────────────────────────────────────
export function useRequestRetainedAssessor() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: string | RequestRetainedAssessorPayload) =>
      requestRetainedAssessorApi(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["assessor", "retained-requests"],
      });
      queryClient.invalidateQueries({
        queryKey: ["assessor", "centres"],
      });
      queryClient.invalidateQueries({
        queryKey: ASSESSOR_QUERY_KEYS.summary,
      });
      toast({
        type: "success",
        title: "Request Sent",
        description: "Retained assessor request sent to centre.",
      });
    },

    onError: (error: Error) => {
      if (error instanceof ApiError) {
        toast({
          type: "error",
          title: "Request Failed",
          description: error.message,
        });
      } else {
        toast({
          type: "error",
          title: "Network Error",
          description: "Unable to send request. Please try again.",
        });
      }
    },
  });
}

// ─── 12. Assessor Profile Hook ───────────────────────────────────────────────
export function useGetAssessorProfile() {
  return useQuery({
    queryKey: ASSESSOR_QUERY_KEYS.profile,
    queryFn: () => getAssessorProfileApi(),
  });
}

// ─── 13. Update Assessor Profile Hook ────────────────────────────────────────
export function usePatchAssessorProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: AssessorSelfProfilePatch) =>
      patchAssessorProfileApi(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSESSOR_QUERY_KEYS.profile });
      queryClient.invalidateQueries({ queryKey: ASSESSOR_QUERY_KEYS.sectors });
      toast({
        type: "success",
        title: "Profile Updated",
        description: "Assessor profile updated successfully. Status set to pending for review.",
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
          description: "Unable to update profile. Please try again.",
        });
      }
    },
  });
}

// ─── 14. Assessor Profile Sectors Hook ───────────────────────────────────────
export function useGetAssessorProfileSectors() {
  return useQuery({
    queryKey: ASSESSOR_QUERY_KEYS.sectors,
    queryFn: () => getAssessorProfileSectorsApi(),
  });
}

// ─── 15. Update Assessor Profile Sectors Hook ────────────────────────────────
export function useUpdateAssessorProfileSectors() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (sectorIds: string[]) =>
      updateAssessorProfileSectorsApi(sectorIds),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSESSOR_QUERY_KEYS.sectors });
      queryClient.invalidateQueries({ queryKey: ASSESSOR_QUERY_KEYS.profile });
      toast({
        type: "success",
        title: "Sectors Updated",
        description: "Your declared sector experience has been updated.",
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
          description: "Unable to update sectors. Please try again.",
        });
      }
    },
  });
}

/**
 * Composite hook grouping Assessor operations
 */
export function useAssessor() {
  const summary = useGetAssessorSummary();
  const applyToJobPosting = useApplyToJobPosting();
  const requestRetainedAssessor = useRequestRetainedAssessor();
  const updateSectors = useUpdateAssessorProfileSectors();
  const patchProfile = usePatchAssessorProfile();

  return {
    summary,
    applyToJobPosting,
    requestRetainedAssessor,
    updateSectors,
    patchProfile,
  };
}
