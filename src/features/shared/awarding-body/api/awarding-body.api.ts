import { capFetch } from "@/src/lib/api/cap";
import type { Application } from "@/src/features/shared/applications/api";

export interface AddAwardingBodyStaffPayload {
  email: string;
  awardingBodyId: string;
}

export interface AssignEvPayload {
  assessorId: string;
}

export interface EvReviewDecisionPayload {
  decision: "approve" | "reject";
  feedback?: string;
}

export interface IssueCertificatePayload {
  certificateAssetId: string;
}

export interface Certificate {
  id: string;
  applicationId: string;
  issuedBy: string;
  issuedAt: string;
  certificateAssetId: string;
}

export async function getAwardingBodyApplicationsApi(): Promise<
  Application[]
> {
  return capFetch<Application[]>("/awarding-body/applications", {
    method: "GET",
  });
}

export async function addAwardingBodyStaffApi(
  payload: AddAwardingBodyStaffPayload,
): Promise<void> {
  await capFetch<void>("/awarding-body/staff", {
    method: "POST",
    data: payload,
  });
}

export async function assignExternalVerifierApi(
  applicationId: string,
  payload: AssignEvPayload,
): Promise<Application> {
  return capFetch<Application>(`/applications/${applicationId}/ev`, {
    method: "POST",
    data: payload,
  });
}

export async function reviewExternalVerifierApi(
  applicationId: string,
  payload: EvReviewDecisionPayload,
): Promise<Application> {
  return capFetch<Application>(`/applications/${applicationId}/ev/review`, {
    method: "POST",
    data: payload,
  });
}

export async function issueCertificateApi(
  applicationId: string,
  payload: IssueCertificatePayload,
): Promise<Certificate> {
  return capFetch<Certificate>(`/applications/${applicationId}/certificate`, {
    method: "POST",
    data: payload,
  });
}
