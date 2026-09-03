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
import {
  useGetApplicationById,
  useGetInterviewSchedule,
  useGetInterviewForms,
  useEvaluateInterview,
} from "@/src/features/shared/applications/hooks";
import {
  reviewIvApi,
  reviewEvApi,
} from "@/src/features/shared/applications/api/application.api";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/src/components/ui/toast";

export type AssessorDetailSubView =
  | "stages"
  | "application_form"
  | "evidence_vault"
  | "assessment_form";

const BASE_FORMS_TO_SIGN: ApplicationStageFormToSign[] = [
  {
    id: "records",
    title: "Skills Demonstration Records Form",
    description: "Form recording interview questions and demonstration notes",
    signed: false,
  },
  {
    id: "assessment_grid",
    title: "Assessment Grid/Mapping Form",
    description: "Form mapping competency criteria and scores",
    signed: false,
  },
  {
    id: "practical_observation",
    title: "Practical Observation Checklist Form",
    description: "Form recording practical observation findings",
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
  const { data: interviewSchedule } = useGetInterviewSchedule(application.id);
  const { data: remoteForms } = useGetInterviewForms(application.id);
  const evaluateInterview = useEvaluateInterview(application.id);

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
    useState<ApplicationStageFormToSign[]>(BASE_FORMS_TO_SIGN);

  React.useEffect(() => {
    if (remoteForms && remoteForms.length > 0) {
      setFormsToSign((prev) =>
        prev.map((f) => {
          const matching = remoteForms.find(
            (rf) =>
              rf.formType === f.id ||
              rf.id === f.id,
          );
          return matching
            ? {
                ...f,
                signed: Boolean(
                  matching.candidateSignedAt || matching.status === "completed",
                ),
              }
            : f;
        }),
      );
    }
  }, [remoteForms]);

  const queryClient = useQueryClient();

  // Internal Verifier Modals State
  const [isConfirmCompetentOpen, setIsConfirmCompetentOpen] = useState(false);
  const [isCompetentSuccessOpen, setIsCompetentSuccessOpen] = useState(false);

  // External Verifier Modals State
  const [isConfirmEvCompetentOpen, setIsConfirmEvCompetentOpen] = useState(false);
  const [isEvCompetentSuccessOpen, setIsEvCompetentSuccessOpen] = useState(false);

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

  const handleConfirmCompetent = async () => {
    setIsConfirmCompetentOpen(false);
    try {
      await reviewIvApi(application.id, {
        decision: "approve",
        feedback: "Candidate verified and confirmed competent by Internal Verifier.",
      });
      await queryClient.invalidateQueries({
        queryKey: ["applications", application.id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["applications", "stages", application.id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["applications"],
      });
    } catch (err) {
      console.warn("reviewIvApi error:", err);
    }
    setIsCompetentSuccessOpen(true);
  };

  const handleConfirmEvCompetent = async () => {
    setIsConfirmEvCompetentOpen(false);
    try {
      await reviewEvApi(application.id, {
        decision: "approve",
        feedback: "Candidate verified and confirmed competent by External Verifier.",
      });
      await queryClient.invalidateQueries({
        queryKey: ["applications", application.id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["applications", "stages", application.id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["applications"],
      });
    } catch (err) {
      console.warn("reviewEvApi error:", err);
    }
    setIsEvCompetentSuccessOpen(true);
  };

  const handleConfirmCandidateCompetent = () => {
    setIsConfirmCandidateCompetentOpen(false);
    setIsCandidateCompetentSuccessOpen(true);
  };

  const handleCandidateCompetentSuccessContinue = () => {
    setIsCandidateCompetentSuccessOpen(false);
    setInterviewOutcome("competent");
    evaluateInterview.mutate({
      decision: "approve",
      feedback: "Candidate demonstrated all required competencies.",
      signatureAssetId: "default",
    });
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
    evaluateInterview.mutate({
      decision: "reject",
      outcome: "inconclusive",
      feedback: interviewFeedback?.reason || "Candidate evaluation inconclusive.",
      signatureAssetId: "default",
    });
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
        applicationId={application.id}
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
      : interviewSchedule?.scheduledAt
        ? {
            title: "Panel Interview",
            time: new Date(interviewSchedule.scheduledAt).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            }),
            date: new Date(interviewSchedule.scheduledAt).toLocaleDateString("en-GB"),
            location: interviewSchedule.location || "Cstemp Centre",
            mode: interviewSchedule.mode,
            liveUrl: interviewSchedule.mode === "online" ? interviewSchedule.link : undefined,
            isRescheduled: Boolean((interviewSchedule as any)?.isRescheduled),
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
          onMarkEvCompetent={() => setIsConfirmEvCompetentOpen(true)}
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
        <AssessorCalendarWidget
          panelInterviewDate={interviewSchedule?.scheduledAt || undefined}
        />
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

      {/* External Verifier Modals */}
      <ConfirmMarkCompetentModal
        isOpen={isConfirmEvCompetentOpen}
        onClose={() => setIsConfirmEvCompetentOpen(false)}
        onConfirm={handleConfirmEvCompetent}
        title="Confirm External Verification"
        description="Confirm you want to approve and mark external verification competent"
      />

      <MarkCompetentSuccessModal
        isOpen={isEvCompetentSuccessOpen}
        onClose={() => setIsEvCompetentSuccessOpen(false)}
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
