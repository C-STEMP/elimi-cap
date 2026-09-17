import type { ApplicationStatus } from "../api/types";

// Poll interval for application detail views so stage changes made by
// the current user (or another actor, e.g. a centre/assessor decision)
// show up without a manual reload. Only fires while the tab is focused
// (React Query's refetchIntervalInBackground defaults to false).
export const APPLICATION_DETAIL_REFRESH_INTERVAL_MS = 15_000;

export const APPLICATION_QUERY_KEYS = {
  all: ["applications"] as const,
  list: (status?: ApplicationStatus) => ["applications", "list", status] as const,
  detail: (id: string) => ["applications", "detail", id] as const,
  history: (id: string) => ["applications", "history", id] as const,
  stages: (id: string) => ["applications", "stages", id] as const,
  receipt: (id: string) => ["applications", "receipt", id] as const,
  selfAssessment: (id: string) => ["applications", "self-assessment", id] as const,
  evidence: (id: string, params?: { cursor?: string; limit?: number }) =>
    ["applications", "evidence", id, params] as const,
  inductionForm: (id: string) => ["applications", "induction", id] as const,
  unitCriteria: (id: string, unitId: string) =>
    ["applications", "units", id, unitId, "criteria"] as const,
  directObservations: (id: string) =>
    ["applications", "direct-observations", id] as const,
  directObservationSession: (id: string, sessionId: string) =>
    ["applications", "direct-observations", id, sessionId] as const,
  centreIqam: (id: string, tool: string) =>
    ["centre", "applications", id, "iqam", tool] as const,
};
