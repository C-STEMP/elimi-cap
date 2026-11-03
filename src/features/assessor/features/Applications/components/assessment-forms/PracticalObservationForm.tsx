"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { AssessorAssessmentFormLayout } from "./AssessorAssessmentFormLayout";
import { useToast } from "@/src/components/ui/toast";
import { FiPlus, FiTrash2, FiEdit3, FiCheckCircle } from "react-icons/fi";
import type { AssessmentMappingUnit, InterviewForm } from "@/src/features/shared/applications/api/types";
import type { Unit } from "@/src/features/shared/reference/api";
import { useResolveAssets } from "@/src/features/shared/storage/hooks";
import { useAssessorSignature } from "./useAssessorSignature";
import { DigitalSignaturePad } from "./DigitalSignaturePad";
import {
  AssessorSignatureModal,
  type AssessorSignatureData,
} from "./AssessorSignatureModal";
import {
  buildUnitObservationChecklist,
  cleanQuestionTitle,
  type GeneratedChecklistItem,
} from "./utils";

export type ObservationChecklistItem = GeneratedChecklistItem;

interface PracticalObservationFormProps {
  candidateName: string;
  onBack: () => void;
  onSubmit: (data: Record<string, any>) => void;
  formData?: Record<string, any>;
  canonicalForm?: InterviewForm | null;
  candidateSignedAt?: string | null;
  candidateSignatureAssetId?: string | null;
  candidateSignatureUrl?: string | null;
  candidateSignatureMode?: "upload" | "default" | "typed" | null;
  candidateTypedName?: string | null;
  isCandidateSigned?: boolean;
  isReadOnly?: boolean;
  applicationTrade?: string;
  unitLabels?: string[];
  scopedUnits?: Unit[];
  mappingUnits?: AssessmentMappingUnit[];
  levelLabel?: string;
  defaultAssessorName?: string;
  defaultDate?: string;
  defaultSite?: string;
  badgeLabel?: string;
  headerTabs?: React.ReactNode;
  bannerNotice?: React.ReactNode;
  submitLabel?: string;
}

export const PracticalObservationForm: React.FC<
  PracticalObservationFormProps
> = ({
  candidateName,
  onBack,
  onSubmit,
  formData,
  canonicalForm,
  candidateSignedAt: propCandidateSignedAt,
  candidateSignatureAssetId: propCandidateSignatureAssetId,
  candidateSignatureUrl: propCandidateSignatureUrl,
  candidateSignatureMode: propCandidateSignatureMode,
  candidateTypedName: propCandidateTypedName,
  isCandidateSigned: propIsCandidateSigned,
  isReadOnly = false,
  applicationTrade,
  unitLabels = [],
  scopedUnits = [],
  mappingUnits = [],
  levelLabel = "Level 1",
  defaultAssessorName = "",
  defaultDate = "",
  defaultSite = "",
  badgeLabel,
  headerTabs,
  bannerNotice,
  submitLabel = "Submit Form",
}) => {
  const { toast } = useToast();

  const resolvedUnitDisplay = React.useMemo(() => {
    if (unitLabels.length > 0) {
      return unitLabels.join(" | ");
    }
    if (formData?.unitTitleCode && formData.unitTitleCode !== "Select") {
      return formData.unitTitleCode;
    }
    return applicationTrade
      ? `${applicationTrade} — ${levelLabel}`
      : levelLabel;
  }, [unitLabels, formData?.unitTitleCode, applicationTrade, levelLabel]);

  const [candidateFullName, setCandidateFullName] = useState<string>(
    candidateName || formData?.candidateFullName || "",
  );
  const [assessorName, setAssessorName] = useState<string>(
    defaultAssessorName || formData?.assessorName || "",
  );
  const [unitTitleCode, setUnitTitleCode] = useState<string>(resolvedUnitDisplay);
  const [observationDate, setObservationDate] = useState<string>(
    defaultDate ||
      formData?.observationDate ||
      new Date().toISOString().split("T")[0],
  );
  const [observationSite, setObservationSite] = useState<string>(
    defaultSite || formData?.observationSite || "",
  );

  // Keep personal details synced with resolved application/panel/schedule data
  useEffect(() => {
    if (candidateName) setCandidateFullName(candidateName);
  }, [candidateName]);

  useEffect(() => {
    if (defaultAssessorName) setAssessorName(defaultAssessorName);
  }, [defaultAssessorName]);

  useEffect(() => {
    if (resolvedUnitDisplay) setUnitTitleCode(resolvedUnitDisplay);
  }, [resolvedUnitDisplay]);

  useEffect(() => {
    if (defaultDate) setObservationDate(defaultDate);
  }, [defaultDate]);

  useEffect(() => {
    if (defaultSite) setObservationSite(defaultSite);
  }, [defaultSite]);

  const generatedDefaults = React.useMemo(
    () =>
      buildUnitObservationChecklist({
        scopedUnits,
        mappingUnits,
        tradeName: applicationTrade,
        levelLabel,
      }),
    [scopedUnits, mappingUnits, applicationTrade, levelLabel],
  );

  const hasSavedChecklist =
    Array.isArray(formData?.checklist) && formData.checklist.length > 0;
  const [hasUserEditedChecklist, setHasUserEditedChecklist] =
    useState<boolean>(hasSavedChecklist);

  const [checklist, setChecklist] = useState<ObservationChecklistItem[]>(() => {
    if (hasSavedChecklist) {
      const seen = new Set<string>();
      const deduped: ObservationChecklistItem[] = [];
      formData!.checklist.forEach((item: any) => {
        const cleaned = cleanQuestionTitle(item.title || "");
        const key = cleaned.toLowerCase().trim();
        if (key && seen.has(key)) return;
        if (key) seen.add(key);
        deduped.push({
          ...item,
          title: cleaned,
        });
      });
      return deduped;
    }
    if (isReadOnly) return [];
    return generatedDefaults;
  });

  useEffect(() => {
    if (!hasSavedChecklist && !hasUserEditedChecklist && !isReadOnly) {
      setChecklist(generatedDefaults);
    }
  }, [generatedDefaults, hasSavedChecklist, hasUserEditedChecklist, isReadOnly]);

  const [verdict, setVerdict] = useState<"Competent" | "Not Competent">(
    formData?.verdict ?? "Competent",
  );
  const [observationNotes, setObservationNotes] = useState<string>(
    formData?.observationNotes ?? "",
  );
  const {
    signatureUrl: profileSignatureUrl,
    signatureAssetId: profileSignatureAssetId,
  } = useAssessorSignature();

  const initialSig = formData?.assessorSignature;
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

  const [assessorSigned, setAssessorSigned] = useState<boolean>(
    Boolean(
      initialSig?.assetId ||
        formData?.assessorSigned ||
        formData?.assessorSignedAt,
    ),
  );
  const [assessorSignedAt, setAssessorSignedAt] = useState<string>(
    initialSig?.signedAt || formData?.assessorSignedAt || "",
  );
  const [assessorSignatureAssetId, setAssessorSignatureAssetId] =
    useState<string>(
      initialSig?.assetId || formData?.assessorSignatureAssetId || "",
    );
  const [assessorSignatureUrl, setAssessorSignatureUrl] = useState<string>(
    initialSig?.url || formData?.assessorSignatureUrl || "",
  );

  const effectiveCandidateSigAssetId =
    propCandidateSignatureAssetId ||
    canonicalForm?.candidateSignatureAssetId ||
    (canonicalForm?.data as any)?.candidateSignatureAssetId ||
    (formData as any)?.candidateSignatureAssetId ||
    null;

  const directCandidateSigUrl =
    propCandidateSignatureUrl ||
    (canonicalForm as any)?.candidateSignatureUrl ||
    (canonicalForm?.data as any)?.candidateSignatureUrl ||
    (formData as any)?.candidateSignatureUrl ||
    null;

  const sigAssetsToResolve = useMemo(() => {
    const list: string[] = [];
    if (assessorSignatureAssetId && !assessorSignatureUrl) {
      list.push(assessorSignatureAssetId);
    }
    if (
      effectiveCandidateSigAssetId &&
      !directCandidateSigUrl &&
      effectiveCandidateSigAssetId !== "default" &&
      !list.includes(effectiveCandidateSigAssetId)
    ) {
      list.push(effectiveCandidateSigAssetId);
    }
    return list;
  }, [
    assessorSignatureAssetId,
    assessorSignatureUrl,
    effectiveCandidateSigAssetId,
    directCandidateSigUrl,
  ]);
  const { data: resolvedSigAssets } = useResolveAssets(sigAssetsToResolve);

  const activeAssessorSignatureUrl =
    assessorSignatureUrl ||
    resolvedSigAssets?.find((a) => a.assetId === assessorSignatureAssetId)?.url ||
    (assessorSigned ? profileSignatureUrl : null);

  const activeCandidateSignatureUrl =
    directCandidateSigUrl ||
    (effectiveCandidateSigAssetId && Array.isArray(resolvedSigAssets)
      ? resolvedSigAssets.find((a) => a.assetId === effectiveCandidateSigAssetId)?.url
      : null) ||
    null;

  const resolvedCandidateSignedAt =
    propCandidateSignedAt ||
    canonicalForm?.candidateSignedAt ||
    (canonicalForm?.data as any)?.candidateSignedAt ||
    (formData as any)?.candidateSignedAt ||
    null;

  const isCandidateSignedResolved = Boolean(
    propIsCandidateSigned ||
    resolvedCandidateSignedAt ||
    canonicalForm?.candidateSignedAt ||
    (canonicalForm?.data as any)?.candidateSignedAt ||
    (formData as any)?.candidateSignedAt ||
    (canonicalForm?.status === "completed" &&
      Boolean(canonicalForm?.candidateSignedAt || effectiveCandidateSigAssetId))
  );

  const resolvedCandidateDisplayName =
    propCandidateTypedName ||
    canonicalForm?.typedSignatureName ||
    (canonicalForm?.data as any)?.typedSignatureName ||
    candidateName ||
    "Candidate";

  const formattedSignedDate =
    resolvedCandidateSignedAt &&
    typeof resolvedCandidateSignedAt === "string" &&
    !isNaN(Date.parse(resolvedCandidateSignedAt))
      ? new Date(resolvedCandidateSignedAt).toLocaleDateString("en-GB")
      : null;

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
  }, [checklist.length]);

  const toggleDemonstrated = (id: string, val: boolean) => {
    if (isReadOnly) return;
    setHasUserEditedChecklist(true);
    setChecklist((prev) =>
      prev.map((c) => (c.id === id ? { ...c, demonstrated: val } : c)),
    );
  };

  const updateTitle = (id: string, title: string) => {
    if (isReadOnly) return;
    setHasUserEditedChecklist(true);
    setChecklist((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title } : c)),
    );
  };

  const updateComments = (id: string, text: string) => {
    if (isReadOnly) return;
    setHasUserEditedChecklist(true);
    setChecklist((prev) =>
      prev.map((c) => (c.id === id ? { ...c, comments: text } : c)),
    );
  };

  const handleAddChecklistItem = () => {
    if (isReadOnly) return;
    const newId = `obs-custom-${Date.now()}`;
    setHasUserEditedChecklist(true);
    pendingFocusIdRef.current = newId;
    setChecklist((prev) => [
      ...prev,
      {
        id: newId,
        title: "",
        demonstrated: true,
        comments: "",
        isCustom: true,
      },
    ]);
    toast({
      type: "success",
      title: "Checklist Item Added",
      description: "A new checklist item has been added.",
    });
  };

  const handleRemoveChecklistItem = (id: string) => {
    if (isReadOnly) return;
    setHasUserEditedChecklist(true);
    setChecklist((prev) => prev.filter((c) => c.id !== id));
  };

  const handleAppendSignature = () => {
    if (isReadOnly) return;
    if (profileSignatureAssetId || profileSignatureUrl) {
      const now = new Date().toISOString();
      setAssessorSigned(true);
      setAssessorSignedAt(now);
      if (profileSignatureAssetId) {
        setAssessorSignatureAssetId(profileSignatureAssetId);
      }
      if (profileSignatureUrl) {
        setAssessorSignatureUrl(profileSignatureUrl);
      }
      toast({
        type: "success",
        title: "Signature Appended",
        description:
          "Assessor saved signature recorded. Click 'Change' to draw or upload another.",
      });
    } else {
      setIsSignatureModalOpen(true);
    }
  };

  const handleSignatureConfirmed = (sig: AssessorSignatureData) => {
    setAssessorSigned(true);
    setAssessorSignedAt(sig.signedAt);
    setAssessorSignatureAssetId(sig.assetId);
    if (sig.url) {
      setAssessorSignatureUrl(sig.url);
    }
  };

  const handleSubmit = () => {
    if (isReadOnly) return;
    if (!assessorSigned && !activeAssessorSignatureUrl) {
      toast({
        type: "error",
        title: "Signature Required",
        description: "Please append your assessor signature before submitting.",
      });
      return;
    }
    const now = new Date().toISOString();
    const finalAssetId =
      assessorSignatureAssetId || profileSignatureAssetId || "";
    const finalSignedAt = assessorSignedAt || now;
    const finalUrl = activeAssessorSignatureUrl || undefined;

    onSubmit({
      candidateFullName,
      assessorName,
      unitTitleCode,
      observationDate,
      observationSite,
      checklist,
      verdict,
      observationNotes,
      assessorSigned: true,
      assessorSignedAt: finalSignedAt,
      assessorSignatureAssetId: finalAssetId || undefined,
      assessorSignatureUrl: finalUrl,
      assessorSignature: {
        assetId: finalAssetId,
        name: assessorName,
        signedAt: finalSignedAt,
        ...(finalUrl ? { url: finalUrl } : {}),
      },
    });
  };

  return (
    <AssessorAssessmentFormLayout
      title="Practical Observation Record"
      subtitle="Assessor on-site observation of real-time occupational tasks under industrial conditions."
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
              Assessors Full Name<span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={assessorName}
              disabled
              readOnly
              placeholder="Assessor Name"
              className="w-full h-11 sm:h-12 bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 text-xs sm:text-sm text-neutral-primary disabled:opacity-80 disabled:cursor-not-allowed transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-neutral-primary">
              Unit Title &amp; Code<span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={unitTitleCode}
              disabled
              readOnly
              title={unitTitleCode}
              className="w-full h-11 sm:h-12 bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 text-xs sm:text-sm text-neutral-primary truncate disabled:opacity-80 disabled:cursor-not-allowed transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-neutral-primary">
              Observation Date<span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={observationDate}
              disabled
              readOnly
              className="w-full h-11 sm:h-12 bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 text-xs sm:text-sm text-neutral-primary disabled:opacity-80 disabled:cursor-not-allowed transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-neutral-primary">
            Observation Site / Facility<span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={observationSite}
            disabled
            readOnly
            placeholder="Assessment Centre / Facility"
            className="w-full h-11 sm:h-12 bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 text-xs sm:text-sm text-neutral-primary disabled:opacity-80 disabled:cursor-not-allowed transition-all"
          />
        </div>
      </div>

      {/* 2. Observation Criteria & Standards Checklist */}
      <div className="flex flex-col gap-4 pt-4 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
          <h3 className="text-sm sm:text-base font-bold text-neutral-primary">
            Observation Criteria &amp; Standards Checklist
          </h3>
          {!isReadOnly && (
            <button
              type="button"
              onClick={handleAddChecklistItem}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#8A1538] text-[#8A1538] text-xs font-semibold hover:bg-[#8A1538]/5 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <FiPlus className="w-3.5 h-3.5" />
              Add Checklist Item
            </button>
          )}
        </div>

        {checklist.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-gray-200 text-center text-xs text-neutral-secondary">
            No checklist items recorded yet.
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            {checklist.map((item, index) => {
              const isEditableTitle =
                item.isCustom ||
                item.id.startsWith("obs-custom-") ||
                !item.title;

              return (
                <div
                  key={item.id}
                  ref={(el) => {
                    itemRefs.current[item.id] = el;
                  }}
                  className="bg-[#F8F9FA] rounded-2xl p-4 sm:p-5 border border-gray-100 flex flex-col gap-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-secondary shrink-0">
                        #{index + 1}
                      </span>
                      {!isEditableTitle ? (
                        <span className="text-xs sm:text-sm font-bold text-neutral-primary">
                          {cleanQuestionTitle(item.title)}
                        </span>
                      ) : (
                        <input
                          ref={(el) => {
                            titleInputRefs.current[item.id] = el;
                          }}
                          type="text"
                          disabled={isReadOnly}
                          value={item.title}
                          onChange={(e) => updateTitle(item.id, e.target.value)}
                          placeholder="e.g. Prepares work area and equipment safely"
                          className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs sm:text-sm font-medium text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] disabled:opacity-80"
                        />
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto shrink-0 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-gray-200/60 sm:border-transparent">
                      <span className="text-xs text-neutral-secondary font-medium mr-1">
                        Demonstrated:
                      </span>
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center rounded-lg overflow-hidden border border-gray-200 bg-white p-0.5">
                          <button
                            type="button"
                            disabled={isReadOnly}
                            onClick={() => toggleDemonstrated(item.id, true)}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                              item.demonstrated
                                ? "bg-[#8A1538] text-white"
                                : "text-neutral-secondary hover:text-neutral-primary"
                            } disabled:cursor-not-allowed`}
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            disabled={isReadOnly}
                            onClick={() => toggleDemonstrated(item.id, false)}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                              !item.demonstrated
                                ? "bg-[#8A1538] text-white"
                                : "text-neutral-secondary hover:text-neutral-primary"
                            } disabled:cursor-not-allowed`}
                          >
                            No
                          </button>
                        </div>

                        {!isReadOnly && checklist.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveChecklistItem(item.id)}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete checklist item"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <textarea
                    rows={2}
                    disabled={isReadOnly}
                    value={item.comments}
                    onChange={(e) => updateComments(item.id, e.target.value)}
                    placeholder="Type Comments Here"
                    className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs text-neutral-primary placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] resize-none disabled:opacity-80"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Overall Observation Decision & Notes */}
      <div className="flex flex-col gap-4 pt-4 border-t border-gray-100">
        <h3 className="text-sm sm:text-base font-bold text-neutral-primary">
          Overall Observation Decision &amp; Notes
        </h3>

        <div className="bg-[#F8F9FA] rounded-2xl p-4 sm:p-5 border border-gray-100 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs sm:text-sm font-semibold text-neutral-primary">
              Practical Observation Verdict:
            </span>

            <div className="flex items-center rounded-lg overflow-hidden border border-gray-200 bg-white p-0.5 shrink-0">
              <button
                type="button"
                disabled={isReadOnly}
                onClick={() => setVerdict("Competent")}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                  verdict === "Competent"
                    ? "bg-[#8A1538] text-white"
                    : "text-neutral-secondary hover:text-neutral-primary"
                } disabled:cursor-not-allowed`}
              >
                Competent
              </button>
              <button
                type="button"
                disabled={isReadOnly}
                onClick={() => setVerdict("Not Competent")}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                  verdict === "Not Competent"
                    ? "bg-[#8A1538] text-white"
                    : "text-neutral-secondary hover:text-neutral-primary"
                } disabled:cursor-not-allowed`}
              >
                Not Competent
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-primary">
              Assessor Detailed Observation Notes
            </label>
            <textarea
              rows={3}
              disabled={isReadOnly}
              placeholder="Candidate executed occupational task..."
              value={observationNotes}
              onChange={(e) => setObservationNotes(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs text-neutral-primary placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] resize-none disabled:opacity-80"
            />
          </div>
        </div>
      </div>

      {/* 4. Signature Section */}
      <div className="flex flex-col gap-4 pt-4 border-t border-gray-100">
        <h3 className="text-sm sm:text-base font-bold text-neutral-primary">
          Signature
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DigitalSignaturePad
            label="Assessor Signature"
            required
            isSigned={assessorSigned || Boolean(activeAssessorSignatureUrl)}
            signerName={assessorName}
            signedAt={assessorSignedAt}
            signatureUrl={activeAssessorSignatureUrl}
            isReadOnly={isReadOnly}
            onAppendSignature={handleAppendSignature}
            onChangeSignature={() => setIsSignatureModalOpen(true)}
            onClearSignature={() => {
              setAssessorSigned(false);
              setAssessorSignedAt("");
              setAssessorSignatureAssetId("");
              setAssessorSignatureUrl("");
            }}
          />

          <AssessorSignatureModal
            isOpen={isSignatureModalOpen}
            onClose={() => setIsSignatureModalOpen(false)}
            onConfirm={handleSignatureConfirmed}
            signerName={assessorName}
            title="Append Assessor Signature"
            subtitle="Practical Observation Record"
          />

          <DigitalSignaturePad
            label="Candidate Signature"
            required
            isSigned={isCandidateSignedResolved}
            signerName={resolvedCandidateDisplayName}
            signedAt={resolvedCandidateSignedAt || undefined}
            signatureUrl={activeCandidateSignatureUrl}
            isReadOnly={true}
            onAppendSignature={() => {}}
          />
        </div>
      </div>
    </AssessorAssessmentFormLayout>
  );
};
