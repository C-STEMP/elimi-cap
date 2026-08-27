import {
  getAssessorApplicationsApi,
  type CentreAssessorApplication,
} from "@/src/features/shared/assessor/api";
import {
  getApplicationByIdApi,
  type Application,
  type ApplicationStatus,
  type ApplicationType,
} from "@/src/features/shared/applications/api";

export type { Application, CentreAssessorApplication };

export async function getAssessorAssignedApplicationsApi(params?: {
  q?: string;
  tradeId?: string;
  type?: ApplicationType;
  status?: ApplicationStatus;
  sort?: string;
  order?: "asc" | "desc";
  cursor?: string;
  limit?: number;
}): Promise<CentreAssessorApplication[]> {
  return getAssessorApplicationsApi(params);
}

export async function getAssessorApplicationByIdApi(
  id: string,
): Promise<Application> {
  return getApplicationByIdApi(id);
}

