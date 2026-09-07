import { capFetch } from "@/src/lib/api/cap";
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
}): Promise<Application[]> {
  const query = new URLSearchParams();
  if (params?.status) query.append("status", params.status);
  if (params?.type) query.append("type", params.type);
  if (params?.q) query.append("q", params.q);
  if (params?.tradeId) query.append("tradeId", params.tradeId);
  if (params?.stage) query.append("stage", params.stage);
  if (params?.sort) query.append("sort", params.sort);
  if (params?.order) query.append("order", params.order);
  if (params?.cursor) query.append("cursor", params.cursor);
  if (params?.limit) query.append("limit", params.limit.toString());

  const queryString = query.toString() ? `?${query.toString()}` : "";
  return capFetch<Application[]>(`/applications${queryString}`, {
    method: "GET",
  });
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
