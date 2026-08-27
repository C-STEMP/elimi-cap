import {
  getAssessorProfileApi,
  patchAssessorProfileApi,
  getAssessorProfileSectorsApi,
  updateAssessorProfileSectorsApi,
  type Sector,
  type AssessorSelfProfile,
  type AssessorSelfProfilePatch,
} from "@/src/features/shared/assessor/api";

export type { Sector, AssessorSelfProfile, AssessorSelfProfilePatch };

export {
  getAssessorProfileApi,
  patchAssessorProfileApi,
  getAssessorProfileSectorsApi,
  updateAssessorProfileSectorsApi,
};

export async function getAssessorSectorsApi(): Promise<Sector[]> {
  return getAssessorProfileSectorsApi();
}

export async function updateAssessorSectorsApi(
  sectorIds: string[],
): Promise<Sector[]> {
  return updateAssessorProfileSectorsApi(sectorIds);
}
