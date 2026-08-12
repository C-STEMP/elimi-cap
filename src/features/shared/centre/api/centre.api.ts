import { capFetch } from "@/src/lib/api/cap";

export type CentreStaffRole = "super_admin" | "regular_admin" | "staff";

export interface CentreStaff {
  id: string;
  email: string;
  role: CentreStaffRole;
}

export interface AddCentreStaffPayload {
  email: string;
  role: CentreStaffRole;
}

export interface JobPosting {
  id: string;
  title: string;
  tradeId: string;
  slot: number;
  deadline: string;
  description: string;
  requirements: string[];
  duration?: string | null;
  status: "open" | "closed";
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

export type RetainedRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "revoked";

export interface RetainedAssessorRequest {
  id: string;
  assessorId: string;
  centreId: string;
  status: RetainedRequestStatus;
  requestedAt: string;
  respondedAt?: string | null;
  respondedBy?: string | null;
}

export interface Money {
  amountMinorUnits: string;
  currency: string;
}

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

export async function getCentreStaffApi(): Promise<CentreStaff[]> {
  return capFetch<CentreStaff[]>("/centre/staff", {
    method: "GET",
  });
}

export async function addCentreStaffApi(
  payload: AddCentreStaffPayload,
): Promise<CentreStaff> {
  return capFetch<CentreStaff>("/centre/staff", {
    method: "POST",
    data: payload,
  });
}

export async function getCentreJobPostingsApi(): Promise<JobPosting[]> {
  return capFetch<JobPosting[]>("/centre/job-postings", {
    method: "GET",
  });
}

export async function createCentreJobPostingApi(
  payload: CreateJobPostingPayload,
): Promise<JobPosting> {
  return capFetch<JobPosting>("/centre/job-postings", {
    method: "POST",
    data: payload,
  });
}

export async function getCentreRetainedRequestsApi(
  status?: RetainedRequestStatus,
): Promise<RetainedAssessorRequest[]> {
  const query = status ? `?status=${status}` : "";
  return capFetch<RetainedAssessorRequest[]>(
    `/centre/retained-requests${query}`,
    {
      method: "GET",
    },
  );
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

export async function getCentrePricingApi(): Promise<CentrePricing[]> {
  return capFetch<CentrePricing[]>("/centre/pricing", {
    method: "GET",
  });
}

export async function setCentrePricingApi(
  payload: SetCentrePricingPayload,
): Promise<CentrePricing> {
  return capFetch<CentrePricing>("/centre/pricing", {
    method: "POST",
    data: payload,
  });
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
