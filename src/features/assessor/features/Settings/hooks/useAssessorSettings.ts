import {
  useGetAssessorProfile as useSharedGetAssessorProfile,
  usePatchAssessorProfile as useSharedPatchAssessorProfile,
  useGetAssessorProfileSectors as useSharedGetAssessorProfileSectors,
  useUpdateAssessorProfileSectors as useSharedUpdateAssessorProfileSectors,
} from "@/src/features/shared/assessor/hooks";

export function useGetAssessorProfile() {
  return useSharedGetAssessorProfile();
}

export function usePatchAssessorProfile() {
  return useSharedPatchAssessorProfile();
}

export function useGetAssessorSectors() {
  return useSharedGetAssessorProfileSectors();
}

export function useUpdateAssessorSectors() {
  return useSharedUpdateAssessorProfileSectors();
}

