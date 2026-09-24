"use client";

import React, { useState, useEffect } from "react";
import { ResourcesSection } from "./ResourcesSection";
import { EvidenceListSection } from "./EvidenceListSection";
import { type EvidenceItem } from "./EvidenceItemCard";
import { ConfirmMarkCompleteModal } from "./ConfirmMarkCompleteModal";
import { FolderCompleteSuccessModal } from "./FolderCompleteSuccessModal";
import {
  AssessorCalendarWidget,
  AssessorUpcomingEventsWidget,
} from "../detail";
import { PreviewEvidenceModal } from "@/src/features/shared/evidence-vault/components/PreviewEvidenceModal";
import type { EvidenceRecord } from "@/src/features/shared/evidence-vault/utils/evidenceConstants";
import { useToast } from "@/src/components/ui/toast";

import { useGetEvidenceVault, useGetSelfAssessment, useGetThirdPartyReport, useReviewApplication } from "@/src/features/shared/applications/hooks";

interface AssessorEvidenceVaultViewProps {
  applicationId?: string;
  candidateName?: string;
  onBack: () => void;
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
  onViewSelfAssessment,
  onAllApprovedChange,
  onMarkAsComplete,
  triggerMarkComplete,
  onResetTriggerMarkComplete,
  isStageAlreadyComplete = false,
}) => {
  const { toast } = useToast();

  const { data: remoteEvidence, isLoading: isLoadingEvidence } = useGetEvidenceVault(applicationId || "");
  const { data: selfAssessmentData } = useGetSelfAssessment(applicationId || "");
  const { data: thirdPartyReportData } = useGetThirdPartyReport(applicationId || "");
  const reviewMutation = useReviewApplication();

  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);
  const [previewItem, setPreviewItem] = useState<EvidenceRecord | null>(null);

  useEffect(() => {
    // Self-assessment and third-party report records are structured form
    // data, not uploaded files — they have no resolvable URL/assetId and no
    // matching GeneralEvidence record, so previewing/approving them here
    // always fails. They're already surfaced via the Resources section above.
    const isGeneralEvidence = (e: any) =>
      e.kind === "general" ||
      (!e.kind && (e.documentName || e.name || e.assetId));

    const mapped = (remoteEvidence || [])
      .filter(isGeneralEvidence)
      .map((e: any) => {
        const docName = (
          e.documentName || e.name || e.title || e.filename || e.originalName || ""
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
          isStageAlreadyComplete ||
          /approv|accepted|successful/i.test(status);
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

  // Mark Folder As Complete Flow State
  const [isConfirmMarkCompleteOpen, setIsConfirmMarkCompleteOpen] =
    useState(false);
  const [isFolderCompleteSuccessOpen, setIsFolderCompleteSuccessOpen] =
    useState(false);

  // The backend reviews the folder as a whole (POST /review with
  // folder_arrangement); there is no per-item approval, so the folder can be
  // marked complete once the candidate has uploaded evidence.
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

  // View Evidence Preview
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

  // Handle Mark As Complete Flow
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
      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Resources and Evidence Items */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <ResourcesSection
            applicationId={applicationId}
            onViewSelfAssessment={onViewSelfAssessment}
            onViewThirdPartyReport={handleViewThirdPartyReport}
          />
          <EvidenceListSection
            items={evidenceItems}
            onView={handleViewEvidence}
            isLoading={isLoadingEvidence}
          />
        </div>

        {/* Right Column: Calendar and Events Widgets */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <AssessorCalendarWidget />
          <AssessorUpcomingEventsWidget applicationId={applicationId} />
        </div>
      </div>

      {/* Document Preview Modal */}
      <PreviewEvidenceModal
        item={previewItem}
        applicationId={applicationId}
        onClose={() => setPreviewItem(null)}
      />

      {/* --- Mark Folder As Complete Modals --- */}
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
