"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiPlus } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { HeaderBanner } from "@/features/candidate/features/Dashboard/components/HeaderBanner";
import { CalendarWidget } from "@/features/candidate/features/Dashboard/components/CalendarWidget";
import { UpcomingCard } from "@/features/candidate/features/Dashboard/components/UpcomingCard";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";
import {
  useGetApplicationById,
  useGetSelfAssessment,
  useGetEvidenceVault,
  useCreateGeneralEvidence,
  useDeleteGeneralEvidence,
  useGetInterviewSchedule,
} from "@/src/features/shared/applications/hooks";
import { useUploadFile } from "@/src/features/shared/storage/hooks";
import { EvidenceRecord } from "../utils/evidenceConstants";
import { UploadEvidenceModal } from "../components/UploadEvidenceModal";
import { DeleteEvidenceModal } from "../components/DeleteEvidenceModal";
import { PreviewEvidenceModal } from "../components/PreviewEvidenceModal";
import { ResourcesSection } from "../components/ResourcesSection";
import { EvidenceSection } from "../components/EvidenceSection";
import { useUrlModal } from "@/src/lib/hooks/usePersistentModal";
import { UPLOAD_EVIDENCE_MODAL } from "@/src/lib/modal-keys";

interface EvidenceVaultPageProps {
  applicationId?: string;
}

export const EvidenceVaultPage: React.FC<EvidenceVaultPageProps> = ({
  applicationId = "",
}) => {
  const { toast } = useToast();
  const router = useRouter();

  const { data: apiApp } = useGetApplicationById(applicationId);
  const { data: selfAssessment } = useGetSelfAssessment(applicationId);
  const { data: remoteVault = [] } = useGetEvidenceVault(applicationId);
  const { data: interviewSchedule } = useGetInterviewSchedule(applicationId, { enabled: Boolean(applicationId) });
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

  const [isUploadModalOpen, setIsUploadModalOpen] = useUrlModal(UPLOAD_EVIDENCE_MODAL);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<EvidenceRecord | null>(null);
  const [previewItem, setPreviewItem] = useState<EvidenceRecord | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const combinedEvidenceList = React.useMemo(
    () =>
      (remoteVault || [])
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
    [remoteVault],
  );

  const evidences: EvidenceRecord[] = combinedEvidenceList.map((item) => {
    const docName = item.documentName;

    const combinedIssues: string[] = (
      Array.isArray(item.issues)
        ? item.issues
        : item.feedback
          ? [item.feedback]
          : item.reviewComment
            ? [item.reviewComment]
            : []
    ).filter(Boolean);

    const defaultPendingStatus = "Pending";
    const rawStatus: string =
      (item.status as string) ||
      (combinedIssues.length > 0 ? "Attention Required" : defaultPendingStatus);
    const statusLabel = rawStatus
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c: string) => c.toUpperCase());

    const s = rawStatus.toLowerCase().replace(/_/g, " ");
    const isApproved =
      s.includes("approv") ||
      s.includes("accept") ||
      s.includes("complet") ||
      s.includes("verifi");
    const isSubmitted = s.includes("submi");
    const isAttention =
      s.includes("reject") ||
      s.includes("attenti") ||
      s.includes("fail") ||
      s.includes("declin") ||
      (combinedIssues.length > 0 && !isApproved);
    const isInProgress = s.includes("review") || s.includes("progress");

    const statusBg = isApproved || isSubmitted
      ? "bg-[#1E7F4C]/10"
      : isAttention
        ? "bg-[#FEE2E2]"
        : isInProgress
          ? "bg-[#EFF6FF]"
          : "bg-[#F9A825]/10";

    const statusText = isApproved || isSubmitted
      ? "text-[#1E7F4C]"
      : isAttention
        ? "text-[#B91C1C]"
        : isInProgress
          ? "text-[#1D4ED8]"
          : "text-[#F9A825]";

    return {
      id: item.id || item.assetId,
      name: docName,
      size: item.size || item.fileSize || "",
      status: statusLabel,
      statusBg,
      statusText,
      issues: combinedIssues,
      url: item.url || item.dataUrl,
      dataUrl: item.dataUrl || item.url,
      mimeType: item.mimeType,
      assetId: item.assetId,
      evidenceType: item.evidenceType || item.type || "",
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

      const asset = await uploadFileMutation.mutateAsync({
        file,
        purpose: "evidence",
      });
      const assetId = asset?.assetId || (asset as any)?.id;
      if (!assetId) throw new Error("The file upload did not return an asset id.");

      await createGeneralEvidenceMutation.mutateAsync({
        documentName: finalDocName,
        evidenceType,
        assetId,
      });

      toast({
        type: "success",
        title: "Evidence Uploaded",
        description: `"${finalDocName}" has been successfully added to your Evidence Vault.`,
      });

      setIsUploadModalOpen(false);
    } catch (err: any) {
      toast({
        type: "error",
        title: "Upload Failed",
        description: err?.message || "Could not upload your evidence. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete && applicationId) {
      try {
        await deleteGeneralEvidenceMutation.mutateAsync(itemToDelete.id);
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
      } catch (err: any) {
        toast({
          type: "error",
          title: "Delete Failed",
          description: err?.message || "Could not delete this evidence. Please try again.",
        });
      }
    }
  };

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
          </div>

          <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6">
            <CalendarWidget panelInterviewDate={interviewSchedule?.scheduledAt || undefined} />
            <UpcomingCard
              interview={
                interviewSchedule?.scheduledAt
                  ? {
                      title: "Panel Interview",
                      date: new Date(interviewSchedule.scheduledAt).toLocaleDateString("en-GB"),
                      time: new Date(interviewSchedule.scheduledAt).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      }),
                      mode: interviewSchedule.mode,
                      liveUrl:
                        interviewSchedule.mode === "online"
                          ? interviewSchedule.link
                          : undefined,
                      location: interviewSchedule.location || "",
                    }
                  : null
              }
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
