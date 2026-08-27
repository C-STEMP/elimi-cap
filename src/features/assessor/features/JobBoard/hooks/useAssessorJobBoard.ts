import {
  useGetAssessorMarketplace as useSharedGetAssessorMarketplace,
  useGetAssessorMarketplaceDetail as useSharedGetAssessorMarketplaceDetail,
  useGetAssessorJobPostings as useSharedGetAssessorJobPostings,
  useApplyToJobPosting as useSharedApplyToJobPosting,
} from "@/src/features/shared/assessor/hooks";

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

export function useGetAssessorJobPostings(params?: {
  cursor?: string;
  limit?: number;
}) {
  return useSharedGetAssessorJobPostings(params);
}

export function useApplyToJobPosting() {
  return useSharedApplyToJobPosting();
}

