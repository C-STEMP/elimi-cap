import {
  useGetRetainedRequests as useSharedGetRetainedRequests,
  useApproveRetainedRequest as useSharedApproveRetainedRequest,
  useRejectRetainedRequest as useSharedRejectRetainedRequest,
} from "@/src/features/shared/centre/hooks";
import type { RetainedRequestStatus } from "../api/assessor.api";

export function useGetRetainedRequests(status?: RetainedRequestStatus) {
  return useSharedGetRetainedRequests(status);
}

export function useApproveRetainedRequest() {
  return useSharedApproveRetainedRequest();
}

export function useRejectRetainedRequest() {
  return useSharedRejectRetainedRequest();
}

/**
 * Composite hook for Assessor feature operations in Assessment Centre
 */
export function useAssessor() {
  const getRetainedRequests = useGetRetainedRequests();
  const approveRequest = useApproveRetainedRequest();
  const rejectRequest = useRejectRetainedRequest();

  return {
    getRetainedRequests,
    approveRequest,
    rejectRequest,
  };
}
