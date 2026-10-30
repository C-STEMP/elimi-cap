"use client";

import { useToast } from "@/src/components/ui/toast";
import { StaffFacilitatorCard } from "@/src/features/shared/applications/components/StaffFacilitatorCard";
import {
  useGetApplicationById,
  useGetEvidenceVault,
  useGetSelfAssessment,
  useGetThirdPartyReport,
  useReviewApplication,
  useReviewGeneralEvidence,
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
  type PortfolioBadgeTone,
} from "@/src/features/shared/evidence-vault/components/portfolio";
import type { IqamFormSummaryItem } from "@/src/features/shared/applications/api/types";
import type { IqamToolId } from "@/src/features/assessor/features/iqam/types/iqam.types";
import { FinalPortfolioReportView } from "@/src/features/assessor/features/iqam/components/con06/FinalPortfolioReportView";
import { ObservationChecklistView } from "@/src/features/assessor/features/iqam/components/con05/ObservationChecklistView";
import React, { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import {
  AssessorCalendarWidget,
  AssessorUpcomingEventsWidget,
} from "../detail";
import { ConfirmMarkCompleteModal } from "./ConfirmMarkCompleteModal";
import { type EvidenceItem } from "./EvidenceItemCard";
import { EvidenceListSection } from "./EvidenceListSection";
import { FolderCompleteSuccessModal } from "./FolderCompleteSuccessModal";
import { AssessorThirdPartyReportCard } from "./AssessorThirdPartyReportCard";

const IQAM_TOOL_TITLES: Partial<Record<IqamToolId, string>> = {
  "CON/05/IQAM": "IV Observation & Questioning Checklist",
  "CON/06/IQAM": "Final Portfolio / Award Report Form",
};

function iqamBadge(
  forms: IqamFormSummaryItem[] | null | undefined,
  key: IqamFormSummaryItem["key"],
): { label: string; tone: PortfolioBadgeTone } {
  const status = forms?.find((f) => f.key === key)?.status?.toLowerCase() || "";
  if (status.includes("submit") || status.includes("complet")) {
    return { label: "Submitted", tone: "success" };
  }
  if (status) return { label: "In Progress", tone: "warning" };
  return { label: "Not Started", tone: "neutral" };
}

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
  isLeadPanelist?: boolean;
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
  isLeadPanelist,
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
  const reviewGeneralEvidenceMutation = useReviewGeneralEvidence(
    applicationId || "",
  );

  const activeFacilitator = React.useMemo(
    () => extractFacilitatorFromApplication(appDetail),
    [appDetail],
  );

  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);
  const [previewItem, setPreviewItem] = useState<EvidenceRecord | null>(null);
  const [openIqamTool, setOpenIqamTool] = useState<IqamToolId | null>(null);

  const iqamCard = (toolId: IqamToolId, key: IqamFormSummaryItem["key"]) => {
    const isSubmitted = Boolean(
      appDetail?.iqamForms?.find((f) => f.key === key)?.submittedAt ||
        appDetail?.iqamForms
          ?.find((f) => f.key === key)
          ?.status?.toLowerCase()
          .includes("submit")
    );
    return (
      <PortfolioDocCard
        title={IQAM_TOOL_TITLES[toolId] || toolId}
        subtitle={`Ref: ${toolId} · Filled by the quality assurer`}
        badge={iqamBadge(appDetail?.iqamForms, key)}
        actions={
          <PortfolioActionButton onClick={() => setOpenIqamTool(toolId)}>
            {isSubmitted ? "View" : "Fill Form"}
          </PortfolioActionButton>
        }
      />
    );
  };

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
        const status = String(e.reviewStatus || e.status || "");
        const isItemApproved =
          isStageAlreadyComplete || /approv|accepted|successful/i.test(status);
        const isItemRejected =
          !isItemApproved &&
          (/reject|attenti|declin|fail/i.test(status) || feedback.length > 0);
        const rawStatus = isItemApproved
          ? "Approved"
          : isItemRejected
            ? "Attention Required"
            : "Pending";
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

  // The CV is shown under "Candidate Profile", not in the evidences list.
  const cvItem = evidenceItems.find((item) => isCvEvidence(item));
  const otherEvidenceItems = cvItem
    ? evidenceItems.filter((item) => item !== cvItem)
    : evidenceItems;

  const allApproved =
    !isStageAlreadyComplete &&
    otherEvidenceItems.length > 0 &&
    otherEvidenceItems.every((item) =>
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
      const unitId = (matched as any)?.unitId || item.unitId;
      if (unitId && applicationId) {
        await reviewUnitEvidenceApi(applicationId, unitId, item.id, {
          decision: "approve",
        });
      } else if (applicationId && item.id) {
        await reviewGeneralEvidenceMutation.mutateAsync({
          evidenceId: item.id,
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
      const unitId = (matched as any)?.unitId || item.unitId;
      if (unitId && applicationId) {
        await reviewUnitEvidenceApi(applicationId, unitId, item.id, {
          decision: "reject",
          comment,
        });
      } else if (applicationId && item.id) {
        await reviewGeneralEvidenceMutation.mutateAsync({
          evidenceId: item.id,
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

  const cvEvidenceRecord: EvidenceRecord | null = appDetail?.cv?.assetId
    ? {
        id: appDetail.cv.assetId,
        name: cvItem?.name || "Candidate CV / Resume",
        size: cvItem?.size || "Uploaded document",
        status: "Uploaded",
        statusBg: "bg-[#D1FAE5]",
        statusText: "text-[#047857]",
        assetId: appDetail.cv.assetId,
        url: appDetail.cv.url || cvItem?.url,
        dataUrl: appDetail.cv.url || cvItem?.dataUrl,
        evidenceType: "CV",
      }
    : cvItem
      ? toPreviewRecord(cvItem)
      : null;

  const handleConfirmMarkComplete = async () => {
    if (!applicationId) return;
    if (!allApproved) {
      toast({
        type: "error",
        title: "Evidence Review Incomplete",
        description:
          "All general evidence files must be approved before passing the folder arrangement stage.",
      });
      setIsConfirmMarkCompleteOpen(false);
      return;
    }
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
            cvEvidence={cvEvidenceRecord}
            isLeadPanelist={isLeadPanelist}
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
            extraReportCards={iqamCard("CON/05/IQAM", "assessor_outcomes")}
            verificationReportCard={iqamCard("CON/06/IQAM", "final_portfolio")}
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

      {openIqamTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs select-text">
          <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100">
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-[#F8F9FA] shrink-0">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                  Internal Quality Assurance
                </span>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  {IQAM_TOOL_TITLES[openIqamTool] || openIqamTool}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpenIqamTool(null)}
                aria-label="Close"
                className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {openIqamTool === "CON/06/IQAM" ? (
                <FinalPortfolioReportView
                  applicationId={applicationId || ""}
                  candidateName={candidateName}
                  onBack={() => setOpenIqamTool(null)}
                />
              ) : openIqamTool === "CON/05/IQAM" ? (
                <ObservationChecklistView
                  applicationId={applicationId || ""}
                  candidateName={candidateName}
                  onBack={() => setOpenIqamTool(null)}
                />
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
