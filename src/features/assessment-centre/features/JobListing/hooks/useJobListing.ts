import {
  useGetJobPostings as useSharedGetJobPostings,
  useCreateJobPosting as useSharedCreateJobPosting,
} from "@/src/features/shared/centre/hooks";

export function useGetJobPostings() {
  return useSharedGetJobPostings();
}

export function useCreateJobPosting() {
  return useSharedCreateJobPosting();
}

/**
 * Composite hook for JobListing feature operations
 */
export function useJobListing() {
  const createJobPosting = useCreateJobPosting();
  const getJobPostings = useGetJobPostings();

  return {
    createJobPosting,
    getJobPostings,
  };
}
