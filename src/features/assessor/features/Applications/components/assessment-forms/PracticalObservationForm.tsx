"use client";

import React, { useState } from "react";
import { AssessorAssessmentFormLayout } from "./AssessorAssessmentFormLayout";
import { useToast } from "@/src/components/ui/toast";

interface ObservationChecklistItem {
  id: string;
  title: string;
  demonstrated: boolean;
  comments: string;
}

const DEFAULT_CHECKLIST: ObservationChecklistItem[] = [
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

interface PracticalObservationFormProps {
  candidateName: string;
  onBack: () => void;
  onSubmit: () => void;
}

export const PracticalObservationForm: React.FC<
  PracticalObservationFormProps
> = ({ candidateName, onBack, onSubmit }) => {
  const { toast } = useToast();
  const [checklist, setChecklist] =
    useState<ObservationChecklistItem[]>(DEFAULT_CHECKLIST);
  const [verdict, setVerdict] = useState<"Competent" | "Not Competent">(
    "Competent",
  );
  const [assessorSigned, setAssessorSigned] = useState(false);

  const toggleDemonstrated = (id: string, val: boolean) => {
    setChecklist((prev) =>
      prev.map((c) => (c.id === id ? { ...c, demonstrated: val } : c)),
    );
  };

  const updateComments = (id: string, text: string) => {
    setChecklist((prev) =>
      prev.map((c) => (c.id === id ? { ...c, comments: text } : c)),
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
      title="Practical Observation Record"
      subtitle="Assessor on-site observation of real-time occupational tasks under industrial conditions."
      onBack={onBack}
      onSubmit={onSubmit}
      submitLabel="Continue →"
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
              Observation Date<span className="text-rose-500">*</span>
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
            Observation Site / Facility<span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Type Here"
            defaultValue="Cstemp Technical Centre, Site B"
            className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A]"
          />
        </div>
      </div>

      {/* 2. Observation Criteria & Standards Checklist */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm sm:text-base font-bold text-neutral-primary">
          Observation Criteria & Standards Checklist
        </h3>

        <div className="flex flex-col gap-3.5">
          {checklist.map((item) => (
            <div
              key={item.id}
              className="bg-[#F8F9FA] rounded-2xl p-4 sm:p-5 border border-gray-100 flex flex-col gap-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs sm:text-sm font-semibold text-neutral-primary">
                  {item.title}
                </span>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-neutral-secondary font-medium mr-1">
                    Demonstrated:
                  </span>
                  <div className="flex items-center rounded-lg overflow-hidden border border-gray-200 bg-white p-0.5">
                    <button
                      type="button"
                      onClick={() => toggleDemonstrated(item.id, true)}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                        item.demonstrated
                          ? "bg-[#8A1538] text-white"
                          : "text-neutral-secondary hover:text-neutral-primary"
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleDemonstrated(item.id, false)}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                        !item.demonstrated
                          ? "bg-[#8A1538] text-white"
                          : "text-neutral-secondary hover:text-neutral-primary"
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>
              </div>

              <textarea
                rows={2}
                value={item.comments}
                onChange={(e) => updateComments(item.id, e.target.value)}
                placeholder="Type Comments Here"
                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs text-neutral-primary placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] resize-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 3. Overall Observation Decision & Notes */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm sm:text-base font-bold text-neutral-primary">
          Overall Observation Decision & Notes
        </h3>

        <div className="bg-[#F8F9FA] rounded-2xl p-4 sm:p-5 border border-gray-100 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs sm:text-sm font-semibold text-neutral-primary">
              Practical Observation Verdict:
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
              Assessor Detailed Observation Notes
            </label>
            <textarea
              rows={3}
              placeholder="Type Here"
              defaultValue="Candidate executed task methodically and cleanly without deviation from workshop safety regulations."
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
