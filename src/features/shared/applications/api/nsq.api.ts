import { capFetch } from "@/src/lib/api/cap";
import type {
  DirectObservationSession,
  InductionForm,
  PostUnitEvidencePayload,
  PostUnitSignoffPayload,
  SaveSelfAssessmentPayload,
  SelfAssessment,
} from "./types";

export async function getSelfAssessmentApi(
  applicationId: string,
): Promise<SelfAssessment> {
  return capFetch<SelfAssessment>(
    `/applications/${applicationId}/evidence/self-assessment`,
    { method: "GET" },
  );
}

export async function saveSelfAssessmentApi(
  applicationId: string,
  payload: SaveSelfAssessmentPayload,
): Promise<SelfAssessment> {
  return capFetch<SelfAssessment>(
    `/applications/${applicationId}/evidence/self-assessment`,
    {
      method: "PUT",
      data: payload,
    },
  );
}

export async function submitInductionFormApi(
  applicationId: string,
  data: Record<string, unknown>,
): Promise<InductionForm> {
  return capFetch<InductionForm>(`/applications/${applicationId}/induction-form`, {
    method: "POST",
    data: { data },
  });
}

export async function scheduleDirectObservationApi(
  applicationId: string,
  scheduledAt: string,
): Promise<DirectObservationSession> {
  return capFetch<DirectObservationSession>(
    `/applications/${applicationId}/direct-observation`,
    {
      method: "POST",
      data: { scheduledAt },
    },
  );
}

export async function submitUnitEvidenceApi(
  applicationId: string,
  unitId: string,
  payload: PostUnitEvidencePayload,
): Promise<{ message?: string }> {
  return capFetch<{ message?: string }>(
    `/applications/${applicationId}/units/${unitId}/evidence`,
    {
      method: "POST",
      data: payload,
    },
  );
}

export async function submitUnitSignoffApi(
  applicationId: string,
  unitId: string,
  payload: PostUnitSignoffPayload,
): Promise<{ message?: string }> {
  return capFetch<{ message?: string }>(
    `/applications/${applicationId}/units/${unitId}/signoff`,
    {
      method: "POST",
      data: payload,
    },
  );
}

export async function assignUnitAssessorApi(
  applicationId: string,
  unitId: string,
  assessorId: string,
): Promise<{ message?: string }> {
  return capFetch<{ message?: string }>(
    `/applications/${applicationId}/units/${unitId}/assessor`,
    {
      method: "POST",
      data: { assessorId },
    },
  );
}
