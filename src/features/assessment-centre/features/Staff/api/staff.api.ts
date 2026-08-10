import {
  getCentreStaffApi,
  addCentreStaffApi,
  type CentreStaff,
  type AddCentreStaffPayload,
} from "@/src/features/shared/centre/api";

export type { CentreStaff, AddCentreStaffPayload };

export async function getStaffApi(): Promise<CentreStaff[]> {
  return getCentreStaffApi();
}

export async function addStaffApi(
  payload: AddCentreStaffPayload,
): Promise<CentreStaff> {
  return addCentreStaffApi(payload);
}
