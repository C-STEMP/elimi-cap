import {
  useGetAssessorApplications as useSharedGetAssessorApplications,
} from "@/src/features/shared/assessor/hooks";
import {
  useGetApplicationById as useSharedGetApplicationById,
} from "@/src/features/shared/applications/hooks";
import type { Application } from "../api/applications.api";

export type { Application };

export function useGetAssessorApplications() {
  return useSharedGetAssessorApplications();
}

export function useGetAssessorApplicationById(id: string) {
  return useSharedGetApplicationById(id);
}
