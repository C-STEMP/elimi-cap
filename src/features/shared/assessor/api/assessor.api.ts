import { capFetch } from "@/src/lib/api/cap";
import type { Application } from "@/src/features/shared/applications/api";
import type { JobPosting, RetainedAssessorRequest } from "@/src/features/shared/centre/api";

export interface JobPostingApplication {
  id: string;
  jobPostingId: string;
  status: "applied" | "accepted" | "rejected";
}

export interface Sector {
  id: string;
  slug: string;
  name: string;
  description?: string;
}

export async function getAssessorApplicationsApi(): Promise<Application[]> {
  return capFetch<Application[]>("/assessor/applications", {
    method: "GET",
  });
}

export async function getAssessorJobPostingsApi(): Promise<
  JobPostingApplication[]
> {
  return capFetch<JobPostingApplication[]>("/assessor/job-postings", {
    method: "GET",
  });
}

export async function getAssessorMarketplaceApi(): Promise<JobPosting[]> {
  return capFetch<JobPosting[]>("/assessor/marketplace", {
    method: "GET",
  });
}

export async function applyToJobPostingApi(
  jobPostingId: string,
): Promise<JobPostingApplication> {
  return capFetch<JobPostingApplication>(
    `/assessor/job-postings/${jobPostingId}/apply`,
    {
      method: "POST",
    },
  );
}

export async function getAssessorRetainedRequestsApi(): Promise<
  RetainedAssessorRequest[]
> {
  return capFetch<RetainedAssessorRequest[]>("/assessor/retained-requests", {
    method: "GET",
  });
}

export async function requestRetainedAssessorApi(
  centreId: string,
): Promise<RetainedAssessorRequest> {
  return capFetch<RetainedAssessorRequest>("/assessor/retained-requests", {
    method: "POST",
    data: { centreId },
  });
}

export async function getAssessorProfileSectorsApi(): Promise<Sector[]> {
  return capFetch<Sector[]>("/assessor/profile/sectors", {
    method: "GET",
  });
}

export async function updateAssessorProfileSectorsApi(
  sectorIds: string[],
): Promise<Sector[]> {
  return capFetch<Sector[]>("/assessor/profile/sectors", {
    method: "PUT",
    data: { sectorIds },
  });
}
