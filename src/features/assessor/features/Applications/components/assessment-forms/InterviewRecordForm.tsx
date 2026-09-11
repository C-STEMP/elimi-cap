"use client";

import React, { useState } from "react";
import { AssessorAssessmentFormLayout } from "./AssessorAssessmentFormLayout";
import { useToast } from "@/src/components/ui/toast";
import { Select } from "@/src/components/ui/select";
import { FiPlus, FiTrash2 } from "react-icons/fi";

export interface InterviewQuestionItem {
  id: string;
  question: string;
  candidateResponse: string;
}

const DEFAULT_QUESTIONS: string[] = [
  "Can you describe your previous experience related to this role?",
  "How do you prioritize tasks when managing multiple deadlines?",
  "Give an example of a problem you faced and how you solved it?",
  "How do you handle working as part of a team?",
  "Tell us about a time you received feedback. How did you respond?",
  "Describe a situation where you had to learn something quickly?",
  "Why are you interested in this position or field?",
  "What do you consider to be your biggest strength?",
  "What areas do you feel you need to improve?",
  "Do you have any questions for us?",
];

interface InterviewRecordFormProps {
  candidateName: string;
  onBack: () => void;
  onSubmit: (data: Record<string, any>) => void;
  formData?: Record<string, any>;
  isReadOnly?: boolean;
}

export const InterviewRecordForm: React.FC<InterviewRecordFormProps> = ({
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
  const [levelAppliedFor, setLevelAppliedFor] = useState<string>(
    formData?.levelAppliedFor ?? formData?.level ?? "Level 3",
  );

  const levelOptions = React.useMemo(() => {
    const base = [
      { label: "Level 1", value: "Level 1" },
      { label: "Level 2", value: "Level 2" },
      { label: "Level 3", value: "Level 3" },
      { label: "Level 4", value: "Level 4" },
      { label: "Level 5", value: "Level 5" },
    ];
    if (levelAppliedFor && !base.some((b) => b.value === levelAppliedFor)) {
      return [{ label: levelAppliedFor, value: levelAppliedFor }, ...base];
    }
    return base;
  }, [levelAppliedFor]);
  const [interviewerNames, setInterviewerNames] = useState<string>(
    formData?.interviewerNames ?? formData?.assessorName ?? "",
  );
  const [interviewDate, setInterviewDate] = useState<string>(
    formData?.interviewDate ?? "",
  );

  const [questions, setQuestions] = useState<InterviewQuestionItem[]>(() => {
    if (Array.isArray(formData?.questions) && formData.questions.length > 0) {
      return formData.questions.map((q: any, i: number) => ({
        id: q.id || `q-${i + 1}`,
        question: q.question || DEFAULT_QUESTIONS[i] || `Question ${i + 1}`,
        candidateResponse: q.candidateResponse || q.response || "",
      }));
    }
    return DEFAULT_QUESTIONS.map((q, i) => ({
      id: `q-${i + 1}`,
      question: q,
      candidateResponse: "",
    }));
  });

  const [strengths, setStrengths] = useState<string>(
    formData?.strengths ?? formData?.panelistSummaryNotes ?? "",
  );
  const [areasForDevelopment, setAreasForDevelopment] = useState<string>(
    formData?.areasForDevelopment ?? "",
  );

  const [leadPanelistSigned, setLeadPanelistSigned] = useState<boolean>(
    Boolean(
      formData?.leadPanelistSigned ||
        formData?.assessorSigned ||
        formData?.assessorSignedAt,
    ),
  );

  const updateResponse = (id: string, text: string) => {
    if (isReadOnly) return;
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, candidateResponse: text } : q)),
    );
  };

  const handleAddQuestion = () => {
    if (isReadOnly) return;
    setQuestions((prev) => [
      ...prev,
      {
        id: `q-${Date.now()}`,
        question: `Additional Question ${prev.length + 1}`,
        candidateResponse: "",
      },
    ]);
  };

  const handleRemoveQuestion = (id: string) => {
    if (isReadOnly) return;
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleAppendSignature = () => {
    if (isReadOnly) return;
    setLeadPanelistSigned(true);
    toast({
      type: "success",
      title: "Signature Appended",
      description: "Lead panelist signature recorded successfully.",
    });
  };

  const handleSubmit = () => {
    if (isReadOnly) return;
    onSubmit({
      candidateFullName,
      levelAppliedFor,
      interviewerNames,
      interviewDate,
      questions,
      strengths,
      areasForDevelopment,
      leadPanelistSigned,
      leadPanelistSignedAt: leadPanelistSigned
        ? formData?.leadPanelistSignedAt || new Date().toISOString()
        : undefined,
      assessorSigned: leadPanelistSigned,
      assessorSignedAt: leadPanelistSigned
        ? formData?.assessorSignedAt || new Date().toISOString()
        : undefined,
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

          <Select
            label={<span className="text-xs font-medium text-neutral-primary">Level Applied For<span className="text-rose-500">*</span></span>}
            placeholder="Select Level"
            value={levelAppliedFor}
            disabled={isReadOnly}
            options={levelOptions}
            onChange={(e) => setLevelAppliedFor(e.target.value || "")}
            containerClassName="gap-2"
          />

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-neutral-primary">
              Interviewer Name(s)
            </label>
            <input
              type="text"
              value={interviewerNames}
              disabled={isReadOnly}
              onChange={(e) => setInterviewerNames(e.target.value)}
              placeholder="Enter interviewer names"
              className="w-full h-11 sm:h-12 bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] disabled:opacity-80 transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-neutral-primary">
              Date of Interview
            </label>
            <input
              type="date"
              value={interviewDate}
              disabled={isReadOnly}
              onChange={(e) => setInterviewDate(e.target.value)}
              className="w-full h-11 sm:h-12 bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] disabled:opacity-80 transition-all"
            />
          </div>
        </div>
      </div>

      {/* 2. Question Bank & Live Responses */}
      <div className="flex flex-col gap-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-neutral-primary">
            Question Bank &amp; Live Responses
          </h3>
          {!isReadOnly && (
            <button
              type="button"
              onClick={handleAddQuestion}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#8A1538] text-[#8A1538] text-xs font-semibold hover:bg-[#8A1538]/5 transition-colors cursor-pointer"
            >
              <FiPlus className="w-3.5 h-3.5" />
              Add Question
            </button>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {questions.map((q, idx) => (
            <div key={q.id} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-medium text-neutral-primary">
                  {idx + 1}. {q.question}
                  <span className="text-rose-500">*</span>
                </label>
                {!isReadOnly && idx >= DEFAULT_QUESTIONS.length && (
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(q.id)}
                    className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Remove question"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <textarea
                rows={3}
                value={q.candidateResponse}
                disabled={isReadOnly}
                onChange={(e) => updateResponse(q.id, e.target.value)}
                placeholder="Type Here"
                className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-neutral-primary placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] resize-none disabled:opacity-80 transition-all"
              />
            </div>
          ))}
        </div>
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
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-primary">
              Lead Panelist<span className="text-rose-500">*</span>
            </label>
            {leadPanelistSigned ? (
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

          {/* Facilitator */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-primary">
              Facilitator<span className="text-rose-500">*</span>
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

          {/* Internal Verifier */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-primary">
              Internal Verifier<span className="text-rose-500">*</span>
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
