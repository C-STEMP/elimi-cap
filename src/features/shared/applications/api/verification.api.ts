import { capFetch } from "@/src/lib/api/cap";
import type {
  Appeal,
  Application,
  RecommendationsResponse,
} from "./types";

export async function assignIvApi(
  id: string,
  assessorId: string,
): Promise<Application> {
  return capFetch<Application>(`/applications/${id}/iv`, {
    method: "POST",
    data: { assessorId },
  });
}

export async function reviewIvApi(
  id: string,
  payload: { decision: "approve" | "reject"; feedback?: string; stageKey?: string },
): Promise<Application> {
  return capFetch<Application>(`/applications/${id}/iv/review`, {
    method: "POST",
    data: payload,
  });
}

export async function assignEvApi(
  id: string,
  assessorId: string,
): Promise<Application> {
  return capFetch<Application>(`/applications/${id}/ev`, {
    method: "POST",
    data: { assessorId },
  });
}

export async function reviewEvApi(
  id: string,
  payload: { decision: "approve" | "reject"; feedback?: string; stageKey?: string },
): Promise<Application> {
  return capFetch<Application>(`/applications/${id}/ev/review`, {
    method: "POST",
    data: payload,
  });
}

export async function forwardToAwardingBodyApi(
  id: string,
): Promise<Application> {
  return capFetch<Application>(`/applications/${id}/forward-to-awarding-body`, {
    method: "POST",
  });
}

export async function createAppealApi(
  id: string,
  comment: string,
): Promise<Appeal> {
  return capFetch<Appeal>(`/applications/${id}/appeal`, {
    method: "POST",
    data: { comment },
  });
}

export async function resolveAppealApi(
  id: string,
  appealId: string,
  payload: { decision: "reopen" | "dismiss"; comment?: string },
): Promise<void> {
  await capFetch<void>(`/applications/${id}/appeal/${appealId}/resolve`, {
    method: "POST",
    data: payload,
  });
}

export async function getRecommendationsApi(
  id: string,
): Promise<RecommendationsResponse> {
  return capFetch<RecommendationsResponse>(
    `/applications/${id}/recommendations`,
    {
      method: "GET",
    },
  );
}

export async function closeRecommendationsApi(
  id: string,
): Promise<Record<string, unknown>> {
  return capFetch<Record<string, unknown>>(
    `/applications/${id}/recommendations/close`,
    {
      method: "POST",
    },
  );
}
