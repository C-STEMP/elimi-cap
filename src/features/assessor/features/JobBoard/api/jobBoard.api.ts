import {
  getAssessorMarketplaceApi,
  getAssessorMarketplaceJobDetailApi,
  getAssessorJobPostingsApi,
  applyToJobPostingApi,
  type JobPostingApplication,
  type AssessorJobPosting,
} from "@/src/features/shared/assessor/api";
import type { JobPosting } from "@/src/features/shared/centre/api";

export type { JobPosting, AssessorJobPosting, JobPostingApplication };

export async function getAssessorMarketplaceJobsApi(params?: {
  cursor?: string;
  limit?: number;
}): Promise<AssessorJobPosting[]> {
  return getAssessorMarketplaceApi(params);
}

export async function getAssessorMarketplaceJobDetail(
  id: string,
): Promise<AssessorJobPosting> {
  return getAssessorMarketplaceJobDetailApi(id);
}

export async function getAssessorAppliedJobsApi(params?: {
  cursor?: string;
  limit?: number;
}): Promise<JobPostingApplication[]> {
  return getAssessorJobPostingsApi(params);
}

export async function applyForJobPostingApi(
  jobPostingId: string,
): Promise<JobPostingApplication> {
  return applyToJobPostingApi(jobPostingId);
}

