import {
  getCentreJobPostingsApi,
  createCentreJobPostingApi,
  type JobPosting,
  type CreateJobPostingPayload,
} from "@/src/features/shared/centre/api";

export type { JobPosting, CreateJobPostingPayload };

export async function getJobPostingsApi(): Promise<JobPosting[]> {
  return getCentreJobPostingsApi();
}

export async function createJobPostingApi(
  payload: CreateJobPostingPayload,
): Promise<JobPosting> {
  return createCentreJobPostingApi(payload);
}
