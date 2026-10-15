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
import { reviewUnitEvidenceApi } from "@/src/features/shared/applications/api/nsq.api";
import { PreviewEvidenceModal } from "@/src/features/shared/evidence-vault/components/PreviewEvidenceModal";
import {
  isCvEvidence,
  type EvidenceRecord,
} from "@/src/features/shared/evidence-vault/utils/evidenceConstants";
import {
  PortfolioActionButton,
  PortfolioDocCard,
  PortfolioVault,
} from "@/src/features/shared/evidence-vault/components/portfolio";
import React, { useEffect, useState } from "react";
import {
  AssessorCalendarWidget,
  AssessorUpcomingEventsWidget,
} from "../detail";
import { ConfirmMarkCompleteModal } from "./ConfirmMarkCompleteModal";
import { type EvidenceItem } from "./EvidenceItemCard";
import { EvidenceListSection } from "./EvidenceListSection";
import { FolderCompleteSuccessModal } from "./FolderCompleteSuccessModal";
import { AssessorThirdPartyReportCard } from "./AssessorThirdPartyReportCard";

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
          unitId: e.unitId,
        };
      })
      .filter((e: any) => e.id || e.assetId || e.name);
    setEvidenceItems(mapped);
  }, [remoteEvidence, isStageAlreadyComplete]);

  const [isConfirmMarkCompleteOpen, setIsConfirmMarkCompleteOpen] =
    useState(false);
  const [isFolderCompleteSuccessOpen, setIsFolderCompleteSuccessOpen] =
    useState(false);
  const [isApprovingEvidence, setIsApprovingEvidence] = useState(false);
  const [isRejectingEvidence, setIsRejectingEvidence] = useState(false);

  const allApproved =
    !isStageAlreadyComplete &&
    evidenceItems.length > 0 &&
    evidenceItems.every((item) =>
      item.status.toLowerCase().includes("approv"),
    );

  useEffect(() => {
    onAllApprovedChange?.(allApproved);
  }, [allApproved, onAllApprovedChange]);

  useEffect(() => {
    if (triggerMarkComplete) {
      setIsConfirmMarkCompleteOpen(true);
      onResetTriggerMarkComplete?.();
    }
  }, [triggerMarkComplete, onResetTriggerMarkComplete]);

  const toPreviewRecord = (item: EvidenceItem): EvidenceRecord => ({
    id: item.id,
    name: item.name,
    size: item.size,
    status: item.status,
    statusBg: item.status.toLowerCase().includes("approv")
      ? "bg-[#D1FAE5]"
      : item.status.toLowerCase().includes("attenti") ||
        item.status.toLowerCase().includes("reject")
      ? "bg-[#FEE2E2]"
      : "bg-[#FEF3C7]",
    statusText: item.status.toLowerCase().includes("approv")
      ? "text-[#047857]"
      : item.status.toLowerCase().includes("attenti") ||
        item.status.toLowerCase().includes("reject")
      ? "text-[#B91C1C]"
      : "text-[#D97706]",
    issues: item.feedback,
    url: item.url || item.fileUrl || item.dataUrl,
    dataUrl: item.dataUrl || item.url || item.fileUrl,
    assetId: item.assetId,
    mimeType: item.mimeType,
    evidenceType: item.evidenceType,
    unitId: item.unitId,
  });

  const handleApproveEvidence = async (item: EvidenceRecord) => {
    setIsApprovingEvidence(true);
    try {
      const matched = evidenceItems.find((e) => e.id === item.id);
      const unitId = (matched as any)?.unitId;
      if (unitId && applicationId) {
        await reviewUnitEvidenceApi(applicationId, unitId, item.id, {
          decision: "approve",
        });
      }
      setEvidenceItems((prev) =>
        prev.map((it) =>
          it.id === item.id ? { ...it, status: "Approved", feedback: [] } : it,
        ),
      );
      if (previewItem && previewItem.id === item.id) {
        setPreviewItem({
          ...previewItem,
          status: "Approved",
          statusBg: "bg-[#D1FAE5]",
          statusText: "text-[#047857]",
          issues: [],
        });
      }
      toast({
        type: "success",
        title: "Evidence Approved",
        description: `"${item.name}" has been approved.`,
      });
    } catch (err: any) {
      toast({
        type: "error",
        title: "Approval Failed",
        description: err?.message || "Failed to approve evidence.",
      });
    } finally {
      setIsApprovingEvidence(false);
    }
  };

  const handleRejectEvidence = async (item: EvidenceRecord, comment: string) => {
    setIsRejectingEvidence(true);
    try {
      const matched = evidenceItems.find((e) => e.id === item.id);
      const unitId = (matched as any)?.unitId;
      if (unitId && applicationId) {
        await reviewUnitEvidenceApi(applicationId, unitId, item.id, {
          decision: "reject",
          comment,
        });
      }
      setEvidenceItems((prev) =>
        prev.map((it) =>
          it.id === item.id
            ? { ...it, status: "Attention Required", feedback: [comment] }
            : it,
        ),
      );
      if (previewItem && previewItem.id === item.id) {
        setPreviewItem({
          ...previewItem,
          status: "Attention Required",
          statusBg: "bg-[#FEE2E2]",
          statusText: "text-[#B91C1C]",
          issues: [comment],
        });
      }
      toast({
        type: "info",
        title: "Evidence Needs Attention",
        description: `"${item.name}" marked as needing attention.`,
      });
    } catch (err: any) {
      toast({
        type: "error",
        title: "Rejection Failed",
        description: err?.message || "Failed to reject evidence.",
      });
    } finally {
      setIsRejectingEvidence(false);
    }
  };

  const handleViewEvidence = (item: EvidenceItem) => {
    setPreviewItem(toPreviewRecord(item));
  };

  // The CV is shown under "Candidate Profile", not in the evidences list.
  const cvItem = evidenceItems.find((item) => isCvEvidence(item));
  const otherEvidenceItems = cvItem
    ? evidenceItems.filter((item) => item !== cvItem)
    : evidenceItems;

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
          <PortfolioVault
            viewer="assessor"
            applicationId={applicationId || ""}
            application={appDetail}
            cvEvidence={cvItem ? toPreviewRecord(cvItem) : null}
            onPreview={setPreviewItem}
            onViewApplicationForm={onViewApplicationForm}
            selfAssessmentCard={
              <PortfolioDocCard
                title="Self-Assessment of Competency Form"
                subtitle="Filled by the candidate"
                badge={
                  selfAssessmentData?.submittedAt
                    ? { label: "Submitted", tone: "success" }
                    : { label: "Not Submitted", tone: "neutral" }
                }
                actions={
                  onViewSelfAssessment && (
                    <PortfolioActionButton onClick={onViewSelfAssessment}>View</PortfolioActionButton>
                  )
                }
              />
            }
            thirdPartyReportCard={
              <AssessorThirdPartyReportCard
                applicationId={applicationId}
                onView={handleViewThirdPartyReport}
              />
            }
            evidenceList={
              <EvidenceListSection
                items={otherEvidenceItems}
                onView={handleViewEvidence}
                isLoading={isLoadingEvidence}
              />
            }
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
        onApprove={handleApproveEvidence}
        isApproving={isApprovingEvidence}
        onReject={handleRejectEvidence}
        isRejecting={isRejectingEvidence}
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
