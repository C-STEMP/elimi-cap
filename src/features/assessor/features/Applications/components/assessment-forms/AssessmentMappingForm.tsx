"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { AssessorAssessmentFormLayout } from "./AssessorAssessmentFormLayout";
import { useToast } from "@/src/components/ui/toast";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import type { AssessmentMappingUnit } from "@/src/features/shared/applications/api/types";
import type { Unit } from "@/src/features/shared/reference/api";
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

export const AssessmentMappingForm: React.FC<AssessmentMappingFormProps> = ({
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

  const handleSubmit = () => {
    if (isReadOnly) return;
    onSubmit({
      candidateFullName,
      assessorName,
      unitTitleCode,
      dateCollected,
      workplaceContext,
      units,
      overallComments,
    });
  };

  return (
    <AssessorAssessmentFormLayout
      title="RPL Assessment Grid / Mapping Form"
      subtitle="Matrix linking candidate evidence artifacts to National Occupational Standards and Performance Criteria."
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
    </AssessorAssessmentFormLayout>
  );
};
