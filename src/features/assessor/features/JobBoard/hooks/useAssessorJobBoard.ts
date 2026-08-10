import {
  useGetAssessorMarketplace as useSharedGetAssessorMarketplace,
  useGetAssessorJobPostings as useSharedGetAssessorJobPostings,
  useApplyToJobPosting as useSharedApplyToJobPosting,
} from "@/src/features/shared/assessor/hooks";

export function useGetAssessorMarketplace() {
  return useSharedGetAssessorMarketplace();
}

export function useGetAssessorJobPostings() {
  return useSharedGetAssessorJobPostings();
}

export function useApplyToJobPosting() {
  return useSharedApplyToJobPosting();
}
