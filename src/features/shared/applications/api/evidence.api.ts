import { capFetch } from "@/src/lib/api/cap";
import type {
  ApplicationDetail,
  ApplicationEvidenceTypes,
  EvidenceVaultItem,
  GeneralEvidence,
  ThirdPartyReportEvidence,
  VaultEvidenceType,
} from "./types";

export async function getEvidenceVaultApi(
  id: string,
  params?: { cursor?: string; limit?: number },
): Promise<EvidenceVaultItem[]> {
  const query = new URLSearchParams();
  if (params?.cursor) query.append("cursor", params.cursor);
  if (params?.limit) query.append("limit", params.limit.toString());
  const queryString = query.toString() ? `?${query.toString()}` : "";
  const items = await capFetch<EvidenceVaultItem[]>(
    `/applications/${id}/evidence${queryString}`,
    {
      method: "GET",
    },
  );

  if (!Array.isArray(items) || items.length === 0) {
    return items;
  }

  // Hydrate rejected / attention-required general evidence items with their full detail
  // (GET /applications/{id}/evidence/{evidenceId}) because the list endpoint omits reviewComment.
  const hydratedItems = await Promise.all(
    items.map(async (item): Promise<EvidenceVaultItem> => {
      const isGeneral = item.kind === "general" || !item.kind;
      const statusStr = String(item.reviewStatus || item.status || "").toLowerCase();
      const isRejectedOrAttention =
        statusStr.includes("reject") ||
        statusStr.includes("attenti") ||
        statusStr.includes("declin") ||
        statusStr.includes("fail");
      const rawItem = item as unknown as Record<string, unknown>;
      const hasComment = Boolean(
        item.reviewComment ||
          item.feedback ||
          rawItem.comment ||
          rawItem.rejectionReason,
      );

      if (isGeneral && item.id && isRejectedOrAttention && !hasComment) {
        try {
          const detail = await getGeneralEvidenceByIdApi(id, item.id);
          if (detail) {
            const rawDetail = detail as unknown as Record<string, unknown>;
            const resolvedComment =
              detail.reviewComment ||
              (rawDetail.comment as string | undefined) ||
              (rawDetail.feedback as string | undefined) ||
              item.reviewComment ||
              undefined;
            return {
              ...item,
              assetId: item.assetId || detail.assetId || undefined,
              reviewStatus: detail.reviewStatus || item.reviewStatus,
              reviewComment: resolvedComment,
              feedback: resolvedComment || item.feedback,
              unitIds: detail.unitIds || item.unitIds,
            };
          }
        } catch {
          // Ignore individual detail fetch error and return summary item
        }
      }

      return item;
    }),
  );

  return hydratedItems;
}

export async function getApplicationEvidenceTypesApi(
  id: string,
): Promise<ApplicationEvidenceTypes> {
  return capFetch<ApplicationEvidenceTypes>(
    `/applications/${id}/evidence-types`,
    {
      method: "GET",
    },
  );
}

export async function uploadApplicationCvApi(
  id: string,
  assetId: string,
): Promise<ApplicationDetail> {
  return capFetch<ApplicationDetail>(`/applications/${id}/cv`, {
    method: "POST",
    data: { assetId },
  });
}

export async function createGeneralEvidenceApi(
  id: string,
  payload: {
    documentName: string;
    evidenceType: VaultEvidenceType | string;
    assetId?: string;
    formData?: Record<string, unknown>;
    textValue?: string;
    unitIds?: string[];
  },
): Promise<GeneralEvidence> {
  return capFetch<GeneralEvidence>(`/applications/${id}/evidence`, {
    method: "POST",
    data: payload,
  });
}

export async function patchGeneralEvidenceApi(
  id: string,
  evidenceId: string,
  payload: {
    documentName?: string;
    assetId?: string;
    formData?: Record<string, unknown>;
    textValue?: string;
    unitIds?: string[];
  },
): Promise<GeneralEvidence> {
  return capFetch<GeneralEvidence>(
    `/applications/${id}/evidence/${evidenceId}`,
    {
      method: "PATCH",
      data: payload,
    },
  );
}

export async function reviewGeneralEvidenceApi(
  id: string,
  evidenceId: string,
  payload: {
    decision: "approve" | "reject";
    comment?: string;
  },
): Promise<GeneralEvidence> {
  return capFetch<GeneralEvidence>(
    `/applications/${id}/evidence/${evidenceId}/review`,
    {
      method: "PATCH",
      data: payload,
    },
  );
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
