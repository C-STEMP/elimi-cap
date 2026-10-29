"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { AssessorAssessmentFormLayout } from "./AssessorAssessmentFormLayout";
import { useToast } from "@/src/components/ui/toast";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import type { AssessmentMappingUnit } from "@/src/features/shared/applications/api/types";
import type { Unit } from "@/src/features/shared/reference/api";
import { useResolveAssets } from "@/src/features/shared/storage/hooks";
import { useAssessorSignature } from "./useAssessorSignature";
import { AssessorSignatureModal } from "./AssessorSignatureModal";
import { DigitalSignaturePad } from "./DigitalSignaturePad";
import {
  buildUnitInterviewQuestions,
  type GeneratedQuestionItem,
} from "./utils";

export type InterviewQuestionItem = GeneratedQuestionItem;

interface InterviewRecordFormProps {
  candidateName: string;
  onBack: () => void;
  onSubmit: (data: Record<string, any>) => void;
  formData?: Record<string, any>;
  isReadOnly?: boolean;
  applicationTrade?: string;
  unitLabels?: string[];
  scopedUnits?: Unit[];
  mappingUnits?: AssessmentMappingUnit[];
  levelLabel?: string;
  defaultInterviewerNames?: string;
  defaultDate?: string;
}

export const InterviewRecordForm: React.FC<InterviewRecordFormProps> = ({
  candidateName,
  onBack,
  onSubmit,
  formData,
  isReadOnly = false,
  applicationTrade,
  scopedUnits = [],
  mappingUnits = [],
  levelLabel = "Level 1",
  defaultInterviewerNames = "",
  defaultDate = "",
}) => {
  const { toast } = useToast();

  const [candidateFullName, setCandidateFullName] = useState<string>(
    candidateName || formData?.candidateFullName || "",
  );
  const [levelAppliedFor, setLevelAppliedFor] = useState<string>(
    levelLabel || formData?.levelAppliedFor || formData?.level || "Level 1",
  );
  const [interviewerNames, setInterviewerNames] = useState<string>(
    defaultInterviewerNames ||
      formData?.interviewerNames ||
      formData?.assessorName ||
      "",
  );
  const [interviewDate, setInterviewDate] = useState<string>(
    defaultDate ||
      formData?.interviewDate ||
      new Date().toISOString().split("T")[0],
  );

  // Sync Personal Details with resolved application/panel/schedule data
  useEffect(() => {
    if (candidateName) setCandidateFullName(candidateName);
  }, [candidateName]);

  useEffect(() => {
    if (levelLabel) setLevelAppliedFor(levelLabel);
  }, [levelLabel]);

  useEffect(() => {
    if (defaultInterviewerNames) setInterviewerNames(defaultInterviewerNames);
  }, [defaultInterviewerNames]);

  useEffect(() => {
    if (defaultDate) setInterviewDate(defaultDate);
  }, [defaultDate]);

  const generatedDefaults = React.useMemo(
    () =>
      buildUnitInterviewQuestions({
        scopedUnits,
        mappingUnits,
        tradeName: applicationTrade,
        levelLabel,
      }),
    [scopedUnits, mappingUnits, applicationTrade, levelLabel],
  );

  const hasSavedQuestions =
    Array.isArray(formData?.questions) && formData.questions.length > 0;
  const [hasUserEditedQuestions, setHasUserEditedQuestions] =
    useState<boolean>(hasSavedQuestions);

  const [questions, setQuestions] = useState<InterviewQuestionItem[]>(() => {
    if (hasSavedQuestions) {
      return formData!.questions.map((q: any, i: number) => ({
        id: q.id || `q-${i + 1}`,
        question: q.question ?? "",
        candidateResponse: q.candidateResponse || q.response || "",
        isCustom: Boolean(q.isCustom),
      }));
    }
    return generatedDefaults;
  });

  useEffect(() => {
    if (!hasSavedQuestions && !hasUserEditedQuestions && !isReadOnly) {
      setQuestions(generatedDefaults);
    }
  }, [generatedDefaults, hasSavedQuestions, hasUserEditedQuestions, isReadOnly]);

  const [strengths, setStrengths] = useState<string>(
    formData?.strengths ?? formData?.panelistSummaryNotes ?? "",
  );
  const [areasForDevelopment, setAreasForDevelopment] = useState<string>(
    formData?.areasForDevelopment ?? "",
  );

  const {
    signatureUrl: profileSignatureUrl,
    signatureAssetId: profileSignatureAssetId,
    hasSignature: hasProfileSignature,
  } = useAssessorSignature();

  const [signatureModalTarget, setSignatureModalTarget] = useState<
    "lead" | "panel" | "iv" | null
  >(null);

  const [leadPanelistSigned, setLeadPanelistSigned] = useState<boolean>(
    Boolean(
      formData?.leadPanelistSigned ||
        formData?.assessorSigned ||
        formData?.assessorSignedAt,
    ),
  );
  const [leadPanelistSignedAt, setLeadPanelistSignedAt] = useState<string>(
    formData?.leadPanelistSignedAt || formData?.assessorSignedAt || "",
  );
  const [leadPanelistSignatureAssetId, setLeadPanelistSignatureAssetId] =
    useState<string>(
      formData?.leadPanelistSignatureAssetId ||
        formData?.assessorSignatureAssetId ||
        "",
    );
  const [leadPanelistSignatureUrl, setLeadPanelistSignatureUrl] =
    useState<string>(
      formData?.leadPanelistSignatureUrl ||
        formData?.assessorSignatureUrl ||
        "",
    );

  const [panelMemberSigned, setPanelMemberSigned] = useState<boolean>(
    Boolean(formData?.panelMemberSigned || formData?.panelMemberSignedAt),
  );
  const [panelMemberSignedAt, setPanelMemberSignedAt] = useState<string>(
    formData?.panelMemberSignedAt || "",
  );
  const [panelMemberSignatureAssetId, setPanelMemberSignatureAssetId] =
    useState<string>(formData?.panelMemberSignatureAssetId || "");
  const [panelMemberSignatureUrl, setPanelMemberSignatureUrl] =
    useState<string>(formData?.panelMemberSignatureUrl || "");

  const [internalVerifierSigned, setInternalVerifierSigned] = useState<boolean>(
    Boolean(
      formData?.internalVerifierSigned ||
        formData?.ivSigned ||
        formData?.internalVerifierSignedAt,
    ),
  );
  const [internalVerifierSignedAt, setInternalVerifierSignedAt] =
    useState<string>(
      formData?.internalVerifierSignedAt || formData?.ivSignedAt || "",
    );
  const [internalVerifierSignatureAssetId, setInternalVerifierSignatureAssetId] =
    useState<string>(
      formData?.internalVerifierSignatureAssetId ||
        formData?.ivSignatureAssetId ||
        "",
    );
  const [internalVerifierSignatureUrl, setInternalVerifierSignatureUrl] =
    useState<string>(
      formData?.internalVerifierSignatureUrl ||
        formData?.ivSignatureUrl ||
        "",
    );

  const sigAssetsToResolve = useMemo(() => {
    const list: string[] = [];
    if (leadPanelistSignatureAssetId && !leadPanelistSignatureUrl) {
      list.push(leadPanelistSignatureAssetId);
    }
    if (panelMemberSignatureAssetId && !panelMemberSignatureUrl) {
      list.push(panelMemberSignatureAssetId);
    }
    if (internalVerifierSignatureAssetId && !internalVerifierSignatureUrl) {
      list.push(internalVerifierSignatureAssetId);
    }
    return list;
  }, [
    leadPanelistSignatureAssetId,
    leadPanelistSignatureUrl,
    panelMemberSignatureAssetId,
    panelMemberSignatureUrl,
    internalVerifierSignatureAssetId,
    internalVerifierSignatureUrl,
  ]);
  const { data: resolvedSigAssets } = useResolveAssets(sigAssetsToResolve);

  const activeLeadSignatureUrl =
    leadPanelistSignatureUrl ||
    resolvedSigAssets?.find((a) => a.assetId === leadPanelistSignatureAssetId)
      ?.url ||
    (leadPanelistSigned ? profileSignatureUrl : null);

  const activePanelSignatureUrl =
    panelMemberSignatureUrl ||
    resolvedSigAssets?.find((a) => a.assetId === panelMemberSignatureAssetId)
      ?.url ||
    (panelMemberSigned ? profileSignatureUrl : null);

  const activeIvSignatureUrl =
    internalVerifierSignatureUrl ||
    resolvedSigAssets?.find(
      (a) => a.assetId === internalVerifierSignatureAssetId,
    )?.url ||
    (internalVerifierSigned ? profileSignatureUrl : null);

  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const titleInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const pendingFocusIdRef = useRef<string | null>(null);

  useEffect(() => {
    const targetId = pendingFocusIdRef.current;
    if (!targetId) return;
    pendingFocusIdRef.current = null;

    const cardEl = itemRefs.current[targetId];
    const inputEl = titleInputRefs.current[targetId];
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    if (inputEl) {
      setTimeout(() => {
        inputEl.focus();
      }, 150);
    }
  }, [questions.length]);

  const updateQuestionTitle = (id: string, text: string) => {
    if (isReadOnly) return;
    setHasUserEditedQuestions(true);
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, question: text } : q)),
    );
  };

  const updateResponse = (id: string, text: string) => {
    if (isReadOnly) return;
    setHasUserEditedQuestions(true);
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, candidateResponse: text } : q)),
    );
  };

  const handleAddQuestion = () => {
    if (isReadOnly) return;
    const newId = `q-custom-${Date.now()}`;
    setHasUserEditedQuestions(true);
    pendingFocusIdRef.current = newId;
    setQuestions((prev) => [
      ...prev,
      {
        id: newId,
        question: "",
        candidateResponse: "",
        isCustom: true,
      },
    ]);
    toast({
      type: "success",
      title: "Question Added",
      description: "A new question item has been added.",
    });
  };

  const handleRemoveQuestion = (id: string) => {
    if (isReadOnly) return;
    setHasUserEditedQuestions(true);
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleAppendSignature = () => {
    if (isReadOnly) return;
    if (
      !hasProfileSignature &&
      !activeLeadSignatureUrl &&
      !leadPanelistSignatureAssetId
    ) {
      setSignatureModalTarget("lead");
      return;
    }
    const now = new Date().toISOString();
    setLeadPanelistSigned(true);
    setLeadPanelistSignedAt(now);
    setLeadPanelistSignatureAssetId(
      profileSignatureAssetId || leadPanelistSignatureAssetId || "",
    );
    setLeadPanelistSignatureUrl(
      profileSignatureUrl || activeLeadSignatureUrl || "",
    );
    toast({
      type: "success",
      title: "Signature Appended",
      description: "Lead panelist official signature has been recorded.",
    });
  };

  const handleAppendPanelMemberSignature = () => {
    if (isReadOnly) return;
    if (
      !hasProfileSignature &&
      !activePanelSignatureUrl &&
      !panelMemberSignatureAssetId
    ) {
      setSignatureModalTarget("panel");
      return;
    }
    const now = new Date().toISOString();
    setPanelMemberSigned(true);
    setPanelMemberSignedAt(now);
    setPanelMemberSignatureAssetId(
      profileSignatureAssetId || panelMemberSignatureAssetId || "",
    );
    setPanelMemberSignatureUrl(
      profileSignatureUrl || activePanelSignatureUrl || "",
    );
    toast({
      type: "success",
      title: "Signature Appended",
      description: "Panel member official signature has been recorded.",
    });
  };

  const handleAppendIvSignature = () => {
    if (isReadOnly) return;
    if (
      !hasProfileSignature &&
      !activeIvSignatureUrl &&
      !internalVerifierSignatureAssetId
    ) {
      setSignatureModalTarget("iv");
      return;
    }
    const now = new Date().toISOString();
    setInternalVerifierSigned(true);
    setInternalVerifierSignedAt(now);
    setInternalVerifierSignatureAssetId(
      profileSignatureAssetId || internalVerifierSignatureAssetId || "",
    );
    setInternalVerifierSignatureUrl(
      profileSignatureUrl || activeIvSignatureUrl || "",
    );
    toast({
      type: "success",
      title: "Signature Appended",
      description: "Internal verifier official signature has been recorded.",
    });
  };

  const handleSignatureUploadSuccess = (sig: {
    assetId: string;
    url?: string;
  }) => {
    const now = new Date().toISOString();
    if (signatureModalTarget === "lead") {
      setLeadPanelistSigned(true);
      setLeadPanelistSignedAt(now);
      setLeadPanelistSignatureAssetId(sig.assetId);
      setLeadPanelistSignatureUrl(sig.url || "");
    } else if (signatureModalTarget === "panel") {
      setPanelMemberSigned(true);
      setPanelMemberSignedAt(now);
      setPanelMemberSignatureAssetId(sig.assetId);
      setPanelMemberSignatureUrl(sig.url || "");
    } else if (signatureModalTarget === "iv") {
      setInternalVerifierSigned(true);
      setInternalVerifierSignedAt(now);
      setInternalVerifierSignatureAssetId(sig.assetId);
      setInternalVerifierSignatureUrl(sig.url || "");
    }
    setSignatureModalTarget(null);
  };

  const handleSubmit = () => {
    if (isReadOnly) return;
    if (!leadPanelistSigned && !activeLeadSignatureUrl) {
      toast({
        type: "error",
        title: "Signature Required",
        description:
          "Please append your lead panelist signature before submitting.",
      });
      if (!hasProfileSignature) {
        setSignatureModalTarget("lead");
      }
      return;
    }
    const now = new Date().toISOString();
    onSubmit({
      candidateFullName,
      levelAppliedFor,
      interviewerNames,
      interviewDate,
      questions,
      strengths,
      areasForDevelopment,
      leadPanelistSigned: true,
      leadPanelistSignedAt: leadPanelistSignedAt || now,
      leadPanelistSignatureAssetId:
        leadPanelistSignatureAssetId || profileSignatureAssetId || undefined,
      leadPanelistSignatureUrl: activeLeadSignatureUrl || undefined,
      panelMemberSigned,
      panelMemberSignedAt: panelMemberSigned
        ? panelMemberSignedAt || now
        : undefined,
      panelMemberSignatureAssetId: panelMemberSigned
        ? panelMemberSignatureAssetId || undefined
        : undefined,
      panelMemberSignatureUrl: panelMemberSigned
        ? activePanelSignatureUrl || undefined
        : undefined,
      facilitatorSigned: panelMemberSigned,
      facilitatorSignedAt: panelMemberSigned
        ? panelMemberSignedAt || now
        : undefined,
      internalVerifierSigned,
      internalVerifierSignedAt: internalVerifierSigned
        ? internalVerifierSignedAt || now
        : undefined,
      internalVerifierSignatureAssetId: internalVerifierSigned
        ? internalVerifierSignatureAssetId || undefined
        : undefined,
      internalVerifierSignatureUrl: internalVerifierSigned
        ? activeIvSignatureUrl || undefined
        : undefined,
      assessorSigned: true,
      assessorSignedAt: leadPanelistSignedAt || now,
      assessorSignatureAssetId:
        leadPanelistSignatureAssetId || profileSignatureAssetId || undefined,
      assessorSignatureUrl: activeLeadSignatureUrl || undefined,
    });
  };

  return (
    <AssessorAssessmentFormLayout
      title="Interview Question Bank & Record Sheet"
      subtitle="Structured oral questioning instrument assessing theoretical knowledge, safety protocols, and problem-solving."
      onBack={onBack}
      onSubmit={handleSubmit}
      submitLabel="Submit Form"
      isReadOnly={isReadOnly}
    >
      {/* 1. Personal Details (Auto-filled & Locked) */}
      <div className="flex flex-col gap-4 sm:gap-5">
        <h3 className="text-sm sm:text-base font-bold text-neutral-primary">
          Personal Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-neutral-primary">
              Candidate Full Name<span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={candidateFullName}
              disabled
              readOnly
              placeholder="Candidate Name"
              className="w-full h-11 sm:h-12 bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 text-xs sm:text-sm text-neutral-primary disabled:opacity-80 disabled:cursor-not-allowed transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-neutral-primary">
              Level Applied For<span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={levelAppliedFor}
              disabled
              readOnly
              className="w-full h-11 sm:h-12 bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 text-xs sm:text-sm text-neutral-primary disabled:opacity-80 disabled:cursor-not-allowed transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-neutral-primary">
              Interviewer Name(s)
            </label>
            <input
              type="text"
              value={interviewerNames}
              disabled
              readOnly
              placeholder="Interviewer names"
              className="w-full h-11 sm:h-12 bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 text-xs sm:text-sm text-neutral-primary disabled:opacity-80 disabled:cursor-not-allowed transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-neutral-primary">
              Date of Interview
            </label>
            <input
              type="date"
              value={interviewDate}
              disabled
              readOnly
              className="w-full h-11 sm:h-12 bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 text-xs sm:text-sm text-neutral-primary disabled:opacity-80 disabled:cursor-not-allowed transition-all"
            />
          </div>
        </div>
      </div>

      {/* 2. Question Bank & Live Responses (Matches Practical Observation Checklist UI) */}
      <div className="flex flex-col gap-4 pt-4 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
          <h3 className="text-sm sm:text-base font-bold text-neutral-primary">
            Question Bank &amp; Live Responses
          </h3>
          {!isReadOnly && (
            <button
              type="button"
              onClick={handleAddQuestion}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#8A1538] text-[#8A1538] text-xs font-semibold hover:bg-[#8A1538]/5 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <FiPlus className="w-3.5 h-3.5" />
              Add Question
            </button>
          )}
        </div>

        {questions.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-gray-200 text-center text-xs text-neutral-secondary">
            No interview questions recorded yet.
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            {questions.map((q, idx) => {
              const isEditableTitle =
                q.isCustom ||
                q.id.startsWith("q-custom-") ||
                !q.question ||
                /^Additional Question \d+$/i.test(q.question);

              return (
                <div
                  key={q.id}
                  ref={(el) => {
                    itemRefs.current[q.id] = el;
                  }}
                  className="bg-[#F8F9FA] rounded-2xl p-4 sm:p-5 border border-gray-100 flex flex-col gap-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-secondary shrink-0">
                        #{idx + 1}
                      </span>
                      {!isEditableTitle ? (
                        <span className="text-xs sm:text-sm font-bold text-neutral-primary">
                          {q.question}
                          <span className="text-rose-500">*</span>
                        </span>
                      ) : (
                        <input
                          ref={(el) => {
                            titleInputRefs.current[q.id] = el;
                          }}
                          type="text"
                          disabled={isReadOnly}
                          value={
                            /^Additional Question \d+$/i.test(q.question)
                              ? ""
                              : q.question
                          }
                          onChange={(e) =>
                            updateQuestionTitle(q.id, e.target.value)
                          }
                          placeholder="e.g. Explain the procedure and safety checks for this unit"
                          className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs sm:text-sm font-medium text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] disabled:opacity-80"
                        />
                      )}
                    </div>

                    {!isReadOnly && questions.length > 1 && (
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(q.id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete question"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <textarea
                    rows={2}
                    value={q.candidateResponse}
                    disabled={isReadOnly}
                    onChange={(e) => updateResponse(q.id, e.target.value)}
                    placeholder="Type Comments / Candidate Response Here"
                    className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs text-neutral-primary placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] resize-none disabled:opacity-80"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Overall Assessment */}
      <div className="flex flex-col gap-4 pt-4 border-t border-gray-100">
        <h3 className="text-sm sm:text-base font-bold text-neutral-primary">
          Overall Assessment
        </h3>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs sm:text-sm font-medium text-neutral-primary">
              Strengths Identified<span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Type Here"
              value={strengths}
              disabled={isReadOnly}
              onChange={(e) => setStrengths(e.target.value)}
              className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-neutral-primary placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] resize-none disabled:opacity-80 transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs sm:text-sm font-medium text-neutral-primary">
              Areas for Development<span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Type Here"
              value={areasForDevelopment}
              disabled={isReadOnly}
              onChange={(e) => setAreasForDevelopment(e.target.value)}
              className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-neutral-primary placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] resize-none disabled:opacity-80 transition-all"
            />
          </div>
        </div>
      </div>

      {/* 4. Interviewer Declaration */}
      <div className="flex flex-col gap-4 pt-4 border-t border-gray-100">
        <h3 className="text-sm sm:text-base font-bold text-neutral-primary">
          Interviewer Declaration
        </h3>

        <p className="text-xs text-neutral-secondary italic">
          I confirm that the information provided in this assessment is true and
          based on my own participation
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Lead Panelist */}
          <DigitalSignaturePad
            label="Lead Panelist"
            required
            isSigned={leadPanelistSigned}
            signerName={formData?.leadPanelistName || interviewerNames || "Lead Panelist"}
            signedAt={leadPanelistSignedAt}
            signatureUrl={activeLeadSignatureUrl}
            isReadOnly={isReadOnly}
            onAppendSignature={handleAppendSignature}
            onChangeSignature={() => setSignatureModalTarget("lead")}
            onClearSignature={() => {
              setLeadPanelistSigned(false);
              setLeadPanelistSignedAt("");
            }}
          />

          {/* Panel Member */}
          <DigitalSignaturePad
            label="Panel Member"
            required
            isSigned={panelMemberSigned}
            signerName={formData?.panelMemberName || "Panel Member"}
            signedAt={panelMemberSignedAt}
            signatureUrl={activePanelSignatureUrl}
            isReadOnly={isReadOnly}
            onAppendSignature={handleAppendPanelMemberSignature}
            onChangeSignature={() => setSignatureModalTarget("panel")}
            onClearSignature={() => {
              setPanelMemberSigned(false);
              setPanelMemberSignedAt("");
            }}
          />

          {/* Internal Verifier */}
          <DigitalSignaturePad
            label="Internal Verifier"
            required
            isSigned={internalVerifierSigned}
            signerName={formData?.internalVerifierName || "Internal Verifier"}
            signedAt={internalVerifierSignedAt}
            signatureUrl={activeIvSignatureUrl}
            isReadOnly={isReadOnly}
            onAppendSignature={handleAppendIvSignature}
            onChangeSignature={() => setSignatureModalTarget("iv")}
            onClearSignature={() => {
              setInternalVerifierSigned(false);
              setInternalVerifierSignedAt("");
            }}
          />
        </div>
      </div>

      <AssessorSignatureModal
        isOpen={Boolean(signatureModalTarget)}
        onClose={() => setSignatureModalTarget(null)}
        onSuccess={handleSignatureUploadSuccess}
        title={
          signatureModalTarget === "lead"
            ? "Upload Lead Panelist Signature"
            : signatureModalTarget === "panel"
              ? "Upload Panel Member Signature"
              : "Upload Internal Verifier Signature"
        }
      />
    </AssessorAssessmentFormLayout>
  );
};
