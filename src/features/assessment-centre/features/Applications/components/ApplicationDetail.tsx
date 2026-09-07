"use client";

import React from "react";
import { Loader } from "@/src/components/ui/loader";
import { useApplicationDetailState } from "../hooks/useApplicationDetailState";
import { DetailStagesList } from "./DetailStagesList";
import { DetailSidebar } from "./DetailSidebar";
import { ApplicationModals } from "./ApplicationModals";

export interface ApplicationDetailProps {
  id?: string;
  candidateName?: string;
  onBack: () => void;
  onOpenCandidateForm: () => void;
  onOpenEvidenceVault?: () => void;
}

export const ApplicationDetail: React.FC<ApplicationDetailProps> = ({
  id = "",
  candidateName = "Candidate",
  onBack,
  onOpenCandidateForm,
  onOpenEvidenceVault,
}) => {
  const state = useApplicationDetailState(id, candidateName);

  if (state.isLoadingDetail && !state.appDetail) {
    return (
      <div className="w-full min-h-100 flex items-center justify-center">
        <Loader tip="Loading application details..." />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <DetailStagesList
          submittedDate={state.submittedDate}
          onOpenCandidateForm={onOpenCandidateForm}
          onOpenEvidenceVault={onOpenEvidenceVault}
          appFormStatus={state.appFormStatus}
          paymentStatus={state.paymentStatus}
          paymentDate={state.paymentDate}
          isPaymentPaid={state.isPaymentPaid}
          isAppFormExplicitlyApproved={state.isAppFormExplicitlyApproved}
          activeFacilitator={state.activeFacilitator}
          isAtInterviewStage={state.isAtInterviewStage}
          evidenceStatus={state.evidenceStatus}
          evidenceDate={state.evidenceDate}
          interviewStatus={state.interviewStatus}
          interviewDate={state.interviewDate}
          interviewDateFormatted={state.interviewDateFormatted}
          isInterviewScheduled={state.isInterviewScheduled}
          interviewAssessorsList={state.interviewAssessorsList}
          resolvedTradeName={state.resolvedTradeName}
          ivStatus={state.ivStatus}
          ivDate={state.ivDate}
          activeIv={state.activeIv}
          evStatus={state.evStatus}
          evDate={state.evDate}
          activeEv={state.activeEv}
          certStatus={state.certStatus}
          certDate={state.certDate}
          onOpenAssignFacilitator={() => state.setIsAssignFacilitatorOpen(true)}
          onOpenRescheduleModal={() => state.setIsRescheduleModalOpen(true)}
          onOpenScheduleModal={state.handleOpenScheduleModal}
          onOpenAssignVerifier={(type) => {
            state.setActiveVerifierType(type);
            state.setIsAssignVerifierOpen(true);
          }}
          onOpenReviewVerifier={(type) => {
            state.setActiveVerifierType(type);
            state.setIsReviewVerifierOpen(true);
          }}
        />

        <DetailSidebar
          currentMonth={state.currentMonth}
          daysOfWeek={state.daysOfWeek}
          daysInMonth={state.daysInMonth}
          handlePrevMonth={state.handlePrevMonth}
          handleNextMonth={state.handleNextMonth}
          isInterviewScheduled={state.isInterviewScheduled}
          activeInterviewSchedule={state.activeInterviewSchedule}
          interviewEventDateFormatted={state.interviewEventDateFormatted}
          interviewTimeFormatted={state.interviewTimeFormatted}
          isRescheduled={state.isRescheduled}
          isAtInterviewStage={state.isAtInterviewStage}
          activeFacilitator={state.activeFacilitator}
          tradeName={state.resolvedTradeName}
        />
      </div>

      <ApplicationModals
        id={id}
        candidateName={state.resolvedCandidateName}
        resolvedTradeName={state.resolvedTradeName}
        activeInterviewSchedule={state.activeInterviewSchedule}
        interviewPanelFromApi={state.interviewPanelFromApi}
        interviewTimeFormatted={state.interviewTimeFormatted}
        activeIv={state.activeIv}
        activeEv={state.activeEv}
        state={state}
      />
    </div>
  );
};

export default ApplicationDetail;
