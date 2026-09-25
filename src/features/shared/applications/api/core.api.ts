import { capFetch, capFetchAll } from "@/src/lib/api/cap";
import type {
  Application,
  ApplicationDetail,
  ApplicationProgress,
  ApplicationStage,
  ApplicationStatus,
  ApplicationType,
  ApplicationVersion,
  CreateApplicationPayload,
  ReviewDecisionPayload,
  ApplicationShareToken,
  ApplicationDossier,
} from "./types";

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
  type?: ApplicationType;
  q?: string;
  tradeId?: string;
  stage?: string;
  sort?: string;
  order?: "asc" | "desc";
  cursor?: string;
  limit?: number;
  ivApproved?: boolean;
  interviewSchedulable?: boolean;
}): Promise<Application[]> {
  return capFetchAll<Application>("/applications", params);
}

export async function getApplicationByIdApi(
  id: string,
): Promise<ApplicationDetail> {
  return capFetch<ApplicationDetail>(`/applications/${id}`, {
    method: "GET",
  });
}

export async function patchApplicationDraftApi(
  id: string,
  payload: Record<string, unknown>,
): Promise<Application> {
  return capFetch<Application>(`/applications/${id}`, {
    method: "PATCH",
    data: payload,
  });
}

export async function getApplicationProgressApi(
  id: string,
): Promise<ApplicationProgress> {
  return capFetch<ApplicationProgress>(`/applications/${id}/progress`, {
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
  const safePayload = {
    decision: payload.decision,
    stageKey: payload.stageKey || "application_form",
    ...(payload.feedback ? { feedback: payload.feedback } : {}),
  };
  return capFetch<Application>(`/applications/${id}/review`, {
    method: "POST",
    data: safePayload,
  });
}

export async function createShareTokenApi(
  id: string,
): Promise<ApplicationShareToken> {
  return capFetch<ApplicationShareToken>(`/applications/${id}/share-token`, {
    method: "POST",
  });
}

export async function deleteShareTokenApi(
  id: string,
): Promise<{ message?: string }> {
  return capFetch<{ message?: string }>(`/applications/${id}/share-token`, {
    method: "DELETE",
  });
}

export async function getSharedApplicationApi(
  token: string,
): Promise<ApplicationDossier> {
  return capFetch<ApplicationDossier>(`/shared/applications/${token}`, {
    method: "GET",
  });
}
