"use client";

import { useState, useMemo } from "react";
import {
  useGetEvidenceVault,
  useGetSelfAssessment,
  useGetApplicationById,
  APPLICATION_DETAIL_REFRESH_INTERVAL_MS,
} from "@/src/features/shared/applications/hooks";
import type { EvidenceRecord } from "@/src/features/shared/evidence-vault/utils/evidenceConstants";

export function useEvidenceVaultViewState(id: string = "") {
  const { data: remoteEvidenceItems = [], isLoading: isLoadingEvidence } =
    useGetEvidenceVault(id);
  const { data: selfAssessment } = useGetSelfAssessment(id);
  const { data: appDetail } = useGetApplicationById(id, {
    refetchInterval: APPLICATION_DETAIL_REFRESH_INTERVAL_MS,
  });

  const [previewItem, setPreviewItem] = useState<EvidenceRecord | null>(null);

  const activeFacilitator = appDetail?.facilitator ?? null;

  // General evidence rows from GET /applications/{id}/evidence; status is the
  // backend's own review status.
  const evidenceItems = useMemo(
    () =>
      (remoteEvidenceItems || [])
        .filter(
          (item: any) =>
            item.kind === "general" ||
            (!item.kind && (item.documentName || item.name || item.assetId)),
        )
        .map((item: any) => ({
          ...item,
          documentName: (
            item.documentName || item.name || item.title || item.filename || item.originalName || ""
          ).trim(),
        }))
        .filter((item: any) => item.documentName),
    [remoteEvidenceItems],
  );

  return {
    isLoadingEvidence,
    selfAssessment,
    appDetail,
    activeFacilitator,
    evidenceItems,
    previewItem,
    setPreviewItem,
  };
}
