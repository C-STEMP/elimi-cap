import { capFetch } from "@/src/lib/api/cap";
import type {
  PersonalDetails,
  ContactInformation,
  ResidentialAddress,
} from "@/src/features/shared/account/api";

export type CentreStaffRole = "super_admin" | "regular_admin" | "staff";
export type CentreStaffStatus = "pending" | "active" | "inactive";

export interface Money {
  amountMinorUnits: string;
  currency: string;
}

export interface PaginationMeta {
  pagination?: {
    nextCursor: string | null;
    hasMore: boolean;
    limit: number;
  };
}

// ─── Staff Types ─────────────────────────────────────────────────────────────
export interface CentreStaff {
  id: string;
  email: string;
  name?: string | null;
  role: CentreStaffRole;
  status: CentreStaffStatus;
  createdAt: string;
}

export interface AddCentreStaffPayload {
  name: string;
  email: string;
  role: CentreStaffRole;
}

export interface CentreStaffWorkload {
  reviewed: number;
  pending: number;
  requiresAttention: number;
}

export interface CentreStaffDetail extends CentreStaff {
  workload: CentreStaffWorkload;
}

export interface CentreStaffSummary {
  total: number;
  active: number;
  pending: number;
  inactive: number;
}

// ─── Dashboard & Summary Types ───────────────────────────────────────────────
export interface CentreDashboardKpis {
  applications: number;
  staff: number;
  assessors: number;
  revenue?: Money;
}

export interface RevenueMonthBucket {
  month: number;
  amount: Money;
}

export interface NamedCountBucket {
  id: string;
  name: string;
  count: number;
}

export interface GenderCountBucket {
  gender: "female" | "male" | "other" | "unspecified";
  count: number;
}

export interface StageCountBucket {
  stageKey: string;
  label: string;
  count: number;
}

export interface CentreActivityItem {
  id: string;
  actorName: string;
  role: CentreStaffRole;
  action: string;
  occurredAt: string;
  metadata?: Record<string, unknown>;
}

export interface CentreDashboard {
  year: number;
  applicationType?: "RPL" | "NSQ" | null;
  kpis: CentreDashboardKpis;
  revenueByMonth?: RevenueMonthBucket[];
  applicationsByTrade: NamedCountBucket[];
  genderDistribution: GenderCountBucket[];
  candidatesByStage: StageCountBucket[];
  staffActivity: CentreActivityItem[];
}

export interface CentreApplicationsSummary {
  total: number;
  pending: number;
  ongoing: number;
  completed: number;
  archived: number;
}

// ─── Assessor & Retained Requests Types ───────────────────────────────────────
export type AssessorQualification = "QAA" | "IQM" | "IV" | "EV";

export interface AssessorCertificate {
  kind: "qaa" | "iqm" | "ev";
  assetId: string;
  url: string;
}

export interface AssessorSnapshot {
  id: string;
  name: string;
  email?: string | null;
  qualifications: AssessorQualification[];
  sectors: { id: string; name: string }[];
  yearsOfExperience?: number | null;
  certificates: AssessorCertificate[];
}

export interface CentreAssessorListItem extends AssessorSnapshot {
  retainedRequestId: string;
  status: "pending" | "approved" | "revoked";
  assignedCount: number;
}

export interface CentreAssessorSummary {
  total: number;
  active: number;
  pending: number;
  inactive: number;
}

export interface CentreAssessorWorkload {
  assigned: number;
  ongoing: number;
  completed: number;
}

export interface CentreAssessorDetail extends CentreAssessorListItem {
  workload: CentreAssessorWorkload;
}

export type RetainedRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "revoked";

export type CentreAssessorAssignmentRole =
  | "facilitator"
  | "panelist"
  | "lead_panelist"
  | "observer"
  | "iv"
  | "unit_assessor"
  | "ev";

export interface CentreAssessorApplication {
  id: string;
  centreId: string;
  tradeId: string;
  type: string;
  status: string;
  candidateId: string;
  candidate?: {
    id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  trade?: {
    id: string;
    name: string;
  };
  currentStageKey?: string;
  roles?: CentreAssessorAssignmentRole[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface RetainedAssessorRequest {
  id: string;
  assessorId: string;
  centreId: string;
  status: RetainedRequestStatus;
  preferredRole?: CentreAssessorAssignmentRole | string | null;
  requestedAt: string;
  respondedAt?: string | null;
  respondedBy?: string | null;
  assessor?: AssessorSnapshot | null;
}

// ─── Job Postings Types ──────────────────────────────────────────────────────
export type JobPostingStatus = "open" | "closed" | "filled" | "cancelled";

export interface JobPosting {
  id: string;
  title: string;
  tradeId: string;
  slot: number;
  deadline: string;
  description: string;
  requirements: string[];
  duration?: string | null;
  status: JobPostingStatus;
  trade?: {
    id: string;
    name: string;
  };
  applicantCount?: number;
  slotsOccupied?: number;
  createdAt?: string;
}

export interface CreateJobPostingPayload {
  title: string;
  tradeId: string;
  slot: number;
  deadline: string;
  description: string;
  requirements: string[];
  duration?: string;
}

export interface JobPostingApplication {
  id: string;
  jobPostingId: string;
  status: "applied" | "accepted" | "rejected" | "withdrawn";
  createdAt?: string;
  trade?: {
    id: string;
    name: string;
  };
  assessor?: AssessorSnapshot | null;
}

// ─── Pricing, Wallet & Payments Types ────────────────────────────────────────
export interface CentrePricing {
  applicationType: "RPL" | "NSQ";
  price: Money;
  effectiveFrom: string;
}

export interface SetCentrePricingPayload {
  applicationType: "RPL" | "NSQ";
  price: Money;
}

export interface Wallet {
  balance: Money;
}

export interface WithdrawPayload {
  amount: Money;
}

export interface CentrePaymentsSummary {
  totalRevenue: Money;
  completedCount: number;
  pendingCount: number;
}

export interface CentrePaymentListItem {
  applicationId: string;
  candidateName: string;
  applicationType: "RPL" | "NSQ";
  amount: Money;
  status: "pending" | "completed" | "failed";
  paidAt?: string | null;
  initiatedAt?: string | null;
  receiptAvailable: boolean;
}

// ─── Profile & Policy Types ──────────────────────────────────────────────────
export interface CentreAccountDetails {
  bank?: string;
  accountNo?: string;
  nameOfAccount?: string;
}

export interface CentreProfile {
  id: string;
  name: string;
  registrationNo: string;
  logoAssetId?: string | null;
  logo?: {
    assetId: string;
    url?: string | null;
  } | null;
  status: "pending" | "approved" | "suspended" | "rejected";
  ownerIdentityVerified: boolean;
  onboarding?: any;
  address?: ResidentialAddress | null;
  formattedAddress?: string | null;
  supportContact?: ContactInformation | null;
  accountDetails?: CentreAccountDetails | null;
}

export interface CentreProfilePatch {
  name?: string;
  logoAssetId?: string | null;
  address?: ResidentialAddress;
  supportContact?: ContactInformation;
  accountDetails?: CentreAccountDetails;
}

export interface CentreNotificationPolicy {
  events: {
    event: "application.submitted";
    recipientCapUserIds?: string[];
    recipientRoles?: CentreStaffRole[];
  }[];
}

// ─── Directory Hit ───────────────────────────────────────────────────────────
export interface DirectoryHit {
  id: string;
  kind: "staff" | "candidate" | "assessor";
  displayName: string;
  subtitle?: string | null;
  userId?: string | null;
}

// ═════════════════════════════════════════════════════════════════════════════
// API CALL FUNCTIONS
// ═════════════════════════════════════════════════════════════════════════════

// ─── Staff API ───────────────────────────────────────────────────────────────
export async function getCentreStaffApi(params?: {
  status?: CentreStaffStatus;
  q?: string;
  sort?: string;
  order?: "asc" | "desc";
  cursor?: string;
  limit?: number;
}): Promise<CentreStaff[]> {
  const res = await capFetch<CentreStaff[] | { data: CentreStaff[]; meta: PaginationMeta }>(
    "/centre/staff",
    {
      method: "GET",
      params: params as Record<string, unknown>,
    },
  );
  return Array.isArray(res) ? res : (res as any)?.data || [];
}

export async function addCentreStaffApi(
  payload: AddCentreStaffPayload,
): Promise<CentreStaff> {
  return capFetch<CentreStaff>("/centre/staff", {
    method: "POST",
    data: payload,
  });
}

export async function patchCentreStaffBulkApi(payload: {
  ids: string[];
  status: "active" | "inactive";
}): Promise<void> {
  await capFetch<void>("/centre/staff", {
    method: "PATCH",
    data: payload,
  });
}

export async function getCentreStaffSummaryApi(): Promise<CentreStaffSummary> {
  return capFetch<CentreStaffSummary>("/centre/staff/summary", {
    method: "GET",
  });
}

export async function getCentreStaffDetailApi(
  id: string,
): Promise<CentreStaffDetail> {
  return capFetch<CentreStaffDetail>(`/centre/staff/${id}`, {
    method: "GET",
  });
}

export async function getCentreStaffApplicationsApi(
  id: string,
  params?: {
    q?: string;
    tradeId?: string;
    type?: "RPL" | "NSQ";
    status?: string;
    queue?: "pending" | "requires_attention";
    sort?: string;
    order?: "asc" | "desc";
    cursor?: string;
    limit?: number;
  },
): Promise<any[]> {
  const res = await capFetch<any[] | { data: any[]; meta: PaginationMeta }>(
    `/centre/staff/${id}/applications`,
    {
      method: "GET",
      params: params as Record<string, unknown>,
    },
  );
  return Array.isArray(res) ? res : (res as any)?.data || [];
}

// ─── Dashboard & Summary API ─────────────────────────────────────────────────
export async function getCentreDashboardApi(params?: {
  year?: number;
  applicationType?: "RPL" | "NSQ";
}): Promise<CentreDashboard> {
  return capFetch<CentreDashboard>("/centre/dashboard", {
    method: "GET",
    params: params as Record<string, unknown>,
  });
}

export async function getCentreApplicationsSummaryApi(): Promise<CentreApplicationsSummary> {
  return capFetch<CentreApplicationsSummary>("/centre/applications/summary", {
    method: "GET",
  });
}

// ─── Assessor & Retained Requests API ─────────────────────────────────────────
export async function getCentreAssessorsApi(params?: {
  qualification?: AssessorQualification;
  q?: string;
  status?: "pending" | "approved" | "revoked" | "all";
  cursor?: string;
  limit?: number;
}): Promise<CentreAssessorListItem[]> {
  const res = await capFetch<
    CentreAssessorListItem[] | { data: CentreAssessorListItem[]; meta: PaginationMeta }
  >("/centre/assessors", {
    method: "GET",
    params: params as Record<string, unknown>,
  });
  return Array.isArray(res) ? res : (res as any)?.data || [];
}

export async function getCentreAssessorsSummaryApi(): Promise<CentreAssessorSummary> {
  return capFetch<CentreAssessorSummary>("/centre/assessors/summary", {
    method: "GET",
  });
}

export async function getCentreAssessorDetailApi(
  id: string,
): Promise<CentreAssessorDetail> {
  return capFetch<CentreAssessorDetail>(`/centre/assessors/${id}`, {
    method: "GET",
  });
}

export async function getCentreAssessorApplicationsApi(
  id: string,
  params?: {
    q?: string;
    tradeId?: string;
    type?: "RPL" | "NSQ";
    status?: string;
    sort?: string;
    order?: "asc" | "desc";
    cursor?: string;
    limit?: number;
  },
): Promise<any[]> {
  const res = await capFetch<any[] | { data: any[]; meta: PaginationMeta }>(
    `/centre/assessors/${id}/applications`,
    {
      method: "GET",
      params: params as Record<string, unknown>,
    },
  );
  return Array.isArray(res) ? res : (res as any)?.data || [];
}

export async function getCentreRetainedRequestsApi(params?: {
  status?: RetainedRequestStatus;
  q?: string;
  sort?: string;
  order?: "asc" | "desc";
  cursor?: string;
  limit?: number;
}): Promise<RetainedAssessorRequest[]> {
  const res = await capFetch<
    RetainedAssessorRequest[] | { data: RetainedAssessorRequest[]; meta: PaginationMeta }
  >("/centre/retained-requests", {
    method: "GET",
    params: params as Record<string, unknown>,
  });
  return Array.isArray(res) ? res : (res as any)?.data || [];
}

export async function patchCentreRetainedRequestsBulkApi(payload: {
  ids: string[];
  decision: "approve" | "reject";
}): Promise<void> {
  await capFetch<void>("/centre/retained-requests/bulk", {
    method: "PATCH",
    data: payload,
  });
}

export async function getCentreRetainedRequestDetailApi(
  id: string,
): Promise<RetainedAssessorRequest> {
  return capFetch<RetainedAssessorRequest>(`/centre/retained-requests/${id}`, {
    method: "GET",
  });
}

export async function approveRetainedRequestApi(id: string): Promise<void> {
  await capFetch<void>(`/centre/retained-requests/${id}/approve`, {
    method: "PATCH",
  });
}

export async function rejectRetainedRequestApi(id: string): Promise<void> {
  await capFetch<void>(`/centre/retained-requests/${id}/reject`, {
    method: "PATCH",
  });
}

export async function revokeRetainedRequestApi(id: string): Promise<void> {
  await capFetch<void>(`/centre/retained-requests/${id}/revoke`, {
    method: "PATCH",
  });
}

// ─── Job Postings API ────────────────────────────────────────────────────────
export async function getCentreJobPostingsApi(params?: {
  q?: string;
  status?: JobPostingStatus;
  sort?: string;
  order?: "asc" | "desc";
  cursor?: string;
  limit?: number;
}): Promise<JobPosting[]> {
  const res = await capFetch<
    JobPosting[] | { data: JobPosting[]; meta: PaginationMeta }
  >("/centre/job-postings", {
    method: "GET",
    params: params as Record<string, unknown>,
  });
  return Array.isArray(res) ? res : (res as any)?.data || [];
}

function toIsoDateTimeString(dateStr?: string): string {
  if (!dateStr || !dateStr.trim()) {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString();
  }
  const trimmed = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(trimmed)) {
    const parsed = new Date(trimmed);
    return isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d, 23, 59, 59)).toISOString();
  }
  const parts = trimmed.split(/[/.-]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      const [y, m, d] = parts.map(Number);
      return new Date(Date.UTC(y, m - 1, d, 23, 59, 59)).toISOString();
    }
    const p0 = parseInt(parts[0], 10);
    const p1 = parseInt(parts[1], 10);
    let year = parseInt(parts[2], 10);
    if (year < 100) year += 2000;

    let day = p0;
    let month = p1;
    if (p0 <= 12 && p1 > 12) {
      month = p0;
      day = p1;
    }
    const d = new Date(Date.UTC(year, month - 1, day, 23, 59, 59));
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  }
  const parsed = new Date(trimmed);
  return isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

export async function createCentreJobPostingApi(
  payload: CreateJobPostingPayload,
): Promise<JobPosting> {
  const normalizedPayload = {
    ...payload,
    deadline: toIsoDateTimeString(payload.deadline),
  };
  return capFetch<JobPosting>("/centre/job-postings", {
    method: "POST",
    data: normalizedPayload,
  });
}

export async function patchCentreJobPostingsBulkApi(payload: {
  ids: string[];
  status: "closed";
}): Promise<void> {
  await capFetch<void>("/centre/job-postings/bulk", {
    method: "PATCH",
    data: payload,
  });
}

export async function getCentreJobPostingDetailApi(
  id: string,
): Promise<JobPosting> {
  return capFetch<JobPosting>(`/centre/job-postings/${id}`, {
    method: "GET",
  });
}

export async function patchCentreJobPostingApi(
  id: string,
  payload: { status: "closed" },
): Promise<JobPosting> {
  return capFetch<JobPosting>(`/centre/job-postings/${id}`, {
    method: "PATCH",
    data: payload,
  });
}

export async function deleteCentreJobPostingApi(id: string): Promise<void> {
  await capFetch<void>(`/centre/job-postings/${id}`, {
    method: "DELETE",
  });
}

export async function getCentreJobPostingApplicationsApi(
  id: string,
  params?: {
    q?: string;
    status?: "applied" | "accepted" | "rejected" | "withdrawn";
    sort?: string;
    order?: "asc" | "desc";
    cursor?: string;
    limit?: number;
  },
): Promise<JobPostingApplication[]> {
  const res = await capFetch<
    JobPostingApplication[] | { data: JobPostingApplication[]; meta: PaginationMeta }
  >(`/centre/job-postings/${id}/applications`, {
    method: "GET",
    params: params as Record<string, unknown>,
  });
  return Array.isArray(res) ? res : (res as any)?.data || [];
}

export async function patchCentreJobPostingApplicationsBulkApi(
  id: string,
  payload: {
    ids: string[];
    decision: "shortlist" | "reject";
  },
): Promise<void> {
  await capFetch<void>(`/centre/job-postings/${id}/applications/bulk`, {
    method: "PATCH",
    data: payload,
  });
}

export async function getCentreJobPostingApplicationDetailApi(
  id: string,
  applicationId: string,
): Promise<JobPostingApplication> {
  return capFetch<JobPostingApplication>(
    `/centre/job-postings/${id}/applications/${applicationId}`,
    {
      method: "GET",
    },
  );
}

export async function patchCentreJobPostingApplicationDecisionApi(
  id: string,
  applicationId: string,
  payload: { decision: "shortlist" | "reject" },
): Promise<JobPostingApplication> {
  return capFetch<JobPostingApplication>(
    `/centre/job-postings/${id}/applications/${applicationId}`,
    {
      method: "PATCH",
      data: payload,
    },
  );
}

// ─── Pricing, Wallet & Payments API ──────────────────────────────────────────
export async function getCentrePricingApi(): Promise<CentrePricing[]> {
  const res = await capFetch<CentrePricing[]>("/centre/pricing", {
    method: "GET",
  });
  return Array.isArray(res) ? res : (res as any)?.data || [];
}

export async function postCentrePricingApi(
  payload: SetCentrePricingPayload,
): Promise<CentrePricing> {
  return capFetch<CentrePricing>("/centre/pricing", {
    method: "POST",
    data: payload,
  });
}

export async function putCentrePricingBatchApi(payload: {
  items: SetCentrePricingPayload[];
}): Promise<CentrePricing[]> {
  const res = await capFetch<CentrePricing[]>("/centre/pricing", {
    method: "PUT",
    data: payload,
  });
  return Array.isArray(res) ? res : (res as any)?.data || [];
}

export async function getCentrePaymentsSummaryApi(): Promise<CentrePaymentsSummary> {
  return capFetch<CentrePaymentsSummary>("/centre/payments/summary", {
    method: "GET",
  });
}

export async function getCentrePaymentsApi(params?: {
  cursor?: string;
  limit?: number;
  q?: string;
  status?: "pending" | "completed" | "failed";
  sort?: "paidAt" | "initiatedAt";
  order?: "asc" | "desc";
}): Promise<CentrePaymentListItem[]> {
  const res = await capFetch<
    CentrePaymentListItem[] | { data: CentrePaymentListItem[]; meta: PaginationMeta }
  >("/centre/payments", {
    method: "GET",
    params: params as Record<string, unknown>,
  });
  return Array.isArray(res) ? res : (res as any)?.data || [];
}

export async function getCentreWalletApi(): Promise<Wallet> {
  return capFetch<Wallet>("/centre/wallet", {
    method: "GET",
  });
}

export async function withdrawCentreWalletApi(
  payload: WithdrawPayload,
): Promise<void> {
  await capFetch<void>("/centre/wallet/withdraw", {
    method: "POST",
    data: payload,
  });
}

// ─── Profile & Policy API ────────────────────────────────────────────────────
export async function getCentreProfileApi(): Promise<CentreProfile> {
  return capFetch<CentreProfile>("/centre/profile", {
    method: "GET",
  });
}

export async function patchCentreProfileApi(
  payload: CentreProfilePatch,
): Promise<CentreProfile> {
  return capFetch<CentreProfile>("/centre/profile", {
    method: "PATCH",
    data: payload,
  });
}

export async function getCentreNotificationPolicyApi(): Promise<CentreNotificationPolicy> {
  return capFetch<CentreNotificationPolicy>("/centre/notification-policy", {
    method: "GET",
  });
}

export async function putCentreNotificationPolicyApi(
  payload: CentreNotificationPolicy,
): Promise<CentreNotificationPolicy> {
  return capFetch<CentreNotificationPolicy>("/centre/notification-policy", {
    method: "PUT",
    data: payload,
  });
}

export async function patchCentreNotificationPolicyApi(
  payload: Partial<CentreNotificationPolicy>,
): Promise<CentreNotificationPolicy> {
  return capFetch<CentreNotificationPolicy>("/centre/notification-policy", {
    method: "PATCH",
    data: payload,
  });
}

// ─── Directory API ───────────────────────────────────────────────────────────
export async function getDirectoryApi(params?: {
  q?: string;
  kinds?: string;
  cursor?: string;
  limit?: number;
}): Promise<DirectoryHit[]> {
  const res = await capFetch<
    DirectoryHit[] | { data: DirectoryHit[]; meta: PaginationMeta }
  >("/directory", {
    method: "GET",
    params: params as Record<string, unknown>,
  });
  return Array.isArray(res) ? res : (res as any)?.data || [];
}

// ─── Panels & Interviews API (OpenAPI spec §28 /centre/panels & /centre/interviews) ───

export interface CentrePanelMember {
  assessorId: string;
  name: string;
  email?: string | null;
  photoAssetId?: string | null;
  photo?: { assetId: string; url?: string | null } | null;
  isLead: boolean;
  isObserver: boolean;
}

export interface CentrePanel {
  id: string;
  centreId: string;
  name: string;
  description?: string | null;
  assessorIds: string[];
  leadAssessorId: string;
  observerIvAssessorId?: string;
  members: CentrePanelMember[];
  createdAt: string;
  updatedAt?: string;
}

export interface CreateCentrePanelPayload {
  name: string;
  description?: string | null;
  assessorIds: string[];
  leadAssessorId: string;
  observerIvAssessorId?: string;
}

export interface PatchCentrePanelPayload {
  name?: string;
  description?: string | null;
  assessorIds?: string[];
  leadAssessorId?: string;
  observerIvAssessorId?: string;
}

export interface CentreInterview {
  id: string;
  centreId: string;
  name: string;
  description?: string | null;
  durationMinutes?: number | null;
  panelId?: string | null;
  panel?: {
    id: string;
    name: string;
    members: CentrePanelMember[];
  } | null;
  scheduledAt?: string | null;
  mode?: "physical" | "online" | null;
  link?: string | null;
  location?: string | null;
  useCentreAddress?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateCentreInterviewPayload {
  name: string;
  description?: string | null;
  durationMinutes?: number | null;
  panelId?: string | null;
  scheduledAt?: string | null;
  mode?: "physical" | "online" | null;
  location?: string;
  useCentreAddress?: boolean;
  link?: string;
}

export interface ScheduleCentreInterviewPayload {
  applicationId: string;
  scheduledAt?: string;
  mode?: "physical" | "online";
  location?: string;
  useCentreAddress?: boolean;
  link?: string;
}

export interface CentreInterviewBooking {
  id: string;
  scheduledAt: string;
  mode?: "physical" | "online" | null;
  link?: string | null;
  location?: string | null;
  useCentreAddress?: boolean;
  status: "scheduled" | "completed" | "cancelled";
  centreInterviewId?: string | null;
  application: {
    id: string;
    type: "RPL" | "NSQ";
    status: string;
    currentStageKey: string;
    trade?: { id: string; name: string } | null;
  };
  candidate: {
    id: string;
    name: string;
    email?: string | null;
    photoAssetId?: string | null;
    photo?: { assetId: string; url?: string | null } | null;
  };
  panel: {
    id: string;
    members: CentrePanelMember[];
  };
}

export async function getCentrePanelsApi(params?: {
  cursor?: string;
  limit?: number;
  q?: string;
  order?: "asc" | "desc";
}): Promise<CentrePanel[]> {
  const res = await capFetch<
    CentrePanel[] | { data: CentrePanel[]; meta: PaginationMeta }
  >("/centre/panels", {
    method: "GET",
    params: params as Record<string, unknown>,
  });
  return Array.isArray(res) ? res : (res as any)?.data || [];
}

export async function postCentrePanelsApi(
  payload: CreateCentrePanelPayload,
): Promise<CentrePanel> {
  const res = await capFetch<CentrePanel | { data: CentrePanel }>(
    "/centre/panels",
    {
      method: "POST",
      data: payload,
    },
  );
  return (res as any)?.data || res;
}

export async function getCentrePanelDetailApi(id: string): Promise<CentrePanel> {
  const res = await capFetch<CentrePanel | { data: CentrePanel }>(
    `/centre/panels/${id}`,
    {
      method: "GET",
    },
  );
  return (res as any)?.data || res;
}

export async function patchCentrePanelApi(
  id: string,
  payload: PatchCentrePanelPayload,
): Promise<CentrePanel> {
  const res = await capFetch<CentrePanel | { data: CentrePanel }>(
    `/centre/panels/${id}`,
    {
      method: "PATCH",
      data: payload,
    },
  );
  return (res as any)?.data || res;
}

export async function deleteCentrePanelApi(id: string): Promise<void> {
  await capFetch<void>(`/centre/panels/${id}`, {
    method: "DELETE",
  });
}

export async function getCentreInterviewsApi(params?: {
  cursor?: string;
  limit?: number;
  q?: string;
  from?: string;
  to?: string;
  scheduledAt?: string;
  order?: "asc" | "desc";
}): Promise<CentreInterview[]> {
  const res = await capFetch<
    CentreInterview[] | { data: CentreInterview[]; meta: PaginationMeta }
  >("/centre/interviews", {
    method: "GET",
    params: params as Record<string, unknown>,
  });
  return Array.isArray(res) ? res : (res as any)?.data || [];
}

export async function postCentreInterviewsApi(
  payload: CreateCentreInterviewPayload,
): Promise<CentreInterview> {
  const res = await capFetch<CentreInterview | { data: CentreInterview }>(
    "/centre/interviews",
    {
      method: "POST",
      data: payload,
    },
  );
  return (res as any)?.data || res;
}

export async function getCentreInterviewDetailApi(
  id: string,
): Promise<CentreInterview> {
  const res = await capFetch<CentreInterview | { data: CentreInterview }>(
    `/centre/interviews/${id}`,
    {
      method: "GET",
    },
  );
  return (res as any)?.data || res;
}

export async function patchCentreInterviewApi(
  id: string,
  payload: Partial<CreateCentreInterviewPayload>,
): Promise<CentreInterview> {
  const res = await capFetch<CentreInterview | { data: CentreInterview }>(
    `/centre/interviews/${id}`,
    {
      method: "PATCH",
      data: payload,
    },
  );
  return (res as any)?.data || res;
}

export async function deleteCentreInterviewApi(id: string): Promise<void> {
  await capFetch<void>(`/centre/interviews/${id}`, {
    method: "DELETE",
  });
}

export async function scheduleCentreInterviewFromTemplateApi(
  templateId: string,
  payload: ScheduleCentreInterviewPayload,
): Promise<any> {
  return capFetch<any>(`/centre/interviews/${templateId}/schedule`, {
    method: "POST",
    data: payload,
  });
}

export async function getCentreInterviewBookingsApi(params?: {
  cursor?: string;
  limit?: number;
  q?: string;
  from?: string;
  to?: string;
  scheduledAt?: string;
  status?: "scheduled" | "completed" | "cancelled";
  order?: "asc" | "desc";
}): Promise<CentreInterviewBooking[]> {
  const res = await capFetch<
    CentreInterviewBooking[] | { data: CentreInterviewBooking[]; meta: PaginationMeta }
  >("/centre/interview-bookings", {
    method: "GET",
    params: params as Record<string, unknown>,
  });
  return Array.isArray(res) ? res : (res as any)?.data || [];
}

export async function getCentreInterviewBookingDetailApi(
  id: string,
): Promise<CentreInterviewBooking> {
  const res = await capFetch<
    CentreInterviewBooking | { data: CentreInterviewBooking }
  >(`/centre/interview-bookings/${id}`, {
    method: "GET",
  });
  return (res as any)?.data || res;
}

export async function patchCentreInterviewBookingApi(
  id: string,
  payload: {
    scheduledAt?: string;
    mode?: "physical" | "online";
    location?: string;
    useCentreAddress?: boolean;
    link?: string;
  },
): Promise<CentreInterviewBooking> {
  const res = await capFetch<
    CentreInterviewBooking | { data: CentreInterviewBooking }
  >(`/centre/interview-bookings/${id}`, {
    method: "PATCH",
    data: payload,
  });
  return (res as any)?.data || res;
}

