"use client";

import React, { useState, useEffect } from "react";
import { IqamSignatureBlock } from "../common/IqamSignatureBlock";
import type { ChecklistQuestionItem } from "../../types/iqam.types";

interface ObservationChecklistViewProps {
  onBack: () => void;
  candidateName?: string;
  onSubmit?: () => void;
  onUpdateHeader?: (config: {
    title: string;
    breadcrumb: string;
    actionLabel?: string;
    onAction?: () => void;
  } | null) => void;
}

const INITIAL_SECTION_A_QUESTIONS: ChecklistQuestionItem[] = [
  { id: "a-1", question: "Develop and agree an assessment plan with the candidate using appropriate assessment methods", answer: "yes", comments: "" },
  { id: "a-2", question: "Agree when assessment will take place with candidates and other people involved", answer: "yes", comments: "" },
  { id: "a-3", question: "Agree arrangements with candidate for reviewing progress against the assessment plan", answer: "yes", comments: "" },
  { id: "a-4", question: "Review and update assessment plans to take account of what the candidates has achieved", answer: "yes", comments: "" },
  { id: "a-5", question: "Give the candidate feedback at an appropriate time and pace", answer: "yes", comments: "" },
  { id: "a-6", question: "Give feedback in a constructive and encouraging way", answer: "yes", comments: "" },
  { id: "a-7", question: "Give feedback to the candidate which met his/her needs and was appropriate to his/her level of confidence", answer: "yes", comments: "" },
  { id: "a-8", question: "Clearly explain his/her candidate how to get advice on the assessment decisions and appeals", answer: "yes", comments: "" },
];

const INITIAL_SECTION_B_QUESTIONS: ChecklistQuestionItem[] = [
  { id: "b-1", question: "How to operate the centre standardisation and internal quality assurance procedures?", answer: "yes", comments: "" },
  { id: "b-2", question: "How to access the centre appeals and access to fair assessment policy?", answer: "yes", comments: "" },
  { id: "b-3", question: "What information is made available by the awarding organization and Regulatory Body?", answer: "yes", comments: "" },
  { id: "b-4", question: "How to identify and gain resources to support candidates who have special assessment needs?", answer: "yes", comments: "" },
];

export const ObservationChecklistView: React.FC<ObservationChecklistViewProps> = ({
  onBack,
  candidateName = "Samson David",
  onSubmit,
  onUpdateHeader,
}) => {
  const [sectionA, setSectionA] = useState(INITIAL_SECTION_A_QUESTIONS);
  const [sectionB, setSectionB] = useState(INITIAL_SECTION_B_QUESTIONS);
  const [ivSigned, setIvSigned] = useState(false);
  const [secondIvSigned, setSecondIvSigned] = useState(false);

  useEffect(() => {
    onUpdateHeader?.({
      title: "IV Observation & Questioning Checklist",
      breadcrumb: "IV Observation Checklist",
      actionLabel: "Submit",
      onAction: onSubmit,
    });
  }, [onUpdateHeader, onSubmit]);

  const toggleAnswer = (list: "A" | "B", id: string, ans: "yes" | "no") => {
    if (list === "A") {
      setSectionA((prev) => prev.map((q) => (q.id === id ? { ...q, answer: ans } : q)));
    } else {
      setSectionB((prev) => prev.map((q) => (q.id === id ? { ...q, answer: ans } : q)));
    }
  };

  const updateComments = (list: "A" | "B", id: string, text: string) => {
    if (list === "A") {
      setSectionA((prev) => prev.map((q) => (q.id === id ? { ...q, comments: text } : q)));
    } else {
      setSectionB((prev) => prev.map((q) => (q.id === id ? { ...q, comments: text } : q)));
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 select-text pb-12 animate-fadeIn">

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
        {/* Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 sm:p-5">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">REF: CON/05/IQAM</span>
            <h4 className="text-sm sm:text-base font-extrabold text-neutral-primary mt-1">
              IV Observation & Questioning Checklist
            </h4>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 sm:p-5">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">CANDIDATE NAME</span>
            <h4 className="text-sm sm:text-base font-extrabold text-neutral-primary mt-1">{candidateName}</h4>
          </div>
        </div>

        {/* Section A: Did the Assessor? */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-5">
          <h3 className="text-sm sm:text-base font-extrabold text-neutral-primary">Did the Assessor?</h3>
          <div className="flex flex-col gap-4">
            {sectionA.map((item) => (
              <div key={item.id} className="p-4 bg-gray-50/70 rounded-2xl border border-gray-100 flex flex-col gap-2.5">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-xs font-semibold text-neutral-primary leading-snug">{item.question}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button type="button" onClick={() => toggleAnswer("A", item.id, "yes")} className={`px-3 py-1 rounded-lg text-xs font-bold ${item.answer === "yes" ? "bg-[#a31d38] text-white" : "bg-gray-200 text-gray-700"}`}>Yes</button>
                    <button type="button" onClick={() => toggleAnswer("A", item.id, "no")} className={`px-3 py-1 rounded-lg text-xs font-bold ${item.answer === "no" ? "bg-[#a31d38] text-white" : "bg-gray-200 text-gray-700"}`}>No</button>
                  </div>
                </div>
                <textarea rows={2} placeholder="Type Comments Here" value={item.comments} onChange={(e) => updateComments("A", item.id, e.target.value)} className="w-full p-3 bg-white rounded-xl border border-gray-200 text-xs text-neutral-primary outline-none resize-none" />
              </div>
            ))}
          </div>
        </div>

        {/* Section B: Can the Assessor explain? */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-5">
          <h3 className="text-sm sm:text-base font-extrabold text-neutral-primary">Can the Assessor explain?</h3>
          <div className="flex flex-col gap-4">
            {sectionB.map((item) => (
              <div key={item.id} className="p-4 bg-gray-50/70 rounded-2xl border border-gray-100 flex flex-col gap-2.5">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-xs font-semibold text-neutral-primary leading-snug">{item.question}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button type="button" onClick={() => toggleAnswer("B", item.id, "yes")} className={`px-3 py-1 rounded-lg text-xs font-bold ${item.answer === "yes" ? "bg-[#a31d38] text-white" : "bg-gray-200 text-gray-700"}`}>Yes</button>
                    <button type="button" onClick={() => toggleAnswer("B", item.id, "no")} className={`px-3 py-1 rounded-lg text-xs font-bold ${item.answer === "no" ? "bg-[#a31d38] text-white" : "bg-gray-200 text-gray-700"}`}>No</button>
                  </div>
                </div>
                <textarea rows={2} placeholder="Type Comments Here" value={item.comments} onChange={(e) => updateComments("B", item.id, e.target.value)} className="w-full p-3 bg-white rounded-xl border border-gray-200 text-xs text-neutral-primary outline-none resize-none" />
              </div>
            ))}
          </div>
        </div>

        {/* Signatures */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-5">
          <h3 className="text-sm sm:text-base font-extrabold text-neutral-primary">Signature & Date</h3>
          <IqamSignatureBlock label="Assessor Signature" readOnly />
          <IqamSignatureBlock label="IV Signature" signed={ivSigned} onSign={() => setIvSigned(true)} />
          <IqamSignatureBlock label="Second line IV signature" signed={secondIvSigned} onSign={() => setSecondIvSigned(true)} />
        </div>
      </div>
    </div>
  );
};
