import {
  createApplicationApi,
  getApplicationsApi,
  getApplicationByIdApi,
  submitApplicationApi,
  getApplicationStagesApi,
  initiateApplicationPaymentApi,
  getApplicationReceiptApi,
  type CreateApplicationPayload,
  type ApplicationStatus,
  type Application,
  type ApplicationStage,
  type PaymentInitiationResponse,
  type PaymentReceipt,
} from "@/src/features/shared/applications/api";

export type {
  CreateApplicationPayload,
  ApplicationStatus,
  Application,
  ApplicationStage,
  PaymentInitiationResponse,
  PaymentReceipt,
};

export async function createCandidateApplicationApi(
  payload: CreateApplicationPayload,
): Promise<Application> {
  return createApplicationApi(payload);
}

export async function getCandidateApplicationsApi(
  status?: ApplicationStatus,
): Promise<Application[]> {
  return getApplicationsApi({ status });
}

export async function getCandidateApplicationByIdApi(
  id: string,
): Promise<Application> {
  return getApplicationByIdApi(id);
}

export async function submitCandidateApplicationApi(
  id: string,
): Promise<Application> {
  return submitApplicationApi(id);
}

export async function getCandidateApplicationStagesApi(
  id: string,
): Promise<ApplicationStage[]> {
  return getApplicationStagesApi(id);
}

export async function initiateCandidateApplicationPaymentApi(
  id: string,
): Promise<PaymentInitiationResponse> {
  return initiateApplicationPaymentApi(id);
}

export async function getCandidateApplicationReceiptApi(
  id: string,
): Promise<PaymentReceipt> {
  return getApplicationReceiptApi(id);
}
