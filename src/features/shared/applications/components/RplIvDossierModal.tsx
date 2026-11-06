"use client";

import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  FiX,
  FiCheck,
  FiAlertCircle,
  FiEye,
  FiFileText,
  FiFolder,
  FiShare2,
  FiSend,
  FiExternalLink,
} from "react-icons/fi";
import { Avatar } from "@/src/components/ui/avatar";
import { useToast } from "@/src/components/ui/toast";
import {
  useGetApplicationById,
  useGetApplicationStages,
  useGetInterviewFormsBundle,
  useGetInterviewPanel,
  useGetInterviewSchedule,
} from "@/src/features/shared/applications/hooks";
import { useCreateShareToken } from "@/src/features/shared/centre/hooks";
import { useGetEvidenceVault } from "@/src/features/shared/applications/hooks/evidence.hooks";
import {
  reviewIvApi,
  forwardToAwardingBodyApi,
} from "@/src/features/shared/applications/api/verification.api";
import type { InterviewForm } from "@/src/features/shared/applications/api/types";
import { AssessorAssessmentFormDocumentView } from "@/src/features/assessor/features/Applications/components/assessment-forms/AssessorAssessmentFormDocumentView";
import { PreviewEvidenceModal } from "@/src/features/shared/evidence-vault/components/PreviewEvidenceModal";
import type { EvidenceRecord } from "@/src/features/shared/evidence-vault/utils/evidenceConstants";

export interface RplIvDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  isAssignedIv?: boolean;
  candidateName?: string;
  tradeName?: string;
  onSuccess?: () => void;
}

const FORM_TITLES: Record<string, string> = {
  records: "Interview Question Bank & Record Sheet",
  interview_record: "Interview Question Bank & Record Sheet",
  assessment_grid: "RPL Assessment Grid / Mapping Form",
  assessment_mapping: "RPL Assessment Grid / Mapping Form",
  practical_observation: "Practical Observation Record",
  skill_demonstration: "Skills Demonstration Records Form",
  skills_demo: "Skills Demonstration Records Form",
};

const CANONICAL_FORMS = [
  {
    id: "assessment_grid",
    name: "RPL Assessment Grid / Mapping Form",
  },
  {
    id: "skill_demonstration",
    name: "Skills Demonstration Records Form",
  },
  {
    id: "practical_observation",
    name: "Practical Observation Record",
  },
  {
    id: "records",
    name: "Interview Question Bank & Record Sheet",
  },
];

export const RplIvDossierModal: React.FC<RplIvDossierModalProps> = ({
  isOpen,
  onClose,
  applicationId,
  isAssignedIv = false,
  candidateName: propCandidateName,
  tradeName: propTradeName,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"forms" | "evidence" | "evaluations">("forms");
  const [feedback, setFeedback] = useState("");
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<{ code?: number; message: string } | null>(null);

  const [selectedFormForView, setSelectedFormForView] = useState<InterviewForm | null>(null);
  const [previewItem, setPreviewItem] = useState<EvidenceRecord | null>(null);

  const [isForwarding, setIsForwarding] = useState(false);
  const [isForwarded, setIsForwarded] = useState(false);
  const [hasCopiedLink, setHasCopiedLink] = useState(false);

  const { data: application } = useGetApplicationById(applicationId);
  const { data: stagesData } = useGetApplicationStages(applicationId);
  const { data: formsBundle } = useGetInterviewFormsBundle(applicationId, {
    enabled: isOpen && Boolean(applicationId),
  });
  const { data: interviewPanel } = useGetInterviewPanel(applicationId, {
    enabled: isOpen && Boolean(applicationId),
  });
  const { data: interviewSchedule } = useGetInterviewSchedule(applicationId, {
    enabled: isOpen && Boolean(applicationId),
  });
  const { data: evidenceItems = [] } = useGetEvidenceVault(applicationId);

  const createShareTokenMutation = useCreateShareToken(applicationId || "");

  if (!isOpen) return null;

  const ivStage = stagesData?.find(
    (s) =>
      s.stageKey === "internal_verification" ||
      s.stageKey === "internal_verifier" ||
      s.stageKey === "iv_review" ||
      s.stageKey === "iv",
  );
  const isIvDone = Boolean(
    ivStage?.status === "successful" ||
      (ivStage?.status as string) === "completed" ||
      (application?.status as string) === "completed" ||
      (application?.status as string) === "certified",
  );

  const candidateFullName =
    propCandidateName ||
    (application as any)?.candidate?.name ||
    `${(application as any)?.candidate?.firstName || ""} ${(application as any)?.candidate?.lastName || ""}`.trim() ||
    (application as any)?.personalInformation?.personalDetails?.firstName ||
    "Candidate";

  const resolvedTrade =
    propTradeName ||
    (application as any)?.trade?.name ||
    (application as any)?.trade ||
    "RPL Qualification";

  const formsList = formsBundle?.forms || [];
  const panelistRecords = formsBundle?.panelistRecords || [];
  const panelMembers = interviewPanel?.members || [];

  const leadRecord = formsList[0]?.data;
  const recordedVerdict =
    leadRecord?.verdict ||
    (application as any)?.interviewOutcome ||
    (isIvDone ? "Competent" : "Pending");

  const handleReview = async (decision: "approve" | "reject") => {
    if (decision === "reject" && !feedback.trim()) {
      setFeedbackError("Please enter feedback explaining why this application is being returned.");
      return;
    }
    setFeedbackError(null);
    setApiError(null);
    setIsSubmitting(true);

    const finalFeedback =
      feedback.trim() ||
      (decision === "approve"
        ? "Candidate verified and confirmed competent by Internal Verifier."
        : "Application returned by Internal Verifier.");

    try {
      await reviewIvApi(applicationId, {
        decision,
        feedback: finalFeedback,
        stageKey: "internal_verification",
      });

      await queryClient.invalidateQueries({
        queryKey: ["applications", applicationId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["applications", "stages", applicationId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["applications"],
      });

      toast({
        type: "success",
        title:
          decision === "approve"
            ? "Verification Approved"
            : "Application Returned",
        description:
          decision === "approve"
            ? "Candidate has been verified and confirmed competent."
            : "Application has been returned with your feedback.",
      });

      onSuccess?.();
      onClose();
    } catch (err: any) {
      const status =
        err?.statusCode || err?.status || err?.response?.status;
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        "";

      let customMsg = "Could not submit review. Please try again.";
      if (
        status === 403 ||
        msg.toLowerCase().includes("actively assigned iv") ||
        msg.toLowerCase().includes("not the assigned iv") ||
        msg.toLowerCase().includes("forbidden")
      ) {
        customMsg =
          "Only the assigned Internal Verifier for this application may submit a decision.";
      } else if (
        status === 409 ||
        msg.toLowerCase().includes("stage") ||
        msg.toLowerCase().includes("conflict")
      ) {
        customMsg =
          "This application is not currently at the internal verification stage.";
      } else if (msg) {
        customMsg = msg;
      }

      setApiError({ code: status, message: customMsg });
      toast({
        type: "error",
        title: "Review Failed",
        description: customMsg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForwardToAwardingBody = async () => {
    setIsForwarding(true);
    try {
      await forwardToAwardingBodyApi(applicationId);
      setIsForwarded(true);
      await queryClient.invalidateQueries({
        queryKey: ["applications", applicationId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["applications", "stages", applicationId],
      });
      toast({
        type: "success",
        title: "Forwarded to Awarding Body",
        description: "Application dossier has been forwarded for external verification.",
      });
    } catch (err: any) {
      toast({
        type: "error",
        title: "Forwarding Failed",
        description: err?.message || "Could not forward to awarding body.",
      });
    } finally {
      setIsForwarding(false);
    }
  };

  const handleGenerateShareLink = async () => {
    try {
      const res = await createShareTokenMutation.mutateAsync();
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const fullUrl = res?.token
        ? `${origin}/shared/applications/${res.token}`
        : `${origin}/applications/${applicationId}`;
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(fullUrl);
        setHasCopiedLink(true);
        setTimeout(() => setHasCopiedLink(false), 3000);
      }
      toast({
        type: "success",
        title: "Dossier Link Copied",
        description: "Shareable link copied to clipboard.",
      });
    } catch (err: any) {
      toast({
        type: "error",
        title: "Share Link Failed",
        description: err?.message || "Could not generate share link.",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto select-text">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Clean Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                {candidateFullName}
              </h2>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  isIvDone
                    ? "bg-[#1E7F4C]/10 text-[#1E7F4C]"
                    : "bg-[#FBAB2A]/15 text-[#D97706]"
                }`}
              >
                {isIvDone ? "Verified" : "Under Review"}
              </span>
            </div>
            <p className="text-xs text-gray-500 truncate">
              Internal Verification Dossier &bull; {resolvedTrade}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* API Error Banner */}
        {apiError && (
          <div className="mx-6 mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2.5 text-xs">
            <FiAlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{apiError.message}</span>
          </div>
        )}

        {/* Simple Tab Bar */}
        <div className="flex items-center gap-6 px-6 border-b border-gray-100 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("forms")}
            className={`py-3 border-b-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "forms"
                ? "border-[#8A1538] text-[#8A1538]"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            Assessment Forms ({formsList.length || 4})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("evidence")}
            className={`py-3 border-b-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "evidence"
                ? "border-[#8A1538] text-[#8A1538]"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            Evidence ({evidenceItems.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("evaluations")}
            className={`py-3 border-b-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "evaluations"
                ? "border-[#8A1538] text-[#8A1538]"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            Panel &amp; Verdict
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: ASSESSMENT FORMS */}
          {activeTab === "forms" && (
            <div className="flex flex-col gap-2.5">
              {CANONICAL_FORMS.map((spec) => {
                const matchedRemote = formsList.find(
                  (f) =>
                    (f.formType as string) === spec.id ||
                    (spec.id === "skill_demonstration" &&
                      (f.formType as string) === "skills_demo") ||
                    (spec.id === "assessment_grid" &&
                      (f.formType as string) === "assessment_mapping"),
                );
                const isSigned = Boolean(
                  matchedRemote?.assessorSignedAt ||
                    (matchedRemote?.data as any)?.assessorSigned ||
                    (matchedRemote?.data as any)?.leadPanelistSigned ||
                    matchedRemote?.status === "completed" ||
                    isIvDone,
                );

                return (
                  <div
                    key={spec.id}
                    onClick={() =>
                      setSelectedFormForView(
                        matchedRemote || ({ formType: spec.id, data: {} } as any),
                      )
                    }
                    className="bg-[#F8F9FA] hover:bg-gray-100/80 rounded-2xl px-4 py-3.5 border border-gray-100 flex items-center justify-between gap-4 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-white border border-gray-200/80 text-gray-600 flex items-center justify-center shrink-0">
                        <FiFileText className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                          {spec.name}
                        </span>
                        <span
                          className={`text-[11px] font-medium flex items-center gap-1 ${
                            isSigned ? "text-[#1E7F4C]" : "text-gray-400"
                          }`}
                        >
                          {isSigned ? (
                            <>
                              <FiCheck className="w-3 h-3" /> Completed &amp; Signed
                            </>
                          ) : (
                            "In Progress"
                          )}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFormForView(
                          matchedRemote || ({ formType: spec.id, data: {} } as any),
                        );
                      }}
                      className="px-3.5 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors shrink-0 cursor-pointer"
                    >
                      View
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: CANDIDATE EVIDENCE */}
          {activeTab === "evidence" && (
            <div className="flex flex-col gap-2.5">
              {evidenceItems.length === 0 ? (
                <div className="bg-[#F8F9FA] rounded-2xl p-8 text-center text-gray-400 text-xs border border-gray-100">
                  No evidence files uploaded for this application.
                </div>
              ) : (
                evidenceItems.map((item: any, idx: number) => {
                  const docName =
                    item.documentName || item.name || `Evidence Document #${idx + 1}`;
                  const docUrl = item.asset?.url || item.url || item.fileUrl || "";
                  const docType = item.evidenceType || item.category || "Portfolio File";

                  return (
                    <div
                      key={item.id || idx}
                      className="bg-[#F8F9FA] rounded-2xl px-4 py-3.5 border border-gray-100 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-white border border-gray-200/80 text-[#8A1538] flex items-center justify-center shrink-0">
                          <FiFolder className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                            {docName}
                          </span>
                          <span className="text-[11px] text-gray-500 capitalize">
                            {String(docType).replace(/([A-Z])/g, " $1")}
                          </span>
                        </div>
                      </div>

                      {docUrl && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewItem({
                                id: String(item.id || idx),
                                name: docName,
                                size: "Evidence Asset",
                                status: "Approved",
                                statusBg: "bg-emerald-50",
                                statusText: "text-emerald-700",
                                url: docUrl,
                              })
                            }
                            className="px-3.5 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <FiEye className="w-3.5 h-3.5 text-gray-500" />
                            <span>Preview</span>
                          </button>
                          <a
                            href={docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open in new tab"
                            className="w-8 h-8 bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 rounded-xl shadow-2xs flex items-center justify-center"
                          >
                            <FiExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 3: PANEL & VERDICT */}
          {activeTab === "evaluations" && (
            <div className="flex flex-col gap-4">
              {/* Verdict Summary Row */}
              <div className="bg-[#F8F9FA] rounded-2xl p-4 border border-gray-100 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-medium text-gray-500">
                    Panel Interview Verdict
                  </span>
                  <span
                    className={`text-sm font-bold px-3 py-0.5 rounded-full w-fit ${
                      recordedVerdict === "Competent"
                        ? "bg-[#1E7F4C]/10 text-[#1E7F4C]"
                        : recordedVerdict === "Incompetent"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {recordedVerdict}
                  </span>
                </div>

                {interviewSchedule?.scheduledAt && (
                  <div className="flex flex-col text-xs text-gray-500 sm:text-right">
                    <span className="font-semibold text-gray-800">
                      {new Date(interviewSchedule.scheduledAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      &bull;{" "}
                      {new Date(interviewSchedule.scheduledAt).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                    <span>Venue: {interviewSchedule.location || "Online"}</span>
                  </div>
                )}
              </div>

              {/* Panel Members List */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-gray-500">
                  Panelists ({panelMembers.length})
                </span>

                {panelMembers.map((member: any, i: number) => {
                  const roleLabel = member.isLead
                    ? "Lead Panelist"
                    : member.isObserver
                      ? "Internal Verifier"
                      : "Panel Member";

                  const isLeadSigned = Boolean(
                    member.isLead &&
                      (recordedVerdict === "Competent" ||
                        recordedVerdict === "Incompetent" ||
                        isIvDone ||
                        stagesData?.some(
                          (s) =>
                            (s.stageKey === "interview" && s.status === "successful") ||
                            (s.stageKey === "internal_verification" &&
                              (s.status === "in_progress" ||
                                s.status === "successful" ||
                                (s.status as string) === "completed")),
                        ) ||
                        formsList.some(
                          (f) =>
                            Boolean(f.assessorSignedAt) ||
                            Boolean(f.status === "completed") ||
                            Boolean((f.data as any)?.assessorSignature) ||
                            Boolean((f.data as any)?.leadSignature) ||
                            Boolean((f.data as any)?.leadPanelistSigned) ||
                            Boolean((f.data as any)?.assessorSigned),
                        )),
                  );

                  const isObserverSigned = Boolean(
                    member.isObserver &&
                      (isIvDone ||
                        ivStage?.status === "successful" ||
                        (ivStage?.status as string) === "completed" ||
                        panelistRecords.some(
                          (pr) =>
                            (pr.assessorId === member.assessorId || pr.isObserver) &&
                            Boolean(
                              (pr.data as any)?.assessorSignature ||
                                (pr.data as any)?.assessorSigned ||
                                (pr.data as any)?.ivSignature ||
                                (pr.data as any)?.internalVerifierSigned,
                            ),
                        )),
                  );

                  const isPanelMemberSigned = Boolean(
                    panelistRecords.some(
                      (pr) =>
                        (pr.assessorId === member.assessorId ||
                          ((pr as any).userId &&
                            (pr as any).userId === member.assessorId) ||
                          (member.isLead && pr.isLead) ||
                          (member.isObserver && pr.isObserver)) &&
                        Boolean(
                          (pr.data as any)?.assessorSignature ||
                            (pr.data as any)?.assessorSigned ||
                            (pr.data as any)?.panelMemberSigned,
                        ),
                    ),
                  );

                  const isSigned = Boolean(
                    member.signed ||
                      isLeadSigned ||
                      isObserverSigned ||
                      isPanelMemberSigned,
                  );

                  return (
                    <div
                      key={member.assessorId || i}
                      className="bg-[#F8F9FA] rounded-2xl px-4 py-3 border border-gray-100 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar
                          name={member.name || `Panelist ${i + 1}`}
                          className="w-8 h-8 shrink-0 text-xs font-bold"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                            {member.name || `Panelist ${i + 1}`}
                          </span>
                          <span className="text-[11px] text-gray-500">{roleLabel}</span>
                        </div>
                      </div>

                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0 ${
                          isSigned
                            ? "bg-[#1E7F4C]/10 text-[#1E7F4C]"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {isSigned ? "Signed" : "Pending"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Clean Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60">
          {isAssignedIv && !isIvDone ? (
            <div className="flex flex-col gap-3">
              <textarea
                value={feedback}
                onChange={(e) => {
                  setFeedback(e.target.value);
                  if (feedbackError) setFeedbackError(null);
                }}
                placeholder="Add verification notes (required if returning application)..."
                rows={2}
                className={`w-full text-xs p-3 rounded-xl border bg-white outline-none resize-none transition-colors ${
                  feedbackError
                    ? "border-rose-400 focus:ring-1 focus:ring-rose-400"
                    : "border-gray-200 focus:border-[#fbab2a]"
                }`}
              />
              {feedbackError && (
                <span className="text-rose-600 text-xs font-medium">
                  {feedbackError}
                </span>
              )}

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => handleReview("reject")}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  Return Application
                </button>

                <button
                  type="button"
                  onClick={() => handleReview("approve")}
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#1E7F4C] hover:bg-[#17663C] text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Approve & Verify"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="text-xs text-gray-500">
                {isIvDone
                  ? "Internal verification is complete."
                  : "Awaiting Internal Verifier review."}
              </span>

              <div className="flex items-center gap-2">
                {isIvDone && !isAssignedIv ? (
                  <>
                    <button
                      type="button"
                      onClick={handleGenerateShareLink}
                      disabled={createShareTokenMutation.isPending}
                      className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <FiShare2 className="w-3.5 h-3.5 text-gray-500" />
                      <span>{hasCopiedLink ? "Copied!" : "Share Link"}</span>
                    </button>

                    <button
                      type="button"
                      disabled={isForwarding || isForwarded}
                      onClick={handleForwardToAwardingBody}
                      className="px-4 py-2 bg-[#FBAB2A] hover:bg-[#E89B1F] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs disabled:opacity-60"
                    >
                      <FiSend className="w-3.5 h-3.5" />
                      <span>
                        {isForwarded
                          ? "Forwarded"
                          : isForwarding
                            ? "Forwarding..."
                            : "Forward to Awarding Body"}
                      </span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nested Modal: Full Form Document View */}
      {selectedFormForView && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">
            <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-900">
                {FORM_TITLES[selectedFormForView.formType] || selectedFormForView.formType}
              </span>
              <button
                type="button"
                onClick={() => setSelectedFormForView(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center cursor-pointer"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-8">
              <AssessorAssessmentFormDocumentView
                applicationId={applicationId}
                formId={selectedFormForView.formType}
                candidateName={candidateFullName}
                formData={selectedFormForView.data || {}}
                onBack={() => setSelectedFormForView(null)}
                formRecord={selectedFormForView}
                panelistRecords={panelistRecords}
                interviewPanel={interviewPanel}
                applicationTrade={resolvedTrade}
                isInterviewStage={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Evidence Document Preview Modal */}
      {previewItem && (
        <PreviewEvidenceModal
          item={previewItem}
          applicationId={applicationId}
          onClose={() => setPreviewItem(null)}
        />
      )}
    </div>
  );
};
