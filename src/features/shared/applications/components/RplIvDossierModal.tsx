"use client";

import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  FiX,
  FiCheck,
  FiCheckCircle,
  FiAlertCircle,
  FiAlertTriangle,
  FiEye,
  FiFileText,
  FiFolder,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUsers,
  FiShare2,
  FiSend,
  FiCopy,
  FiExternalLink,
  FiShield,
  FiLayers,
} from "react-icons/fi";
import { Button } from "@/src/components/ui/button";
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
  isAssignedIv?: boolean; // True ONLY for the actively assigned IV
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

  // Form viewing modal state
  const [selectedFormForView, setSelectedFormForView] = useState<InterviewForm | null>(null);

  // Evidence preview modal state
  const [previewItem, setPreviewItem] = useState<EvidenceRecord | null>(null);

  // Centre share / forward state
  const [isForwarding, setIsForwarding] = useState(false);
  const [isForwarded, setIsForwarded] = useState(false);
  const [shareLink, setShareLink] = useState("");
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

  // Determine lead evaluation notes / verdict
  const leadMember = panelMembers.find((m: any) => m.isLead);
  const leadRecord = formsList[0]?.data;
  const recordedVerdict =
    leadRecord?.verdict ||
    (application as any)?.interviewOutcome ||
    (isIvDone ? "Competent" : "Pending");

  const handleReview = async (decision: "approve" | "reject") => {
    if (decision === "reject" && !feedback.trim()) {
      setFeedbackError("Feedback is required when rejecting this application.");
      return;
    }
    setFeedbackError(null);
    setApiError(null);
    setIsSubmitting(true);

    const finalFeedback =
      feedback.trim() ||
      (decision === "approve"
        ? "Candidate verified and confirmed competent by Internal Verifier."
        : "Application rejected by Internal Verifier.");

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
            ? "Internal Verification Approved"
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
          "Access Denied: Only the actively assigned Internal Verifier for this application may review.";
      } else if (
        status === 409 ||
        msg.toLowerCase().includes("stage") ||
        msg.toLowerCase().includes("conflict")
      ) {
        customMsg =
          "Stage Conflict: This application is not currently at the internal verification stage.";
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
      setShareLink(fullUrl);
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(fullUrl);
        setHasCopiedLink(true);
        setTimeout(() => setHasCopiedLink(false), 3000);
      }
      toast({
        type: "success",
        title: "Dossier Link Ready",
        description: "Public link copied to clipboard.",
      });
    } catch (err: any) {
      toast({
        type: "error",
        title: "Share Link Failed",
        description: err?.message || "Could not generate share token.",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-start justify-between gap-4 bg-[#F8F9FA]/80">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-[#8A1538]/10 text-[#8A1538] flex items-center justify-center shrink-0 border border-[#8A1538]/20">
              <FiShield className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-[#8A1538] uppercase tracking-wider">
                  RPL Internal Verification Dossier
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isIvDone
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {isIvDone ? "IV Completed" : "Under Review"}
                </span>
                {!isAssignedIv && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    Centre View (Read-Only)
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate mt-0.5">
                {candidateFullName}
              </h2>
              <p className="text-xs text-gray-500 truncate">
                Trade: {resolvedTrade} &bull; Application ID: {applicationId.slice(0, 8)}...
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* API Error Banner (Handles 403 & 409) */}
        {apiError && (
          <div
            className={`p-4 border-b flex items-start gap-3 ${
              apiError.code === 403
                ? "bg-rose-50 border-rose-200 text-rose-800"
                : apiError.code === 409
                  ? "bg-amber-50 border-amber-200 text-amber-800"
                  : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            <FiAlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex flex-col text-xs">
              <span className="font-bold">
                {apiError.code === 403
                  ? "403 Unauthorized: Not the Assigned IV"
                  : apiError.code === 409
                    ? "409 Conflict: Wrong Stage"
                    : "Review Submission Error"}
              </span>
              <span>{apiError.message}</span>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 sm:px-6 pt-3 border-b border-gray-100 overflow-x-auto scrollbar-none bg-white">
          <button
            type="button"
            onClick={() => setActiveTab("forms")}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "forms"
                ? "border-[#8A1538] text-[#8A1538]"
                : "border-transparent text-gray-500 hover:text-black"
            }`}
          >
            <FiFileText className="w-4 h-4" />
            <span>Assessment Forms ({formsList.length || 4})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("evidence")}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "evidence"
                ? "border-[#8A1538] text-[#8A1538]"
                : "border-transparent text-gray-500 hover:text-black"
            }`}
          >
            <FiFolder className="w-4 h-4" />
            <span>Candidate Evidence ({evidenceItems.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("evaluations")}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "evaluations"
                ? "border-[#8A1538] text-[#8A1538]"
                : "border-transparent text-gray-500 hover:text-black"
            }`}
          >
            <FiUsers className="w-4 h-4" />
            <span>Panel Evaluations &amp; Verdict</span>
          </button>
        </div>

        {/* Dossier Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col gap-6">
          {/* TAB 1: ASSESSMENT FORMS */}
          {activeTab === "forms" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Official NBTE Assessment Instruments
                  </h3>
                  <p className="text-xs text-gray-500">
                    Review completed instruments, scoring criteria, and panelist signatures.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {[
                  {
                    id: "assessment_grid",
                    name: "RPL Assessment Grid / Mapping Form",
                    code: "NBTE/RPL/AG-01",
                  },
                  {
                    id: "skill_demonstration",
                    name: "Skills Demonstration Records Form",
                    code: "NBTE/RPL/SDR-01",
                  },
                  {
                    id: "practical_observation",
                    name: "Practical Observation Record",
                    code: "NBTE/RPL/POR-02",
                  },
                  {
                    id: "records",
                    name: "Interview Question Bank & Record Sheet",
                    code: "NBTE/RPL/IR-01",
                  },
                ].map((spec) => {
                  const matchedRemote = formsList.find(
                    (f) =>
                      (f.formType as string) === spec.id ||
                      (spec.id === "skill_demonstration" && (f.formType as string) === "skills_demo") ||
                      (spec.id === "assessment_grid" && (f.formType as string) === "assessment_mapping"),
                  );
                  const isCandSigned = Boolean(
                    matchedRemote?.candidateSignedAt ||
                      (matchedRemote?.data as any)?.candidateSignedAt,
                  );
                  const isLeadSigned = Boolean(
                    matchedRemote?.assessorSignedAt ||
                      (matchedRemote?.data as any)?.assessorSigned ||
                      (matchedRemote?.data as any)?.leadPanelistSigned,
                  );

                  return (
                    <div
                      key={spec.id}
                      className="bg-[#F8F9FA] rounded-2xl p-4 border border-gray-200/70 flex flex-col justify-between gap-3 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                          <FiFileText className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] font-mono font-bold text-gray-400">
                            {spec.code}
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                            {spec.name}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            {isLeadSigned ? (
                              <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <FiCheck className="w-3 h-3" /> Assessor Signed
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                                In Progress
                              </span>
                            )}
                            {isCandSigned && (
                              <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <FiCheck className="w-3 h-3" /> Candidate Signed
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end border-t border-gray-200/60 pt-2.5">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            setSelectedFormForView(
                              matchedRemote || ({ formType: spec.id, data: {} } as any),
                            )
                          }
                          className="text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
                        >
                          <FiEye className="w-3.5 h-3.5" />
                          <span>View Form (Read-Only)</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: CANDIDATE EVIDENCE */}
          {activeTab === "evidence" && (
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Candidate Portfolios &amp; Evidence Files
                </h3>
                <p className="text-xs text-gray-500">
                  Work samples, certifications, and verification documentation submitted by candidate.
                </p>
              </div>

              {evidenceItems.length === 0 ? (
                <div className="bg-[#F8F9FA] rounded-2xl p-8 text-center text-gray-400 text-xs italic border border-gray-100">
                  No independent evidence artifacts uploaded in the vault for this application.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {evidenceItems.map((item: any, idx: number) => {
                    const docName = item.documentName || item.name || `Evidence Document #${idx + 1}`;
                    const docUrl = item.asset?.url || item.url || item.fileUrl || "";
                    const docType = item.evidenceType || item.category || "Portfolio File";

                    return (
                      <div
                        key={item.id || idx}
                        className="bg-[#F8F9FA] border border-gray-200/70 rounded-2xl p-3.5 flex flex-col justify-between gap-3"
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-rose-50 text-[#8A1538] flex items-center justify-center shrink-0">
                            <FiFolder className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-gray-900 truncate">
                              {docName}
                            </span>
                            <span className="text-[10px] text-gray-500 capitalize">
                              {String(docType).replace(/([A-Z])/g, " $1")}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 border-t border-gray-200/60 pt-2">
                          {docUrl && (
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
                              className="px-2.5 py-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                            >
                              <FiEye className="w-3 h-3" />
                              <span>Preview</span>
                            </button>
                          )}
                          {docUrl && (
                            <a
                              href={docUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold rounded-lg flex items-center gap-1"
                            >
                              <FiExternalLink className="w-3 h-3" />
                              <span>Open</span>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PANEL EVALUATIONS & VERDICT */}
          {activeTab === "evaluations" && (
            <div className="flex flex-col gap-4">
              {/* Verdict Summary Card */}
              <div className="bg-[#F8F9FA] rounded-2xl p-4 sm:p-5 border border-gray-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Panel Interview Verdict
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-base font-extrabold px-3 py-1 rounded-full ${
                        recordedVerdict === "Competent"
                          ? "bg-emerald-100 text-emerald-800"
                          : recordedVerdict === "Incompetent"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {recordedVerdict}
                    </span>
                  </div>
                </div>

                {interviewSchedule?.scheduledAt && (
                  <div className="flex flex-col text-xs text-gray-600 sm:text-right">
                    <span className="font-semibold text-gray-700">Interview Scheduled:</span>
                    <span>
                      {new Date(interviewSchedule.scheduledAt).toLocaleDateString("en-GB", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      at{" "}
                      {new Date(interviewSchedule.scheduledAt).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      Venue: {interviewSchedule.location || "Online"}
                    </span>
                  </div>
                )}
              </div>

              {/* Panel Members & Signatures List */}
              <div className="flex flex-col gap-2.5">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                  Panel Assessors &amp; Sign-Off Records
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {panelMembers.map((member: any, i: number) => {
                    const roleLabel = member.isLead
                      ? "Lead Panelist"
                      : member.isObserver
                        ? "Internal Verifier"
                        : "Panel Member";
                    const isSigned = Boolean(
                      member.signed ||
                        panelistRecords.some(
                          (pr) =>
                            pr.assessorId === member.assessorId &&
                            ((pr.data as any)?.assessorSignature || (pr.data as any)?.assessorSigned),
                        ),
                    );

                    return (
                      <div
                        key={member.assessorId || i}
                        className="bg-white rounded-2xl p-3.5 border border-gray-200/80 shadow-2xs flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar
                            name={member.name || `Panelist ${i + 1}`}
                            className="w-8 h-8 shrink-0 text-xs font-bold"
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-gray-900 truncate">
                              {member.name || `Panelist ${i + 1}`}
                            </span>
                            <span className="text-[10px] text-gray-500">{roleLabel}</span>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            isSigned
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {isSigned ? "Signed" : "Pending"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer / Decision Controls */}
        <div className="p-5 sm:p-6 border-t border-gray-100 bg-[#F8F9FA]/90 flex flex-col gap-4">
          {/* ASSIGNED IV: Decision Review Section */}
          {isAssignedIv ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-800 flex items-center justify-between">
                  <span>
                    Verification Feedback &amp; Audit Notes
                    <span className="text-rose-500 ml-0.5">* (Required on Reject)</span>
                  </span>
                  <span className="text-[11px] font-normal text-gray-400">
                    Sends stageKey: &quot;internal_verification&quot;
                  </span>
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => {
                    setFeedback(e.target.value);
                    if (feedbackError) setFeedbackError(null);
                  }}
                  placeholder="Enter comments, audit observations, or specific required corrections..."
                  rows={2}
                  className={`w-full text-xs p-3 rounded-xl border bg-white outline-none resize-none transition-colors ${
                    feedbackError
                      ? "border-rose-400 focus:ring-1 focus:ring-rose-400"
                      : "border-gray-200 focus:border-[#fbab2a] focus:ring-1 focus:ring-[#fbab2a]/30"
                  }`}
                />
                {feedbackError && (
                  <span className="text-rose-600 text-xs font-semibold flex items-center gap-1 mt-0.5">
                    <FiAlertCircle className="w-3.5 h-3.5" />
                    {feedbackError}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="text-[11px] text-gray-500">
                  Signed in as assigned IV. Decision will close internal verification.
                </span>

                <div className="flex items-center gap-2.5">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handleReview("reject")}
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    className="border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
                  >
                    Reject &amp; Request Revision
                  </Button>

                  <Button
                    type="button"
                    variant="amber"
                    onClick={() => handleReview("approve")}
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs cursor-pointer"
                  >
                    Approve (Mark Competent)
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* CENTRE VIEW: Decision buttons hidden; show status & once approved, forward + share actions */
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <FiShield className="w-4 h-4 text-gray-400" />
                  <span>
                    {isIvDone
                      ? "Internal verification is complete and endorsed."
                      : "Internal verification is under review by the assigned IV. Decision buttons are restricted to the IV account."}
                  </span>
                </div>

                {isIvDone && (
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleGenerateShareLink}
                      loading={createShareTokenMutation.isPending}
                      className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <FiShare2 className="w-3.5 h-3.5 text-gray-500" />
                      <span>{hasCopiedLink ? "Link Copied!" : "Share Dossier"}</span>
                    </Button>

                    <Button
                      type="button"
                      variant="amber"
                      size="sm"
                      disabled={isForwarding || isForwarded}
                      onClick={handleForwardToAwardingBody}
                      className="bg-[#FBAB2A] hover:bg-[#E89B1F] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-60"
                    >
                      <FiSend className="w-3.5 h-3.5" />
                      <span>
                        {isForwarded
                          ? "Forwarded to Awarding Body"
                          : isForwarding
                            ? "Forwarding..."
                            : "Forward to Awarding Body"}
                      </span>
                    </Button>
                  </div>
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
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 uppercase">
                {FORM_TITLES[selectedFormForView.formType] || selectedFormForView.formType} &bull; Read-Only Dossier View
              </span>
              <button
                type="button"
                onClick={() => setSelectedFormForView(null)}
                className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 text-gray-600 flex items-center justify-center border border-gray-200 cursor-pointer"
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
