import {
  getAssessorCentresApi,
  getAssessorCentreApplicationsApi,
  getAssessorRetainedRequestsApi,
  requestRetainedAssessorApi,
  type AssessorCentreItem,
  type RetainedAssessorRequest,
  type RequestRetainedAssessorPayload,
  type CentreAssessorApplication,
} from "@/src/features/shared/assessor/api";

export type {
  AssessorCentreItem,
  RetainedAssessorRequest,
  RequestRetainedAssessorPayload,
  CentreAssessorApplication,
};

export {
  getAssessorCentresApi,
  getAssessorCentreApplicationsApi,
  getAssessorRetainedRequestsApi,
  requestRetainedAssessorApi,
};

export async function requestToJoinCentreApi(
  payload: string | RequestRetainedAssessorPayload,
): Promise<RetainedAssessorRequest> {
  return requestRetainedAssessorApi(payload);
}

