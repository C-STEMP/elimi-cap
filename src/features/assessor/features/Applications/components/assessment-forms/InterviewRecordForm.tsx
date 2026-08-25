"use client";

import React, { useState } from "react";
import { AssessorAssessmentFormLayout } from "./AssessorAssessmentFormLayout";
import { useToast } from "@/src/components/ui/toast";

interface InterviewQuestionItem {
  id: string;
  question: string;
  candidateResponse: string;
  rating: "Satisfactory" | "Needs Improvement";
}

const DEFAULT_QUESTIONS: InterviewQuestionItem[] = [
  {
    id: "q-1",
    question: "Explain the critical difference between mortise-and-tenon and dowel joints in load-bearing frames.",
    candidateResponse: "Candidate articulated structural load distribution and glue-surface advantages accurately.",
    rating: "Satisfactory",
  },
  {
    id: "q-2",
    question: "What safety protocols are required when handling toxic wood finishes and solvent-based lacquers?",
    candidateResponse: "Mentioned respirator mask grading, cross-ventilation, and eye-wash station locations.",
    rating: "Satisfactory",
  },
  {
    id: "q-3",
    question: "Describe your method for moisture content testing prior to wood fabrication.",
    candidateResponse: "Explained digital pin-probe readings and equilibrium moisture content thresholds.",
    rating: "Satisfactory",
  },
];

interface InterviewRecordFormProps {
  candidateName: string;
  onBack: () => void;
  onSubmit: () => void;
}

export const InterviewRecordForm: React.FC<InterviewRecordFormProps> = ({
  candidateName,
  onBack,
  onSubmit,
}) => {
  const { toast } = useToast();
  const [questions, setQuestions] =
    useState<InterviewQuestionItem[]>(DEFAULT_QUESTIONS);
  const [verdict, setVerdict] = useState<"Competent" | "Not Competent">(
    "Competent",
  );
  const [assessorSigned, setAssessorSigned] = useState(false);

  const toggleRating = (
    id: string,
    val: "Satisfactory" | "Needs Improvement",
  ) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, rating: val } : q)),
    );
  };

  const updateResponse = (id: string, text: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, candidateResponse: text } : q)),
    );
  };

  const handleAppendSignature = () => {
    setAssessorSigned(true);
    toast({
      type: "success",
      title: "Signature Appended",
      description: "Assessor signature has been recorded.",
    });
  };

  return (
    <AssessorAssessmentFormLayout
      title="Interview Record Form"
      subtitle="Structured record of panelist dialogue, technical questioning, and oral defense."
      onBack={onBack}
      onSubmit={onSubmit}
      submitLabel="Submit"
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
              defaultValue={candidateName}
              placeholder="Type Here"
              className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-primary">
              Assessors Full Name<span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              defaultValue="Ngozi Eze"
              placeholder="Type Here"
              className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-primary">
              Unit Title & Code
            </label>
            <select className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A]">
              <option>Select</option>
              <option value="CRP-301">CRP-301: Advanced Joinery & Surface Prep</option>
              <option value="CRP-302">CRP-302: Finishing & Structural Framework</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-primary">
              Interview Date<span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              defaultValue="2026-07-23"
              className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A]"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-neutral-primary">
            Interview Location<span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Type Here"
            defaultValue="Cstemp Technical Training Centre, Room 4B"
            className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A]"
          />
        </div>
      </div>

      {/* 2. Questioning & Technical Discussion */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm sm:text-base font-bold text-neutral-primary">
          Questioning & Technical Discussion
        </h3>

        <div className="flex flex-col gap-3.5">
          {questions.map((q) => (
            <div
              key={q.id}
              className="bg-[#F8F9FA] rounded-2xl p-4 sm:p-5 border border-gray-100 flex flex-col gap-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs sm:text-sm font-semibold text-neutral-primary">
                  {q.question}
                </span>

                <div className="flex items-center rounded-lg overflow-hidden border border-gray-200 bg-white p-0.5 shrink-0">
                  <button
                    type="button"
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
              </div>

              <textarea
                rows={2}
                value={q.candidateResponse}
                onChange={(e) => updateResponse(q.id, e.target.value)}
                placeholder="Type candidate response notes..."
                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs text-neutral-primary placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] resize-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 3. Overall Interview Decision & Notes */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm sm:text-base font-bold text-neutral-primary">
          Overall Interview Decision & Notes
        </h3>

        <div className="bg-[#F8F9FA] rounded-2xl p-4 sm:p-5 border border-gray-100 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs sm:text-sm font-semibold text-neutral-primary">
              Interview Verdict:
            </span>

            <div className="flex items-center rounded-lg overflow-hidden border border-gray-200 bg-white p-0.5 shrink-0">
              <button
                type="button"
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
              placeholder="Type Here"
              defaultValue="Candidate presented deep theoretical comprehension and practical safety awareness."
              className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs text-neutral-primary placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] resize-none"
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
                Signed
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
