import { capFetch } from "@/src/lib/api/cap";
import type {
  DirectObservationSession,
  DirectObservationSessionList,
  InductionForm,
  InductionFormWritePayload,
  NsqUnitCriteria,
  PostUnitEvidencePayload,
  PostUnitSignoffPayload,
  ReviewObservationPayload,
  ReviewUnitEvidencePayload,
  SaveObservationFormPayload,
  SaveSelfAssessmentPayload,
  ScheduleObservationPayload,
  SelfAssessment,
  SignObservationPayload,
  CentreIqamSamplingPlan,
  CentreIqamSamplingRecord,
  CentreIqamIvReport,
  CentreIqamAssessorOutcomes,
  CentreIqamFinalPortfolio,
} from "./types";

// ==========================================
// 1. Induction Form
// ==========================================

export async function getInductionFormApi(
  applicationId: string,
): Promise<InductionForm> {
  return capFetch<InductionForm>(
    `/applications/${applicationId}/induction-form`,
    { method: "GET" },
  );
}

export async function submitInductionFormApi(
  applicationId: string,
  payload: InductionFormWritePayload | Record<string, unknown>,
): Promise<InductionForm> {
  const isDirectPayload =
    "submit" in payload || "data" in payload || "unitIds" in payload;
  const body = isDirectPayload ? payload : { data: payload };

  return capFetch<InductionForm>(
    `/applications/${applicationId}/induction-form`,
    {
      method: "POST",
      data: body,
    },
  );
}

// ==========================================
// 2. Units, Criteria, & Evidence
// ==========================================

export async function getUnitCriteriaApi(
  applicationId: string,
  unitId: string,
): Promise<NsqUnitCriteria> {
  return capFetch<NsqUnitCriteria>(
    `/applications/${applicationId}/units/${unitId}/criteria`,
    { method: "GET" },
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

export async function reviewUnitEvidenceApi(
  applicationId: string,
  unitId: string,
  evidenceId: string,
  payload: ReviewUnitEvidencePayload,
): Promise<{ message?: string }> {
  return capFetch<{ message?: string }>(
    `/applications/${applicationId}/units/${unitId}/evidence/${evidenceId}`,
    {
      method: "PATCH",
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

export async function assignNsqAssessorApi(
  applicationId: string,
  assessorId: string,
): Promise<{ message?: string }> {
  return capFetch<{ message?: string }>(
    `/applications/${applicationId}/assessor`,
    {
      method: "POST",
      data: { assessorId },
    },
  );
}

// ==========================================
// 3. Direct Observation Lifecycle
// ==========================================

export async function getDirectObservationListApi(
  applicationId: string,
): Promise<DirectObservationSessionList> {
  return capFetch<DirectObservationSessionList>(
    `/applications/${applicationId}/direct-observation`,
    { method: "GET" },
  );
}

export async function scheduleDirectObservationApi(
  applicationId: string,
  payload: ScheduleObservationPayload | string,
): Promise<DirectObservationSession> {
  const body =
    typeof payload === "string"
      ? { scheduledAt: payload, unitIds: [], address: "" }
      : payload;

  return capFetch<DirectObservationSession>(
    `/applications/${applicationId}/direct-observation`,
    {
      method: "POST",
      data: body,
    },
  );
}

export async function getDirectObservationSessionApi(
  applicationId: string,
  sessionId: string,
): Promise<DirectObservationSession> {
  return capFetch<DirectObservationSession>(
    `/applications/${applicationId}/direct-observation/${sessionId}`,
    { method: "GET" },
  );
}

export async function reviewDirectObservationApi(
  applicationId: string,
  sessionId: string,
  payload: ReviewObservationPayload,
): Promise<DirectObservationSession> {
  return capFetch<DirectObservationSession>(
    `/applications/${applicationId}/direct-observation/${sessionId}/review`,
    {
      method: "PATCH",
      data: payload,
    },
  );
}

export async function saveDirectObservationFormApi(
  applicationId: string,
  sessionId: string,
  payload: SaveObservationFormPayload,
): Promise<DirectObservationSession> {
  return capFetch<DirectObservationSession>(
    `/applications/${applicationId}/direct-observation/${sessionId}/form`,
    {
      method: "PATCH",
      data: payload,
    },
  );
}

export async function signDirectObservationApi(
  applicationId: string,
  sessionId: string,
  payload: SignObservationPayload,
): Promise<DirectObservationSession> {
  return capFetch<DirectObservationSession>(
    `/applications/${applicationId}/direct-observation/${sessionId}/signoff`,
    {
      method: "POST",
      data: payload,
    },
  );
}

// ==========================================
// 4. Centre IQAM View-Only Tools
// ==========================================

export async function getCentreIqamSamplingPlanApi(
  applicationId: string,
): Promise<CentreIqamSamplingPlan> {
  return capFetch<CentreIqamSamplingPlan>(
    `/centre/applications/${applicationId}/iqam/sampling-plan`,
    { method: "GET" },
  );
}

export async function getCentreIqamSamplingRecordApi(
  applicationId: string,
): Promise<CentreIqamSamplingRecord> {
  return capFetch<CentreIqamSamplingRecord>(
    `/centre/applications/${applicationId}/iqam/sampling-record`,
    { method: "GET" },
  );
}

export async function getCentreIqamIvReportApi(
  applicationId: string,
): Promise<CentreIqamIvReport> {
  return capFetch<CentreIqamIvReport>(
    `/centre/applications/${applicationId}/iqam/iv-report`,
    { method: "GET" },
  );
}

export async function getCentreIqamAssessorOutcomesApi(
  applicationId: string,
): Promise<CentreIqamAssessorOutcomes> {
  return capFetch<CentreIqamAssessorOutcomes>(
    `/centre/applications/${applicationId}/iqam/assessor-outcomes`,
    { method: "GET" },
  );
}

export async function getCentreIqamFinalPortfolioApi(
  applicationId: string,
): Promise<CentreIqamFinalPortfolio> {
  return capFetch<CentreIqamFinalPortfolio>(
    `/centre/applications/${applicationId}/iqam/final-portfolio`,
    { method: "GET" },
  );
}

// ==========================================
// 5. Legacy Fallbacks
// ==========================================

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
