import {
  getAssessorMarketplaceApi,
  getAssessorJobPostingsApi,
  applyToJobPostingApi,
  type JobPostingApplication,
} from "@/src/features/shared/assessor/api";
import type { JobPosting } from "@/src/features/shared/centre/api";

export type { JobPosting, JobPostingApplication };

export async function getAssessorMarketplaceJobsApi(): Promise<JobPosting[]> {
  return getAssessorMarketplaceApi();
}

export async function getAssessorAppliedJobsApi(): Promise<
  JobPostingApplication[]
> {
  return getAssessorJobPostingsApi();
}

export async function applyForJobPostingApi(
  jobPostingId: string,
): Promise<JobPostingApplication> {
  return applyToJobPostingApi(jobPostingId);
}
