"use client";

import { useToast } from "@/src/components/ui/toast";
import type {
  AssessmentMappingUnit,
  InterviewForm,
  InterviewFormRecord,
} from "@/src/features/shared/applications/api/types";
import type { Unit } from "@/src/features/shared/reference/api";
import { useResolveAssets } from "@/src/features/shared/storage/hooks";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { AssessorAssessmentFormLayout } from "./AssessorAssessmentFormLayout";
import { DigitalSignaturePad } from "./DigitalSignaturePad";
import { useAssessorSignature } from "./useAssessorSignature";
import {
  AssessorSignatureModal,
  type AssessorSignatureData,
} from "./AssessorSignatureModal";
import {
  buildUnitInterviewQuestions,
  cleanQuestionTitle,
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
  leadMemberName?: string;
  panelMemberName?: string;
  internalVerifierName?: string;
  currentUserRole?: "lead" | "panel" | "iv";
  badgeLabel?: string;
  headerTabs?: React.ReactNode;
  bannerNotice?: React.ReactNode;
  submitLabel?: string;
  panelistRecords?: InterviewFormRecord[];
  canonicalForm?: InterviewForm | null;
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
  leadMemberName,
  panelMemberName,
  internalVerifierName,
  currentUserRole = "lead",
  badgeLabel,
  headerTabs,
  bannerNotice,
  submitLabel = "Submit Form",
  panelistRecords,
  canonicalForm,
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
      const seen = new Set<string>();
      const deduped: InterviewQuestionItem[] = [];
      formData!.questions.forEach((q: any, i: number) => {
        const cleaned = cleanQuestionTitle(q.question ?? "");
        const key = cleaned.toLowerCase().trim();
        if (key && seen.has(key)) return;
        if (key) seen.add(key);
        deduped.push({
          id: q.id || `q-${i + 1}`,
          question: cleaned,
          candidateResponse: q.candidateResponse || q.response || "",
          isCustom: Boolean(q.isCustom),
        });
      });
      return deduped;
    }
    return generatedDefaults;
  });

  useEffect(() => {
    if (!hasSavedQuestions && !hasUserEditedQuestions && !isReadOnly) {
      setQuestions(generatedDefaults);
    }
  }, [
    generatedDefaults,
    hasSavedQuestions,
    hasUserEditedQuestions,
    isReadOnly,
  ]);

  const [strengths, setStrengths] = useState<string>(
    formData?.strengths ?? formData?.panelistSummaryNotes ?? "",
  );
  const [areasForDevelopment, setAreasForDevelopment] = useState<string>(
    formData?.areasForDevelopment ?? "",
  );

  const {
    signatureUrl: profileSignatureUrl,
    signatureAssetId: profileSignatureAssetId,
  } = useAssessorSignature();

  const [signatureModalConfig, setSignatureModalConfig] = useState<{
    isOpen: boolean;
    role: "lead" | "panel" | "iv";
    title: string;
    signerName: string;
  }>({
    isOpen: false,
    role: "lead",
    title: "Append Signature",
    signerName: "",
  });

  // Check remote panel member signature from panelistRecords if not in current formData
  const remotePanelistRecord = useMemo(() => {
    return panelistRecords?.find(
      (pr) =>
        !pr.isObserver &&
        (pr.formType === "records" ||
          (pr.formType as string) === "interview_record") &&
        ((pr.data as any)?.assessorSignature ||
          (pr.data as any)?.assessorSigned ||
          (pr.data as any)?.panelMemberSigned),
    );
  }, [panelistRecords]);

  // Check remote IV signature from panelistRecords if not in current formData
  const remoteIvRecord = useMemo(() => {
    return panelistRecords?.find(
      (pr) =>
        Boolean(pr.isObserver) &&
        (pr.formType === "records" ||
          (pr.formType as string) === "interview_record") &&
        ((pr.data as any)?.assessorSignature ||
          (pr.data as any)?.assessorSigned ||
          (pr.data as any)?.internalVerifierSigned),
    );
  }, [panelistRecords]);

  const leadSigData =
    formData?.leadSignature ||
    canonicalForm?.data?.leadSignature ||
    formData?.assessorSignature ||
    canonicalForm?.data?.assessorSignature;

  const panelSigData =
    formData?.panelMemberSignature ||
    remotePanelistRecord?.data?.assessorSignature ||
    remotePanelistRecord?.data?.panelMemberSignature;

  const ivSigData =
    formData?.internalVerifierSignature ||
    remoteIvRecord?.data?.assessorSignature ||
    remoteIvRecord?.data?.internalVerifierSignature;

  const [leadPanelistSigned, setLeadPanelistSigned] = useState<boolean>(
    Boolean(
      leadSigData?.assetId ||
        formData?.leadPanelistSigned ||
        formData?.assessorSigned ||
        canonicalForm?.data?.leadPanelistSigned ||
        canonicalForm?.assessorSignedAt,
    ),
  );
  const [leadPanelistSignedAt, setLeadPanelistSignedAt] = useState<string>(
    leadSigData?.signedAt ||
      formData?.leadPanelistSignedAt ||
      formData?.assessorSignedAt ||
      canonicalForm?.data?.leadPanelistSignedAt ||
      canonicalForm?.assessorSignedAt ||
      "",
  );
  const [leadPanelistSignatureAssetId, setLeadPanelistSignatureAssetId] =
    useState<string>(
      leadSigData?.assetId ||
        formData?.leadPanelistSignatureAssetId ||
        formData?.assessorSignatureAssetId ||
        canonicalForm?.data?.leadPanelistSignatureAssetId ||
        "",
    );
  const [leadPanelistSignatureUrl, setLeadPanelistSignatureUrl] =
    useState<string>(
      leadSigData?.url ||
        formData?.leadPanelistSignatureUrl ||
        formData?.assessorSignatureUrl ||
        canonicalForm?.data?.leadPanelistSignatureUrl ||
        "",
    );

  const [panelMemberSigned, setPanelMemberSigned] = useState<boolean>(
    Boolean(
      panelSigData?.assetId ||
        formData?.panelMemberSigned ||
        formData?.panelMemberSignedAt ||
        remotePanelistRecord?.data?.assessorSigned ||
        remotePanelistRecord?.data?.panelMemberSigned,
    ),
  );
  const [panelMemberSignedAt, setPanelMemberSignedAt] = useState<string>(
    panelSigData?.signedAt ||
      formData?.panelMemberSignedAt ||
      remotePanelistRecord?.data?.assessorSignedAt ||
      "",
  );
  const [panelMemberSignatureAssetId, setPanelMemberSignatureAssetId] =
    useState<string>(
      panelSigData?.assetId ||
        formData?.panelMemberSignatureAssetId ||
        remotePanelistRecord?.data?.assessorSignatureAssetId ||
        "",
    );
  const [panelMemberSignatureUrl, setPanelMemberSignatureUrl] =
    useState<string>(
      panelSigData?.url ||
        formData?.panelMemberSignatureUrl ||
        remotePanelistRecord?.data?.assessorSignatureUrl ||
        "",
    );

  const [internalVerifierSigned, setInternalVerifierSigned] = useState<boolean>(
    Boolean(
      ivSigData?.assetId ||
        formData?.internalVerifierSigned ||
        formData?.ivSigned ||
        formData?.internalVerifierSignedAt ||
        remoteIvRecord?.data?.assessorSigned ||
        remoteIvRecord?.data?.internalVerifierSigned,
    ),
  );
  const [internalVerifierSignedAt, setInternalVerifierSignedAt] =
    useState<string>(
      ivSigData?.signedAt ||
        formData?.internalVerifierSignedAt ||
        formData?.ivSignedAt ||
        remoteIvRecord?.data?.assessorSignedAt ||
        "",
    );
  const [
    internalVerifierSignatureAssetId,
    setInternalVerifierSignatureAssetId,
  ] = useState<string>(
    ivSigData?.assetId ||
      formData?.internalVerifierSignatureAssetId ||
      formData?.ivSignatureAssetId ||
      remoteIvRecord?.data?.assessorSignatureAssetId ||
      "",
  );
  const [internalVerifierSignatureUrl, setInternalVerifierSignatureUrl] =
    useState<string>(
      ivSigData?.url ||
        formData?.internalVerifierSignatureUrl ||
        formData?.ivSignatureUrl ||
        remoteIvRecord?.data?.assessorSignatureUrl ||
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

  const safeSigAssetsList: Array<{ assetId: string; url?: string }> =
    Array.isArray(resolvedSigAssets)
      ? resolvedSigAssets
      : Array.isArray((resolvedSigAssets as any)?.assets)
        ? (resolvedSigAssets as any).assets
        : [];

  const activeLeadSignatureUrl =
    leadPanelistSignatureUrl ||
    safeSigAssetsList.find((a) => a.assetId === leadPanelistSignatureAssetId)
      ?.url ||
    (leadPanelistSigned ? profileSignatureUrl : null);

  const activePanelSignatureUrl =
    panelMemberSignatureUrl ||
    safeSigAssetsList.find((a) => a.assetId === panelMemberSignatureAssetId)
      ?.url ||
    (panelMemberSigned ? profileSignatureUrl : null);

  const activeIvSignatureUrl =
    internalVerifierSignatureUrl ||
    safeSigAssetsList.find(
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

  const canSignLead = !isReadOnly && currentUserRole === "lead";
  const canSignPanel = !isReadOnly && currentUserRole === "panel";
  const canSignIv = !isReadOnly && currentUserRole === "iv";

  const resolvedLeadName =
    leadMemberName ||
    formData?.leadPanelistName ||
    (currentUserRole === "lead" ? interviewerNames : "") ||
    "Lead Panelist";

  const resolvedPanelName =
    panelMemberName ||
    formData?.panelMemberName ||
    (currentUserRole === "panel" ? interviewerNames : "") ||
    "Panel Member";

  const resolvedIvName =
    internalVerifierName ||
    formData?.internalVerifierName ||
    (currentUserRole === "iv" ? interviewerNames : "") ||
    "Internal Verifier";

  const handleAppendSignature = () => {
    if (!canSignLead) return;
    const now = new Date().toISOString();
    setLeadPanelistSigned(true);
    setLeadPanelistSignedAt(now);
    if (profileSignatureAssetId) {
      setLeadPanelistSignatureAssetId(profileSignatureAssetId);
    }
    if (profileSignatureAssetId || profileSignatureUrl) {
      const now = new Date().toISOString();
      setLeadPanelistSigned(true);
      setLeadPanelistSignedAt(now);
      if (profileSignatureAssetId) {
        setLeadPanelistSignatureAssetId(profileSignatureAssetId);
      }
      if (profileSignatureUrl) {
        setLeadPanelistSignatureUrl(profileSignatureUrl);
      }
      toast({
        type: "success",
        title: "Signature Appended",
        description:
          "Lead panelist saved signature recorded. Click 'Change' to draw or upload another.",
      });
    } else {
      setSignatureModalConfig({
        isOpen: true,
        role: "lead",
        title: "Append Lead Panelist Signature",
        signerName: resolvedLeadName,
      });
    }
  };

  const handleAppendPanelMemberSignature = () => {
    if (!canSignPanel) return;
    if (profileSignatureAssetId || profileSignatureUrl) {
      const now = new Date().toISOString();
      setPanelMemberSigned(true);
      setPanelMemberSignedAt(now);
      if (profileSignatureAssetId) {
        setPanelMemberSignatureAssetId(profileSignatureAssetId);
      }
      if (profileSignatureUrl) {
        setPanelMemberSignatureUrl(profileSignatureUrl);
      }
      toast({
        type: "success",
        title: "Signature Appended",
        description:
          "Panel member saved signature recorded. Click 'Change' to draw or upload another.",
      });
    } else {
      setSignatureModalConfig({
        isOpen: true,
        role: "panel",
        title: "Append Panel Member Signature",
        signerName: resolvedPanelName,
      });
    }
  };

  const handleAppendIvSignature = () => {
    if (!canSignIv) return;
    if (profileSignatureAssetId || profileSignatureUrl) {
      const now = new Date().toISOString();
      setInternalVerifierSigned(true);
      setInternalVerifierSignedAt(now);
      if (profileSignatureAssetId) {
        setInternalVerifierSignatureAssetId(profileSignatureAssetId);
      }
      if (profileSignatureUrl) {
        setInternalVerifierSignatureUrl(profileSignatureUrl);
      }
      toast({
        type: "success",
        title: "Signature Appended",
        description:
          "Internal verifier saved signature recorded. Click 'Change' to draw or upload another.",
      });
    } else {
      setSignatureModalConfig({
        isOpen: true,
        role: "iv",
        title: "Append Internal Verifier Signature",
        signerName: resolvedIvName,
      });
    }
  };

  const handleSignatureConfirmed = (sig: AssessorSignatureData) => {
    if (signatureModalConfig.role === "lead") {
      setLeadPanelistSigned(true);
      setLeadPanelistSignedAt(sig.signedAt);
      setLeadPanelistSignatureAssetId(sig.assetId);
      if (sig.url) setLeadPanelistSignatureUrl(sig.url);
    } else if (signatureModalConfig.role === "panel") {
      setPanelMemberSigned(true);
      setPanelMemberSignedAt(sig.signedAt);
      setPanelMemberSignatureAssetId(sig.assetId);
      if (sig.url) setPanelMemberSignatureUrl(sig.url);
    } else if (signatureModalConfig.role === "iv") {
      setInternalVerifierSigned(true);
      setInternalVerifierSignedAt(sig.signedAt);
      setInternalVerifierSignatureAssetId(sig.assetId);
      if (sig.url) setInternalVerifierSignatureUrl(sig.url);
    }
  };

  const handleSubmit = () => {
    if (isReadOnly) return;

    if (currentUserRole === "lead" && !leadPanelistSigned && !activeLeadSignatureUrl) {
      toast({
        type: "error",
        title: "Signature Required",
        description:
          "Please append your Lead Panelist signature before submitting.",
      });
      return;
    }

    if (currentUserRole === "panel" && !panelMemberSigned && !activePanelSignatureUrl) {
      toast({
        type: "error",
        title: "Signature Required",
        description:
          "Please append your Panel Member signature before submitting.",
      });
      return;
    }

    if (currentUserRole === "iv" && !internalVerifierSigned && !activeIvSignatureUrl) {
      toast({
        type: "error",
        title: "Signature Required",
        description:
          "Please append your Internal Verifier signature before submitting.",
      });
      return;
    }

    const now = new Date().toISOString();

    let activeSigObj: AssessorSignatureData;
    if (currentUserRole === "lead") {
      activeSigObj = {
        assetId:
          leadPanelistSignatureAssetId || profileSignatureAssetId || "",
        name: resolvedLeadName,
        signedAt: leadPanelistSignedAt || now,
        url: activeLeadSignatureUrl || undefined,
      };
    } else if (currentUserRole === "panel") {
      activeSigObj = {
        assetId:
          panelMemberSignatureAssetId || profileSignatureAssetId || "",
        name: resolvedPanelName,
        signedAt: panelMemberSignedAt || now,
        url: activePanelSignatureUrl || undefined,
      };
    } else {
      activeSigObj = {
        assetId:
          internalVerifierSignatureAssetId || profileSignatureAssetId || "",
        name: resolvedIvName,
        signedAt: internalVerifierSignedAt || now,
        url: activeIvSignatureUrl || undefined,
      };
    }

    const leadSigObj =
      currentUserRole === "lead"
        ? activeSigObj
        : leadSigData || {
            assetId: leadPanelistSignatureAssetId,
            name: resolvedLeadName,
            signedAt: leadPanelistSignedAt || now,
            url: activeLeadSignatureUrl || undefined,
          };

    const panelSigObj =
      currentUserRole === "panel"
        ? activeSigObj
        : panelSigData ||
          (panelMemberSigned
            ? {
                assetId: panelMemberSignatureAssetId,
                name: resolvedPanelName,
                signedAt: panelMemberSignedAt || now,
                url: activePanelSignatureUrl || undefined,
              }
            : undefined);

    const ivSigObj =
      currentUserRole === "iv"
        ? activeSigObj
        : ivSigData ||
          (internalVerifierSigned
            ? {
                assetId: internalVerifierSignatureAssetId,
                name: resolvedIvName,
                signedAt: internalVerifierSignedAt || now,
                url: activeIvSignatureUrl || undefined,
              }
            : undefined);

    onSubmit({
      candidateFullName,
      levelAppliedFor,
      interviewerNames,
      interviewDate,
      questions,
      strengths,
      areasForDevelopment,
      assessorSignature: activeSigObj,
      leadSignature: leadSigObj,
      panelMemberSignature: panelSigObj,
      internalVerifierSignature: ivSigObj,
      leadPanelistSigned: Boolean(leadPanelistSigned || currentUserRole === "lead"),
      leadPanelistSignedAt: leadPanelistSigned
        ? leadPanelistSignedAt || now
        : currentUserRole === "lead"
          ? now
          : undefined,
      leadPanelistSignatureAssetId:
        leadPanelistSignatureAssetId ||
        (currentUserRole === "lead" ? profileSignatureAssetId : undefined) ||
        undefined,
      leadPanelistSignatureUrl:
        activeLeadSignatureUrl ||
        (currentUserRole === "lead" ? profileSignatureUrl : undefined) ||
        undefined,
      leadPanelistName: resolvedLeadName,
      panelMemberSigned: Boolean(panelMemberSigned || currentUserRole === "panel"),
      panelMemberSignedAt: panelMemberSigned
        ? panelMemberSignedAt || now
        : currentUserRole === "panel"
          ? now
          : undefined,
      panelMemberSignatureAssetId:
        panelMemberSignatureAssetId ||
        (currentUserRole === "panel" ? profileSignatureAssetId : undefined) ||
        undefined,
      panelMemberSignatureUrl:
        activePanelSignatureUrl ||
        (currentUserRole === "panel" ? profileSignatureUrl : undefined) ||
        undefined,
      panelMemberName: resolvedPanelName,
      internalVerifierSigned: Boolean(
        internalVerifierSigned || currentUserRole === "iv",
      ),
      internalVerifierSignedAt: internalVerifierSigned
        ? internalVerifierSignedAt || now
        : currentUserRole === "iv"
          ? now
          : undefined,
      internalVerifierSignatureAssetId:
        internalVerifierSignatureAssetId ||
        (currentUserRole === "iv" ? profileSignatureAssetId : undefined) ||
        undefined,
      internalVerifierSignatureUrl:
        activeIvSignatureUrl ||
        (currentUserRole === "iv" ? profileSignatureUrl : undefined) ||
        undefined,
      internalVerifierName: resolvedIvName,
      assessorSigned: true,
      assessorSignedAt: now,
      assessorSignatureAssetId: activeSigObj.assetId || profileSignatureAssetId || undefined,
      assessorSignatureUrl: activeSigObj.url || profileSignatureUrl || undefined,
      assessorName: activeSigObj.name,
    });
  };

  return (
    <AssessorAssessmentFormLayout
      title="Interview Question Bank & Record Sheet"
      subtitle="Structured oral questioning instrument assessing theoretical knowledge, safety protocols, and problem-solving."
      onBack={onBack}
      onSubmit={handleSubmit}
      submitLabel={submitLabel}
      isReadOnly={isReadOnly}
      badgeLabel={badgeLabel}
      headerTabs={headerTabs}
      bannerNotice={bannerNotice}
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
                          {cleanQuestionTitle(q.question)}
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
      <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
        <h3 className="text-sm sm:text-base font-bold text-neutral-primary">
          Interviewer Declaration
        </h3>
        <p className="text-xs text-neutral-secondary">
          I confirm that the information provided in this assessment is true and
          based on my own participation.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-1">
          {/* Lead Panelist */}
          <DigitalSignaturePad
            label="Lead Panelist"
            required={currentUserRole === "lead"}
            isSigned={leadPanelistSigned || Boolean(activeLeadSignatureUrl)}
            signerName={resolvedLeadName}
            signedAt={leadPanelistSignedAt}
            signatureUrl={activeLeadSignatureUrl}
            isReadOnly={!canSignLead}
            onAppendSignature={handleAppendSignature}
            onChangeSignature={
              canSignLead
                ? () =>
                    setSignatureModalConfig({
                      isOpen: true,
                      role: "lead",
                      title: "Change Lead Panelist Signature",
                      signerName: resolvedLeadName,
                    })
                : undefined
            }
            onClearSignature={
              canSignLead
                ? () => {
                    setLeadPanelistSigned(false);
                    setLeadPanelistSignedAt("");
                    setLeadPanelistSignatureAssetId("");
                    setLeadPanelistSignatureUrl("");
                  }
                : undefined
            }
          />

          {/* Panel Member */}
          <DigitalSignaturePad
            label="Panel Member"
            required={currentUserRole === "panel"}
            isSigned={panelMemberSigned || Boolean(activePanelSignatureUrl)}
            signerName={resolvedPanelName}
            signedAt={panelMemberSignedAt}
            signatureUrl={activePanelSignatureUrl}
            isReadOnly={!canSignPanel}
            onAppendSignature={handleAppendPanelMemberSignature}
            onChangeSignature={
              canSignPanel
                ? () =>
                    setSignatureModalConfig({
                      isOpen: true,
                      role: "panel",
                      title: "Change Panel Member Signature",
                      signerName: resolvedPanelName,
                    })
                : undefined
            }
            onClearSignature={
              canSignPanel
                ? () => {
                    setPanelMemberSigned(false);
                    setPanelMemberSignedAt("");
                    setPanelMemberSignatureAssetId("");
                    setPanelMemberSignatureUrl("");
                  }
                : undefined
            }
          />

          {/* Internal Verifier */}
          <DigitalSignaturePad
            label="Internal Verifier"
            required={currentUserRole === "iv"}
            isSigned={internalVerifierSigned || Boolean(activeIvSignatureUrl)}
            signerName={resolvedIvName}
            signedAt={internalVerifierSignedAt}
            signatureUrl={activeIvSignatureUrl}
            isReadOnly={!canSignIv}
            onAppendSignature={handleAppendIvSignature}
            onChangeSignature={
              canSignIv
                ? () =>
                    setSignatureModalConfig({
                      isOpen: true,
                      role: "iv",
                      title: "Change Internal Verifier Signature",
                      signerName: resolvedIvName,
                    })
                : undefined
            }
            onClearSignature={
              canSignIv
                ? () => {
                    setInternalVerifierSigned(false);
                    setInternalVerifierSignedAt("");
                    setInternalVerifierSignatureAssetId("");
                    setInternalVerifierSignatureUrl("");
                  }
                : undefined
            }
          />

          <AssessorSignatureModal
            isOpen={signatureModalConfig.isOpen}
            onClose={() =>
              setSignatureModalConfig((prev) => ({ ...prev, isOpen: false }))
            }
            onConfirm={handleSignatureConfirmed}
            signerName={signatureModalConfig.signerName}
            title={signatureModalConfig.title}
            subtitle="Interview Question Bank & Record Sheet"
          />
        </div>
      </div>
    </AssessorAssessmentFormLayout>
  );
};
