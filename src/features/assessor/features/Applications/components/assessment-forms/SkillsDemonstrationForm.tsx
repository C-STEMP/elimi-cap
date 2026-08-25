"use client";

import React, { useState } from "react";
import { AssessorAssessmentFormLayout } from "./AssessorAssessmentFormLayout";
import { useToast } from "@/src/components/ui/toast";

interface CriteriaItem {
  id: string;
  title: string;
  demonstrated: boolean;
  comments: string;
}

const DEFAULT_CRITERIA: CriteriaItem[] = [
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

interface SkillsDemonstrationFormProps {
  candidateName: string;
  onBack: () => void;
  onSubmit: () => void;
}

export const SkillsDemonstrationForm: React.FC<
  SkillsDemonstrationFormProps
> = ({ candidateName, onBack, onSubmit }) => {
  const { toast } = useToast();
  const [criteria, setCriteria] = useState<CriteriaItem[]>(DEFAULT_CRITERIA);
  const [verdict, setVerdict] = useState<"Competent" | "Not Competent">("Competent");
  const [assessorSigned, setAssessorSigned] = useState(false);

  const toggleDemonstrated = (id: string, val: boolean) => {
    setCriteria((prev) =>
      prev.map((c) => (c.id === id ? { ...c, demonstrated: val } : c)),
    );
  };

  const updateComments = (id: string, text: string) => {
    setCriteria((prev) =>
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
      title="Skills Demonstration Records Form"
      subtitle="Direct Observation & Practical Performance Record Formally records real-time skill demonstration under controlled workshop conditions."
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
              Date Of Demonstration<span className="text-rose-500">*</span>
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
            Location Of Demonstration<span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Type Here"
            defaultValue="Cstemp Technical Training Centre, Abuja"
            className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A]"
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
            placeholder="Type Here"
            defaultValue="Surface smoothing, joint fabrication, and POP coating application."
            className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] resize-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-neutral-primary">
            Workplace/Simulated Environment Description<span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={2}
            placeholder="Type Here"
            defaultValue="Standard workshop bench with safety ventilation and precision wood machinery."
            className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] resize-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-neutral-primary">
            Tools/Equipment Used<span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={2}
            placeholder="Type Here"
            defaultValue="Hand planes, chisels, sanding blocks, protective goggles, measuring tape."
            className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] resize-none"
          />
        </div>
      </div>

      {/* 3. Demonstration Criteria */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm sm:text-base font-bold text-neutral-primary">
          Demonstration Criteria
        </h3>

        <div className="flex flex-col gap-3.5">
          {criteria.map((c) => (
            <div
              key={c.id}
              className="bg-[#F8F9FA] rounded-2xl p-4 sm:p-5 border border-gray-100 flex flex-col gap-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs sm:text-sm font-semibold text-neutral-primary">
                  {c.title}
                </span>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-neutral-secondary font-medium mr-1">
                    Demonstrated:
                  </span>
                  <div className="flex items-center rounded-lg overflow-hidden border border-gray-200 bg-white p-0.5">
                    <button
                      type="button"
                      onClick={() => toggleDemonstrated(c.id, true)}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                        c.demonstrated
                          ? "bg-[#8A1538] text-white"
                          : "text-neutral-secondary hover:text-neutral-primary"
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleDemonstrated(c.id, false)}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                        !c.demonstrated
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
                value={c.comments}
                onChange={(e) => updateComments(c.id, e.target.value)}
                placeholder="Type Comments Here"
                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs text-neutral-primary placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] resize-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 4. Assessment Decision & Assessor Notes */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm sm:text-base font-bold text-neutral-primary">
          Assessment Decision & Assessor Notes
        </h3>

        <div className="bg-[#F8F9FA] rounded-2xl p-4 sm:p-5 border border-gray-100 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs sm:text-sm font-semibold text-neutral-primary">
              Skills Demonstration Verdict:
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
              Assessor Detailed Technical Comments & Next Steps
            </label>
            <textarea
              rows={3}
              placeholder="Type Here"
              defaultValue="Candidate showed exceptional technical craftsmanship and safety discipline throughout the process."
              className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs text-neutral-primary placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] resize-none"
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
