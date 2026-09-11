"use client";

import React, { useState } from "react";
import { AssessorAssessmentFormLayout } from "./AssessorAssessmentFormLayout";
import { useToast } from "@/src/components/ui/toast";
import { Select } from "@/src/components/ui/select";
import { FiPlus, FiTrash2 } from "react-icons/fi";

export interface ObservationChecklistItem {
  id: string;
  title: string;
  demonstrated: boolean;
  comments: string;
}

const DEFAULT_OBSERVATION_CHECKLIST: ObservationChecklistItem[] = [
  {
    id: "obs-1",
    title: "Prepares work area and equipment",
    demonstrated: true,
    comments: "",
  },
  {
    id: "obs-2",
    title: "Follows safety procedures",
    demonstrated: true,
    comments: "",
  },
  {
    id: "obs-3",
    title: "Performs task to required standard",
    demonstrated: true,
    comments: "",
  },
  {
    id: "obs-4",
    title: "Demonstrates problem-solving skills",
    demonstrated: true,
    comments: "",
  },
  {
    id: "obs-5",
    title: "Communicates effectively",
    demonstrated: true,
    comments: "",
  },
  {
    id: "obs-6",
    title: "Cleans and secures work area",
    demonstrated: true,
    comments: "",
  },
];

import { getAutoFilledUnitTitleCode, getUnitOptions } from "./utils";

interface PracticalObservationFormProps {
  candidateName: string;
  onBack: () => void;
  onSubmit: (data: Record<string, any>) => void;
  formData?: Record<string, any>;
  isReadOnly?: boolean;
  applicationTrade?: string;
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
}) => {
  const { toast } = useToast();

  const autoUnit = getAutoFilledUnitTitleCode(applicationTrade, "observation_checklist");
  const [candidateFullName, setCandidateFullName] = useState<string>(
    formData?.candidateFullName ?? candidateName ?? "",
  );
  const [assessorName, setAssessorName] = useState<string>(
    formData?.assessorName ?? "",
  );
  const [unitTitleCode, setUnitTitleCode] = useState<string>(
    formData?.unitTitleCode && formData.unitTitleCode !== "Select"
      ? formData.unitTitleCode
      : autoUnit,
  );

  React.useEffect(() => {
    if (formData?.unitTitleCode && formData.unitTitleCode !== "Select") {
      setUnitTitleCode(formData.unitTitleCode);
    } else if (!unitTitleCode && autoUnit) {
      setUnitTitleCode(autoUnit);
    }
  }, [formData?.unitTitleCode, autoUnit]);

  const unitOptions = React.useMemo(() => {
    return getUnitOptions(unitTitleCode, "observation_checklist");
  }, [unitTitleCode]);
  const [observationDate, setObservationDate] = useState<string>(
    formData?.observationDate ?? "",
  );
  const [observationSite, setObservationSite] = useState<string>(
    formData?.observationSite ?? "",
  );

  const [checklist, setChecklist] = useState<ObservationChecklistItem[]>(
    Array.isArray(formData?.checklist) && formData.checklist.length > 0
      ? formData.checklist
      : isReadOnly
      ? []
      : DEFAULT_OBSERVATION_CHECKLIST,
  );

  const [verdict, setVerdict] = useState<"Competent" | "Not Competent">(
    formData?.verdict ?? "Competent",
  );
  const [observationNotes, setObservationNotes] = useState<string>(
    formData?.observationNotes ?? "",
  );
  const [assessorSigned, setAssessorSigned] = useState<boolean>(
    Boolean(formData?.assessorSigned || formData?.assessorSignedAt),
  );

  const toggleDemonstrated = (id: string, val: boolean) => {
    if (isReadOnly) return;
    setChecklist((prev) =>
      prev.map((c) => (c.id === id ? { ...c, demonstrated: val } : c)),
    );
  };

  const updateTitle = (id: string, title: string) => {
    if (isReadOnly) return;
    setChecklist((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title } : c)),
    );
  };

  const updateComments = (id: string, text: string) => {
    if (isReadOnly) return;
    setChecklist((prev) =>
      prev.map((c) => (c.id === id ? { ...c, comments: text } : c)),
    );
  };

  const handleAddChecklistItem = () => {
    if (isReadOnly) return;
    setChecklist((prev) => [
      ...prev,
      {
        id: `obs-${Date.now()}`,
        title: "",
        demonstrated: true,
        comments: "",
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
    setChecklist((prev) => prev.filter((c) => c.id !== id));
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
      observationDate,
      observationSite,
      checklist,
      verdict,
      observationNotes,
      assessorSigned,
      assessorSignedAt: assessorSigned
        ? formData?.assessorSignedAt || new Date().toISOString()
        : undefined,
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
      {/* 1. Personal Details */}
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
              disabled={isReadOnly}
              onChange={(e) => setCandidateFullName(e.target.value)}
              placeholder="Candidate Name"
              className="w-full h-11 sm:h-12 bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] disabled:opacity-80 transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-neutral-primary">
              Assessors Full Name<span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={assessorName}
              disabled={isReadOnly}
              onChange={(e) => setAssessorName(e.target.value)}
              placeholder="Enter Assessor Name"
              className="w-full h-11 sm:h-12 bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] disabled:opacity-80 transition-all"
            />
          </div>

          <Select
            label={<span className="text-xs font-medium text-neutral-primary">Unit Title &amp; Code</span>}
            placeholder="Select"
            value={unitTitleCode}
            disabled={isReadOnly}
            options={unitOptions}
            onChange={(e) => setUnitTitleCode(e.target.value || "")}
            containerClassName="gap-2"
          />

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-neutral-primary">
              Observation Date<span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={observationDate}
              disabled={isReadOnly}
              onChange={(e) => setObservationDate(e.target.value)}
              className="w-full h-11 sm:h-12 bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] disabled:opacity-80 transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-neutral-primary">
            Observation Site / Facility<span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Assessment Centre Workshop, Site A"
            value={observationSite}
            disabled={isReadOnly}
            onChange={(e) => setObservationSite(e.target.value)}
            className="w-full h-11 sm:h-12 bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] disabled:opacity-80 transition-all"
          />
        </div>
      </div>

      {/* 2. Observation Criteria & Standards Checklist */}
      <div className="flex flex-col gap-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-neutral-primary">
            Observation Criteria &amp; Standards Checklist
          </h3>
          {!isReadOnly && (
            <button
              type="button"
              onClick={handleAddChecklistItem}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#8A1538] text-[#8A1538] text-xs font-semibold hover:bg-[#8A1538]/5 transition-colors cursor-pointer"
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
            {checklist.map((item, index) => (
              <div
                key={item.id}
                className="bg-[#F8F9FA] rounded-2xl p-4 sm:p-5 border border-gray-100 flex flex-col gap-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-secondary shrink-0">
                      #{index + 1}
                    </span>
                    {item.title &&
                    DEFAULT_OBSERVATION_CHECKLIST.some(
                      (d) => d.id === item.id,
                    ) ? (
                      <span className="text-xs sm:text-sm font-bold text-neutral-primary">
                        {item.title}
                      </span>
                    ) : (
                      <input
                        type="text"
                        disabled={isReadOnly}
                        value={item.title}
                        onChange={(e) => updateTitle(item.id, e.target.value)}
                        placeholder="e.g. Prepares work area and equipment safely"
                        className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs sm:text-sm font-medium text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] disabled:opacity-80"
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <span className="text-xs text-neutral-secondary font-medium mr-1">
                      Demonstrated:
                    </span>
                    <div className="flex items-center rounded-lg overflow-hidden border border-gray-200 bg-white p-0.5">
                      <button
                        type="button"
                        disabled={isReadOnly}
                        onClick={() => toggleDemonstrated(item.id, true)}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
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
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
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

                <textarea
                  rows={2}
                  disabled={isReadOnly}
                  value={item.comments}
                  onChange={(e) => updateComments(item.id, e.target.value)}
                  placeholder="Type Comments Here"
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs text-neutral-primary placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] resize-none disabled:opacity-80"
                />
              </div>
            ))}
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
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${
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
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${
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
                Signed
              </div>
            ) : (
              <button
                type="button"
                disabled={isReadOnly}
                onClick={handleAppendSignature}
                className="h-11 bg-[#FFF8EB] border border-[#FBAB2A] hover:bg-[#FDEED5] text-[#FBAB2A] font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs disabled:cursor-not-allowed disabled:opacity-60"
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
              Awaiting Signature
            </div>
          </div>
        </div>
      </div>
    </AssessorAssessmentFormLayout>
  );
};
