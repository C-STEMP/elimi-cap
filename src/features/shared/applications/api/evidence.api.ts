import { capFetch } from "@/src/lib/api/cap";
import type {
  EvidenceVaultItem,
  GeneralEvidence,
  ThirdPartyReportEvidence,
} from "./types";

export async function getEvidenceVaultApi(
  id: string,
  params?: { cursor?: string; limit?: number },
): Promise<EvidenceVaultItem[]> {
  const query = new URLSearchParams();
  if (params?.cursor) query.append("cursor", params.cursor);
  if (params?.limit) query.append("limit", params.limit.toString());
  const queryString = query.toString() ? `?${query.toString()}` : "";
  return capFetch<EvidenceVaultItem[]>(`/applications/${id}/evidence${queryString}`, {
    method: "GET",
  });
}

export async function createGeneralEvidenceApi(
  id: string,
  payload: {
    documentName: string;
    evidenceType: string;
    assetId?: string;
    formData?: Record<string, unknown>;
    textValue?: string;
  },
): Promise<GeneralEvidence> {
  return capFetch<GeneralEvidence>(`/applications/${id}/evidence`, {
    method: "POST",
    data: payload,
  });
}

export async function getGeneralEvidenceByIdApi(
  id: string,
  evidenceId: string,
): Promise<GeneralEvidence> {
  return capFetch<GeneralEvidence>(
    `/applications/${id}/evidence/${evidenceId}`,
    {
      method: "GET",
    },
  );
}

export async function deleteGeneralEvidenceApi(
  id: string,
  evidenceId: string,
): Promise<void> {
  await capFetch<void>(`/applications/${id}/evidence/${evidenceId}`, {
    method: "DELETE",
  });
}

export async function getThirdPartyReportApi(
  id: string,
): Promise<ThirdPartyReportEvidence> {
  return capFetch<ThirdPartyReportEvidence>(
    `/applications/${id}/evidence/third-party-report`,
    {
      method: "GET",
    },
  );
}

export async function uploadThirdPartyReportApi(
  id: string,
  assetId: string,
): Promise<ThirdPartyReportEvidence> {
  return capFetch<ThirdPartyReportEvidence>(
    `/applications/${id}/evidence/third-party-report`,
    {
      method: "POST",
      data: { assetId },
    },
  );
}
