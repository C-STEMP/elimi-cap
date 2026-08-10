import {
  getAssessorRetainedRequestsApi,
  requestRetainedAssessorApi,
} from "@/src/features/shared/assessor/api";
import type { RetainedAssessorRequest } from "@/src/features/shared/centre/api";

export type { RetainedAssessorRequest };

export async function getAssessorCentresApi(): Promise<
  RetainedAssessorRequest[]
> {
  return getAssessorRetainedRequestsApi();
}

export async function requestToJoinCentreApi(
  centreId: string,
): Promise<RetainedAssessorRequest> {
  return requestRetainedAssessorApi(centreId);
}
