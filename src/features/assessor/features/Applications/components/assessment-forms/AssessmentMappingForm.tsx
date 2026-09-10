"use client";

import React, { useState } from "react";
import { AssessorAssessmentFormLayout } from "./AssessorAssessmentFormLayout";
import { useToast } from "@/src/components/ui/toast";
import { FiPlus, FiTrash2 } from "react-icons/fi";

export interface UnitMappingItem {
  id: string;
  occupationalUnit: string;
  performanceCriteria: string;
  typeOfEvidence: string;
  description: string;
  status: "Satisfied" | "Not Satisfied";
}

interface AssessmentMappingFormProps {
  candidateName: string;
  onBack: () => void;
  onSubmit: (data: Record<string, any>) => void;
  formData?: Record<string, any>;
  isReadOnly?: boolean;
}

export const AssessmentMappingForm: React.FC<AssessmentMappingFormProps> = ({
  candidateName,
  onBack,
  onSubmit,
  formData,
  isReadOnly = false,
}) => {
  const { toast } = useToast();

  const [candidateFullName, setCandidateFullName] = useState<string>(
    formData?.candidateFullName ?? candidateName ?? "",
  );
  const [assessorName, setAssessorName] = useState<string>(
    formData?.assessorName ?? "",
  );
  const [unitTitleCode, setUnitTitleCode] = useState<string>(
    formData?.unitTitleCode ?? "",
  );
  const [dateCollected, setDateCollected] = useState<string>(
    formData?.dateCollected ?? "",
  );
  const [workplaceContext, setWorkplaceContext] = useState<string>(
    formData?.workplaceContext ?? "",
  );

  const [units, setUnits] = useState<UnitMappingItem[]>(
    Array.isArray(formData?.units) && formData.units.length > 0
      ? formData.units
      : isReadOnly
      ? []
      : [
          {
            id: "unit-1",
            occupationalUnit: "",
            performanceCriteria: "",
            typeOfEvidence: "",
            description: "",
            status: "Satisfied",
          },
        ],
  );

  const [overallComments, setOverallComments] = useState<string>(
    formData?.overallComments ?? "",
  );
  const [assessorSigned, setAssessorSigned] = useState<boolean>(
    Boolean(formData?.assessorSigned || formData?.assessorSignedAt),
  );

  const handleAddUnit = () => {
    if (isReadOnly) return;
    setUnits((prev) => [
      ...prev,
      {
        id: `unit-${Date.now()}`,
        occupationalUnit: "",
        performanceCriteria: "",
        typeOfEvidence: "",
        description: "",
        status: "Satisfied",
      },
    ]);
  };

  const handleRemoveUnit = (id: string) => {
    if (isReadOnly) return;
    setUnits((prev) => prev.filter((u) => u.id !== id));
  };

  const updateUnitField = (id: string, field: keyof UnitMappingItem, val: string) => {
    if (isReadOnly) return;
    setUnits((prev) =>
      prev.map((u) => (u.id === id ? { ...u, [field]: val } : u)),
    );
  };

  const toggleUnitStatus = (id: string) => {
    if (isReadOnly) return;
    setUnits((prev) =>
      prev.map((u) =>
        u.id === id
          ? {
              ...u,
              status: u.status === "Satisfied" ? "Not Satisfied" : "Satisfied",
            }
          : u,
      ),
    );
  };

  const handleAppendSignature = () => {
    if (isReadOnly) return;
    setAssessorSigned(true);
    toast({
      type: "success",
      title: "Signature Appended",
      description: "Assessor signature has been recorded.",
    });
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
      assessorSigned,
      assessorSignedAt: assessorSigned
        ? formData?.assessorSignedAt || new Date().toISOString()
        : undefined,
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
      {/* 1. Personal Details */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm sm:text-base font-bold text-neutral-primary">
          Personal Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-primary">
              Candidate Full Name<span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={candidateFullName}
              disabled={isReadOnly}
              onChange={(e) => setCandidateFullName(e.target.value)}
              placeholder="Candidate Name"
              className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] disabled:opacity-80"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-primary">
              Assessor&apos;s Full Name<span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={assessorName}
              disabled={isReadOnly}
              onChange={(e) => setAssessorName(e.target.value)}
              placeholder="Enter Assessor Name"
              className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] disabled:opacity-80"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-primary">
              Unit Title &amp; Code
            </label>
            <input
              type="text"
              value={unitTitleCode}
              disabled={isReadOnly}
              onChange={(e) => setUnitTitleCode(e.target.value)}
              placeholder="e.g. CRP-302: Finishing &amp; Structure"
              className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] disabled:opacity-80"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-primary">
              Date Collected<span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={dateCollected}
              disabled={isReadOnly}
              onChange={(e) => setDateCollected(e.target.value)}
              className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] disabled:opacity-80"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-neutral-primary">
            Workplace/Context<span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter workplace or assessment context"
            value={workplaceContext}
            disabled={isReadOnly}
            onChange={(e) => setWorkplaceContext(e.target.value)}
            className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] disabled:opacity-80"
          />
        </div>
      </div>

      {/* 2. Trade Units & Competency Grid */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-neutral-primary">
            Occupational Units &amp; Competency Grid
          </h3>
          {!isReadOnly && (
            <button
              type="button"
              onClick={handleAddUnit}
              className="text-xs font-semibold text-[#FBAB2A] hover:text-[#E89B1F] flex items-center gap-1 cursor-pointer"
            >
              <FiPlus className="w-4 h-4" /> Add Unit
            </button>
          )}
        </div>

        {units.length === 0 ? (
          <p className="text-xs text-gray-400 italic bg-[#F8F9FA] p-4 rounded-xl border border-gray-100">
            No competency units recorded.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {units.map((unit, idx) => (
              <div
                key={unit.id}
                className="bg-[#F8F9FA] rounded-2xl p-4 sm:p-5 border border-gray-100 flex flex-col gap-3.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400">Unit #{idx + 1}</span>
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => handleRemoveUnit(unit.id)}
                      className="text-gray-400 hover:text-rose-600 p-1"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-neutral-primary">
                    Occupational Unit Title:
                  </label>
                  <input
                    type="text"
                    value={unit.occupationalUnit}
                    disabled={isReadOnly}
                    onChange={(e) => updateUnitField(unit.id, "occupationalUnit", e.target.value)}
                    placeholder={isReadOnly ? "Not provided" : "e.g. Core Occupational Standards & Practical Execution"}
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] disabled:opacity-80"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-neutral-primary">
                      Performance Criteria:
                    </label>
                    <textarea
                      rows={2}
                      value={unit.performanceCriteria}
                      disabled={isReadOnly}
                      onChange={(e) => updateUnitField(unit.id, "performanceCriteria", e.target.value)}
                      placeholder={isReadOnly ? "Not provided" : "Criteria mapped..."}
                      className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] resize-none disabled:opacity-80"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-neutral-primary">
                      Evidence Type / Artifact:
                    </label>
                    <textarea
                      rows={2}
                      value={unit.typeOfEvidence}
                      disabled={isReadOnly}
                      onChange={(e) => updateUnitField(unit.id, "typeOfEvidence", e.target.value)}
                      placeholder={isReadOnly ? "Not provided" : "e.g. Direct Observation, Portfolio, Third Party"}
                      className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] resize-none disabled:opacity-80"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-gray-200/50">
                  <span className="text-xs font-semibold text-gray-600">Verification Status:</span>
                  <button
                    type="button"
                    disabled={isReadOnly}
                    onClick={() => toggleUnitStatus(unit.id)}
                    className={`px-3 py-1 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      unit.status === "Satisfied"
                        ? "bg-[#1E7F4C] text-white border-[#1E7F4C]"
                        : "bg-white text-gray-600 border-gray-200"
                    }`}
                  >
                    {unit.status}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Overall Remarks */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm sm:text-base font-bold text-neutral-primary">
          Overall Grid Summary
        </h3>
        <textarea
          rows={3}
          value={overallComments}
          disabled={isReadOnly}
          onChange={(e) => setOverallComments(e.target.value)}
          placeholder={isReadOnly ? "No overall comments provided." : "Type overall assessment mapping remarks..."}
          className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl p-3 text-xs text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] resize-none disabled:opacity-80"
        />
      </div>

      {/* 4. Signature Section */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm sm:text-base font-bold text-neutral-primary">
          Signature
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-primary">
              Assessor Signature<span className="text-rose-500">*</span>
            </label>
            {assessorSigned ? (
              <div className="h-11 bg-[#E6F4EA] border border-[#1E7F4C]/30 text-[#1E7F4C] font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 select-none shadow-2xs">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 text-[#1E7F4C]"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                Signed by Assessor
              </div>
            ) : isReadOnly ? (
              <div className="h-11 bg-gray-100 border border-gray-200 text-gray-500 text-xs sm:text-sm rounded-xl flex items-center justify-center">
                Pending Assessor Signature
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAppendSignature}
                className="h-11 bg-[#FFF8EB] border border-[#FBAB2A] hover:bg-[#FDEED5] text-[#FBAB2A] font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 text-[#FBAB2A]"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                Append Signature
              </button>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-primary">
              Candidate Signature<span className="text-rose-500">*</span>
            </label>
            {formData?.candidateSignedAt ? (
              <div className="h-11 bg-[#E6F4EA] border border-[#1E7F4C]/30 text-[#1E7F4C] font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 select-none shadow-2xs">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 text-[#1E7F4C]"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                Signed by Candidate ({new Date(formData.candidateSignedAt).toLocaleDateString()})
              </div>
            ) : (
              <div className="h-11 bg-[#FFF8EB] border border-[#FBAB2A]/60 text-[#FBAB2A] font-semibold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 select-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 text-[#FBAB2A]"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                Awaiting Candidate Signature
              </div>
            )}
          </div>
        </div>
      </div>
    </AssessorAssessmentFormLayout>
  );
};
