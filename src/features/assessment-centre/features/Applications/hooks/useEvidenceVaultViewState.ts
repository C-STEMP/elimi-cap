"use client";

import { useState, useMemo } from "react";
import {
  useGetEvidenceVault,
  useGetSelfAssessment,
  useGetApplicationById,
} from "@/src/features/shared/applications/hooks";
import type { EvidenceRecord } from "@/src/features/shared/evidence-vault/utils/evidenceConstants";

export function useEvidenceVaultViewState(id: string = "") {
  const { data: remoteEvidenceItems = [], isLoading: isLoadingEvidence } =
    useGetEvidenceVault(id);
  const { data: selfAssessment } = useGetSelfAssessment(id);
  const { data: appDetail } = useGetApplicationById(id);

  const [previewItem, setPreviewItem] = useState<EvidenceRecord | null>(null);

  const persistedFacilitator = useMemo(() => {
    if (typeof window === "undefined" || !id) return null;
    try {
      if (localStorage.getItem("elimi_assigned_facilitator_active")) {
        localStorage.removeItem("elimi_assigned_facilitator_active");
      }
      const stored = localStorage.getItem(`elimi_assigned_facilitator_${id}`);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, [id]);

  const activeFacilitator =
    (appDetail as any)?.facilitator ||
    (appDetail as any)?.assessor ||
    (appDetail as any)?.metadata?.facilitator ||
    persistedFacilitator ||
    null;

  const persistedEvidence: any[] = useMemo(() => {
    if (typeof window === "undefined" || !id) return [];
    try {
      const stored = localStorage.getItem(`elimi_evidence_vault_${id}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, [id]);

  const evidenceItems = useMemo(() => {
    const list: any[] = [];
    const seenNames = new Set<string>();
    const seenIds = new Set<string>();

    (remoteEvidenceItems || [])
      .filter(
        (item: any) =>
          item.kind === "general" ||
          (!item.kind && (item.documentName || item.name || item.assetId)),
      )
      .forEach((item: any) => {
        const docName = (item.documentName || item.name || item.title || item.filename || item.originalName || "").trim();
        if (!docName) return;
        const norm = docName.toLowerCase();
        seenNames.add(norm);
        if (item.id) seenIds.add(item.id);
        if (item.assetId) seenIds.add(item.assetId);
        list.push({ ...item, documentName: docName });
      });

    persistedEvidence
      .filter((item: any) => item.kind === "general" || (!item.kind && item.documentName))
      .forEach((item: any) => {
        const docName = (item.documentName || item.name || item.title || item.filename || item.originalName || "").trim();
        if (!docName) return;
        const norm = docName.toLowerCase();
        if (seenNames.has(norm) || (item.id && seenIds.has(item.id)) || (item.assetId && seenIds.has(item.assetId))) {
          return;
        }
        seenNames.add(norm);
        if (item.id) seenIds.add(item.id);
        if (item.assetId) seenIds.add(item.assetId);
        list.push({ ...item, documentName: docName });
      });

    return list;
  }, [remoteEvidenceItems, persistedEvidence]);

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
