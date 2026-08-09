import { capFetch } from "@/src/lib/api/cap";
import {
  getApplicationsApi,
  getApplicationByIdApi,
  reviewApplicationApi,
  type Application,
  type ApplicationStatus,
  type ReviewDecisionPayload,
} from "@/src/features/shared/applications/api";

export type { Application, ApplicationStatus, ReviewDecisionPayload };

export interface AssignFacilitatorPayload {
  assessorId: string;
}

export interface AssignInternalVerifierPayload {
  assessorId: string;
}

export interface CentreStaff {
  id: string;
  email: string;
  role: "super_admin" | "regular_admin" | "staff";
}

export interface AddCentreStaffPayload {
  email: string;
  role: "super_admin" | "regular_admin" | "staff";
}

export interface CentrePricing {
  applicationType: "RPL" | "NSQ";
  price: {
    amountMinorUnits: string;
    currency: string;
  };
  effectiveFrom: string;
}

export interface WalletBalance {
  balance: {
    amountMinorUnits: string;
    currency: string;
  };
}

export async function getCentreApplicationsApi(
  status?: ApplicationStatus,
): Promise<Application[]> {
  return getApplicationsApi({ status });
}

export async function getCentreApplicationByIdApi(
  id: string,
): Promise<Application> {
  return getApplicationByIdApi(id);
}

export async function reviewCentreApplicationApi(
  id: string,
  payload: ReviewDecisionPayload,
): Promise<Application> {
  return reviewApplicationApi(id, payload);
}

export async function assignFacilitatorApi(
  id: string,
  payload: AssignFacilitatorPayload,
): Promise<Application> {
  return capFetch<Application>(`/applications/${id}/facilitator`, {
    method: "POST",
    data: payload,
  });
}

export async function assignInternalVerifierApi(
  id: string,
  payload: AssignInternalVerifierPayload,
): Promise<Application> {
  return capFetch<Application>(`/applications/${id}/iv`, {
    method: "POST",
    data: payload,
  });
}

export async function forwardToAwardingBodyApi(
  id: string,
): Promise<Application> {
  return capFetch<Application>(
    `/applications/${id}/forward-to-awarding-body`,
    {
      method: "POST",
    },
  );
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

export async function getCentrePricingApi(): Promise<CentrePricing[]> {
  return capFetch<CentrePricing[]>("/centre/pricing", {
    method: "GET",
  });
}

export async function setCentrePricingApi(payload: {
  applicationType: "RPL" | "NSQ";
  price: { amountMinorUnits: string; currency: string };
}): Promise<CentrePricing> {
  return capFetch<CentrePricing>("/centre/pricing", {
    method: "POST",
    data: payload,
  });
}

export async function getCentreWalletApi(): Promise<WalletBalance> {
  return capFetch<WalletBalance>("/centre/wallet", {
    method: "GET",
  });
}

export async function withdrawCentreWalletApi(payload: {
  amount: { amountMinorUnits: string; currency: string };
}): Promise<void> {
  await capFetch<void>("/centre/wallet/withdraw", {
    method: "POST",
    data: payload,
  });
}
