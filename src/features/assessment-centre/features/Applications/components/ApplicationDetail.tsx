"use client";

import React from "react";
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
      <div className="w-full flex flex-col gap-6 select-text">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-2xs flex items-center justify-between gap-4 animate-pulse"
              >
                <div className="flex flex-col gap-2 min-w-0 w-full">
                  <div className="h-4 bg-gray-200 rounded w-40" />
                  <div className="h-3 bg-gray-100 rounded w-56" />
                </div>
                <div className="h-8 bg-gray-100 rounded-xl w-20 shrink-0" />
              </div>
            ))}
          </div>
          <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs h-64 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <DetailStagesList
          applicationId={id}
          candidateName={state.resolvedCandidateName}
          candidatePhotoUrl={state.candidatePhotoUrl}
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
