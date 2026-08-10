import {
  useGetAssessorApplications as useSharedGetAssessorApplications,
  useGetAssessorJobPostings as useSharedGetAssessorJobPostings,
  useGetAssessorMarketplace as useSharedGetAssessorMarketplace,
  useApplyToJobPosting as useSharedApplyToJobPosting,
  useGetAssessorRetainedRequests as useSharedGetAssessorRetainedRequests,
  useRequestRetainedAssessor as useSharedRequestRetainedAssessor,
  useGetAssessorProfileSectors as useSharedGetAssessorProfileSectors,
  useUpdateAssessorProfileSectors as useSharedUpdateAssessorProfileSectors,
  useAssessor as useSharedAssessor,
} from "@/src/features/shared/assessor/hooks";

export function useGetAssessorApplications() {
  return useSharedGetAssessorApplications();
}

export function useGetAssessorJobPostings() {
  return useSharedGetAssessorJobPostings();
}

export function useGetAssessorMarketplace() {
  return useSharedGetAssessorMarketplace();
}

export function useApplyToJobPosting() {
  return useSharedApplyToJobPosting();
}

export function useGetAssessorRetainedRequests() {
  return useSharedGetAssessorRetainedRequests();
}

export function useRequestRetainedAssessor() {
  return useSharedRequestRetainedAssessor();
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
