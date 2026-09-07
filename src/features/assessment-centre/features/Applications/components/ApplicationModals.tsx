"use client";

import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AssignFacilitatorModal } from "./AssignFacilitatorModal";
import { AssignPanelistModal } from "./AssignPanelistModal";
import { RescheduleInterviewModal } from "./RescheduleInterviewModal";
import { AssignVerifierModal } from "./AssignVerifierModal";
import { ReviewVerifierModal } from "./ReviewVerifierModal";
import { PromptCreatePanelModal } from "./PromptCreatePanelModal";
import { CreatePanelModal } from "./CreatePanelModal";
import { ScheduleInterviewModal } from "./ScheduleInterviewModal";

interface ApplicationModalsProps {
  id: string;
  candidateName: string;
  resolvedTradeName: string;
  activeInterviewSchedule: any;
  interviewPanelFromApi: any;
  interviewTimeFormatted: string;
  activeIv: any;
  activeEv: any;
  state: any;
}

export const ApplicationModals: React.FC<ApplicationModalsProps> = ({
  id,
  candidateName,
  resolvedTradeName,
  activeInterviewSchedule,
  interviewPanelFromApi,
  interviewTimeFormatted,
  activeIv,
  activeEv,
  state,
}) => {
  const queryClient = useQueryClient();

  return (
    <>
      <AssignFacilitatorModal
        isOpen={state.isAssignFacilitatorOpen}
        onClose={() => state.setIsAssignFacilitatorOpen(false)}
        applicationId={id}
        tradeName={resolvedTradeName}
        onSuccess={state.handleFacilitatorSuccess}
      />

      <AssignPanelistModal
        isOpen={state.isAssignPanelistOpen}
        onClose={() => state.setIsAssignPanelistOpen(false)}
        applicationId={id}
        tradeName={resolvedTradeName}
        initialSchedule={activeInterviewSchedule}
        initialPanel={interviewPanelFromApi}
        onSuccess={state.handlePanelistSuccess}
      />

      <RescheduleInterviewModal
        isOpen={state.isRescheduleModalOpen}
        onClose={() => state.setIsRescheduleModalOpen(false)}
        applicationId={id}
        currentDate={
          activeInterviewSchedule?.scheduledAt
            ? new Date(activeInterviewSchedule.scheduledAt).toISOString().split("T")[0]
            : ""
        }
        currentTime={interviewTimeFormatted}
        currentMeetingLink={activeInterviewSchedule?.link || "www.meet.google.com"}
        currentLocation={activeInterviewSchedule?.location || "Cstemp Centre"}
        currentMode={activeInterviewSchedule?.mode === "online" ? "virtual" : "physical"}
        onSuccess={state.handleRescheduleSuccess}
      />

      <AssignVerifierModal
        isOpen={state.isAssignVerifierOpen}
        onClose={() => state.setIsAssignVerifierOpen(false)}
        applicationId={id}
        verifierType={state.activeVerifierType}
        tradeName={resolvedTradeName}
      />

      <ReviewVerifierModal
        isOpen={state.isReviewVerifierOpen}
        onClose={() => state.setIsReviewVerifierOpen(false)}
        applicationId={id}
        verifierType={state.activeVerifierType}
        verifierName={
          state.activeVerifierType === "internal"
            ? activeIv?.name || "Internal Verifier"
            : activeEv?.name || "External Verifier"
        }
      />

      <PromptCreatePanelModal
        isOpen={state.isPromptCreatePanelOpen}
        onClose={() => state.setIsPromptCreatePanelOpen(false)}
        onCreatePanel={() => {
          state.setIsPromptCreatePanelOpen(false);
          state.setIsCreatePanelModalOpen(true);
        }}
      />

      <CreatePanelModal
        isOpen={state.isCreatePanelModalOpen}
        onClose={() => state.setIsCreatePanelModalOpen(false)}
        onSuccess={() => {
          state.setIsCreatePanelModalOpen(false);
          state.setIsScheduleInterviewModalOpen(true);
        }}
      />

      <ScheduleInterviewModal
        isOpen={state.isScheduleInterviewModalOpen}
        onClose={() => state.setIsScheduleInterviewModalOpen(false)}
        initialApplicationId={id}
        initialCandidateName={candidateName}
        initialTradeName={resolvedTradeName}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["applications", "interview-schedule", id] });
          queryClient.invalidateQueries({ queryKey: ["applications", "interview-panel", id] });
          queryClient.invalidateQueries({ queryKey: ["applications", "stages", id] });
          queryClient.invalidateQueries({ queryKey: ["centre", "applications", "detail", id] });
          queryClient.invalidateQueries({ queryKey: ["applications", id] });
          queryClient.invalidateQueries({ queryKey: ["applications"] });
          state.setIsScheduleInterviewModalOpen(false);
        }}
      />
    </>
  );
};
