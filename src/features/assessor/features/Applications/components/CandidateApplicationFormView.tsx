"use client";

import React, { useState } from "react";
import {
  FormHeaderActions,
  CandidateApplicationFormDocument,
  SendFeedbackPanel,
  PastCommentsPanel,
  ConfirmFeedbackModal,
  FeedbackSuccessModal,
} from "./form";
import type { ApplicationDetail } from "@/src/features/shared/applications/api";

interface CandidateApplicationFormViewProps {
  candidateName: string;
  trade: string;
  applicationId?: string;
  applicationDetail?: ApplicationDetail | null;
}

export const CandidateApplicationFormView: React.FC<
  CandidateApplicationFormViewProps
> = ({ candidateName, trade, applicationDetail }) => {
  const [feedbackComment, setFeedbackComment] = useState("");
  const [commentsList, setCommentsList] = useState<
    Array<{ text: string; date?: string; version?: number }>
  >([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const handleOpenConfirm = () => {
    if (!feedbackComment.trim()) return;
    setIsConfirmModalOpen(true);
  };

  const handleConfirmSend = () => {
    setIsConfirmModalOpen(false);
    setCommentsList((prev) => [
      {
        text: feedbackComment.trim(),
        date: new Date().toLocaleDateString("en-GB"),
      },
      ...prev,
    ]);
    setFeedbackComment("");
    setIsSuccessModalOpen(true);
  };

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      {/* Top Header Download & Print Actions */}
      <FormHeaderActions
        formName={`Application_Form_${(candidateName || "Candidate").replace(/\s+/g, "_")}`}
        elementId="printable-application-card"
      />

      {/* Main Grid: Document on Left, Feedback Panels on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Document Column */}
        <div id="printable-application-card" className="lg:col-span-8 flex flex-col gap-6 printable-application-card">
          <CandidateApplicationFormDocument
            candidateName={candidateName}
            trade={trade}
            applicationDetail={applicationDetail}
          />
        </div>

        {/* Feedback Sidebar Column */}
        <div className="lg:col-span-4 flex flex-col gap-6 no-print">
          <SendFeedbackPanel
            comment={feedbackComment}
            onCommentChange={setFeedbackComment}
            onSubmit={handleOpenConfirm}
          />
          <PastCommentsPanel comments={commentsList} />
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmFeedbackModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmSend}
      />

      {/* Success Modal */}
      <FeedbackSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
      />
    </div>
  );
};
