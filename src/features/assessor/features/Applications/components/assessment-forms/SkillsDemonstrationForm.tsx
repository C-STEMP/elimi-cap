"use client";

import React, { useState } from "react";
import { AssessorAssessmentFormLayout } from "./AssessorAssessmentFormLayout";
import { useToast } from "@/src/components/ui/toast";
import { FiPlus, FiTrash2 } from "react-icons/fi";

export interface CriteriaItem {
  id: string;
  title: string;
  demonstrated: boolean;
  comments: string;
}

interface SkillsDemonstrationFormProps {
  candidateName: string;
  onBack: () => void;
  onSubmit: (data: Record<string, any>) => void;
  formData?: Record<string, any>;
  isReadOnly?: boolean;
}

export const SkillsDemonstrationForm: React.FC<
  SkillsDemonstrationFormProps
> = ({ candidateName, onBack, onSubmit, formData, isReadOnly = false }) => {
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
  const [demonstrationDate, setDemonstrationDate] = useState<string>(
    formData?.demonstrationDate ?? "",
  );
  const [location, setLocation] = useState<string>(
    formData?.location ?? "",
  );
  const [taskDemonstrated, setTaskDemonstrated] = useState<string>(
    formData?.taskDemonstrated ?? "",
  );

  const [criteria, setCriteria] = useState<CriteriaItem[]>(
    Array.isArray(formData?.criteria) && formData.criteria.length > 0
      ? formData.criteria
      : isReadOnly
      ? []
      : [
          {
            id: "crit-1",
            title: "",
            demonstrated: true,
            comments: "",
          },
        ],
  );

  const [verdict, setVerdict] = useState<"Competent" | "Not Competent">(
    formData?.verdict ?? "Competent",
  );
  const [assessorComments, setAssessorComments] = useState<string>(
    formData?.assessorComments ?? "",
  );
  const [assessorSigned, setAssessorSigned] = useState<boolean>(
    Boolean(formData?.assessorSigned || formData?.assessorSignedAt),
  );

  const toggleDemonstrated = (id: string) => {
    if (isReadOnly) return;
    setCriteria((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, demonstrated: !c.demonstrated } : c,
      ),
    );
  };

  const updateCriteriaTitle = (id: string, text: string) => {
    if (isReadOnly) return;
    setCriteria((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: text } : c)),
    );
  };

  const updateComments = (id: string, text: string) => {
    if (isReadOnly) return;
    setCriteria((prev) =>
      prev.map((c) => (c.id === id ? { ...c, comments: text } : c)),
    );
  };

  const handleAddCriteria = () => {
    if (isReadOnly) return;
    setCriteria((prev) => [
      ...prev,
      {
        id: `crit-${Date.now()}`,
        title: "",
        demonstrated: true,
        comments: "",
      },
    ]);
  };

  const handleRemoveCriteria = (id: string) => {
    if (isReadOnly) return;
    setCriteria((prev) => prev.filter((c) => c.id !== id));
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
      demonstrationDate,
      location,
      taskDemonstrated,
      criteria,
      verdict,
      assessorComments,
      assessorSigned,
      assessorSignedAt: assessorSigned
        ? formData?.assessorSignedAt || new Date().toISOString()
        : undefined,
    });
  };

  return (
    <AssessorAssessmentFormLayout
      title="Skills Demonstration Records Form"
      subtitle="Direct Observation & Practical Performance Record formally capturing practical skill demonstration."
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
              placeholder="e.g. CRP-301: Structural Framework"
              className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] disabled:opacity-80"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-primary">
              Date Of Demonstration<span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={demonstrationDate}
              disabled={isReadOnly}
              onChange={(e) => setDemonstrationDate(e.target.value)}
              className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] disabled:opacity-80"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-neutral-primary">
            Location Of Demonstration<span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter demonstration workshop/site"
            value={location}
            disabled={isReadOnly}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] disabled:opacity-80"
          />
        </div>
      </div>

      {/* 2. Demonstration Details */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm sm:text-base font-bold text-neutral-primary">
          Demonstration Details
        </h3>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-neutral-primary">
            Task/Activity Being Demonstrated<span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={2}
            placeholder={isReadOnly ? "No demonstration task description provided." : "Type activity details being demonstrated..."}
            value={taskDemonstrated}
            disabled={isReadOnly}
            onChange={(e) => setTaskDemonstrated(e.target.value)}
            className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] resize-none disabled:opacity-80"
          />
        </div>
      </div>

      {/* 3. Performance Criteria & Evidence Checklist */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-neutral-primary">
            Performance Criteria &amp; Evidence Checklist
          </h3>
          {!isReadOnly && (
            <button
              type="button"
              onClick={handleAddCriteria}
              className="text-xs font-semibold text-[#FBAB2A] hover:text-[#E89B1F] flex items-center gap-1 cursor-pointer"
            >
              <FiPlus className="w-4 h-4" /> Add Criteria
            </button>
          )}
        </div>

        {criteria.length === 0 ? (
          <p className="text-xs text-gray-400 italic bg-[#F8F9FA] p-4 rounded-xl border border-gray-100">
            No demonstration criteria recorded.
          </p>
        ) : (
          <div className="flex flex-col gap-3.5">
            {criteria.map((item, idx) => (
              <div
                key={item.id}
                className="bg-[#F8F9FA] rounded-2xl p-4 sm:p-5 border border-gray-100 flex flex-col gap-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 shrink-0">
                      #{idx + 1}
                    </span>
                    {isReadOnly ? (
                      <span className="text-xs sm:text-sm font-semibold text-neutral-primary">
                        {item.title || "Unspecified Criteria"}
                      </span>
                    ) : (
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => updateCriteriaTitle(item.id, e.target.value)}
                        placeholder="Type standard or performance criteria..."
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A]"
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={isReadOnly}
                      onClick={() => toggleDemonstrated(item.id)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        item.demonstrated
                          ? "bg-[#1E7F4C] text-white border-[#1E7F4C]"
                          : "bg-white text-gray-600 border-gray-200"
                      }`}
                    >
                      {item.demonstrated ? "Demonstrated" : "Not Demonstrated"}
                    </button>

                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCriteria(item.id)}
                        className="text-gray-400 hover:text-rose-600 p-1"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  rows={2}
                  value={item.comments}
                  disabled={isReadOnly}
                  onChange={(e) => updateComments(item.id, e.target.value)}
                  placeholder={isReadOnly ? "No assessor comments." : "Assessor observation comments..."}
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs text-neutral-primary placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] resize-none disabled:opacity-80"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Overall Decision */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm sm:text-base font-bold text-neutral-primary">
          Overall Decision &amp; Feedback
        </h3>

        <div className="bg-[#F8F9FA] rounded-2xl p-4 sm:p-5 border border-gray-100 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs sm:text-sm font-semibold text-neutral-primary">
              Final Competency Verdict:
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
                }`}
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
                }`}
              >
                Not Competent
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-primary">
              Assessor Remarks
            </label>
            <textarea
              rows={3}
              placeholder={isReadOnly ? "No remarks recorded." : "Type overall remarks..."}
              value={assessorComments}
              disabled={isReadOnly}
              onChange={(e) => setAssessorComments(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs text-neutral-primary placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] resize-none disabled:opacity-80"
            />
          </div>
        </div>
      </div>

      {/* 5. Signature Section */}
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
