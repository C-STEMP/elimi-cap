import {
  getCentreRetainedRequestsApi,
  approveRetainedRequestApi as approveRetainedRequestSharedApi,
  rejectRetainedRequestApi as rejectRetainedRequestSharedApi,
  type RetainedAssessorRequest,
  type RetainedRequestStatus,
} from "@/src/features/shared/centre/api";

export type { RetainedAssessorRequest, RetainedRequestStatus };

export async function getRetainedRequestsApi(
  status?: RetainedRequestStatus,
): Promise<RetainedAssessorRequest[]> {
  return getCentreRetainedRequestsApi(status ? { status } : undefined);
}

export async function approveRetainedRequestApi(id: string): Promise<void> {
  return approveRetainedRequestSharedApi(id);
}

export async function rejectRetainedRequestApi(id: string): Promise<void> {
  return rejectRetainedRequestSharedApi(id);
}
