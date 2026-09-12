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
        {/* Metadata Grid Row 1 (3 Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#f8f9fa] border border-gray-100/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">REF: CON/06/IQAM</span>
            <h4 className="text-xs sm:text-sm font-black text-neutral-primary mt-1">
              Internal Verifiers Final Portfolio / Award Report Form
            </h4>
          </div>
          <div className="bg-[#f8f9fa] border border-gray-100/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">CANDIDATE NAME</span>
            <h4 className="text-xs sm:text-sm font-black text-neutral-primary mt-1 truncate">{candidateName}</h4>
          </div>
          <div className="bg-[#f8f9fa] border border-gray-100/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">QUALIFICATION</span>
            <h4 className="text-xs sm:text-sm font-black text-neutral-primary mt-1 truncate">Masonry Level 2</h4>
          </div>
        </div>

        {/* Metadata Grid Row 2 (4 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#f8f9fa] border border-gray-100/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">INTERNAL VERIFIER</span>
            <h4 className="text-xs sm:text-sm font-black text-neutral-primary mt-1 truncate">Ogunsakin Jacob</h4>
          </div>
          <div className="bg-[#f8f9fa] border border-gray-100/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">NAME OF COUNTERSIGNING IV</span>
            <h4 className="text-xs sm:text-sm font-black text-neutral-primary mt-1">-</h4>
          </div>
          <div className="bg-[#f8f9fa] border border-gray-100/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">NAME OF ASSESSOR</span>
            <h4 className="text-xs sm:text-sm font-black text-neutral-primary mt-1 truncate">Samson John</h4>
          </div>
          <div className="bg-[#f8f9fa] border border-gray-100/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">COUNTERSIGNING ASSESSOR</span>
            <h4 className="text-xs sm:text-sm font-black text-neutral-primary mt-1">-</h4>
          </div>
        </div>

        {/* Full Award Verified Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-gray-100 flex items-center justify-between gap-4">
          <span className="text-xs sm:text-sm font-bold text-neutral-primary">Full Award Verified</span>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setFullAwardVerified("yes")}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                fullAwardVerified === "yes" ? "bg-[#900B27] text-white" : "bg-white text-gray-700 border border-gray-200"
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setFullAwardVerified("no")}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                fullAwardVerified === "no" ? "bg-[#900B27] text-white" : "bg-white text-gray-700 border border-gray-200"
              }`}
            >
              No
            </button>
          </div>
        </div>

        {/* Comprehensive Portfolio Audit Checkpoints */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 flex flex-col gap-5">
          <h3 className="text-sm sm:text-base font-extrabold text-neutral-primary">
            Comprehensive Portfolio Audit Checkpoints (CON/06)
          </h3>
          <div className="flex flex-col gap-4">
            {checkpoints.map((item) => (
              <div key={item.id} className="p-4 bg-[#f8f9fa] rounded-2xl border border-gray-100/80 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-xs sm:text-sm font-medium text-neutral-primary leading-snug">{item.question}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleAnswer(item.id, "yes")}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        item.answer === "yes" ? "bg-[#900B27] text-white" : "bg-white text-gray-700 border border-gray-200"
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleAnswer(item.id, "no")}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        item.answer === "no" ? "bg-[#900B27] text-white" : "bg-white text-gray-700 border border-gray-200"
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>
                <textarea
                  rows={2}
                  placeholder="Type Comments Here"
                  value={item.comments}
                  onChange={(e) => updateComments(item.id, e.target.value)}
                  className="w-full p-3.5 bg-white rounded-xl border border-gray-100 text-xs text-neutral-primary outline-none resize-none focus:border-[#900B27] transition-all"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Action for Assessor */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 flex flex-col gap-3">
          <h4 className="text-sm font-bold text-neutral-primary">Action for Assessor</h4>
          <textarea
            rows={3}
            placeholder="Type here"
            className="w-full p-3.5 bg-[#f8f9fa] rounded-xl border border-gray-100 text-xs text-neutral-primary outline-none resize-none focus:border-[#900B27] transition-all"
          />
        </div>

        {/* Plan Achieved */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 flex flex-col gap-3">
          <h4 className="text-sm font-bold text-neutral-primary">Plan achieved</h4>
          <textarea
            rows={3}
            placeholder="Type here"
            className="w-full p-3.5 bg-[#f8f9fa] rounded-xl border border-gray-100 text-xs text-neutral-primary outline-none resize-none focus:border-[#900B27] transition-all"
          />
        </div>

        {/* Signature & Date */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 flex flex-col gap-5">
          <h3 className="text-sm sm:text-base font-extrabold text-neutral-primary">Signature & Date</h3>
          <div className="flex flex-col gap-4">
            {/* IV Signature */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-primary">IV Signature*</label>
                <button
                  type="button"
                  onClick={() => setIvSigned(true)}
                  className="h-11 px-4 bg-[#fffbf0] hover:bg-amber-50 text-[#f59e0b] border border-[#fbab2a]/60 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Append Signature</span>
                </button>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-primary">Date*</label>
                <div className="h-11 px-4 bg-[#f8f9fa] rounded-xl border border-gray-100 flex items-center justify-between text-xs text-neutral-primary">
                  <input type="text" placeholder="Type here" className="w-full bg-transparent outline-none" />
                  <span className="text-gray-400">📅</span>
                </div>
              </div>
            </div>

            {/* Countersigning IQA (Lead) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-primary">Countersigning IQA (Lead)*</label>
                <button
                  type="button"
                  onClick={() => setCountersigningIvaSigned(true)}
                  className="h-11 px-4 bg-[#fffbf0] hover:bg-amber-50 text-[#f59e0b] border border-[#fbab2a]/60 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Append Signature</span>
                </button>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-primary">Date*</label>
                <div className="h-11 px-4 bg-[#f8f9fa] rounded-xl border border-gray-100 flex items-center justify-between text-xs text-neutral-primary">
                  <input type="text" placeholder="Type here" className="w-full bg-transparent outline-none" />
                  <span className="text-gray-400">📅</span>
                </div>
              </div>
            </div>

            {/* Assessor Signature */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-primary">Assessor Signature*</label>
                <button
                  type="button"
                  className="h-11 px-4 bg-[#fffbf0] text-[#f59e0b] border border-[#fbab2a]/60 font-bold text-xs rounded-xl flex items-center justify-center gap-2 select-none"
                >
                  <span>Awaiting Signature</span>
                </button>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-primary">Date*</label>
                <div className="h-11 px-4 bg-[#f8f9fa] rounded-xl border border-gray-100 flex items-center justify-between text-xs text-neutral-primary">
                  <input type="text" placeholder="Type here" className="w-full bg-transparent outline-none" />
                  <span className="text-gray-400">📅</span>
                </div>
              </div>
            </div>

            {/* Countersigning Assessor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-primary">Countersigning Assessor*</label>
                <button
                  type="button"
                  className="h-11 px-4 bg-[#fffbf0] text-[#f59e0b] border border-[#fbab2a]/60 font-bold text-xs rounded-xl flex items-center justify-center gap-2 select-none"
                >
                  <span>Awaiting Signature</span>
                </button>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-primary">Date*</label>
                <div className="h-11 px-4 bg-[#f8f9fa] rounded-xl border border-gray-100 flex items-center justify-between text-xs text-neutral-primary">
                  <input type="text" placeholder="Type here" className="w-full bg-transparent outline-none" />
                  <span className="text-gray-400">📅</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
