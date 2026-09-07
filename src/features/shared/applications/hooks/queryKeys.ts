import type { ApplicationStatus } from "../api/types";

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
};
