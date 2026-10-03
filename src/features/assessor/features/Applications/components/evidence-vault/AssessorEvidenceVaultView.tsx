"use client";

import { useToast } from "@/src/components/ui/toast";
import { StaffFacilitatorCard } from "@/src/features/shared/applications/components/StaffFacilitatorCard";
import {
  useGetApplicationById,
  useGetEvidenceVault,
  useGetSelfAssessment,
  useGetThirdPartyReport,
  useReviewApplication,
} from "@/src/features/shared/applications/hooks";
import { extractFacilitatorFromApplication } from "@/src/features/shared/applications/utils/facilitator";
import { PreviewEvidenceModal } from "@/src/features/shared/evidence-vault/components/PreviewEvidenceModal";
import type { EvidenceRecord } from "@/src/features/shared/evidence-vault/utils/evidenceConstants";
import React, { useEffect, useState } from "react";
import {
  AssessorCalendarWidget,
  AssessorUpcomingEventsWidget,
} from "../detail";
import { ConfirmMarkCompleteModal } from "./ConfirmMarkCompleteModal";
import { type EvidenceItem } from "./EvidenceItemCard";
import { EvidenceListSection } from "./EvidenceListSection";
import { FolderCompleteSuccessModal } from "./FolderCompleteSuccessModal";
import { ResourcesSection } from "./ResourcesSection";

interface AssessorEvidenceVaultViewProps {
  applicationId?: string;
  candidateName?: string;
  onBack: () => void;
  onViewApplicationForm?: () => void;
  onViewSelfAssessment?: () => void;
  onAllApprovedChange?: (allApproved: boolean) => void;
  onMarkAsComplete?: () => void;
  triggerMarkComplete?: boolean;
  onResetTriggerMarkComplete?: () => void;
  isStageAlreadyComplete?: boolean;
}

export const AssessorEvidenceVaultView: React.FC<
  AssessorEvidenceVaultViewProps
> = ({
  applicationId,
  candidateName = "Candidate",
  onBack,
  onViewApplicationForm,
  onViewSelfAssessment,
  onAllApprovedChange,
  onMarkAsComplete,
  triggerMarkComplete,
  onResetTriggerMarkComplete,
  isStageAlreadyComplete = false,
}) => {
  const { toast } = useToast();

  const { data: appDetail } = useGetApplicationById(applicationId || "");
  const { data: remoteEvidence, isLoading: isLoadingEvidence } =
    useGetEvidenceVault(applicationId || "");
  const { data: selfAssessmentData } = useGetSelfAssessment(
    applicationId || "",
  );
  const { data: thirdPartyReportData } = useGetThirdPartyReport(
    applicationId || "",
  );
  const reviewMutation = useReviewApplication();

  const activeFacilitator = React.useMemo(
    () => extractFacilitatorFromApplication(appDetail),
    [appDetail],
  );

  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);
  const [previewItem, setPreviewItem] = useState<EvidenceRecord | null>(null);

  useEffect(() => {
    const isGeneralEvidence = (e: any) =>
      e.kind === "general" ||
      (!e.kind && (e.documentName || e.name || e.assetId));

    const mapped = (remoteEvidence || [])
      .filter(isGeneralEvidence)
      .map((e: any) => {
        const docName = (
          e.documentName ||
          e.name ||
          e.title ||
          e.filename ||
          e.originalName ||
          ""
        ).trim();
        const feedback: string[] = (
          Array.isArray(e.feedback)
            ? e.feedback
            : e.feedback
              ? [e.feedback]
              : e.reviewComment
                ? [e.reviewComment]
                : Array.isArray(e.issues)
                  ? e.issues
                  : []
        ).filter(Boolean);
        const status = String(e.status || "");
        const isItemApproved =
          isStageAlreadyComplete || /approv|accepted|successful/i.test(status);
        const rawStatus = isItemApproved
          ? "Approved"
          : feedback.length > 0
            ? "Attention Required"
            : status || "Pending";
        return {
          id: e.id,
          name: docName,
          size: e.size || e.fileSize || "",
          status: rawStatus
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c: string) => c.toUpperCase()),
          url: e.url || e.dataUrl,
          dataUrl: e.dataUrl || e.url,
          assetId: e.assetId,
          mimeType: e.mimeType,
          evidenceType: e.evidenceType || e.type,
          feedback,
        };
      })
      .filter((e: any) => e.id || e.assetId || e.name);
    setEvidenceItems(mapped);
  }, [remoteEvidence, isStageAlreadyComplete]);

  const [isConfirmMarkCompleteOpen, setIsConfirmMarkCompleteOpen] =
    useState(false);
  const [isFolderCompleteSuccessOpen, setIsFolderCompleteSuccessOpen] =
    useState(false);

  const allApproved = !isStageAlreadyComplete && evidenceItems.length > 0;

  useEffect(() => {
    onAllApprovedChange?.(allApproved);
  }, [allApproved, onAllApprovedChange]);

  useEffect(() => {
    if (triggerMarkComplete) {
      setIsConfirmMarkCompleteOpen(true);
      onResetTriggerMarkComplete?.();
    }
  }, [triggerMarkComplete, onResetTriggerMarkComplete]);

  const handleViewEvidence = (item: EvidenceItem) => {
    setPreviewItem({
      id: item.id,
      name: item.name,
      size: item.size,
      status: item.status,
      statusBg: item.status.toLowerCase().includes("approv")
        ? "bg-[#D1FAE5]"
        : "bg-[#FEF3C7]",
      statusText: item.status.toLowerCase().includes("approv")
        ? "text-[#047857]"
        : "text-[#D97706]",
      issues: item.feedback,
      url: item.url || item.fileUrl || item.dataUrl,
      dataUrl: item.dataUrl || item.url || item.fileUrl,
      assetId: item.assetId,
      mimeType: item.mimeType,
      evidenceType: item.evidenceType,
    });
  };

  const handleConfirmMarkComplete = async () => {
    if (!applicationId) return;
    try {
      await reviewMutation.mutateAsync({
        id: applicationId,
        payload: {
          decision: "approve",
          stageKey: "folder_arrangement",
          feedback: "Folder arrangement marked complete by assessor.",
        },
      });
      setIsConfirmMarkCompleteOpen(false);
      setIsFolderCompleteSuccessOpen(true);
    } catch (err: any) {
      console.error("Mark folder complete error:", err);
      toast({
        type: "error",
        title: "Could Not Complete",
        description:
          err?.message ||
          "Failed to mark folder as complete. Please try again.",
      });
      setIsConfirmMarkCompleteOpen(false);
    }
  };

  const handleFolderCompleteFinished = () => {
    setIsFolderCompleteSuccessOpen(false);
    onMarkAsComplete?.();
  };

  const handleViewThirdPartyReport = () => {
    setPreviewItem({
      id: thirdPartyReportData?.assetId || "third-party-report",
      name: "Third Party Report",
      size: "PDF",
      status: "Submitted",
      statusBg: "bg-[#D1FAE5]",
      statusText: "text-[#047857]",
      url: (thirdPartyReportData as any)?.url || undefined,
      assetId: thirdPartyReportData?.assetId || undefined,
      evidenceType: "TPR",
    });
  };

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 flex flex-col gap-8">
          <ResourcesSection
            applicationId={applicationId}
            onViewApplicationForm={onViewApplicationForm}
            onViewSelfAssessment={onViewSelfAssessment}
            onViewThirdPartyReport={handleViewThirdPartyReport}
          />
          <EvidenceListSection
            items={evidenceItems}
            onView={handleViewEvidence}
            isLoading={isLoadingEvidence}
          />
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <AssessorCalendarWidget />
          <AssessorUpcomingEventsWidget applicationId={applicationId} />
          <StaffFacilitatorCard
            facilitator={activeFacilitator}
            tradeName={
              (appDetail as any)?.trade?.name ||
              (typeof (appDetail as any)?.trade === "string"
                ? (appDetail as any).trade
                : "")
            }
          />
        </div>
      </div>

      <PreviewEvidenceModal
        item={previewItem}
        applicationId={applicationId}
        onClose={() => setPreviewItem(null)}
      />

      <ConfirmMarkCompleteModal
        isOpen={isConfirmMarkCompleteOpen}
        onClose={() => setIsConfirmMarkCompleteOpen(false)}
        onConfirm={handleConfirmMarkComplete}
        isLoading={reviewMutation.isPending}
      />

      <FolderCompleteSuccessModal
        isOpen={isFolderCompleteSuccessOpen}
        onClose={handleFolderCompleteFinished}
      />
    </div>
  );
};
