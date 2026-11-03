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
  buildUnitMappingItems,
  type GeneratedUnitMappingItem,
} from "./utils";

export type UnitMappingItem = GeneratedUnitMappingItem;

interface AssessmentMappingFormProps {
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

export const AssessmentMappingForm: React.FC<AssessmentMappingFormProps> = ({
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
  const [dateCollected, setDateCollected] = useState<string>(
    defaultDate ||
      formData?.dateCollected ||
      new Date().toISOString().split("T")[0],
  );
  const [workplaceContext, setWorkplaceContext] = useState<string>(
    defaultSite || formData?.workplaceContext || "",
  );

  // Sync Personal Details with resolved application/panel/schedule data
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
    if (defaultDate) setDateCollected(defaultDate);
  }, [defaultDate]);

  useEffect(() => {
    if (defaultSite) setWorkplaceContext(defaultSite);
  }, [defaultSite]);

  const generatedDefaults = React.useMemo(
    () =>
      buildUnitMappingItems({
        scopedUnits,
        mappingUnits,
        tradeName: applicationTrade,
        levelLabel,
      }),
    [scopedUnits, mappingUnits, applicationTrade, levelLabel],
  );

  const hasSavedUnits =
    Array.isArray(formData?.units) && formData.units.length > 0;
  const [hasUserEditedUnits, setHasUserEditedUnits] =
    useState<boolean>(hasSavedUnits);

  const [units, setUnits] = useState<UnitMappingItem[]>(() => {
    if (hasSavedUnits) return formData!.units;
    if (isReadOnly) return [];
    return generatedDefaults;
  });

  useEffect(() => {
    if (!hasSavedUnits && !hasUserEditedUnits && !isReadOnly) {
      setUnits(generatedDefaults);
    }
  }, [generatedDefaults, hasSavedUnits, hasUserEditedUnits, isReadOnly]);

  const [overallComments, setOverallComments] = useState<string>(
    formData?.overallComments ?? "",
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
  }, [units.length]);

  const handleAddUnit = () => {
    if (isReadOnly) return;
    const newId = `unit-custom-${Date.now()}`;
    setHasUserEditedUnits(true);
    pendingFocusIdRef.current = newId;
    setUnits((prev) => [
      ...prev,
      {
        id: newId,
        occupationalUnit: "",
        performanceCriteria: "",
        typeOfEvidence: "",
        description: "",
        status: "Satisfied",
        isCustom: true,
      },
    ]);
    toast({
      type: "success",
      title: "Unit Added",
      description: "A new competency unit has been added to the mapping grid.",
    });
  };

  const handleRemoveUnit = (id: string) => {
    if (isReadOnly) return;
    setHasUserEditedUnits(true);
    setUnits((prev) => prev.filter((u) => u.id !== id));
  };

  const updateUnitField = (
    id: string,
    field: keyof UnitMappingItem,
    val: string,
  ) => {
    if (isReadOnly) return;
    setHasUserEditedUnits(true);
    setUnits((prev) =>
      prev.map((u) => (u.id === id ? { ...u, [field]: val } : u)),
    );
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
      dateCollected,
      workplaceContext,
      units,
      overallComments,
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
      title="RPL Assessment Grid / Mapping Form"
      subtitle="Matrix linking candidate evidence artifacts to National Occupational Standards and Performance Criteria."
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
              Assessor&apos;s Full Name<span className="text-rose-500">*</span>
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
              Date Collected<span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={dateCollected}
              disabled
              readOnly
              className="w-full h-11 sm:h-12 bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 text-xs sm:text-sm text-neutral-primary disabled:opacity-80 disabled:cursor-not-allowed transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-neutral-primary">
            Workplace/Context<span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={workplaceContext}
            disabled
            readOnly
            placeholder="Assessment Centre / Workplace Context"
            className="w-full h-11 sm:h-12 bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 text-xs sm:text-sm text-neutral-primary disabled:opacity-80 disabled:cursor-not-allowed transition-all"
          />
        </div>
      </div>

      {/* 2. Trade Units & Competency Grid */}
      <div className="flex flex-col gap-4 pt-4 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
          <h3 className="text-sm sm:text-base font-bold text-neutral-primary">
            Trade Units &amp; Competency Checklist
          </h3>
          {!isReadOnly && (
            <button
              type="button"
              onClick={handleAddUnit}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#8A1538] text-[#8A1538] text-xs font-semibold hover:bg-[#8A1538]/5 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <FiPlus className="w-3.5 h-3.5" />
              Add Checklist Item
            </button>
          )}
        </div>

        {units.length === 0 ? (
          <p className="text-xs text-gray-400 italic bg-[#F8F9FA] p-4 rounded-xl border border-gray-100">
            No competency units recorded.
          </p>
        ) : (
          <div className="flex flex-col gap-3.5">
            {units.map((unit, idx) => {
              const isEditableTitle =
                unit.isCustom ||
                unit.id.startsWith("unit-custom-") ||
                !unit.occupationalUnit;

              return (
                <div
                  key={unit.id}
                  ref={(el) => {
                    itemRefs.current[unit.id] = el;
                  }}
                  className="bg-[#F8F9FA] rounded-2xl p-4 sm:p-5 border border-gray-100 flex flex-col gap-3.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-secondary shrink-0">
                        #{idx + 1}
                      </span>
                      {!isEditableTitle ? (
                        <span className="text-xs sm:text-sm font-bold text-neutral-primary">
                          {unit.occupationalUnit}
                        </span>
                      ) : (
                        <input
                          ref={(el) => {
                            titleInputRefs.current[unit.id] = el;
                          }}
                          type="text"
                          value={unit.occupationalUnit}
                          disabled={isReadOnly}
                          onChange={(e) =>
                            updateUnitField(
                              unit.id,
                              "occupationalUnit",
                              e.target.value,
                            )
                          }
                          placeholder="e.g. Core Occupational Standards & Practical Execution"
                          className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs sm:text-sm font-medium text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] disabled:opacity-80"
                        />
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto shrink-0 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-gray-200/60 sm:border-transparent">
                      <span className="text-xs text-neutral-secondary font-medium mr-1">
                        Status:
                      </span>
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center rounded-lg overflow-hidden border border-gray-200 bg-white p-0.5">
                          <button
                            type="button"
                            disabled={isReadOnly}
                            onClick={() =>
                              updateUnitField(unit.id, "status", "Satisfied")
                            }
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                              unit.status === "Satisfied"
                                ? "bg-[#8A1538] text-white"
                                : "text-neutral-secondary hover:text-neutral-primary"
                            } disabled:cursor-not-allowed`}
                          >
                            Satisfied
                          </button>
                          <button
                            type="button"
                            disabled={isReadOnly}
                            onClick={() =>
                              updateUnitField(unit.id, "status", "Not Satisfied")
                            }
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                              unit.status === "Not Satisfied"
                                ? "bg-[#8A1538] text-white"
                                : "text-neutral-secondary hover:text-neutral-primary"
                            } disabled:cursor-not-allowed`}
                          >
                            Not Satisfied
                          </button>
                        </div>

                        {!isReadOnly && units.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveUnit(unit.id)}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete checklist item"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-neutral-primary">
                        Performance Criteria
                      </label>
                      <input
                        type="text"
                        value={unit.performanceCriteria}
                        disabled={isReadOnly}
                        onChange={(e) =>
                          updateUnitField(
                            unit.id,
                            "performanceCriteria",
                            e.target.value,
                          )
                        }
                        placeholder={
                          isReadOnly ? "Not provided" : "Criteria mapped..."
                        }
                        className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] disabled:opacity-80"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-neutral-primary">
                        Type of Evidence
                      </label>
                      <input
                        type="text"
                        value={unit.typeOfEvidence}
                        disabled={isReadOnly}
                        onChange={(e) =>
                          updateUnitField(
                            unit.id,
                            "typeOfEvidence",
                            e.target.value,
                          )
                        }
                        placeholder={
                          isReadOnly
                            ? "Not provided"
                            : "e.g. Direct Observation, Portfolio, Third Party"
                        }
                        className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] disabled:opacity-80"
                      />
                    </div>
                  </div>

                  <textarea
                    rows={2}
                    value={unit.description}
                    disabled={isReadOnly}
                    onChange={(e) =>
                      updateUnitField(unit.id, "description", e.target.value)
                    }
                    placeholder={
                      isReadOnly
                        ? "Not provided"
                        : "Type Comments / Description Here"
                    }
                    className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs text-neutral-primary placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] resize-none disabled:opacity-80"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Overall Remarks */}
      <div className="flex flex-col gap-4 pt-4 border-t border-gray-100">
        <h3 className="text-sm sm:text-base font-bold text-neutral-primary">
          Overall Grid Summary
        </h3>
        <textarea
          rows={3}
          value={overallComments}
          disabled={isReadOnly}
          onChange={(e) => setOverallComments(e.target.value)}
          placeholder={
            isReadOnly
              ? "No overall comments provided."
              : "Type overall assessment mapping remarks..."
          }
          className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl p-3 text-xs text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] resize-none disabled:opacity-80"
        />
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
            subtitle="RPL Assessment Grid / Mapping Form"
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
