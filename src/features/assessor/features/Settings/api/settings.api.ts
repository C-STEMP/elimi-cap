import {
  getAssessorProfileSectorsApi,
  updateAssessorProfileSectorsApi,
  type Sector,
} from "@/src/features/shared/assessor/api";

export type { Sector };

export async function getAssessorSectorsApi(): Promise<Sector[]> {
  return getAssessorProfileSectorsApi();
}

export async function updateAssessorSectorsApi(
  sectorIds: string[],
): Promise<Sector[]> {
  return updateAssessorProfileSectorsApi(sectorIds);
}
