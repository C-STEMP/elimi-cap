import {
  useGetAssessorProfileSectors as useSharedGetAssessorProfileSectors,
  useUpdateAssessorProfileSectors as useSharedUpdateAssessorProfileSectors,
} from "@/src/features/shared/assessor/hooks";

export function useGetAssessorSectors() {
  return useSharedGetAssessorProfileSectors();
}

export function useUpdateAssessorSectors() {
  return useSharedUpdateAssessorProfileSectors();
}
