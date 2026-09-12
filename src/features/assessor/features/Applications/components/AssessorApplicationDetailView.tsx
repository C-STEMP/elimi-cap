"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
} from "../types/applications.types";
import {
  useGetApplicationById,
  useGetApplicationStages,
  useGetInterviewSchedule,
  useGetInterviewForms,
  useEvaluateInterview,
  useGetInterviewPanel,
  useResolveAppeal,
} from "@/src/features/shared/applications/hooks";
import {
  reviewIvApi,
  reviewEvApi,
} from "@/src/features/shared/applications/api/application.api";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/src/components/ui/toast";
import { useAppSelector } from "@/src/store/hooks";
import { useGetMeProfile } from "@/src/features/shared/account/hooks";
import { useGetAssessorProfile } from "@/src/features/assessor/hooks";

export type AssessorDetailSubView =
  | "stages"
  | "application_form"
  | "evidence_vault"
  | "assessment_form";

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
  const router = useRouter();
  const { toast } = useToast();
  const { data: appDetail } = useGetApplicationById(application.id);
  const { data: stagesData } = useGetApplicationStages(application.id);
  const isInterviewStage = Boolean(
    appDetail?.currentStageKey === "interview" ||
    (appDetail as any)?.stage === "interview" ||
    application?.currentStageKey === "interview"
  );
  const { data: interviewSchedule } = useGetInterviewSchedule(application.id, {
    enabled: isInterviewStage,
  });
  const { data: remoteForms } = useGetInterviewForms(application.id, {
    enabled: isInterviewStage,
  });
  const evaluateInterview = useEvaluateInterview(application.id);
  const resolveAppeal = useResolveAppeal(application.id);

  const user = useAppSelector((state) => state.auth.user);
  const { data: meProfile } = useGetMeProfile();
  const { data: assessorProfile } = useGetAssessorProfile();
  const { data: interviewPanel } = useGetInterviewPanel(application.id, {
    enabled: isInterviewStage,
  });

  const openAppeal = (appDetail as any)?.appeals?.find(
    (a: any) => a.status === "open" || a.status === "pending",
  );

  // Compile all known identifiers and aliases for the logged-in assessor
  const currentUserId = (user?.id || user?.userId || (user as any)?._id || "").toString().toLowerCase().trim();
  const currentAssessorId = (assessorProfile?.id || (assessorProfile as any)?.assessorId || "").toString().toLowerCase().trim();
  const currentUserEmail = (
    user?.email ||
    meProfile?.contactInformation?.emailAddress ||
    assessorProfile?.email ||
    ""
  )
    .toLowerCase()
    .trim();

  const userCandidateNames = [
    user?.fullName,
    (user as any)?.name,
    `${(user as any)?.firstName || ""} ${(user as any)?.lastName || ""}`.trim(),
    assessorProfile?.name,
    `${meProfile?.personalDetails?.firstName || ""} ${meProfile?.personalDetails?.lastName || ""}`.trim(),
  ]
    .filter(Boolean)
    .map((n) => (n as string).toLowerCase().trim());

  const isMemberMatch = (m: any) => {
    if (!m) return false;
    const mAssessorId = (m.assessorId || m.userId || m.id || "").toString().toLowerCase().trim();
    const mEmail = (m.email || "").toLowerCase().trim();
    const mName = (m.name || "").toLowerCase().trim();

    // Match by ID
    if (currentUserId && (mAssessorId === currentUserId || (m.userId && m.userId.toString().toLowerCase().trim() === currentUserId))) {
      return true;
    }
    if (currentAssessorId && mAssessorId === currentAssessorId) {
      return true;
    }

    // Match by email
    if (currentUserEmail && mEmail && currentUserEmail === mEmail) {
      return true;
    }

    // Match by name
    if (mName && userCandidateNames.some((n) => n === mName || n.includes(mName) || mName.includes(n))) {
      return true;
    }

    return false;
  };

  const leadMember = interviewPanel?.members?.find((m: any) => m.isLead);
  const panelMember = interviewPanel?.members?.find((m: any) => !m.isLead && !m.isObserver);
  const ivMember = interviewPanel?.members?.find((m: any) => m.isObserver);

  // User is IV if system role is explicitly IV/verifier OR user matches an observer member on the panel
  const isUserIV = Boolean(
    user?.role?.toLowerCase() === "iv" ||
      user?.role?.toLowerCase() === "verifier" ||
      (ivMember && isMemberMatch(ivMember)),
  );

  // User is Lead Panelist if:
  // 1. Explicit match with the lead member on the panel
  // 2. Application role explicitly indicates lead assessor
  const isUserLeadPanelist = Boolean(
    leadMember
      ? isMemberMatch(leadMember)
      : application.role?.toLowerCase()?.includes("lead"),
  );

  // Check if user matches any non-lead panel member
  const isMatchingAnyPanelMember = Boolean(
    interviewPanel?.members?.some((m: any) => !m.isLead && isMemberMatch(m))
  );

  const isUserPanelMember = Boolean(
    isMatchingAnyPanelMember ||
    (!isUserLeadPanelist && (user?.role?.toLowerCase()?.includes("assessor") || application.role?.toLowerCase()?.includes("panel")))
  );

  // Interview stage status derived from application stages
  const interviewStageRow = stagesData?.find(
    (s) =>
      s.stageKey === "interview" ||
      s.stageKey === "direct_observation" ||
      s.stageKey === "observation",
  );

  // Assessment forms are to be filled by Lead Panelist & viewed by IV, Facilitator, and other panel members
  const isAssessmentFormReadOnly = !isUserLeadPanelist;

  const [internalSubView, setInternalSubView] =
    useState<AssessorDetailSubView>("stages");

  const [selectedAssessmentFormId, setSelectedAssessmentFormId] =
    useState<string>("skills_demo");

  const [interviewOutcome, setInterviewOutcome] = useState<
    "ongoing" | "competent" | "incompetent" | "inconclusive" | "awaiting_signature"
  >(application.status === "Completed" ? "competent" : "ongoing");

  const [pendingSignatures, setPendingSignatures] = useState<
    Array<{ assessorId: string; name?: string; isLead?: boolean }> | null
  >(null);

  const [interviewFeedback, setInterviewFeedback] = useState<{
    title?: string;
    reason: string;
    recommendation: string;
  } | null>(null);

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
  const [competentSuccessModalConfig, setCompetentSuccessModalConfig] = useState<{
    title?: string;
    message?: string;
  }>({});

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

  const handleConfirmCandidateCompetent = async () => {
    try {
      const isLead = isUserLeadPanelist;
      const uName = user?.fullName || (user as any)?.name || "Assessor";
      const payload: {
        feedback: string;
        signatureAssetId: string;
        decision?: "approve" | "reject";
      } = {
        feedback: isLead
          ? "Candidate demonstrated all required competencies."
          : `Interview evaluated and approved by panel member (${uName}).`,
        signatureAssetId: "default",
      };

      if (isLead) {
        payload.decision = "approve";
      }

      const res = await evaluateInterview.mutateAsync(payload);

      setIsConfirmCandidateCompetentOpen(false);

      const msg = res?.message || "";
      const isAwaitingSignatures =
        Boolean(res?.pendingSignatures && res.pendingSignatures.length > 0) ||
        msg.toLowerCase().includes("awaiting") ||
        msg.toLowerCase().includes("signature");

      if (res?.pendingSignatures) {
        setPendingSignatures(res.pendingSignatures);
      }

      if (isAwaitingSignatures) {
        setInterviewOutcome("awaiting_signature");
        const pendingNames = res?.pendingSignatures?.map((s: { name?: string }) => s.name).filter(Boolean).join(", ");
        const detailedMsg = pendingNames
          ? `Interview evaluation recorded. Awaiting signature from: ${pendingNames}.`
          : (msg || "Interview evaluation recorded; awaiting remaining panel signatures.");

        setCompetentSuccessModalConfig({
          title: "Evaluation Recorded",
          message: detailedMsg,
        });
      } else {
        setPendingSignatures([]);
        setInterviewOutcome("competent");
        setCompetentSuccessModalConfig({
          title: isLead ? "Candidate Marked As Competent" : "Interview Evaluation Submitted",
          message:
            msg || (isLead ? "You have successfully marked this candidate as competent." : "Your interview evaluation has been recorded."),
        });
      }

      setIsCandidateCompetentSuccessOpen(true);
    } catch (err: any) {
      console.error("evaluateInterview error:", err);
      // useEvaluateInterview's onError already surfaces the error toast
    }
  };

  const handleCandidateCompetentSuccessContinue = () => {
    setIsCandidateCompetentSuccessOpen(false);
  };

  const handleConfirmCandidateIncompetent = async (data: {
    reason: string;
    recommendation: string;
  }) => {
    try {
      setInterviewFeedback({
        title: "Interview Inconclusive",
        reason: data.reason,
        recommendation: data.recommendation,
      });
      await evaluateInterview.mutateAsync({
        decision: "reject",
        outcome: "inconclusive",
        feedback: data.reason || "Candidate evaluation inconclusive.",
        signatureAssetId: "default",
      });
      setIsConfirmCandidateIncompetentOpen(false);
      setInterviewOutcome("inconclusive");
      setIsCandidateIncompetentSuccessOpen(true);
    } catch (err) {
      console.error("evaluateInterview incompetent error:", err);
    }
  };

  const handleCandidateIncompetentSuccessContinue = () => {
    setIsCandidateIncompetentSuccessOpen(false);
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


  if (subView === "application_form") {
    const isAppApproved = Boolean(
      (application.status as string)?.toLowerCase() === "approved" ||
      (application.status as string)?.toLowerCase() === "completed" ||
      (application.status as string)?.toLowerCase() === "ongoing" ||
      (appDetail?.status as string)?.toLowerCase() === "approved" ||
      (appDetail?.status as string)?.toLowerCase() === "completed" ||
      (appDetail?.status as string)?.toLowerCase() === "ongoing" ||
      (appDetail?.currentStageKey &&
        appDetail.currentStageKey !== "application_form" &&
        appDetail.currentStageKey !== "application_review" &&
        appDetail.currentStageKey !== "draft" &&
        appDetail.currentStageKey !== "submitted")
    );

    return (
      <CandidateApplicationFormView
        candidateName={application.candidateName}
        trade={application.trade}
        applicationId={application.id}
        applicationDetail={appDetail}
        isApproved={isAppApproved}
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
        applicationId={application.id}
        formId={selectedAssessmentFormId}
        candidateName={application.candidateName}
        onBack={() => setSubView("stages")}
        isReadOnly={isAssessmentFormReadOnly}
        applicationTrade={application.trade || appDetail?.trade?.name || ""}
      />
    );
  }

  const resolvedCandidatePhoto =
    appDetail?.candidate?.photo?.url ||
    (appDetail as any)?.candidate?.photoAssetId ||
    (appDetail as any)?.candidate?.avatar ||
    application.candidatePhotoUrl ||
    null;

  const activeApplicationRecord: AssessorApplicationRecord = {
    ...application,
    candidatePhotoUrl: resolvedCandidatePhoto,
    status: application.status,
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
        {openAppeal && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 shadow-xs">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                Active Candidate Appeal
              </span>
              <span className="text-xs text-amber-700">
                {openAppeal.createdAt
                  ? new Date(openAppeal.createdAt).toLocaleDateString()
                  : "Recent"}
              </span>
            </div>
            <p className="text-sm text-amber-900 font-medium leading-relaxed">
              &ldquo;{openAppeal.comment}&rdquo;
            </p>
            {isUserLeadPanelist && (
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    resolveAppeal.mutate({
                      appealId: openAppeal.id,
                      decision: "reopen",
                      comment: "Assessment stage reopened for further evaluation.",
                    })
                  }
                  disabled={resolveAppeal.isPending}
                  className="bg-[#1E7F4C] hover:bg-[#1E7F4C]/90 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  Reopen Assessment
                </button>
                <button
                  type="button"
                  onClick={() =>
                    resolveAppeal.mutate({
                      appealId: openAppeal.id,
                      decision: "dismiss",
                      comment: "Appeal dismissed after panel review.",
                    })
                  }
                  disabled={resolveAppeal.isPending}
                  className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  Dismiss Appeal
                </button>
              </div>
            )}
          </div>
        )}

        {(() => {
          const isCurrentUserInPending = Boolean(
            pendingSignatures &&
            pendingSignatures.length > 0 &&
            pendingSignatures.some((ps) => {
              const psId = (ps.assessorId || "").toString().toLowerCase().trim();
              const psName = (ps.name || "").toLowerCase().trim();
              return (
                (currentAssessorId && psId === currentAssessorId) ||
                (currentUserId && psId === currentUserId) ||
                (psName && userCandidateNames.some((n) => n === psName || n.includes(psName) || psName.includes(n)))
              );
            })
          );

          const isInterviewDone = Boolean(
            (interviewStageRow?.status === "successful" || interviewOutcome === "competent") &&
            interviewOutcome !== "awaiting_signature" &&
            interviewOutcome !== "incompetent" &&
            interviewOutcome !== "inconclusive"
          );

          const isAwaitingPanelSignatures = Boolean(
            !isInterviewDone ||
            interviewOutcome === "awaiting_signature" ||
            (pendingSignatures && pendingSignatures.length > 0)
          );

          return (
            <AssessorApplicationStagesList
              application={activeApplicationRecord}
              interviewOutcome={interviewOutcome}
              interviewFeedback={interviewFeedback}
              isUserLeadPanelist={isUserLeadPanelist}
              isUserPanelMember={isUserPanelMember}
              isUserIV={isUserIV}
              pendingSignatures={pendingSignatures || undefined}
              isCurrentUserInPending={isCurrentUserInPending}
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
          );
        })()}
      </div>

      {/* Right Column: Calendar, Events, and Assessment Forms Widgets */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <AssessorCalendarWidget
          panelInterviewDate={interviewSchedule?.scheduledAt || undefined}
        />
        <AssessorUpcomingEventsWidget event={upcomingEvent} />
        <AssessorAssessmentFormsWidget
          applicationId={application.id}
          isReadOnly={isAssessmentFormReadOnly}
          remoteForms={remoteForms}
          isInterviewDone={Boolean(
            (interviewStageRow?.status === "successful" || interviewOutcome === "competent") &&
            interviewOutcome !== "awaiting_signature" &&
            interviewOutcome !== "incompetent" &&
            interviewOutcome !== "inconclusive"
          )}
          isAwaitingPanelSignatures={Boolean(
            !(interviewStageRow?.status === "successful" || interviewOutcome === "competent") ||
            interviewOutcome === "awaiting_signature" ||
            (pendingSignatures && pendingSignatures.length > 0)
          )}
          onViewForm={(form) => {
            router.push(`/applications/${application.id}/assessment-forms/${form.id}`);
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
        isLoading={evaluateInterview.isPending}
        isLead={isUserLeadPanelist}
      />

      <CandidateCompetentSuccessModal
        isOpen={isCandidateCompetentSuccessOpen}
        onClose={handleCandidateCompetentSuccessContinue}
        title={competentSuccessModalConfig.title}
        message={competentSuccessModalConfig.message}
      />

      {/* Lead Panelist / Interview Stage Incompetent Modals */}
      <ConfirmMarkCandidateIncompetentModal
        isOpen={isConfirmCandidateIncompetentOpen}
        onClose={() => setIsConfirmCandidateIncompetentOpen(false)}
        onConfirm={handleConfirmCandidateIncompetent}
        isLoading={evaluateInterview.isPending}
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
