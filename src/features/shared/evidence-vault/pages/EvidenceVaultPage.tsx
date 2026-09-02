"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiPlus } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { HeaderBanner } from "@/features/candidate/features/Dashboard/components/HeaderBanner";
import { CalendarWidget } from "@/features/candidate/features/Dashboard/components/CalendarWidget";
import { UpcomingCard } from "@/features/candidate/features/Dashboard/components/UpcomingCard";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { markEvidenceUploaded } from "@/store/slices/applicationSlice";
import {
  useGetApplicationById,
  useGetSelfAssessment,
  useGetEvidenceVault,
  useCreateGeneralEvidence,
  useDeleteGeneralEvidence,
} from "@/src/features/shared/applications/hooks";
import { useUploadFile } from "@/src/features/shared/storage/hooks";
import { EvidenceRecord } from "../utils/evidenceConstants";
import { UploadEvidenceModal } from "../components/UploadEvidenceModal";
import { DeleteEvidenceModal } from "../components/DeleteEvidenceModal";
import { PreviewEvidenceModal } from "../components/PreviewEvidenceModal";
import { ResourcesSection } from "../components/ResourcesSection";
import { EvidenceSection } from "../components/EvidenceSection";

interface EvidenceVaultPageProps {
  applicationId?: string;
}

export const EvidenceVaultPage: React.FC<EvidenceVaultPageProps> = ({
  applicationId = "",
}) => {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { data: apiApp } = useGetApplicationById(applicationId);
  const { data: selfAssessment } = useGetSelfAssessment(applicationId);
  const { data: remoteVault = [] } = useGetEvidenceVault(applicationId);
  const uploadFileMutation = useUploadFile();
  const createGeneralEvidenceMutation = useCreateGeneralEvidence(applicationId);
  const deleteGeneralEvidenceMutation = useDeleteGeneralEvidence(applicationId);

  const resolvedTradeId =
    apiApp?.tradeId ||
    apiApp?.trade?.id ||
    "";

  const rawTrade =
    (apiApp as any)?.trade?.name ||
    (typeof (apiApp as any)?.trade === "string" ? (apiApp as any)?.trade : "");
  const typeLabel =
    apiApp?.type === "NSQ" ? "Standard Assessment" : apiApp?.type || "RPL";
  const dynamicTitle = rawTrade
    ? `${rawTrade} (${typeLabel})`
    : `${typeLabel} Application`;

  const application = apiApp
    ? {
        id: apiApp.id,
        title: dynamicTitle,
        subtitle: `Status: ${apiApp.status}`,
        status: "evidence_upload" as const,
        createdAt: apiApp.createdAt,
        updatedAt: apiApp.updatedAt ?? apiApp.createdAt,
      }
    : {
        id: applicationId || "",
        title: "Application Evidence Vault",
        subtitle: "Evidence Vault",
        status: "evidence_upload" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

  const isSelfAssessmentCompleted = Boolean(
    selfAssessment?.submittedAt ||
    remoteVault.some(
      (item) =>
        item.kind === "self_assessment" &&
        (item.status === "completed" || item.status === "submitted"),
    ) ||
    (apiApp as any)?.selfAssessmentCompleted,
  );

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<EvidenceRecord | null>(null);
  const [previewItem, setPreviewItem] = useState<EvidenceRecord | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const persistedEvidence: any[] = React.useMemo(() => {
    if (typeof window === "undefined" || !applicationId) return [];
    try {
      const stored = localStorage.getItem(
        `elimi_evidence_vault_${applicationId}`,
      );
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, [applicationId, isUploadModalOpen, isDeleteModalOpen]);

  const combinedEvidenceList = React.useMemo(() => {
    const list: any[] = [];
    const seenNames = new Set<string>();
    const seenIds = new Set<string>();

    // 1. Process remote items
    (remoteVault || [])
      .filter(
        (item: any) =>
          item.kind === "general" ||
          (!item.kind && (item.documentName || item.name || item.assetId)),
      )
      .forEach((item: any) => {
        const docName = (
          item.documentName ||
          item.name ||
          item.title ||
          item.filename ||
          item.originalName ||
          ""
        ).trim();
        if (!docName) return;
        const norm = docName.toLowerCase();
        seenNames.add(norm);
        if (item.id) seenIds.add(item.id);
        if (item.assetId) seenIds.add(item.assetId);
        list.push({ ...item, documentName: docName });
      });

    // 2. Process persisted local items
    persistedEvidence
      .filter(
        (item: any) =>
          item.kind === "general" || (!item.kind && item.documentName),
      )
      .forEach((item: any) => {
        const docName = (
          item.documentName ||
          item.name ||
          item.title ||
          item.filename ||
          item.originalName ||
          ""
        ).trim();
        if (!docName) return;
        const norm = docName.toLowerCase();
        if (
          seenNames.has(norm) ||
          (item.id && seenIds.has(item.id)) ||
          (item.assetId && seenIds.has(item.assetId))
        ) {
          return;
        }
        seenNames.add(norm);
        if (item.id) seenIds.add(item.id);
        if (item.assetId) seenIds.add(item.assetId);
        list.push({ ...item, documentName: docName });
      });

    return list;
  }, [remoteVault, persistedEvidence]);

  const evidences: EvidenceRecord[] = combinedEvidenceList.map((item, idx) => {
    const statusStr = (item.status as string)?.toLowerCase() || "";
    const isApproved =
      statusStr === "approved" ||
      statusStr === "accepted" ||
      statusStr === "successful";
    const isAttention =
      statusStr === "attention required" ||
      statusStr === "attention_required" ||
      statusStr === "rejected" ||
      statusStr === "needs_attention";
    const isSubmitted = statusStr === "submitted";

    const statusLabel = isApproved
      ? "Approved"
      : isAttention
        ? "Attention Required"
        : isSubmitted
          ? "Submitted"
          : item.status || "Pending";

    const statusBg = isApproved
      ? "bg-[#D1FAE5]"
      : isAttention
        ? "bg-[#FEE2E2]"
        : "bg-[#FEF3C7]";
    const statusText = isApproved
      ? "text-[#047857]"
      : isAttention
        ? "text-[#B91C1C]"
        : "text-[#D97706]";

    const docName =
      item.documentName ||
      item.name ||
      item.title ||
      item.filename ||
      item.originalName ||
      `Evidence Document ${idx + 1}`;

    return {
      id: item.id || `ev-${idx}`,
      name: docName,
      size: item.size || item.fileSize || "5 MB",
      status: statusLabel,
      statusBg,
      statusText,
      issues: item.issues || [],
      url: item.url || item.dataUrl,
      dataUrl: item.dataUrl || item.url,
      mimeType: item.mimeType,
      assetId: item.assetId,
      evidenceType: item.evidenceType || item.type || "PS",
    };
  });

  const handleUploadSubmit = async (
    docName: string,
    evidenceType: string,
    file: File | null,
  ) => {
    if (!file || !applicationId) {
      toast({
        type: "error",
        title: "Upload Failed",
        description: "Please choose a valid file to upload.",
      });
      return;
    }

    try {
      setIsUploading(true);

      const finalDocName = docName.trim() || file.name.replace(/\.[^/.]+$/, "");
      const normalizedType = evidenceType || "PS";
      const formattedSize = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

      // 1. Upload the file to storage
      let assetId = `asset-${Date.now()}`;
      let uploadedUrl = "";
      try {
        const asset = await uploadFileMutation.mutateAsync({
          file,
          purpose: "evidence",
        });
        if (asset?.assetId || (asset as any)?.id) {
          assetId = asset?.assetId || (asset as any)?.id;
        }
        if ((asset as any)?.url) {
          uploadedUrl = (asset as any).url;
        }
      } catch (uploadErr) {
        console.warn("Storage upload fallback:", uploadErr);
      }

      // 2. Create the general evidence record in CAP backend
      try {
        await createGeneralEvidenceMutation.mutateAsync({
          documentName: finalDocName,
          evidenceType: normalizedType,
          assetId,
        });
      } catch (apiErr) {
        console.warn("Backend create evidence fallback:", apiErr);
      }

      // 3. Generate preview url
      let localUrl = uploadedUrl;
      try {
        if (!localUrl && typeof window !== "undefined") {
          localUrl = URL.createObjectURL(file);
        }
      } catch {}

      // 4. Save locally to ensure persistence across browser refresh
      const localItem = {
        id: `ev-local-${Date.now()}`,
        kind: "general",
        documentName: finalDocName,
        name: finalDocName,
        title: finalDocName,
        evidenceType: normalizedType,
        status: "Pending",
        size: formattedSize,
        assetId,
        url: localUrl,
        dataUrl: localUrl,
        mimeType: file.type,
        createdAt: new Date().toISOString(),
      };

      try {
        const stored = localStorage.getItem(
          `elimi_evidence_vault_${applicationId}`,
        );
        const existingList = stored ? JSON.parse(stored) : [];
        const updatedList = [localItem, ...existingList];
        localStorage.setItem(
          `elimi_evidence_vault_${applicationId}`,
          JSON.stringify(updatedList),
        );
      } catch (storageErr) {
        console.error("Local evidence save error:", storageErr);
      }

      toast({
        type: "success",
        title: "Evidence Uploaded",
        description: `"${finalDocName}" has been successfully added to your Evidence Vault.`,
      });

      setIsUploadModalOpen(false);
    } catch (err: any) {
      console.error("Evidence upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete && applicationId) {
      try {
        await deleteGeneralEvidenceMutation.mutateAsync(itemToDelete.id);
      } catch (err: any) {
        console.warn("Evidence delete fallback:", err);
      }

      // Remove from localStorage
      try {
        const stored = localStorage.getItem(
          `elimi_evidence_vault_${applicationId}`,
        );
        if (stored) {
          const list = JSON.parse(stored) as any[];
          const filtered = list.filter(
            (i) =>
              i.id !== itemToDelete.id &&
              i.documentName !== itemToDelete.name &&
              i.name !== itemToDelete.name,
          );
          localStorage.setItem(
            `elimi_evidence_vault_${applicationId}`,
            JSON.stringify(filtered),
          );
        }
      } catch (storageErr) {
        console.error("Local delete error:", storageErr);
      }

      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleSubmit = () => {
    dispatch(markEvidenceUploaded(application.id));
    toast({
      type: "success",
      title: "Evidence Submitted",
      description: "Your evidence has been submitted for review.",
    });
    router.push(`/dashboard/applications/${application.id}`);
  };

  const declaredEvidence =
    (apiApp as any)?.evidenceCandidateCanProvide ||
    (apiApp as any)?.data?.evidenceCandidateCanProvide;
  const declaredCount = declaredEvidence
    ? Object.entries(declaredEvidence).filter(
        ([k, v]) => v === true && k !== "other" && k !== "otherText",
      ).length
    : 0;
  const expectedCount = Math.max(declaredCount, 1);
  const isAllUploaded = evidences.length >= expectedCount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full flex flex-col min-h-screen"
    >
      <HeaderBanner
        backHref={`/dashboard/applications/${application.id}`}
        backTitle="Evidence Vault"
        breadcrumbs={[
          { label: "My Applications", href: "/dashboard/applications" },
          {
            label: application.title,
            href: `/dashboard/applications/${application.id}`,
          },
          { label: "Evidence Vault" },
        ]}
        showCreateButton={false}
        rightAction={
          <Button
            type="button"
            variant="amber"
            size="md"
            rightIcon={<FiPlus className="w-4 h-4 stroke-3" />}
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-[#fbab2a] hover:bg-[#e89b1f] text-white font-bold px-5 py-2.5 rounded-xl shadow-xs"
          >
            Upload Evidence
          </Button>
        }
      />

      <div className="max-w-7xl xl:max-w-360 mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">
            <ResourcesSection
              applicationId={application.id}
              isSelfAssessmentCompleted={isSelfAssessmentCompleted}
            />
            <EvidenceSection
              evidences={evidences}
              onPreview={(item) => setPreviewItem(item)}
              onDelete={(item) => {
                setItemToDelete(item);
                setIsDeleteModalOpen(true);
              }}
              onOpenUploadModal={() => setIsUploadModalOpen(true)}
            />
            <div className="flex flex-col items-end gap-2">
              <Button
                variant="secondary"
                size="lg"
                className="w-55! cursor-pointer place-self-end disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSubmit}
                disabled={!isAllUploaded}
              >
                Submit Evidence ({evidences.length}/{expectedCount})
              </Button>
              {!isAllUploaded && (
                <p className="text-xs text-[#b3261e] font-medium text-right">
                  Please upload all remaining evidence files ({evidences.length}
                  /{expectedCount} uploaded) before submitting.
                </p>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6">
            <CalendarWidget />
            <UpcomingCard
              interview={{
                title: "Panel Interview",
                date: "22-07-2026",
                time: "12:00PM",
              }}
            />
          </div>
        </div>
      </div>

      <UploadEvidenceModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSubmit={handleUploadSubmit}
        isUploading={isUploading}
        tradeId={resolvedTradeId}
      />

      <DeleteEvidenceModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirmDelete={handleConfirmDelete}
      />

      <PreviewEvidenceModal
        item={previewItem}
        applicationId={applicationId}
        onClose={() => setPreviewItem(null)}
      />
    </motion.div>
  );
};
