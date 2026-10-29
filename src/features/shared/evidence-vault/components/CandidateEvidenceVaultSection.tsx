"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/src/components/ui/toast";
import {
  useGetSelfAssessment,
  useGetEvidenceVault,
  useCreateGeneralEvidence,
  useDeleteGeneralEvidence,
  useUploadApplicationCv,
  useGetApplicationEvidenceTypes,
} from "@/src/features/shared/applications/hooks";
import type { ApplicationDetail } from "@/src/features/shared/applications/api/types";
import { useUploadFile } from "@/src/features/shared/storage/hooks";
import {
  useGetTradeDetail,
  useGetUnitsByTrade,
} from "@/src/features/shared/reference/hooks";
import {
  resolveAppliedTradeLevel,
  getRplScopedUnits,
} from "@/src/features/shared/applications/utils/rplTradeLevel";
import { useUrlModal } from "@/src/lib/hooks/usePersistentModal";
import { UPLOAD_EVIDENCE_MODAL } from "@/src/lib/modal-keys";
import { EvidenceRecord, isCvEvidence } from "../utils/evidenceConstants";
import { UploadEvidenceModal } from "./UploadEvidenceModal";
import { DeleteEvidenceModal } from "./DeleteEvidenceModal";
import { PreviewEvidenceModal } from "./PreviewEvidenceModal";
import {
  CandidateSelfAssessmentCard,
  CandidateThirdPartyReportCard,
} from "./CandidateReportCards";
import { EvidenceSection } from "./EvidenceSection";
import { PortfolioVault } from "./portfolio";

interface CandidateEvidenceVaultSectionProps {
  applicationId: string;
  application?: ApplicationDetail | null;
  isApplicationLoading?: boolean;
  accordion?: boolean;
  defaultOpenSection?: number;
}

export const CandidateEvidenceVaultSection: React.FC<
  CandidateEvidenceVaultSectionProps
> = ({
  applicationId,
  application: apiApp,
  isApplicationLoading = false,
  accordion = true,
  defaultOpenSection = 4,
}) => {
  const { toast } = useToast();
  const router = useRouter();

  const { data: selfAssessment } = useGetSelfAssessment(applicationId);
  const { data: remoteVault = [] } = useGetEvidenceVault(applicationId);
  const uploadFileMutation = useUploadFile();
  const createGeneralEvidenceMutation = useCreateGeneralEvidence(applicationId, {
    showToast: false,
  });
  const uploadApplicationCvMutation = useUploadApplicationCv(applicationId, {
    showToast: false,
  });
  const deleteGeneralEvidenceMutation = useDeleteGeneralEvidence(applicationId);

  const resolvedTradeId = apiApp?.tradeId || apiApp?.trade?.id || "";

  // RPL: the general-evidence dropdown must only offer the types the backend
  // accepts for this application (NOS methods + document kinds the candidate
  // declared in the wizard). NSQ / endpoint failure keep the legacy trade list.
  const isRplApplication = apiApp?.type === "RPL";
  const {
    data: applicationEvidenceTypes,
    isLoading: isApplicationEvidenceTypesLoading,
    isError: isApplicationEvidenceTypesError,
  } = useGetApplicationEvidenceTypes(applicationId, {
    enabled: isRplApplication,
  });
  const allowedEvidenceTypes =
    isRplApplication &&
    applicationEvidenceTypes &&
    !isApplicationEvidenceTypesError
      ? applicationEvidenceTypes.allowed ?? []
      : undefined;
  const isLoadingEvidenceTypes =
    isApplicationLoading ||
    (isRplApplication && isApplicationEvidenceTypesLoading);

  const { data: tradeDetail } = useGetTradeDetail(resolvedTradeId);
  const { levelNumber } = resolveAppliedTradeLevel(apiApp, tradeDetail);
  const { data: rawTradeUnits = [] } = useGetUnitsByTrade(
    resolvedTradeId,
    levelNumber,
  );
  const scopedUnits = React.useMemo(
    () =>
      getRplScopedUnits({
        tradeUnits: rawTradeUnits,
        tradeDetail,
        levelNumber,
        preferredUnitIds: apiApp?.unitIds,
      }),
    [rawTradeUnits, tradeDetail, levelNumber, apiApp?.unitIds],
  );

  const isSelfAssessmentCompleted = Boolean(
    selfAssessment?.submittedAt ||
      remoteVault.some(
        (item) =>
          item.kind === "self_assessment" &&
          (item.status === "completed" || item.status === "submitted"),
      ) ||
      (apiApp as any)?.selfAssessmentCompleted,
  );

  const [isUploadModalOpen, setIsUploadModalOpen] =
    useUrlModal(UPLOAD_EVIDENCE_MODAL);
  const [uploadInitialDocName, setUploadInitialDocName] = useState<string>("");
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
            item.documentName ||
            item.name ||
            item.title ||
            item.filename ||
            item.originalName ||
            ""
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
      (item.reviewStatus as string) ||
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

    const statusBg = isApproved
      ? "bg-[#1E7F4C]/10"
      : isSubmitted
        ? "bg-[#EFF6FF]"
        : isAttention
          ? "bg-[#FEE2E2]"
          : isInProgress
            ? "bg-[#EFF6FF]"
            : "bg-[#F9A825]/10";

    const statusText = isApproved
      ? "text-[#1E7F4C]"
      : isSubmitted
        ? "text-[#1D4ED8]"
        : isAttention
          ? "text-[#B91C1C]"
          : isInProgress
            ? "text-[#1D4ED8]"
            : "text-[#D97706]";

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
      unitIds: item.unitIds || [],
    };
  });

  // The CV is shown under "Candidate Profile", not in the evidences list.
  const legacyCvEvidence = evidences.find(isCvEvidence) || null;
  const cvEvidence: EvidenceRecord | null = apiApp?.cv?.assetId
    ? {
        id: apiApp.cv.assetId,
        name: legacyCvEvidence?.name || "Candidate CV / Resume",
        size: legacyCvEvidence?.size || "Uploaded document",
        status: "Uploaded",
        statusBg: "bg-[#1E7F4C]/10",
        statusText: "text-[#1E7F4C]",
        assetId: apiApp.cv.assetId,
        url: apiApp.cv.url || legacyCvEvidence?.url,
        dataUrl: apiApp.cv.url || legacyCvEvidence?.dataUrl,
        evidenceType: "CV",
      }
    : legacyCvEvidence;
  const otherEvidences = legacyCvEvidence
    ? evidences.filter((e) => e !== legacyCvEvidence)
    : evidences;

  const handleUploadSubmit = async (
    items: Array<{ file: File; docName: string }>,
    evidenceType: string,
    unitIds?: string[],
  ) => {
    if (!items.length || !applicationId) {
      toast({
        type: "error",
        title: "Upload Failed",
        description: "Please choose at least one valid file to upload.",
      });
      return;
    }

    try {
      setIsUploading(true);

      for (const item of items) {
        const finalDocName =
          item.docName.trim() || item.file.name.replace(/\.[^/.]+$/, "");
        const isCvUpload =
          uploadInitialDocName.trim().toUpperCase() === "CV" ||
          isCvEvidence({ name: finalDocName, evidenceType });

        const asset = await uploadFileMutation.mutateAsync({
          file: item.file,
          purpose: "evidence",
        });
        const assetId = asset?.assetId || (asset as any)?.id;
        if (!assetId)
          throw new Error("The file upload did not return an asset id.");

        if (isCvUpload) {
          await uploadApplicationCvMutation.mutateAsync(assetId);
        } else {
          await createGeneralEvidenceMutation.mutateAsync({
            documentName: finalDocName,
            evidenceType,
            assetId,
            unitIds: unitIds && unitIds.length > 0 ? unitIds : undefined,
          });
        }
      }

      const count = items.length;
      toast({
        type: "success",
        title: "Evidence Uploaded",
        description:
          count === 1
            ? `"${items[0].docName.trim() || items[0].file.name.replace(/\.[^/.]+$/, "")}" has been successfully added to your Evidence Vault.`
            : `${count} evidence documents have been successfully added to your Evidence Vault.`,
      });

      setIsUploadModalOpen(false);
    } catch (err: any) {
      toast({
        type: "error",
        title: "Upload Failed",
        description:
          err?.message || "Could not upload your evidence. Please try again.",
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
          description:
            err?.message || "Could not delete this evidence. Please try again.",
        });
      }
    }
  };

  return (
    <>
      <PortfolioVault
        viewer="candidate"
        applicationId={applicationId}
        application={apiApp}
        cvEvidence={cvEvidence}
        accordion={accordion}
        defaultOpenSection={defaultOpenSection}
        onPreview={(item) => setPreviewItem(item)}
        onViewApplicationForm={
          applicationId
            ? () =>
                router.push(
                  `/dashboard/applications/${applicationId}/application-form`,
                )
            : undefined
        }
        onUploadCv={() => {
          setUploadInitialDocName("CV");
          setIsUploadModalOpen(true);
        }}
        selfAssessmentCard={
          <CandidateSelfAssessmentCard
            applicationId={applicationId}
            isCompleted={isSelfAssessmentCompleted}
          />
        }
        thirdPartyReportCard={
          <CandidateThirdPartyReportCard applicationId={applicationId} />
        }
        evidenceList={
          <EvidenceSection
            evidences={otherEvidences}
            onPreview={(item) => setPreviewItem(item)}
            onDelete={(item) => {
              setItemToDelete(item);
              setIsDeleteModalOpen(true);
            }}
            onOpenUploadModal={() => {
              setUploadInitialDocName("");
              setIsUploadModalOpen(true);
            }}
          />
        }
      />

      <UploadEvidenceModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setUploadInitialDocName("");
        }}
        onUploadSubmit={handleUploadSubmit}
        isUploading={isUploading}
        tradeId={resolvedTradeId}
        allowedEvidenceTypes={allowedEvidenceTypes}
        isLoadingEvidenceTypes={isLoadingEvidenceTypes}
        hideEvidenceType={uploadInitialDocName.trim().toUpperCase() === "CV"}
        initialDocName={uploadInitialDocName}
        availableUnits={scopedUnits}
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
    </>
  );
};
