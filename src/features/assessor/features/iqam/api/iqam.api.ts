import { capFetch } from "@/src/lib/api/cap";
import type { PaginationMeta } from "@/src/features/shared/centre/api";
import type {
  IqamCentreItem,
  IqamAllocationItem,
  IqamSamplingPlanMatrix,
  IqamSamplingPlanRow,
  IqamSamplingPlanSubmitResult,
  IqamSamplingRecordMatrix,
  IqamSamplingRecordRow,
  IqamSamplingRecordSubmitResult,
  IqamIvReport,
  IqamIvReportData,
  IqamAssessorOutcomes,
  IqamAssessorOutcomesData,
  IqamFinalPortfolio,
  IqamFinalPortfolioData,
} from "./types";

function unwrapList<T>(res: T[] | { data: T[]; meta?: PaginationMeta }): T[] {
  return Array.isArray(res) ? res : res?.data || [];
}

// ─── IQAM Centres ─────────────────────────────────────────────────────────

export async function getIqamCentresApi(params?: {
  q?: string;
  sort?: "joinedAt";
  order?: "asc" | "desc";
  cursor?: string;
  limit?: number;
}): Promise<IqamCentreItem[]> {
  const res = await capFetch<IqamCentreItem[] | { data: IqamCentreItem[]; meta?: PaginationMeta }>(
    "/assessor/iqam/centres",
    { method: "GET", params: params as Record<string, unknown> },
  );
  return unwrapList(res);
}

export async function getIqamCentreApi(centreId: string): Promise<IqamCentreItem> {
  return capFetch<IqamCentreItem>(`/assessor/iqam/centres/${centreId}`, {
    method: "GET",
  });
}

// ─── CON/01 — Allocations ─────────────────────────────────────────────────

export async function getIqamAllocationsApi(
  centreId: string,
  params?: { cursor?: string; limit?: number },
): Promise<IqamAllocationItem[]> {
  const res = await capFetch<
    IqamAllocationItem[] | { data: IqamAllocationItem[]; meta?: PaginationMeta }
  >(`/assessor/iqam/centres/${centreId}/allocations`, {
    method: "GET",
    params: params as Record<string, unknown>,
  });
  return unwrapList(res);
}

// ─── CON/02 — Sampling Plan ───────────────────────────────────────────────

export async function getIqamSamplingPlanApi(
  centreId: string,
  tradeId: string,
  qualificationLevelId: string,
  params?: { cursor?: string; limit?: number },
): Promise<IqamSamplingPlanMatrix> {
  return capFetch<IqamSamplingPlanMatrix>(
    `/assessor/iqam/centres/${centreId}/sampling-plan`,
    { method: "GET", params: { tradeId, qualificationLevelId, ...params } },
  );
}

export async function submitIqamSamplingPlanApi(
  centreId: string,
  payload: { tradeId: string; qualificationLevelId: string },
): Promise<IqamSamplingPlanSubmitResult> {
  return capFetch<IqamSamplingPlanSubmitResult>(
    `/assessor/iqam/centres/${centreId}/sampling-plan/submit`,
    { method: "POST", data: payload },
  );
}

export async function patchIqamSamplingPlanApi(
  applicationId: string,
  payload: { termType?: string | null; plannedDate?: string | null },
): Promise<IqamSamplingPlanRow> {
  return capFetch<IqamSamplingPlanRow>(
    `/assessor/iqam/applications/${applicationId}/sampling-plan`,
    { method: "PATCH", data: payload },
  );
}

export async function putIqamSamplingPlanUnitsApi(
  applicationId: string,
  unitIds: string[],
): Promise<IqamSamplingPlanRow> {
  return capFetch<IqamSamplingPlanRow>(
    `/assessor/iqam/applications/${applicationId}/sampling-plan/units`,
    { method: "PUT", data: { unitIds } },
  );
}

// ─── CON/03 — Sampling Record ─────────────────────────────────────────────

export async function getIqamSamplingRecordApi(
  centreId: string,
  tradeId: string,
  qualificationLevelId: string,
  params?: { cursor?: string; limit?: number },
): Promise<IqamSamplingRecordMatrix> {
  return capFetch<IqamSamplingRecordMatrix>(
    `/assessor/iqam/centres/${centreId}/sampling-record`,
    { method: "GET", params: { tradeId, qualificationLevelId, ...params } },
  );
}

export async function submitIqamSamplingRecordApi(
  centreId: string,
  payload: { tradeId: string; qualificationLevelId: string },
): Promise<IqamSamplingRecordSubmitResult> {
  return capFetch<IqamSamplingRecordSubmitResult>(
    `/assessor/iqam/centres/${centreId}/sampling-record/submit`,
    { method: "POST", data: payload },
  );
}

export async function patchIqamSamplingRecordApi(
  applicationId: string,
  payload: { auditStatus?: string | null; process?: string | null },
): Promise<IqamSamplingRecordRow> {
  return capFetch<IqamSamplingRecordRow>(
    `/assessor/iqam/applications/${applicationId}/sampling-record`,
    { method: "PATCH", data: payload },
  );
}

// ─── CON/04 — Internal Verifier Comprehensive Report ──────────────────────

export async function getIqamIvReportApi(applicationId: string): Promise<IqamIvReport> {
  return capFetch<IqamIvReport>(`/assessor/iqam/applications/${applicationId}/iv-report`, {
    method: "GET",
  });
}

export async function patchIqamIvReportApi(
  applicationId: string,
  data: IqamIvReportData,
): Promise<IqamIvReport> {
  return capFetch<IqamIvReport>(`/assessor/iqam/applications/${applicationId}/iv-report`, {
    method: "PATCH",
    data: { data },
  });
}

export async function submitIqamIvReportApi(applicationId: string): Promise<IqamIvReport> {
  return capFetch<IqamIvReport>(
    `/assessor/iqam/applications/${applicationId}/iv-report/submit`,
    { method: "POST" },
  );
}

// ─── CON/05 — Assessor Outcomes (IV Observation & Questioning Checklist) ──

export async function getIqamAssessorOutcomesApi(
  applicationId: string,
): Promise<IqamAssessorOutcomes> {
  return capFetch<IqamAssessorOutcomes>(
    `/assessor/iqam/applications/${applicationId}/assessor-outcomes`,
    { method: "GET" },
  );
}

export async function patchIqamAssessorOutcomesApi(
  applicationId: string,
  data: IqamAssessorOutcomesData,
): Promise<IqamAssessorOutcomes> {
  return capFetch<IqamAssessorOutcomes>(
    `/assessor/iqam/applications/${applicationId}/assessor-outcomes`,
    { method: "PATCH", data: { data } },
  );
}

export async function submitIqamAssessorOutcomesApi(
  applicationId: string,
): Promise<IqamAssessorOutcomes> {
  return capFetch<IqamAssessorOutcomes>(
    `/assessor/iqam/applications/${applicationId}/assessor-outcomes/submit`,
    { method: "POST" },
  );
}

// ─── CON/06 — Final Portfolio / Award Report ──────────────────────────────

export async function getIqamFinalPortfolioApi(
  applicationId: string,
): Promise<IqamFinalPortfolio> {
  return capFetch<IqamFinalPortfolio>(
    `/assessor/iqam/applications/${applicationId}/final-portfolio`,
    { method: "GET" },
  );
}

export async function patchIqamFinalPortfolioApi(
  applicationId: string,
  data: IqamFinalPortfolioData,
): Promise<IqamFinalPortfolio> {
  return capFetch<IqamFinalPortfolio>(
    `/assessor/iqam/applications/${applicationId}/final-portfolio`,
    { method: "PATCH", data: { data } },
  );
}

export async function submitIqamFinalPortfolioApi(
  applicationId: string,
): Promise<IqamFinalPortfolio> {
  return capFetch<IqamFinalPortfolio>(
    `/assessor/iqam/applications/${applicationId}/final-portfolio/submit`,
    { method: "POST" },
  );
}
