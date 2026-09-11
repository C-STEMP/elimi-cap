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
  isApproved?: boolean;
}

export const CandidateApplicationFormView: React.FC<
  CandidateApplicationFormViewProps
> = ({ candidateName, trade, applicationDetail, isApproved }) => {
  const [feedbackComment, setFeedbackComment] = useState("");
  const [commentsList, setCommentsList] = useState<
    Array<{ text: string; date?: string; version?: number }>
  >([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const appFormStage = (applicationDetail as any)?.stages?.find(
    (s: any) =>
      s.stageKey === "application_form" ||
      s.stageKey === "application_review" ||
      s.stageKey === "application",
  );

  const statusStr = String(applicationDetail?.status || "").toLowerCase();
  const currentStage = String(applicationDetail?.currentStageKey || "").toLowerCase();

  const isApplicationApproved = Boolean(
    isApproved ??
      (statusStr === "approved" ||
        statusStr === "completed" ||
        statusStr === "successful" ||
        statusStr === "ongoing" ||
        appFormStage?.status === "successful" ||
        (appFormStage?.status as string) === "approved" ||
        (currentStage &&
          currentStage !== "application_form" &&
          currentStage !== "application_review" &&
          currentStage !== "draft" &&
          currentStage !== "submitted"))
  );

  const showFeedbackPanel = !isApplicationApproved;
  const showSidebar = showFeedbackPanel || commentsList.length > 0;

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
        <div
          id="printable-application-card"
          className={`${
            showSidebar ? "lg:col-span-8" : "lg:col-span-12 max-w-4xl mx-auto w-full"
          } flex flex-col gap-6 printable-application-card`}
        >
          <CandidateApplicationFormDocument
            candidateName={candidateName}
            trade={trade}
            applicationDetail={applicationDetail}
          />
        </div>

        {/* Feedback Sidebar Column */}
        {showSidebar && (
          <div className="lg:col-span-4 flex flex-col gap-6 no-print">
            {showFeedbackPanel && (
              <SendFeedbackPanel
                comment={feedbackComment}
                onCommentChange={setFeedbackComment}
                onSubmit={handleOpenConfirm}
              />
            )}
            {commentsList.length > 0 && (
              <PastCommentsPanel comments={commentsList} />
            )}
          </div>
        )}
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
