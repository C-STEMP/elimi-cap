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
}) => {
  const { toast } = useToast();

  const { data: remoteEvidence } = useGetEvidenceVault(applicationId || "");
  const { data: selfAssessmentData } = useGetSelfAssessment(applicationId || "");
  const { data: thirdPartyReportData } = useGetThirdPartyReport(applicationId || "");
  const reviewMutation = useReviewApplication();

  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);

  useEffect(() => {
    let localItems: any[] = [];
    if (typeof window !== "undefined" && applicationId) {
      try {
        const stored = localStorage.getItem(
          `elimi_evidence_vault_${applicationId}`,
        );
        localItems = stored ? JSON.parse(stored) : [];
      } catch (e) {
        console.error("Storage read error:", e);
      }
    }

    const combined: any[] = [];
    const seen = new Set<string>();

    (remoteEvidence || []).forEach((e: any) => {
      const docName =
        e.documentName ||
        e.name ||
        e.title ||
        e.filename ||
        e.originalName;
      const key = e.id || e.assetId || docName;
      if (key && !seen.has(key)) {
        seen.add(key);
        combined.push({ ...e, documentName: docName });
      }
    });

    localItems.forEach((e: any) => {
      const docName =
        e.documentName ||
        e.name ||
        e.title ||
        e.filename ||
        e.originalName;
      const key = e.id || e.assetId || docName;
      if (key && !seen.has(key)) {
        seen.add(key);
        combined.push({ ...e, documentName: docName });
      }
    });

    if (combined.length > 0) {
      const mapped = combined.map((e: any, idx: number) => ({
        id: e.id || `ev-${idx}`,
        name:
          e.documentName ||
          e.name ||
          e.title ||
          e.filename ||
          e.originalName ||
          (e.kind === "self_assessment"
            ? "Self-Assessment Document"
            : e.kind === "third_party_report"
              ? "Third Party Report"
              : `Evidence Item ${idx + 1}`),
        size: e.size || e.fileSize || "5 MB",
        status:
          e.status === "Approved" || e.status === "approved"
            ? ("Approved" as const)
            : ("Pending" as const),
      }));
      setEvidenceItems(mapped);
    }
  }, [remoteEvidence, applicationId]);

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
    evidenceItems.length > 0 &&
    evidenceItems.every((item) => item.status === "Approved");

  useEffect(() => {
    onAllApprovedChange?.(allApproved);
  }, [allApproved, onAllApprovedChange]);

  useEffect(() => {
    if (triggerMarkComplete) {
      setIsConfirmMarkCompleteOpen(true);
      onResetTriggerMarkComplete?.();
    }
  }, [triggerMarkComplete, onResetTriggerMarkComplete]);

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

  const handleConfirmFeedback = () => {
    if (selectedItemForFeedback && pendingFeedbackText) {
      setEvidenceItems((prev) =>
        prev.map((e) =>
          e.id === selectedItemForFeedback.id
            ? {
                ...e,
                status: "Pending",
                feedback: [pendingFeedbackText, ...(e.feedback || [])],
              }
            : e,
        ),
      );
    }
    setIsConfirmFeedbackModalOpen(false);
    setIsFeedbackSuccessModalOpen(true);
    setSelectedItemForFeedback(null);
    setPendingFeedbackText("");
  };

  // Handle Approve Flow
  const handleOpenApprove = (item: EvidenceItem) => {
    setSelectedItemForApprove(item);
    setIsConfirmApproveModalOpen(true);
  };

  const handleConfirmApprove = () => {
    if (selectedItemForApprove) {
      setEvidenceItems((prev) =>
        prev.map((e) =>
          e.id === selectedItemForApprove.id
            ? { ...e, status: "Approved", feedback: undefined }
            : e,
        ),
      );
    }
    setIsConfirmApproveModalOpen(false);
    setIsApproveSuccessModalOpen(true);
    setSelectedItemForApprove(null);
  };

  // Handle Mark As Complete Flow
  const handleConfirmMarkComplete = () => {
    setIsConfirmMarkCompleteOpen(false);
    setIsFolderCompleteSuccessOpen(true);
  };

  const handleFolderCompleteFinished = () => {
    setIsFolderCompleteSuccessOpen(false);
    onMarkAsComplete?.();
  };

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Resources and Evidence Items */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <ResourcesSection onViewSelfAssessment={onViewSelfAssessment} />
          <EvidenceListSection
            items={evidenceItems}
            onSendFeedback={handleOpenSendFeedback}
            onApprove={handleOpenApprove}
          />
        </div>

        {/* Right Column: Calendar and Events Widgets */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <AssessorCalendarWidget />
          <AssessorUpcomingEventsWidget />
        </div>
      </div>

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
      />

      <FolderCompleteSuccessModal
        isOpen={isFolderCompleteSuccessOpen}
        onClose={handleFolderCompleteFinished}
      />
    </div>
  );
};
