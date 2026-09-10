"use client";

import React, { useState } from "react";
import { AssessorAssessmentFormLayout } from "./AssessorAssessmentFormLayout";
import { useToast } from "@/src/components/ui/toast";
import { FiPlus, FiTrash2 } from "react-icons/fi";

export interface InterviewQuestionItem {
  id: string;
  question: string;
  candidateResponse: string;
  rating: "Satisfactory" | "Needs Improvement";
}

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
  const [assessorName, setAssessorName] = useState<string>(
    formData?.assessorName ?? "",
  );
  const [unitTitleCode, setUnitTitleCode] = useState<string>(
    formData?.unitTitleCode ?? "",
  );
  const [interviewDate, setInterviewDate] = useState<string>(
    formData?.interviewDate ?? "",
  );
  const [interviewLocation, setInterviewLocation] = useState<string>(
    formData?.interviewLocation ?? "",
  );

  const [questions, setQuestions] = useState<InterviewQuestionItem[]>(
    Array.isArray(formData?.questions) && formData.questions.length > 0
      ? formData.questions
      : isReadOnly
      ? []
      : [
          {
            id: "q-1",
            question: "",
            candidateResponse: "",
            rating: "Satisfactory",
          },
        ],
  );

  const [verdict, setVerdict] = useState<"Competent" | "Not Competent">(
    formData?.verdict ?? "Competent",
  );
  const [panelistSummaryNotes, setPanelistSummaryNotes] = useState<string>(
    formData?.panelistSummaryNotes ?? "",
  );
  const [assessorSigned, setAssessorSigned] = useState<boolean>(
    Boolean(formData?.assessorSigned || formData?.assessorSignedAt),
  );

  const toggleRating = (
    id: string,
    val: "Satisfactory" | "Needs Improvement",
  ) => {
    if (isReadOnly) return;
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, rating: val } : q)),
    );
  };

  const updateQuestionText = (id: string, text: string) => {
    if (isReadOnly) return;
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, question: text } : q)),
    );
  };

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
        question: "",
        candidateResponse: "",
        rating: "Satisfactory",
      },
    ]);
  };

  const handleRemoveQuestion = (id: string) => {
    if (isReadOnly) return;
    setQuestions((prev) => prev.filter((q) => q.id !== id));
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
      interviewDate,
      interviewLocation,
      questions,
      verdict,
      panelistSummaryNotes,
      assessorSigned,
      assessorSignedAt: assessorSigned
        ? formData?.assessorSignedAt || new Date().toISOString()
        : undefined,
    });
  };

  return (
    <AssessorAssessmentFormLayout
      title="Interview Record Form"
      subtitle="Structured record of panelist dialogue, technical questioning, and oral defense."
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
              placeholder="e.g. CRP-301: Joinery &amp; Woodwork"
              className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] disabled:opacity-80"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-primary">
              Interview Date<span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={interviewDate}
              disabled={isReadOnly}
              onChange={(e) => setInterviewDate(e.target.value)}
              className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] disabled:opacity-80"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-neutral-primary">
            Interview Location<span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter venue or online link"
            value={interviewLocation}
            disabled={isReadOnly}
            onChange={(e) => setInterviewLocation(e.target.value)}
            className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] disabled:opacity-80"
          />
        </div>
      </div>

      {/* 2. Questioning & Technical Discussion */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-neutral-primary">
            Questioning &amp; Technical Discussion
          </h3>
          {!isReadOnly && (
            <button
              type="button"
              onClick={handleAddQuestion}
              className="text-xs font-semibold text-[#FBAB2A] hover:text-[#E89B1F] flex items-center gap-1 cursor-pointer"
            >
              <FiPlus className="w-4 h-4" /> Add Question
            </button>
          )}
        </div>

        {questions.length === 0 ? (
          <p className="text-xs text-gray-400 italic bg-[#F8F9FA] p-4 rounded-xl border border-gray-100">
            No questions recorded.
          </p>
        ) : (
          <div className="flex flex-col gap-3.5">
            {questions.map((q, idx) => (
              <div
                key={q.id}
                className="bg-[#F8F9FA] rounded-2xl p-4 sm:p-5 border border-gray-100 flex flex-col gap-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 shrink-0">
                      #{idx + 1}
                    </span>
                    {isReadOnly ? (
                      <span className="text-xs sm:text-sm font-semibold text-neutral-primary">
                        {q.question || "Unspecified Question"}
                      </span>
                    ) : (
                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) => updateQuestionText(q.id, e.target.value)}
                        placeholder="Type question or competency criteria..."
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A]"
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center rounded-lg overflow-hidden border border-gray-200 bg-white p-0.5">
                      <button
                        type="button"
                        disabled={isReadOnly}
                        onClick={() => toggleRating(q.id, "Satisfactory")}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                          q.rating === "Satisfactory"
                            ? "bg-[#8A1538] text-white"
                            : "text-neutral-secondary hover:text-neutral-primary"
                        }`}
                      >
                        Satisfactory
                      </button>
                      <button
                        type="button"
                        disabled={isReadOnly}
                        onClick={() => toggleRating(q.id, "Needs Improvement")}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                          q.rating === "Needs Improvement"
                            ? "bg-[#8A1538] text-white"
                            : "text-neutral-secondary hover:text-neutral-primary"
                        }`}
                      >
                        Needs Improvement
                      </button>
                    </div>

                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(q.id)}
                        className="text-gray-400 hover:text-rose-600 p-1"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  rows={2}
                  value={q.candidateResponse}
                  disabled={isReadOnly}
                  onChange={(e) => updateResponse(q.id, e.target.value)}
                  placeholder={isReadOnly ? "No candidate response notes recorded." : "Type candidate response notes..."}
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs text-neutral-primary placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] resize-none disabled:opacity-80"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Overall Interview Decision & Notes */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm sm:text-base font-bold text-neutral-primary">
          Overall Interview Decision &amp; Notes
        </h3>

        <div className="bg-[#F8F9FA] rounded-2xl p-4 sm:p-5 border border-gray-100 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs sm:text-sm font-semibold text-neutral-primary">
              Interview Verdict:
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
              Panelist Summary Notes
            </label>
            <textarea
              rows={3}
              placeholder={isReadOnly ? "No summary notes provided." : "Type overall assessment notes..."}
              value={panelistSummaryNotes}
              disabled={isReadOnly}
              onChange={(e) => setPanelistSummaryNotes(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs text-neutral-primary placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] resize-none disabled:opacity-80"
            />
          </div>
        </div>
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
