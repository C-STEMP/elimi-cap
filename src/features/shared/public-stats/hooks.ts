import { useQuery } from "@tanstack/react-query";
import { getCapPublicStatsApi, getLmsPublicStatsApi } from "./api";

// Matches the server-side 30-minute snapshot TTL (`cacheTtlSeconds: 1800`).
const PUBLIC_STATS_STALE_TIME_MS = 30 * 60 * 1000;

export const PUBLIC_STATS_QUERY_KEYS = {
  cap: ["public-stats", "cap"] as const,
  lms: ["public-stats", "lms"] as const,
};

export function useCapPublicStats(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: PUBLIC_STATS_QUERY_KEYS.cap,
    queryFn: getCapPublicStatsApi,
    enabled: options?.enabled ?? true,
    staleTime: PUBLIC_STATS_STALE_TIME_MS,
    retry: 1,
  });
}

export function useLmsPublicStats(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: PUBLIC_STATS_QUERY_KEYS.lms,
    queryFn: getLmsPublicStatsApi,
    enabled: options?.enabled ?? true,
    staleTime: PUBLIC_STATS_STALE_TIME_MS,
    retry: 1,
  });
}
