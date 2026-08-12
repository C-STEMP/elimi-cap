import { getAssessorApplicationsApi } from "@/src/features/shared/assessor/api";
import {
  getApplicationByIdApi,
  type Application,
} from "@/src/features/shared/applications/api";

export type { Application };

export async function getAssessorAssignedApplicationsApi(): Promise<Application[]> {
  return getAssessorApplicationsApi();
}

export async function getAssessorApplicationByIdApi(
  id: string,
): Promise<Application> {
  return getApplicationByIdApi(id);
}
