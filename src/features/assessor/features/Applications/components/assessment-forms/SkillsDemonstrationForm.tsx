"use client";

import React, { useState } from "react";
import { AssessorAssessmentFormLayout } from "./AssessorAssessmentFormLayout";
import { useToast } from "@/src/components/ui/toast";
import { Select } from "@/src/components/ui/select";
import { FiPlus, FiTrash2, FiCalendar } from "react-icons/fi";

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
  applicationTrade?: string;
}

const DEFAULT_SKILLS_CRITERIA: CriteriaItem[] = [
  {
    id: "crit-1",
    title: "Demonstrated correct use of surface preparation tools and brushes",
    demonstrated: true,
    comments: "",
  },
  {
    id: "crit-2",
    title: "Followed safety procedures, dust protection, and PPE requirements",
    demonstrated: true,
    comments: "",
  },
  {
    id: "crit-3",
    title: "Performed tasks according to workplace coating thickness specifications",
    demonstrated: true,
    comments: "",
  },
  {
    id: "crit-4",
    title: "Demonstrated technical skills in POP mixing and feathering",
    demonstrated: true,
    comments: "",
  },
  {
    id: "crit-5",
    title: "Solved problems (repaired hairline plaster shrinkage crack)",
    demonstrated: true,
    comments: "",
  },
  {
    id: "crit-6",
    title: "Communicated clearly and maintained clean working space",
    demonstrated: true,
    comments: "",
  },
  {
    id: "crit-7",
    title: "Completed task within designated 90-minute timeframe",
    demonstrated: true,
    comments: "",
  },
];

import { getAutoFilledUnitTitleCode, getUnitOptions } from "./utils";

export const SkillsDemonstrationForm: React.FC<
  SkillsDemonstrationFormProps
> = ({
  candidateName,
  onBack,
  onSubmit,
  formData,
  isReadOnly = false,
  applicationTrade,
}) => {
  const { toast } = useToast();

  const autoUnit = getAutoFilledUnitTitleCode(applicationTrade, "skills_demo");
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
    return getUnitOptions(unitTitleCode, "skills_demo");
  }, [unitTitleCode]);
  const [demonstrationDate, setDemonstrationDate] = useState<string>(
    formData?.demonstrationDate ?? "",
  );
  const [location, setLocation] = useState<string>(
    formData?.location ?? "",
  );
  const [taskDemonstrated, setTaskDemonstrated] = useState<string>(
    formData?.taskDemonstrated ?? "",
  );
  const [workplaceDescription, setWorkplaceDescription] = useState<string>(
    formData?.workplaceDescription ?? "",
  );
  const [toolsUsed, setToolsUsed] = useState<string>(
    formData?.toolsUsed ?? "",
  );

  const [criteria, setCriteria] = useState<CriteriaItem[]>(
    Array.isArray(formData?.criteria) && formData.criteria.length > 0
      ? formData.criteria
      : DEFAULT_SKILLS_CRITERIA,
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

  const toggleDemonstrated = (id: string, value: boolean) => {
    if (isReadOnly) return;
    setCriteria((prev) =>
      prev.map((c) => (c.id === id ? { ...c, demonstrated: value } : c)),
    );
  };

  const updateComments = (id: string, text: string) => {
    if (isReadOnly) return;
    setCriteria((prev) =>
      prev.map((c) => (c.id === id ? { ...c, comments: text } : c)),
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
      demonstrationDate,
      location,
      taskDemonstrated,
      workplaceDescription,
      toolsUsed,
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
      subtitle="Direct Observation & Practical Performance Record Formally records real-time skill demonstration under controlled workshop conditions."
      onBack={onBack}
      onSubmit={handleSubmit}
      submitLabel="Submit"
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
              placeholder="Type Here"
              className="w-full h-11 sm:h-12 bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] disabled:opacity-80 transition-all placeholder:text-gray-400"
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
              placeholder="Type Here"
              className="w-full h-11 sm:h-12 bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] disabled:opacity-80 transition-all placeholder:text-gray-400"
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
              Date Of Demonstration<span className="text-rose-500">*</span>
            </label>
            <div className="relative w-full">
              <input
                type="date"
                value={demonstrationDate}
                disabled={isReadOnly}
                onChange={(e) => setDemonstrationDate(e.target.value)}
                className="w-full h-11 sm:h-12 bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] disabled:opacity-80 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-neutral-primary">
            Location Of Demonstration<span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Type Here"
            value={location}
            disabled={isReadOnly}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full h-11 sm:h-12 bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] disabled:opacity-80 transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* 2. Demonstration Details */}
      <div className="flex flex-col gap-4 sm:gap-5">
        <h3 className="text-sm sm:text-base font-bold text-neutral-primary">
          Demonstration Details
        </h3>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-neutral-primary">
            Task/Activity Being Demonstrated<span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            placeholder="Type Here"
            value={taskDemonstrated}
            disabled={isReadOnly}
            onChange={(e) => setTaskDemonstrated(e.target.value)}
            className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl p-3.5 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] resize-none disabled:opacity-80 transition-all placeholder:text-gray-400"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-neutral-primary">
            Workplace/Simulated Environment Description<span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            placeholder="Type Here"
            value={workplaceDescription}
            disabled={isReadOnly}
            onChange={(e) => setWorkplaceDescription(e.target.value)}
            className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl p-3.5 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] resize-none disabled:opacity-80 transition-all placeholder:text-gray-400"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-neutral-primary">
            Tools/Equipment Used<span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            placeholder="Type Here"
            value={toolsUsed}
            disabled={isReadOnly}
            onChange={(e) => setToolsUsed(e.target.value)}
            className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl p-3.5 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] resize-none disabled:opacity-80 transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* 3. Demonstration Criteria */}
      <div className="flex flex-col gap-4 sm:gap-5">
        <h3 className="text-sm sm:text-base font-bold text-neutral-primary">
          Demonstration Criteria
        </h3>

        <div className="flex flex-col gap-4">
          {criteria.map((item, idx) => (
            <div
              key={item.id}
              className="bg-[#F8F9FA] rounded-2xl p-4 sm:p-5 border border-gray-100 flex flex-col gap-3"
            >
              <div className="text-xs sm:text-sm font-semibold text-neutral-primary leading-snug">
                {item.title}
              </div>

              <div className="flex items-center justify-between gap-3 bg-white p-2.5 sm:p-3 rounded-xl border border-gray-100">
                <span className="text-xs font-semibold text-neutral-secondary">
                  Demonstrated
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    disabled={isReadOnly}
                    onClick={() => toggleDemonstrated(item.id, true)}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      item.demonstrated
                        ? "bg-[#8A1538] text-white shadow-2xs"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    disabled={isReadOnly}
                    onClick={() => toggleDemonstrated(item.id, false)}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      !item.demonstrated
                        ? "bg-[#8A1538] text-white shadow-2xs"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              <textarea
                rows={2}
                value={item.comments}
                disabled={isReadOnly}
                onChange={(e) => updateComments(item.id, e.target.value)}
                placeholder="Type Comments Here"
                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs text-neutral-primary placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] resize-none disabled:opacity-80"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 4. Assessment Decision & Assessor Notes */}
      <div className="flex flex-col gap-4 sm:gap-5">
        <h3 className="text-sm sm:text-base font-bold text-neutral-primary">
          Assessment Decision &amp; Assessor Notes
        </h3>

        <div className="bg-[#F8F9FA] rounded-2xl p-4 sm:p-5 border border-gray-100 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs sm:text-sm font-semibold text-neutral-primary">
              Skills Demonstration Verdict:
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
                }`}
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
                }`}
              >
                Not Competent
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-primary">
              Assessor Detailed Technical Comments &amp; Next Steps
            </label>
            <textarea
              rows={3}
              placeholder="Type Here"
              value={assessorComments}
              disabled={isReadOnly}
              onChange={(e) => setAssessorComments(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs text-neutral-primary placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] resize-none disabled:opacity-80"
            />
          </div>
        </div>
      </div>

      {/* 5. Signature */}
      <div className="flex flex-col gap-4 sm:gap-5">
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
                Awaiting Signature
              </div>
            )}
          </div>
        </div>
      </div>
    </AssessorAssessmentFormLayout>
  );
};
