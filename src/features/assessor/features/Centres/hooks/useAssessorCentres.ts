import {
  useGetAssessorCentres as useSharedGetAssessorCentres,
  useGetAssessorCentreApplications as useSharedGetAssessorCentreApplications,
  useGetAssessorRetainedRequests as useSharedGetAssessorRetainedRequests,
  useRequestRetainedAssessor as useSharedRequestRetainedAssessor,
} from "@/src/features/shared/assessor/hooks";
import type { RequestRetainedAssessorPayload } from "@/src/features/shared/assessor/api";

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

export function useGetAssessorRetainedRequests(params?: {
  cursor?: string;
  limit?: number;
}) {
  return useSharedGetAssessorRetainedRequests(params);
}

export function useRequestToJoinCentre() {
  return useSharedRequestRetainedAssessor();
}

