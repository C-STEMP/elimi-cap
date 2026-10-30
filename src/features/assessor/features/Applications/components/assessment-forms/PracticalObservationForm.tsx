"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { AssessorAssessmentFormLayout } from "./AssessorAssessmentFormLayout";
import { useToast } from "@/src/components/ui/toast";
import { FiPlus, FiTrash2, FiEdit3, FiCheckCircle } from "react-icons/fi";
import type { AssessmentMappingUnit } from "@/src/features/shared/applications/api/types";
import type { Unit } from "@/src/features/shared/reference/api";
import { useResolveAssets } from "@/src/features/shared/storage/hooks";
import { useAssessorSignature } from "./useAssessorSignature";
import { DigitalSignaturePad } from "./DigitalSignaturePad";
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
  isReadOnly?: boolean;
  applicationTrade?: string;
  unitLabels?: string[];
  scopedUnits?: Unit[];
  mappingUnits?: AssessmentMappingUnit[];
  levelLabel?: string;
  defaultAssessorName?: string;
  defaultDate?: string;
  defaultSite?: string;
}

export const PracticalObservationForm: React.FC<
  PracticalObservationFormProps
> = ({
  candidateName,
  onBack,
  onSubmit,
  formData,
  isReadOnly = false,
  applicationTrade,
  unitLabels = [],
  scopedUnits = [],
  mappingUnits = [],
  levelLabel = "Level 1",
  defaultAssessorName = "",
  defaultDate = "",
  defaultSite = "",
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

  const [assessorSigned, setAssessorSigned] = useState<boolean>(
    Boolean(formData?.assessorSigned || formData?.assessorSignedAt),
  );
  const [assessorSignedAt, setAssessorSignedAt] = useState<string>(
    formData?.assessorSignedAt || "",
  );
  const [assessorSignatureAssetId, setAssessorSignatureAssetId] =
    useState<string>(formData?.assessorSignatureAssetId || "");
  const [assessorSignatureUrl, setAssessorSignatureUrl] = useState<string>(
    formData?.assessorSignatureUrl || "",
  );

  const sigAssetsToResolve = useMemo(() => {
    return assessorSignatureAssetId && !assessorSignatureUrl
      ? [assessorSignatureAssetId]
      : [];
  }, [assessorSignatureAssetId, assessorSignatureUrl]);
  const { data: resolvedSigAssets } = useResolveAssets(sigAssetsToResolve);

  const activeAssessorSignatureUrl =
    assessorSignatureUrl ||
    resolvedSigAssets?.[0]?.url ||
    (assessorSigned ? profileSignatureUrl : null);

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
      description: "Assessor signature has been recorded.",
    });
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
      assessorSignedAt: assessorSignedAt || now,
      assessorSignatureAssetId:
        assessorSignatureAssetId || profileSignatureAssetId || undefined,
      assessorSignatureUrl: activeAssessorSignatureUrl || undefined,
    });
  };

  return (
    <AssessorAssessmentFormLayout
      title="Practical Observation Record"
      subtitle="Assessor on-site observation of real-time occupational tasks under industrial conditions."
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
            isSigned={assessorSigned}
            signerName={assessorName}
            signedAt={assessorSignedAt}
            signatureUrl={activeAssessorSignatureUrl}
            isReadOnly={isReadOnly}
            onAppendSignature={handleAppendSignature}
            onClearSignature={() => {
              setAssessorSigned(false);
              setAssessorSignedAt("");
            }}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-primary">
              Candidate Signature<span className="text-rose-500">*</span>
            </label>
            {formData?.candidateSignedAt ? (
              <div className="h-11 sm:h-12 bg-[#E6F4EA] border border-[#1E7F4C]/30 text-[#1E7F4C] font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2.5 px-3.5 select-none shadow-2xs">
                {formData?.candidateSignatureUrl ? (
                  <img
                    src={formData.candidateSignatureUrl}
                    alt="Candidate Signature"
                    className="h-7 max-w-[120px] object-contain"
                  />
                ) : (
                  <FiCheckCircle className="w-4 h-4 text-[#1E7F4C] shrink-0" />
                )}
                <span>Signed</span>
              </div>
            ) : (
              <div className="h-11 sm:h-12 bg-[#FFF8EB] border border-[#FBAB2A]/60 text-[#FBAB2A] font-semibold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 select-none">
                <FiEdit3 className="w-4 h-4 text-[#FBAB2A] shrink-0" />
                <span>Awaiting Signature</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </AssessorAssessmentFormLayout>
  );
};
