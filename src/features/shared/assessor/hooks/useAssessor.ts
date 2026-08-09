import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/src/components/ui/toast";
import { ApiError } from "@/src/lib/api/client";
import {
  getAssessorApplicationsApi,
  getAssessorJobPostingsApi,
  getAssessorMarketplaceApi,
  applyToJobPostingApi,
  getAssessorRetainedRequestsApi,
  requestRetainedAssessorApi,
  getAssessorProfileSectorsApi,
  updateAssessorProfileSectorsApi,
} from "../api/assessor.api";

export const ASSESSOR_QUERY_KEYS = {
  applications: ["assessor", "applications"] as const,
  jobPostings: ["assessor", "job-postings"] as const,
  marketplace: ["assessor", "marketplace"] as const,
  retainedRequests: ["assessor", "retained-requests"] as const,
  sectors: ["assessor", "profile", "sectors"] as const,
};

export function useGetAssessorApplications() {
  return useQuery({
    queryKey: ASSESSOR_QUERY_KEYS.applications,
    queryFn: () => getAssessorApplicationsApi(),
  });
}

export function useGetAssessorJobPostings() {
  return useQuery({
    queryKey: ASSESSOR_QUERY_KEYS.jobPostings,
    queryFn: () => getAssessorJobPostingsApi(),
  });
}

export function useGetAssessorMarketplace() {
  return useQuery({
    queryKey: ASSESSOR_QUERY_KEYS.marketplace,
    queryFn: () => getAssessorMarketplaceApi(),
  });
}

export function useApplyToJobPosting() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (jobPostingId: string) => applyToJobPostingApi(jobPostingId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSESSOR_QUERY_KEYS.jobPostings });
      queryClient.invalidateQueries({ queryKey: ASSESSOR_QUERY_KEYS.marketplace });
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

export function useGetAssessorRetainedRequests() {
  return useQuery({
    queryKey: ASSESSOR_QUERY_KEYS.retainedRequests,
    queryFn: () => getAssessorRetainedRequestsApi(),
  });
}

export function useRequestRetainedAssessor() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (centreId: string) => requestRetainedAssessorApi(centreId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ASSESSOR_QUERY_KEYS.retainedRequests,
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

export function useGetAssessorProfileSectors() {
  return useQuery({
    queryKey: ASSESSOR_QUERY_KEYS.sectors,
    queryFn: () => getAssessorProfileSectorsApi(),
  });
}

export function useUpdateAssessorProfileSectors() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (sectorIds: string[]) =>
      updateAssessorProfileSectorsApi(sectorIds),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSESSOR_QUERY_KEYS.sectors });
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
  const applyToJobPosting = useApplyToJobPosting();
  const requestRetainedAssessor = useRequestRetainedAssessor();
  const updateSectors = useUpdateAssessorProfileSectors();

  return {
    applyToJobPosting,
    requestRetainedAssessor,
    updateSectors,
  };
}
