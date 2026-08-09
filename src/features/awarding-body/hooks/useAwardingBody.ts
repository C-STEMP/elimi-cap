import {
  useGetAwardingBodyApplications as useSharedGetAwardingBodyApplications,
  useAddAwardingBodyStaff as useSharedAddAwardingBodyStaff,
  useAssignExternalVerifier as useSharedAssignExternalVerifier,
  useReviewExternalVerifier as useSharedReviewExternalVerifier,
  useIssueCertificate as useSharedIssueCertificate,
  useAwardingBody as useSharedAwardingBody,
} from "@/src/features/shared/awarding-body/hooks";

export function useGetAwardingBodyApplications() {
  return useSharedGetAwardingBodyApplications();
}

export function useAddAwardingBodyStaff() {
  return useSharedAddAwardingBodyStaff();
}

export function useAssignExternalVerifier() {
  return useSharedAssignExternalVerifier();
}

export function useReviewExternalVerifier() {
  return useSharedReviewExternalVerifier();
}

export function useIssueCertificate() {
  return useSharedIssueCertificate();
}

export function useAwardingBody() {
  return useSharedAwardingBody();
}
