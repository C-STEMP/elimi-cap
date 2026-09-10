"use client";

import React, { useState, useEffect } from "react";
import { IqamSignatureBlock } from "../common/IqamSignatureBlock";
import type { ChecklistQuestionItem } from "../../types/iqam.types";

interface FinalPortfolioReportViewProps {
  onBack: () => void;
  candidateName?: string;
  enrolmentNo?: string;
  onSubmit?: () => void;
  onUpdateHeader?: (config: {
    title: string;
    breadcrumb: string;
    actionLabel?: string;
    onAction?: () => void;
  } | null) => void;
}

const CHECKPOINTS: ChecklistQuestionItem[] = [
  { id: "cp-1", question: "The candidate's details provided on the initial registration form are certified as with the awarding organization", answer: "yes", comments: "" },
  { id: "cp-2", question: "For unqualified assessors, the assessment decisions have been countersigned", answer: "yes", comments: "" },
  { id: "cp-3", question: "The records of all meetings between Assessor and Candidate, agreed actions, and sign-offs for the achievement of Unit are available and complete", answer: "yes", comments: "" },
  { id: "cp-4", question: "There is complete evidence of the assessor perspective for the full assessment cycle", answer: "yes", comments: "" },
  { id: "cp-5", question: "The Assessment plan continues to reflect the progress of the candidate", answer: "yes", comments: "" },
  { id: "cp-6", question: "All key documentation is dated and signed", answer: "yes", comments: "" },
  { id: "cp-7", question: "The Award Summary & Unit records are properly completed", answer: "yes", comments: "" },
  { id: "cp-8", question: "Assessment process documents are complete and available for the panels", answer: "yes", comments: "" },
  { id: "cp-9", question: "Internal quality assurance documentation is completed", answer: "yes", comments: "" },
];

export const FinalPortfolioReportView: React.FC<FinalPortfolioReportViewProps> = ({
  onBack,
  candidateName = "Samson David",
  enrolmentNo = "NBTE/MAQ/2026/10892",
  onSubmit,
  onUpdateHeader,
}) => {
  const [fullAwardVerified, setFullAwardVerified] = useState<"yes" | "no">("yes");
  const [checkpoints, setCheckpoints] = useState(CHECKPOINTS);
  const [ivSigned, setIvSigned] = useState(false);
  const [countersigningIvaSigned, setCountersigningIvaSigned] = useState(false);

  useEffect(() => {
    onUpdateHeader?.({
      title: "Internal Verifiers Final Portfolio / Award Report Form",
      breadcrumb: "Final Portfolio Report",
      actionLabel: "Submit",
      onAction: onSubmit,
    });
  }, [onUpdateHeader, onSubmit]);

  const toggleAnswer = (id: string, ans: "yes" | "no") => {
    setCheckpoints((prev) => prev.map((c) => (c.id === id ? { ...c, answer: ans } : c)));
  };

  const updateComments = (id: string, text: string) => {
    setCheckpoints((prev) => prev.map((c) => (c.id === id ? { ...c, comments: text } : c)));
  };

  return (
    <div className="w-full flex flex-col gap-6 select-text pb-12 animate-fadeIn">

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
        {/* Banner 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 sm:p-5">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">REF: CON/06/IQAM</span>
            <h4 className="text-xs sm:text-sm font-extrabold text-neutral-primary mt-1">
              Internal Verifiers Final Portfolio / Award Report Form
            </h4>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 sm:p-5">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">CANDIDATE NAME</span>
            <h4 className="text-xs sm:text-sm font-extrabold text-neutral-primary mt-1 truncate">{candidateName}</h4>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 sm:p-5">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">ENROLMENT / REG NUMBER</span>
            <h4 className="text-xs sm:text-sm font-extrabold text-neutral-primary mt-1 truncate">{enrolmentNo}</h4>
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-neutral-primary">Title of Qualification<span className="text-rose-500">*</span></label>
            <input type="text" placeholder="Type here" className="h-11 px-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs text-neutral-primary outline-none" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-neutral-primary">Assessment Location<span className="text-rose-500">*</span></label>
            <input type="text" placeholder="Type here" className="h-11 px-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs text-neutral-primary outline-none" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-neutral-primary">Assessor Internal Verifier<span className="text-rose-500">*</span></label>
            <input type="text" placeholder="Type here" className="h-11 px-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs text-neutral-primary outline-none" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-neutral-primary">Countersigning Assessor (if IV)<span className="text-rose-500">*</span></label>
            <input type="text" placeholder="Type here" className="h-11 px-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs text-neutral-primary outline-none" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-neutral-primary">Internal Verifier (IQA)<span className="text-rose-500">*</span></label>
            <input type="text" placeholder="Type here" className="h-11 px-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs text-neutral-primary outline-none" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-neutral-primary">Countersigning IV (if IV)<span className="text-rose-500">*</span></label>
            <input type="text" placeholder="Type here" className="h-11 px-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs text-neutral-primary outline-none" />
          </div>
          <div className="md:col-span-2 flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-xs font-bold text-neutral-primary">Full Award Verified</span>
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={() => setFullAwardVerified("yes")} className={`px-3 py-1 rounded-lg text-xs font-bold ${fullAwardVerified === "yes" ? "bg-[#a31d38] text-white" : "bg-gray-200 text-gray-700"}`}>Yes</button>
              <button type="button" onClick={() => setFullAwardVerified("no")} className={`px-3 py-1 rounded-lg text-xs font-bold ${fullAwardVerified === "no" ? "bg-[#a31d38] text-white" : "bg-gray-200 text-gray-700"}`}>No</button>
            </div>
          </div>
        </div>

        {/* Comprehensive Portfolio Audit Checkpoints */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-5">
          <h3 className="text-sm sm:text-base font-extrabold text-neutral-primary">
            Comprehensive Portfolio Audit Checkpoints (CON/06)
          </h3>
          <div className="flex flex-col gap-4">
            {checkpoints.map((item) => (
              <div key={item.id} className="p-4 bg-gray-50/70 rounded-2xl border border-gray-100 flex flex-col gap-2.5">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-xs font-semibold text-neutral-primary leading-snug">{item.question}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button type="button" onClick={() => toggleAnswer(item.id, "yes")} className={`px-3 py-1 rounded-lg text-xs font-bold ${item.answer === "yes" ? "bg-[#a31d38] text-white" : "bg-gray-200 text-gray-700"}`}>Yes</button>
                    <button type="button" onClick={() => toggleAnswer(item.id, "no")} className={`px-3 py-1 rounded-lg text-xs font-bold ${item.answer === "no" ? "bg-[#a31d38] text-white" : "bg-gray-200 text-gray-700"}`}>No</button>
                  </div>
                </div>
                <textarea rows={2} placeholder="Type Comments Here" value={item.comments} onChange={(e) => updateComments(item.id, e.target.value)} className="w-full p-3 bg-white rounded-xl border border-gray-200 text-xs text-neutral-primary outline-none resize-none" />
              </div>
            ))}
          </div>
        </div>

        {/* Action for Assessor & Plan Achieved */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
          <h4 className="text-xs sm:text-sm font-extrabold text-neutral-primary">Action for Assessor</h4>
          <textarea rows={3} placeholder="Type here" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-neutral-primary outline-none resize-none" />

          <h4 className="text-xs sm:text-sm font-extrabold text-neutral-primary pt-2">Plan achieved</h4>
          <textarea rows={3} placeholder="Type here" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-neutral-primary outline-none resize-none" />
        </div>

        {/* 4-Party Signatures */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-5">
          <h3 className="text-sm sm:text-base font-extrabold text-neutral-primary">Signature & Date</h3>
          <IqamSignatureBlock label="IV Signature" signed={ivSigned} onSign={() => setIvSigned(true)} />
          <IqamSignatureBlock label="Countersigning IQA (Lead)" signed={countersigningIvaSigned} onSign={() => setCountersigningIvaSigned(true)} />
          <IqamSignatureBlock label="Assessor Signature" readOnly />
          <IqamSignatureBlock label="Countersigning Assessor" readOnly />
        </div>
      </div>
    </div>
  );
};
