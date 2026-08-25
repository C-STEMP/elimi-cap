"use client";

import React, { useState } from "react";
import {
  AssessorApplicationStagesList,
  AssessorCalendarWidget,
  AssessorUpcomingEventsWidget,
  AssessorAssessmentFormsWidget,
  ConfirmMarkCompetentModal,
  MarkCompetentSuccessModal,
  ConfirmMarkCandidateCompetentModal,
  CandidateCompetentSuccessModal,
  ConfirmMarkCandidateIncompetentModal,
  CandidateIncompetentSuccessModal,
  ScheduleObservationModal,
  ObservationScheduledSuccessModal,
  CandidateInconclusiveSuccessModal,
} from "./detail";
import { CandidateApplicationFormView } from "./CandidateApplicationFormView";
import { AssessorEvidenceVaultView } from "./evidence-vault";
import { AssessorAssessmentFormView } from "./assessment-forms";
import type {
  AssessorApplicationRecord,
  ApplicationStageFormToSign,
} from "../types/applications.types";
import { useGetApplicationById } from "@/src/features/shared/applications/hooks";
import { useToast } from "@/src/components/ui/toast";

export type AssessorDetailSubView =
  | "stages"
  | "application_form"
  | "evidence_vault"
  | "assessment_form";

const DEFAULT_FORMS_TO_SIGN: ApplicationStageFormToSign[] = [
  {
    id: "form-1",
    title: "Skills Demonstration Records Form",
    description: "Lorem ipsum dolor",
    signed: false,
  },
  {
    id: "form-2",
    title: "Assessment Grid/Mapping Form",
    description: "Lorem ipsum dolor",
    signed: false,
  },
  {
    id: "form-3",
    title: "Practical Observation Checklist Form",
    description: "Lorem ipsum dolor",
    signed: false,
  },
];

interface AssessorApplicationDetailViewProps {
  application: AssessorApplicationRecord;
  onBack: () => void;
  subView?: AssessorDetailSubView;
  onSubViewChange?: (subView: AssessorDetailSubView) => void;
  onAllApprovedChange?: (allApproved: boolean) => void;
  onMarkAsComplete?: () => void;
  triggerMarkComplete?: boolean;
  onResetTriggerMarkComplete?: () => void;
}

export const AssessorApplicationDetailView: React.FC<
  AssessorApplicationDetailViewProps
> = ({
  application,
  onBack,
  subView: externalSubView,
  onSubViewChange,
  onAllApprovedChange,
  onMarkAsComplete,
  triggerMarkComplete,
  onResetTriggerMarkComplete,
}) => {
  const { toast } = useToast();
  const [internalSubView, setInternalSubView] =
    useState<AssessorDetailSubView>("stages");

  const [selectedAssessmentFormId, setSelectedAssessmentFormId] =
    useState<string>("skills_demo");

  const [interviewOutcome, setInterviewOutcome] = useState<
    "ongoing" | "competent" | "incompetent" | "inconclusive" | "awaiting_signature"
  >(application.status === "Completed" ? "competent" : "ongoing");

  const [interviewFeedback, setInterviewFeedback] = useState<{
    title?: string;
    reason: string;
    recommendation: string;
  } | null>(null);

  const [formsToSign, setFormsToSign] =
    useState<ApplicationStageFormToSign[]>(DEFAULT_FORMS_TO_SIGN);

  // Internal Verifier Modals State
  const [isConfirmCompetentOpen, setIsConfirmCompetentOpen] = useState(false);
  const [isCompetentSuccessOpen, setIsCompetentSuccessOpen] = useState(false);

  // Lead Panelist / Interview Stage Competent Modals State
  const [isConfirmCandidateCompetentOpen, setIsConfirmCandidateCompetentOpen] =
    useState(false);
  const [
    isCandidateCompetentSuccessOpen,
    setIsCandidateCompetentSuccessOpen,
  ] = useState(false);

  // Lead Panelist / Interview Stage Incompetent Modals State
  const [
    isConfirmCandidateIncompetentOpen,
    setIsConfirmCandidateIncompetentOpen,
  ] = useState(false);
  const [
    isCandidateIncompetentSuccessOpen,
    setIsCandidateIncompetentSuccessOpen,
  ] = useState(false);
  const [
    isCandidateInconclusiveSuccessOpen,
    setIsCandidateInconclusiveSuccessOpen,
  ] = useState(false);

  // Observation Scheduling Modals State
  const [isScheduleObservationOpen, setIsScheduleObservationOpen] =
    useState(false);
  const [isObservationSuccessOpen, setIsObservationSuccessOpen] =
    useState(false);
  const [scheduledObservationEvent, setScheduledObservationEvent] = useState<{
    title: string;
    time: string;
    date: string;
    address: string;
  } | null>(null);

  const subView = externalSubView !== undefined ? externalSubView : internalSubView;

  const setSubView = (next: AssessorDetailSubView) => {
    setInternalSubView(next);
    onSubViewChange?.(next);
  };

  const { data: appDetail } = useGetApplicationById(application.id);

  const handleConfirmCompetent = () => {
    setIsConfirmCompetentOpen(false);
    setIsCompetentSuccessOpen(true);
  };

  const handleConfirmCandidateCompetent = () => {
    setIsConfirmCandidateCompetentOpen(false);
    setIsCandidateCompetentSuccessOpen(true);
  };

  const handleCandidateCompetentSuccessContinue = () => {
    setIsCandidateCompetentSuccessOpen(false);
    setInterviewOutcome("competent");
  };

  const handleConfirmCandidateIncompetent = (data: {
    reason: string;
    recommendation: string;
  }) => {
    setInterviewFeedback({
      title: "Interview Inconclusive",
      reason: data.reason,
      recommendation: data.recommendation,
    });
    setIsConfirmCandidateIncompetentOpen(false);
    setIsCandidateIncompetentSuccessOpen(true);
  };

  const handleCandidateIncompetentSuccessContinue = () => {
    setIsCandidateIncompetentSuccessOpen(false);
    setInterviewOutcome("inconclusive");
  };

  const handleConfirmCandidateInconclusive = () => {
    setIsCandidateInconclusiveSuccessOpen(true);
  };

  const handleCandidateInconclusiveSuccessContinue = () => {
    setIsCandidateInconclusiveSuccessOpen(false);
    setInterviewOutcome("inconclusive");
  };

  const handleScheduleObservationSubmit = (data: {
    date: string;
    time: string;
    location: string;
  }) => {
    setScheduledObservationEvent({
      title: "Physically Observation",
      time: data.time,
      date: data.date,
      address: data.location,
    });
    setIsScheduleObservationOpen(false);
    setIsObservationSuccessOpen(true);
  };

  const handleObservationSuccessContinue = () => {
    setIsObservationSuccessOpen(false);
    setInterviewOutcome("awaiting_signature");
  };

  const handleAppendSignature = (formId: string) => {
    setFormsToSign((prev) =>
      prev.map((f) => (f.id === formId ? { ...f, signed: true } : f)),
    );
    toast({
      type: "success",
      title: "Signature Appended",
      description: "Your signature has been added to the form.",
    });
  };

  if (subView === "application_form") {
    return (
      <CandidateApplicationFormView
        candidateName={application.candidateName}
        trade={application.trade}
        applicationId={application.id}
        applicationDetail={appDetail}
      />
    );
  }

  if (subView === "evidence_vault") {
    return (
      <AssessorEvidenceVaultView
        candidateName={application.candidateName}
        onBack={() => setSubView("stages")}
        onAllApprovedChange={onAllApprovedChange}
        onMarkAsComplete={onMarkAsComplete}
        triggerMarkComplete={triggerMarkComplete}
        onResetTriggerMarkComplete={onResetTriggerMarkComplete}
      />
    );
  }

  if (subView === "assessment_form") {
    return (
      <AssessorAssessmentFormView
        formId={selectedAssessmentFormId}
        candidateName={application.candidateName}
        onBack={() => setSubView("stages")}
      />
    );
  }

  const activeApplicationRecord: AssessorApplicationRecord = {
    ...application,
    status: interviewOutcome === "competent" ? "Completed" : application.status,
  };

  const upcomingEvent =
    interviewOutcome === "awaiting_signature" && scheduledObservationEvent
      ? scheduledObservationEvent
      : interviewOutcome === "ongoing"
        ? {
            title: "Panel Interview",
            time: "12:00PM",
            date: "22/03/2026",
            address: "Cstemp Centre",
          }
        : null;

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start select-text">
      {/* Left Column: Stages Timeline */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        <AssessorApplicationStagesList
          application={activeApplicationRecord}
          interviewOutcome={interviewOutcome}
          interviewFeedback={interviewFeedback}
          formsToSign={formsToSign}
          onAppendSignature={handleAppendSignature}
          onViewApplicationForm={() => setSubView("application_form")}
          onOpenEvidenceVault={() => setSubView("evidence_vault")}
          onMarkCompetent={() => setIsConfirmCompetentOpen(true)}
          onMarkCandidateCompetent={() =>
            setIsConfirmCandidateCompetentOpen(true)
          }
          onMarkCandidateIncompetent={() =>
            setIsConfirmCandidateIncompetentOpen(true)
          }
          onMarkCandidateInconclusive={handleConfirmCandidateInconclusive}
          onScheduleObservation={() => setIsScheduleObservationOpen(true)}
        />
      </div>

      {/* Right Column: Calendar, Events, and Assessment Forms Widgets */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <AssessorCalendarWidget highlightedDays={[10, 13]} />
        <AssessorUpcomingEventsWidget event={upcomingEvent} />
        <AssessorAssessmentFormsWidget
          onViewForm={(form) => {
            setSelectedAssessmentFormId(form.id);
            setSubView("assessment_form");
          }}
        />
      </div>

      {/* Internal Verifier Modals */}
      <ConfirmMarkCompetentModal
        isOpen={isConfirmCompetentOpen}
        onClose={() => setIsConfirmCompetentOpen(false)}
        onConfirm={handleConfirmCompetent}
      />

      <MarkCompetentSuccessModal
        isOpen={isCompetentSuccessOpen}
        onClose={() => setIsCompetentSuccessOpen(false)}
      />

      {/* Lead Panelist / Interview Stage Competent Modals */}
      <ConfirmMarkCandidateCompetentModal
        isOpen={isConfirmCandidateCompetentOpen}
        onClose={() => setIsConfirmCandidateCompetentOpen(false)}
        onConfirm={handleConfirmCandidateCompetent}
      />

      <CandidateCompetentSuccessModal
        isOpen={isCandidateCompetentSuccessOpen}
        onClose={handleCandidateCompetentSuccessContinue}
      />

      {/* Lead Panelist / Interview Stage Incompetent Modals */}
      <ConfirmMarkCandidateIncompetentModal
        isOpen={isConfirmCandidateIncompetentOpen}
        onClose={() => setIsConfirmCandidateIncompetentOpen(false)}
        onConfirm={handleConfirmCandidateIncompetent}
      />

      <CandidateIncompetentSuccessModal
        isOpen={isCandidateIncompetentSuccessOpen}
        onClose={handleCandidateIncompetentSuccessContinue}
      />

      {/* Candidate Inconclusive Success Modal */}
      <CandidateInconclusiveSuccessModal
        isOpen={isCandidateInconclusiveSuccessOpen}
        onClose={handleCandidateInconclusiveSuccessContinue}
      />

      {/* Observation Scheduling Modals */}
      <ScheduleObservationModal
        isOpen={isScheduleObservationOpen}
        onClose={() => setIsScheduleObservationOpen(false)}
        onSchedule={handleScheduleObservationSubmit}
      />

      <ObservationScheduledSuccessModal
        isOpen={isObservationSuccessOpen}
        onClose={handleObservationSuccessContinue}
      />
    </div>
  );
};
