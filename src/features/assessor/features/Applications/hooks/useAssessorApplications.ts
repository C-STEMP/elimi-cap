import {
  useGetAssessorApplications as useSharedGetAssessorApplications,
} from "@/src/features/shared/assessor/hooks";
import {
  useGetApplicationById as useSharedGetApplicationById,
} from "@/src/features/shared/applications/hooks";
import type { Application } from "../api/applications.api";
import type {
  ApplicationStatus,
  ApplicationType,
} from "@/src/features/shared/applications/api";

export type { Application };

export function useGetAssessorApplications(
  params?: {
    q?: string;
    tradeId?: string;
    type?: ApplicationType;
    status?: ApplicationStatus;
    sort?: string;
    order?: "asc" | "desc";
    cursor?: string;
    limit?: number;
  },
  options?: {
    enabled?: boolean;
    refetchInterval?: number | false;
    refetchOnWindowFocus?: boolean | "always";
    staleTime?: number;
  },
) {
  return useSharedGetAssessorApplications(params, options);
}

export function useGetAssessorApplicationById(
  id: string,
  options?: {
    refetchInterval?: number | false;
    enabled?: boolean;
    refetchOnWindowFocus?: boolean | "always";
    staleTime?: number;
  },
) {
  return useSharedGetApplicationById(id, options);
}

