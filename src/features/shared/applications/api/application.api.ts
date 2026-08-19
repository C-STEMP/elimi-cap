import { capFetch } from "@/src/lib/api/cap";

export type ApplicationType = "RPL" | "NSQ";

export type ApplicationStatus =
  | "draft"
  | "in_progress"
  | "certified"
  | "rejected"
  | "withdrawn";

export interface Application {
  id: string;
  candidateId: string;
  centreId: string;
  awardingBodyId?: string | null;
  type: ApplicationType;
  status: ApplicationStatus;
  currentStageKey: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateApplicationPayload {
  type: ApplicationType;
  sectorId: string;
  tradeId: string;
  unitIds: string[];
  centreId: string;
}

export interface ApplicationStage {
  stageKey: string;
  label: string;
  status:
    | "not_started"
    | "awaiting_payment"
    | "in_progress"
    | "under_review"
    | "scheduled"
    | "successful"
    | "rejected";
  enteredAt?: string | null;
  deadline?: string | null;
}

export interface ApplicationVersion {
  versionNo: number;
  data: Record<string, unknown>;
  submittedBy: string;
  feedback?: string | null;
  createdAt: string;
}

export interface ReviewDecisionPayload {
  decision: "approve" | "reject";
  feedback?: string;
}

export interface PaymentInitiationResponse {
  paymentId: string;
  checkoutUrl: string;
}

export interface PaymentReceipt {
  assetId: string;
  url: string;
}

export async function createApplicationApi(
  payload: CreateApplicationPayload,
): Promise<Application> {
  return capFetch<Application>("/applications", {
    method: "POST",
    data: payload,
  });
}

export async function getApplicationsApi(params?: {
  status?: ApplicationStatus;
  cursor?: string;
  limit?: number;
}): Promise<Application[]> {
  const query = new URLSearchParams();
  if (params?.status) query.append("status", params.status);
  if (params?.cursor) query.append("cursor", params.cursor);
  if (params?.limit) query.append("limit", params.limit.toString());

  const queryString = query.toString() ? `?${query.toString()}` : "";
  return capFetch<Application[]>(`/applications${queryString}`, {
    method: "GET",
  });
}

export async function getApplicationByIdApi(id: string): Promise<Application> {
  return capFetch<Application>(`/applications/${id}`, {
    method: "GET",
  });
}

export async function submitApplicationApi(id: string): Promise<Application> {
  return capFetch<Application>(`/applications/${id}/submit`, {
    method: "POST",
  });
}

export async function getApplicationHistoryApi(
  id: string,
): Promise<ApplicationVersion[]> {
  return capFetch<ApplicationVersion[]>(`/applications/${id}/history`, {
    method: "GET",
  });
}

export async function getApplicationStagesApi(
  id: string,
): Promise<ApplicationStage[]> {
  return capFetch<ApplicationStage[]>(`/applications/${id}/stages`, {
    method: "GET",
  });
}

export async function reviewApplicationApi(
  id: string,
  payload: ReviewDecisionPayload,
): Promise<Application> {
  return capFetch<Application>(`/applications/${id}/review`, {
    method: "POST",
    data: payload,
  });
}

export async function initiateApplicationPaymentApi(
  id: string,
): Promise<PaymentInitiationResponse> {
  return capFetch<PaymentInitiationResponse>(`/applications/${id}/pay`, {
    method: "POST",
  });
}

export async function getApplicationReceiptApi(
  id: string,
): Promise<PaymentReceipt> {
  return capFetch<PaymentReceipt>(`/applications/${id}/receipt`, {
    method: "GET",
  });
}

export interface SelfAssessment {
  applicationId: string;
  personalInformation?: Record<string, unknown>;
  frozenPersonalInformation?: Record<string, unknown>;
  competencies?: Array<Record<string, unknown>>;
  reflection?: Record<string, unknown>;
  declaration?: Record<string, unknown>;
  submittedAt?: string | null;
}

export interface SaveSelfAssessmentPayload {
  competencies?: Array<Record<string, unknown>>;
  reflection?: Record<string, unknown>;
  declaration?: Record<string, unknown>;
  submit?: boolean;
}

export async function getSelfAssessmentApi(
  applicationId: string,
): Promise<SelfAssessment> {
  return capFetch<SelfAssessment>(
    `/applications/${applicationId}/evidence/self-assessment`,
    {
      method: "GET",
    },
  );
}

export async function saveSelfAssessmentApi(
  applicationId: string,
  payload: SaveSelfAssessmentPayload,
): Promise<SelfAssessment> {
  return capFetch<SelfAssessment>(
    `/applications/${applicationId}/evidence/self-assessment`,
    {
      method: "PUT",
      data: payload,
    },
  );
}
