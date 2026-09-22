"use client";

import React, { useState, useEffect } from "react";
import { ResourcesSection } from "./ResourcesSection";
import { EvidenceListSection } from "./EvidenceListSection";
import { type EvidenceItem } from "./EvidenceItemCard";
import { SendEvidenceFeedbackModal } from "./SendEvidenceFeedbackModal";
import { ConfirmApproveModal } from "./ConfirmApproveModal";
import { ApproveSuccessModal } from "./ApproveSuccessModal";
import { ConfirmMarkCompleteModal } from "./ConfirmMarkCompleteModal";
import { FolderCompleteSuccessModal } from "./FolderCompleteSuccessModal";
import {
  AssessorCalendarWidget,
  AssessorUpcomingEventsWidget,
} from "../detail";
import {
  ConfirmFeedbackModal,
  FeedbackSuccessModal,
} from "../form";
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
  const [isApproving, setIsApproving] = useState<boolean>(false);

  useEffect(() => {
    let localItems: any[] = [];
    let storedFeedbackMap: Record<string, string[]> = {};
    let storedApprovedMap: Record<string, boolean> = {};
    let isVaultSubmitted = false;
    if (typeof window !== "undefined" && applicationId) {
      try {
        const stored = localStorage.getItem(
          `elimi_evidence_vault_${applicationId}`,
        );
        localItems = stored ? JSON.parse(stored) : [];

        const submitted = localStorage.getItem(
          `elimi_evidence_vault_submitted_${applicationId}`,
        );
        isVaultSubmitted = submitted === "true";

        const storedFb = localStorage.getItem(
          `elimi_evidence_feedback_${applicationId}`,
        );
        storedFeedbackMap = storedFb ? JSON.parse(storedFb) : {};

        const storedAppr = localStorage.getItem(
          `elimi_evidence_approved_${applicationId}`,
        );
        storedApprovedMap = storedAppr ? JSON.parse(storedAppr) : {};
      } catch (e) {
        console.error("Storage read error:", e);
      }
    }

    const combined: any[] = [];
    const seenNames = new Set<string>();
    const seenIds = new Set<string>();
    const seenAssetIds = new Set<string>();

    // Self-assessment and third-party report records are structured form
    // data, not uploaded files — they have no resolvable URL/assetId and no
    // matching GeneralEvidence record, so previewing/approving them here
    // always fails. They're already surfaced via the Resources section above.
    const isGeneralEvidence = (e: any) =>
      e.kind === "general" ||
      (!e.kind && (e.documentName || e.name || e.assetId));

    (remoteEvidence || []).filter(isGeneralEvidence).forEach((e: any) => {
      const docName = (
        e.documentName ||
        e.name ||
        e.title ||
        e.filename ||
        e.originalName ||
        ""
      ).trim();
      if (!docName && !e.id && !e.assetId) return;
      const norm = docName.toLowerCase();
      if (norm) seenNames.add(norm);
      if (e.id) seenIds.add(e.id);
      if (e.assetId) seenAssetIds.add(e.assetId);
      combined.push({ ...e, documentName: docName });
    });

    localItems.filter(isGeneralEvidence).forEach((e: any) => {
      const docName = (
        e.documentName ||
        e.name ||
        e.title ||
        e.filename ||
        e.originalName ||
        ""
      ).trim();
      if (!docName && !e.id && !e.assetId) return;
      const norm = docName.toLowerCase();
      if (
        (norm && seenNames.has(norm)) ||
        (e.id && seenIds.has(e.id)) ||
        (e.assetId && seenAssetIds.has(e.assetId))
      ) {
        return;
      }
      if (norm) seenNames.add(norm);
      if (e.id) seenIds.add(e.id);
      if (e.assetId) seenAssetIds.add(e.assetId);
      combined.push({ ...e, documentName: docName });
    });

    const mapped = combined.map((e: any, idx: number) => {
      const docName =
        e.documentName ||
        e.name ||
        e.title ||
        e.filename ||
        e.originalName ||
        `Evidence Item ${idx + 1}`;

      const itemKey = e.id || e.assetId || docName;
      const normDocName = docName.toLowerCase();

      const extraFeedback =
        storedFeedbackMap[itemKey] ||
        storedFeedbackMap[docName] ||
        storedFeedbackMap[normDocName] ||
        (e.assetId ? storedFeedbackMap[e.assetId] : null) ||
        [];

      const initialFeedback = Array.isArray(e.feedback)
        ? e.feedback
        : e.feedback
          ? [e.feedback]
          : e.reviewComment
            ? [e.reviewComment]
            : Array.isArray(e.issues)
              ? e.issues
              : [];

      const combinedFeedback = Array.from(
        new Set([...initialFeedback, ...(Array.isArray(extraFeedback) ? extraFeedback : [extraFeedback])]),
      ).filter(Boolean);

      const isApprovedLocally = Boolean(
        storedApprovedMap[itemKey] ||
        storedApprovedMap[docName] ||
        storedApprovedMap[normDocName] ||
        (e.assetId && storedApprovedMap[e.assetId]) ||
        (e.id && storedApprovedMap[e.id]),
      );

      const isItemApproved =
        isStageAlreadyComplete ||
        isApprovedLocally ||
        (e.status &&
          (e.status.toLowerCase().includes("approv") ||
            e.status.toLowerCase() === "accepted" ||
            e.status.toLowerCase() === "successful"));

      // Format backend status directly, no hardcoded fallbacks!
      const defaultStatus = isVaultSubmitted ? "Submitted" : "Pending";
      const rawStatus = isItemApproved
        ? "Approved"
        : combinedFeedback.length > 0
          ? "Attention Required"
          : (e.status || defaultStatus);
      const formattedStatus = rawStatus
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c: string) => c.toUpperCase());

      return {
        id: e.id || `ev-${idx}`,
        name: docName,
        size: e.size || e.fileSize || "5 MB",
        status: formattedStatus,
        url: e.url || e.dataUrl,
        dataUrl: e.dataUrl || e.url,
        assetId: e.assetId,
        mimeType: e.mimeType,
        evidenceType: e.evidenceType || e.type,
        feedback: combinedFeedback,
      };
    });
    setEvidenceItems(mapped);
  }, [remoteEvidence, applicationId, isStageAlreadyComplete]);

  // Send Feedback Flow State
  const [selectedItemForFeedback, setSelectedItemForFeedback] =
    useState<EvidenceItem | null>(null);
  const [pendingFeedbackText, setPendingFeedbackText] = useState("");
  const [isSendFeedbackModalOpen, setIsSendFeedbackModalOpen] = useState(false);
  const [isConfirmFeedbackModalOpen, setIsConfirmFeedbackModalOpen] =
    useState(false);
  const [isFeedbackSuccessModalOpen, setIsFeedbackSuccessModalOpen] =
    useState(false);

  // Approve Flow State
  const [selectedItemForApprove, setSelectedItemForApprove] =
    useState<EvidenceItem | null>(null);
  const [isConfirmApproveModalOpen, setIsConfirmApproveModalOpen] =
    useState(false);
  const [isApproveSuccessModalOpen, setIsApproveSuccessModalOpen] =
    useState(false);

  // Mark Folder As Complete Flow State
  const [isConfirmMarkCompleteOpen, setIsConfirmMarkCompleteOpen] =
    useState(false);
  const [isFolderCompleteSuccessOpen, setIsFolderCompleteSuccessOpen] =
    useState(false);

  const allApproved =
    !isStageAlreadyComplete &&
    evidenceItems.length > 0 &&
    evidenceItems.every((item) =>
      item.status?.toLowerCase().includes("approv"),
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

  // Handle Feedback Flow
  const handleOpenSendFeedback = (item: EvidenceItem) => {
    setSelectedItemForFeedback(item);
    setIsSendFeedbackModalOpen(true);
  };

  const handleFeedbackFormSubmit = (comment: string) => {
    setPendingFeedbackText(comment);
    setIsSendFeedbackModalOpen(false);
    setIsConfirmFeedbackModalOpen(true);
  };

  const handleConfirmFeedback = async () => {
    if (!selectedItemForFeedback || !pendingFeedbackText.trim()) return;

    const feedbackText = pendingFeedbackText.trim();
    const item = selectedItemForFeedback;

    try {
      const targetId = item.id;
      const targetAssetId = item.assetId;

      // Update local state in assessor view
      setEvidenceItems((prev) =>
        prev.map((e) => {
          const isMatch =
            (targetId && e.id === targetId) ||
            (targetAssetId && e.assetId === targetAssetId) ||
            (!targetId && !targetAssetId && e.name === item.name);
          return isMatch
            ? {
                ...e,
                status: "Attention Required",
                feedback: [feedbackText, ...(e.feedback || [])],
              }
            : e;
        }),
      );

      // Save to localStorage for candidate to see immediately
      if (typeof window !== "undefined" && applicationId) {
        try {
          const vaultKey = `elimi_evidence_vault_${applicationId}`;
          const storedVault = localStorage.getItem(vaultKey);
          let parsedVault = storedVault ? JSON.parse(storedVault) : [];

          let found = false;
          parsedVault = parsedVault.map((e: any) => {
            if (
              e.id === item.id ||
              e.documentName === item.name ||
              e.name === item.name ||
              (item.assetId && e.assetId === item.assetId)
            ) {
              found = true;
              return {
                ...e,
                status: "Attention Required",
                issues: [feedbackText, ...(e.issues || [])],
                feedback: feedbackText,
              };
            }
            return e;
          });

          if (!found) {
            parsedVault.push({
              id: item.id,
              name: item.name,
              documentName: item.name,
              size: item.size,
              status: "Attention Required",
              issues: [feedbackText],
              feedback: feedbackText,
              assetId: item.assetId,
              url: item.url || item.fileUrl,
            });
          }

          localStorage.setItem(vaultKey, JSON.stringify(parsedVault));

          // Also remove approval for this item since it now has feedback
          const apprKey = `elimi_evidence_approved_${applicationId}`;
          const storedAppr = localStorage.getItem(apprKey);
          if (storedAppr) {
            const parsedAppr = JSON.parse(storedAppr);
            if (targetId) delete parsedAppr[targetId];
            if (targetAssetId) delete parsedAppr[targetAssetId];
            if (item.name) {
              delete parsedAppr[item.name];
              delete parsedAppr[item.name.toLowerCase()];
            }
            localStorage.setItem(apprKey, JSON.stringify(parsedAppr));
          }

          // Also save in dedicated feedback mapping
          const fbKey = `elimi_evidence_feedback_${applicationId}`;
          const storedFb = localStorage.getItem(fbKey);
          const parsedFb = storedFb ? JSON.parse(storedFb) : {};
          const itemKey = item.id || item.assetId || item.name;
          const existingList = Array.isArray(parsedFb[itemKey])
            ? parsedFb[itemKey]
            : [];
          parsedFb[itemKey] = [feedbackText, ...existingList];
          parsedFb[item.name] = [feedbackText, ...(parsedFb[item.name] || [])];
          localStorage.setItem(fbKey, JSON.stringify(parsedFb));
        } catch (storageErr) {
          console.error("Error saving feedback to storage:", storageErr);
        }
      }

      setIsConfirmFeedbackModalOpen(false);
      setIsFeedbackSuccessModalOpen(true);
      setSelectedItemForFeedback(null);
      setPendingFeedbackText("");
    } catch (err: any) {
      console.error("Feedback submit error:", err);
      toast({
        type: "error",
        title: "Feedback Error",
        description:
          err?.message || "Failed to send feedback. Please try again.",
      });
      setIsConfirmFeedbackModalOpen(false);
    }
  };

  // Handle Approve Flow
  const handleOpenApprove = (item: EvidenceItem) => {
    setSelectedItemForApprove(item);
    setIsConfirmApproveModalOpen(true);
  };

  const handleApproveEvidence = async (
    item: EvidenceItem | EvidenceRecord,
  ) => {
    setIsApproving(true);
    try {
      const targetId = item.id;
      const targetAssetId = item.assetId;
      const targetName = (item.name || "").trim();
      const normTargetName = targetName.toLowerCase();

      setEvidenceItems((prev) =>
        prev.map((e) => {
          const isMatch =
            (targetId && e.id === targetId) ||
            (targetAssetId && e.assetId === targetAssetId) ||
            (e.name && e.name.trim().toLowerCase() === normTargetName);
          return isMatch ? { ...e, status: "Approved", feedback: [] } : e;
        }),
      );

      if (
        previewItem &&
        ((targetId && previewItem.id === targetId) ||
          (targetAssetId && previewItem.assetId === targetAssetId) ||
          (previewItem.name && previewItem.name.trim().toLowerCase() === normTargetName))
      ) {
        setPreviewItem((prev) =>
          prev
            ? {
                ...prev,
                status: "Approved",
                statusBg: "bg-[#D1FAE5]",
                statusText: "text-[#047857]",
                issues: [],
              }
            : null,
        );
      }

      if (typeof window !== "undefined" && applicationId) {
        try {
          // 1. Save to dedicated approval map so it survives page refresh
          const apprKey = `elimi_evidence_approved_${applicationId}`;
          const storedAppr = localStorage.getItem(apprKey);
          const parsedAppr = storedAppr ? JSON.parse(storedAppr) : {};
          if (targetId) parsedAppr[targetId] = true;
          if (targetAssetId) parsedAppr[targetAssetId] = true;
          if (targetName) parsedAppr[targetName] = true;
          if (normTargetName) parsedAppr[normTargetName] = true;
          localStorage.setItem(apprKey, JSON.stringify(parsedAppr));

          // 2. Remove any issues / feedback from feedback map
          const fbKey = `elimi_evidence_feedback_${applicationId}`;
          const storedFb = localStorage.getItem(fbKey);
          if (storedFb) {
            const parsedFb = JSON.parse(storedFb);
            if (targetId) delete parsedFb[targetId];
            delete parsedFb[targetName];
            delete parsedFb[normTargetName];
            if (targetAssetId) delete parsedFb[targetAssetId];
            localStorage.setItem(fbKey, JSON.stringify(parsedFb));
          }

          // 3. Update elimi_evidence_vault_${applicationId}
          const vaultKey = `elimi_evidence_vault_${applicationId}`;
          const storedVault = localStorage.getItem(vaultKey);
          let parsedVault = storedVault ? JSON.parse(storedVault) : [];
          let found = false;
          parsedVault = parsedVault.map((e: any) => {
            const eName = (e.name || e.documentName || "").trim().toLowerCase();
            const isMatch =
              (targetId && e.id === targetId) ||
              (targetAssetId && e.assetId === targetAssetId) ||
              (eName && eName === normTargetName);
            if (isMatch) {
              found = true;
              return { ...e, status: "Approved", issues: [], feedback: null };
            }
            return e;
          });
          if (!found) {
            parsedVault.push({
              id: targetId,
              name: targetName,
              documentName: targetName,
              size: item.size,
              status: "Approved",
              issues: [],
              feedback: null,
              assetId: targetAssetId,
              url: (item as any).url || (item as any).fileUrl,
            });
          }
          localStorage.setItem(vaultKey, JSON.stringify(parsedVault));
        } catch (e) {
          console.error("Local storage error on approve:", e);
        }
      }

      toast({
        type: "success",
        title: "Evidence Approved",
        description: `Successfully approved "${item.name}".`,
      });
      setIsConfirmApproveModalOpen(false);
      setSelectedItemForApprove(null);
    } catch (err: any) {
      console.error("Approve evidence error:", err);
      toast({
        type: "error",
        title: "Approval Failed",
        description: err?.message || "Failed to approve evidence.",
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleConfirmApprove = () => {
    if (selectedItemForApprove) {
      handleApproveEvidence(selectedItemForApprove);
    }
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
            onSendFeedback={handleOpenSendFeedback}
            onApprove={handleOpenApprove}
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
        onApprove={handleApproveEvidence}
        isApproving={isApproving}
      />

      {/* --- Feedback Modals --- */}
      <SendEvidenceFeedbackModal
        isOpen={isSendFeedbackModalOpen}
        item={selectedItemForFeedback}
        onClose={() => {
          setIsSendFeedbackModalOpen(false);
          setSelectedItemForFeedback(null);
        }}
        onSubmit={handleFeedbackFormSubmit}
      />

      <ConfirmFeedbackModal
        isOpen={isConfirmFeedbackModalOpen}
        onClose={() => setIsConfirmFeedbackModalOpen(false)}
        onConfirm={handleConfirmFeedback}
      />

      <FeedbackSuccessModal
        isOpen={isFeedbackSuccessModalOpen}
        onClose={() => setIsFeedbackSuccessModalOpen(false)}
      />

      {/* --- Approve Modals --- */}
      <ConfirmApproveModal
        isOpen={isConfirmApproveModalOpen}
        onClose={() => {
          setIsConfirmApproveModalOpen(false);
          setSelectedItemForApprove(null);
        }}
        onConfirm={handleConfirmApprove}
      />

      <ApproveSuccessModal
        isOpen={isApproveSuccessModalOpen}
        onClose={() => setIsApproveSuccessModalOpen(false)}
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
