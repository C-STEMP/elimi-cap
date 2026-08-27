import { capFetch } from "@/src/lib/api/cap";
import type {
  Application,
  ApplicationEvent,
  ApplicationStatus,
  ApplicationType,
} from "@/src/features/shared/applications/api";
import type {
  JobPosting,
  JobPostingApplication,
  RetainedAssessorRequest,
  AssessorQualification,
  AssessorCertificate,
  CentreAssessorAssignmentRole,
  CentreAssessorApplication,
  PaginationMeta,
} from "@/src/features/shared/centre/api";

export type {
  AssessorQualification,
  AssessorCertificate,
  CentreAssessorAssignmentRole,
  CentreAssessorApplication,
  JobPostingApplication,
  RetainedAssessorRequest,
  ApplicationEvent,
};

export interface Sector {
  id: string;
  slug: string;
  name: string;
  description?: string;
}

export interface AssessorSummary {
  totalCentres: number;
  totalApplications: number;
  completedApplications: number;
  pendingApplications: number;
}

export interface AssessorCentreItem {
  retainedRequestId: string;
  centreId: string;
  centreName: string;
  roles: CentreAssessorAssignmentRole[];
  assignedCount: number;
  status: "pending" | "approved" | "revoked" | "rejected";
  joinedAt: string;
  preferredRole?: CentreAssessorAssignmentRole;
}

export interface AssessorJobPosting extends JobPosting {
  centreName: string;
  trade: {
    id: string;
    name: string;
  };
}

export interface AssessorSelfProfile {
  id: string;
  assessorNo: string;
  status: "pending" | "approved" | "suspended" | "rejected";
  name: string;
  email?: string | null;
  qualifications: AssessorQualification[];
  sectors: Sector[];
  yearsOfExperience?: number | null;
  certificates: AssessorCertificate[];
}

export interface AssessorSelfProfilePatch {
  qualifications?: AssessorQualification[];
  sectorIds?: string[];
  certifications?: {
    ev?: { certificateAssetId: string };
    qaa?: { certificateAssetId: string };
    iqm?: { certificateAssetId: string };
  };
}

export interface RequestRetainedAssessorPayload {
  centreId: string;
  preferredRole?: CentreAssessorAssignmentRole;
}

// ─── 1. Dashboard Summary: GET /assessor/summary ─────────────────────────────
export async function getAssessorSummaryApi(): Promise<AssessorSummary> {
  return capFetch<AssessorSummary>("/assessor/summary", {
    method: "GET",
  });
}

// ─── 2. Events: GET /assessor/events ─────────────────────────────────────────
export async function getAssessorEventsApi(params?: {
  cursor?: string;
  limit?: number;
}): Promise<ApplicationEvent[]> {
  const res = await capFetch<
    ApplicationEvent[] | { data: ApplicationEvent[]; meta?: PaginationMeta }
  >("/assessor/events", {
    method: "GET",
    params: params as Record<string, unknown>,
  });
  return Array.isArray(res) ? res : (res as any)?.data || [];
}

// ─── 3. Applications: GET /assessor/applications ─────────────────────────────
export async function getAssessorApplicationsApi(params?: {
  q?: string;
  tradeId?: string;
  type?: ApplicationType;
  status?: ApplicationStatus;
  sort?: string;
  order?: "asc" | "desc";
  cursor?: string;
  limit?: number;
}): Promise<CentreAssessorApplication[]> {
  const res = await capFetch<
    CentreAssessorApplication[] | { data: CentreAssessorApplication[]; meta?: PaginationMeta }
  >("/assessor/applications", {
    method: "GET",
    params: params as Record<string, unknown>,
  });
  return Array.isArray(res) ? res : (res as any)?.data || [];
}

// ─── 4. Centres: GET /assessor/centres ───────────────────────────────────────
export async function getAssessorCentresApi(params?: {
  status?: "pending" | "approved" | "revoked" | "rejected" | "all";
  q?: string;
  sort?: "joinedAt" | "requestedAt";
  order?: "asc" | "desc";
  cursor?: string;
  limit?: number;
}): Promise<AssessorCentreItem[]> {
  const res = await capFetch<
    AssessorCentreItem[] | { data: AssessorCentreItem[]; meta?: PaginationMeta }
  >("/assessor/centres", {
    method: "GET",
    params: params as Record<string, unknown>,
  });
  return Array.isArray(res) ? res : (res as any)?.data || [];
}

// ─── 5. Centre Applications: GET /assessor/centres/{centreId}/applications ──
export async function getAssessorCentreApplicationsApi(
  centreId: string,
  params?: {
    q?: string;
    tradeId?: string;
    type?: ApplicationType;
    status?: ApplicationStatus;
    sort?: string;
    order?: "asc" | "desc";
    cursor?: string;
    limit?: number;
  },
): Promise<CentreAssessorApplication[]> {
  const res = await capFetch<
    CentreAssessorApplication[] | { data: CentreAssessorApplication[]; meta?: PaginationMeta }
  >(`/assessor/centres/${centreId}/applications`, {
    method: "GET",
    params: params as Record<string, unknown>,
  });
  return Array.isArray(res) ? res : (res as any)?.data || [];
}

// ─── 6. Applied Job Postings: GET /assessor/job-postings ─────────────────────
export async function getAssessorJobPostingsApi(params?: {
  cursor?: string;
  limit?: number;
}): Promise<JobPostingApplication[]> {
  const res = await capFetch<
    JobPostingApplication[] | { data: JobPostingApplication[]; meta?: PaginationMeta }
  >("/assessor/job-postings", {
    method: "GET",
    params: params as Record<string, unknown>,
  });
  return Array.isArray(res) ? res : (res as any)?.data || [];
}

// ─── 7. Marketplace: GET /assessor/marketplace ──────────────────────────────
export async function getAssessorMarketplaceApi(params?: {
  cursor?: string;
  limit?: number;
}): Promise<AssessorJobPosting[]> {
  const res = await capFetch<
    AssessorJobPosting[] | { data: AssessorJobPosting[]; meta?: PaginationMeta }
  >("/assessor/marketplace", {
    method: "GET",
    params: params as Record<string, unknown>,
  });
  return Array.isArray(res) ? res : (res as any)?.data || [];
}

// ─── 8. Marketplace Detail: GET /assessor/marketplace/{id} ───────────────────
export async function getAssessorMarketplaceJobDetailApi(
  id: string,
): Promise<AssessorJobPosting> {
  return capFetch<AssessorJobPosting>(`/assessor/marketplace/${id}`, {
    method: "GET",
  });
}

// ─── 9. Apply to Job Posting: POST /assessor/job-postings/{id}/apply ─────────
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

// ─── 10. Retained Requests: GET /assessor/retained-requests ───────────────────
export async function getAssessorRetainedRequestsApi(params?: {
  cursor?: string;
  limit?: number;
}): Promise<RetainedAssessorRequest[]> {
  const res = await capFetch<
    RetainedAssessorRequest[] | { data: RetainedAssessorRequest[]; meta?: PaginationMeta }
  >("/assessor/retained-requests", {
    method: "GET",
    params: params as Record<string, unknown>,
  });
  return Array.isArray(res) ? res : (res as any)?.data || [];
}

// ─── 11. Request Retained Assessor: POST /assessor/retained-requests ─────────
export async function requestRetainedAssessorApi(
  payload: string | RequestRetainedAssessorPayload,
): Promise<RetainedAssessorRequest> {
  const data =
    typeof payload === "string"
      ? { centreId: payload, preferredRole: "facilitator" as const }
      : payload;
  return capFetch<RetainedAssessorRequest>("/assessor/retained-requests", {
    method: "POST",
    data: {
      centreId: data.centreId,
      preferredRole: data.preferredRole || "facilitator",
    },
  });
}

// ─── 12. Assessor Profile: GET /assessor/profile ─────────────────────────────
export async function getAssessorProfileApi(): Promise<AssessorSelfProfile> {
  return capFetch<AssessorSelfProfile>("/assessor/profile", {
    method: "GET",
  });
}

// ─── 13. Update Assessor Profile: PATCH /assessor/profile ────────────────────
export async function patchAssessorProfileApi(
  payload: AssessorSelfProfilePatch,
): Promise<AssessorSelfProfile> {
  return capFetch<AssessorSelfProfile>("/assessor/profile", {
    method: "PATCH",
    data: payload,
  });
}

// ─── 14. Profile Sectors: GET /assessor/profile/sectors ──────────────────────
export async function getAssessorProfileSectorsApi(): Promise<Sector[]> {
  const res = await capFetch<Sector[]>("/assessor/profile/sectors", {
    method: "GET",
  });
  return Array.isArray(res) ? res : (res as any)?.data || [];
}

// ─── 15. Replace Profile Sectors: PUT /assessor/profile/sectors ──────────────
export async function updateAssessorProfileSectorsApi(
  sectorIds: string[],
): Promise<Sector[]> {
  const res = await capFetch<Sector[]>("/assessor/profile/sectors", {
    method: "PUT",
    data: { sectorIds },
  });
  return Array.isArray(res) ? res : (res as any)?.data || [];
}
