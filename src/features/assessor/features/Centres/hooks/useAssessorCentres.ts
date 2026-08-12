import {
  useGetAssessorRetainedRequests as useSharedGetAssessorRetainedRequests,
  useRequestRetainedAssessor as useSharedRequestRetainedAssessor,
} from "@/src/features/shared/assessor/hooks";

export function useGetAssessorCentres() {
  return useSharedGetAssessorRetainedRequests();
}

export function useRequestToJoinCentre() {
  return useSharedRequestRetainedAssessor();
}
