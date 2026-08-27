import {
  useGetAssessorSummary as useSharedGetAssessorSummary,
  useGetAssessorEvents as useSharedGetAssessorEvents,
  useGetAssessorApplications as useSharedGetAssessorApplications,
  useGetAssessorCentres as useSharedGetAssessorCentres,
  useGetAssessorCentreApplications as useSharedGetAssessorCentreApplications,
  useGetAssessorJobPostings as useSharedGetAssessorJobPostings,
  useGetAssessorMarketplace as useSharedGetAssessorMarketplace,
  useGetAssessorMarketplaceDetail as useSharedGetAssessorMarketplaceDetail,
  useApplyToJobPosting as useSharedApplyToJobPosting,
  useGetAssessorRetainedRequests as useSharedGetAssessorRetainedRequests,
  useRequestRetainedAssessor as useSharedRequestRetainedAssessor,
  useGetAssessorProfile as useSharedGetAssessorProfile,
  usePatchAssessorProfile as useSharedPatchAssessorProfile,
  useGetAssessorProfileSectors as useSharedGetAssessorProfileSectors,
  useUpdateAssessorProfileSectors as useSharedUpdateAssessorProfileSectors,
  useAssessor as useSharedAssessor,
} from "@/src/features/shared/assessor/hooks";

export function useGetAssessorSummary() {
  return useSharedGetAssessorSummary();
}

export function useGetAssessorEvents(params?: {
  cursor?: string;
  limit?: number;
}) {
  return useSharedGetAssessorEvents(params);
}

export function useGetAssessorApplications(params?: {
  q?: string;
  tradeId?: string;
  type?: any;
  status?: any;
  sort?: string;
  order?: "asc" | "desc";
  cursor?: string;
  limit?: number;
}) {
  return useSharedGetAssessorApplications(params);
}

export function useGetAssessorCentres(params?: {
  status?: "pending" | "approved" | "revoked" | "rejected" | "all";
  q?: string;
  sort?: "joinedAt" | "requestedAt";
  order?: "asc" | "desc";
  cursor?: string;
  limit?: number;
}) {
  return useSharedGetAssessorCentres(params);
}

export function useGetAssessorCentreApplications(
  centreId: string,
  params?: {
    q?: string;
    tradeId?: string;
    type?: any;
    status?: any;
    sort?: string;
    order?: "asc" | "desc";
    cursor?: string;
    limit?: number;
  },
  options?: { enabled?: boolean },
) {
  return useSharedGetAssessorCentreApplications(centreId, params, options);
}

export function useGetAssessorJobPostings(params?: {
  cursor?: string;
  limit?: number;
}) {
  return useSharedGetAssessorJobPostings(params);
}

export function useGetAssessorMarketplace(params?: {
  cursor?: string;
  limit?: number;
}) {
  return useSharedGetAssessorMarketplace(params);
}

export function useGetAssessorMarketplaceDetail(
  id: string,
  options?: { enabled?: boolean },
) {
  return useSharedGetAssessorMarketplaceDetail(id, options);
}

export function useApplyToJobPosting() {
  return useSharedApplyToJobPosting();
}

export function useGetAssessorRetainedRequests(params?: {
  cursor?: string;
  limit?: number;
}) {
  return useSharedGetAssessorRetainedRequests(params);
}

export function useRequestRetainedAssessor() {
  return useSharedRequestRetainedAssessor();
}

export function useGetAssessorProfile() {
  return useSharedGetAssessorProfile();
}

export function usePatchAssessorProfile() {
  return useSharedPatchAssessorProfile();
}

export function useGetAssessorProfileSectors() {
  return useSharedGetAssessorProfileSectors();
}

export function useUpdateAssessorProfileSectors() {
  return useSharedUpdateAssessorProfileSectors();
}

export function useAssessor() {
  return useSharedAssessor();
}

