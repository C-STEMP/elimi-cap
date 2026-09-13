"use client";

import React, { useEffect, useState } from "react";
import { IqamSignatureBlock } from "../common/IqamSignatureBlock";
import {
  useGetIqamFinalPortfolio,
  usePatchIqamFinalPortfolio,
  useSubmitIqamFinalPortfolio,
} from "../../hooks/useIqam";
import type { IqamFinalPortfolioData, IqamFinalPortfolioCheckpoint, IqamSignatureStub } from "../../api/types";

interface FinalPortfolioReportViewProps {
  applicationId: string;
  onBack: () => void;
  candidateName?: string;
  onUpdateHeader?: (config: {
    title: string;
    breadcrumb: string;
    actionLabel?: string;
    onAction?: () => void;
  } | null) => void;
}

const DEFAULT_CHECKPOINTS: IqamFinalPortfolioCheckpoint[] = [
  { id: "cp-1", question: "The candidate's details provided on the initial registration form are certified as with the awarding organization", answer: null, comments: "" },
  { id: "cp-2", question: "For unqualified assessors, the assessment decisions have been countersigned", answer: null, comments: "" },
  { id: "cp-3", question: "The records of all meetings between Assessor and Candidate, agreed actions, and sign-offs for the achievement of Unit are available and complete", answer: null, comments: "" },
  { id: "cp-4", question: "There is complete evidence of the assessor perspective for the full assessment cycle", answer: null, comments: "" },
  { id: "cp-5", question: "The Assessment plan continues to reflect the progress of the candidate", answer: null, comments: "" },
  { id: "cp-6", question: "All key documentation is dated and signed", answer: null, comments: "" },
  { id: "cp-7", question: "The Award Summary & Unit records are properly completed", answer: null, comments: "" },
  { id: "cp-8", question: "Assessment process documents are complete and available for the panels", answer: null, comments: "" },
  { id: "cp-9", question: "Internal quality assurance documentation is completed", answer: null, comments: "" },
];

const appendedSignature = (): IqamSignatureStub => ({
  status: "appended",
  signedAt: new Date().toISOString(),
  signatureMode: "typed",
});

export const FinalPortfolioReportView: React.FC<FinalPortfolioReportViewProps> = ({
  applicationId,
  onBack,
  candidateName,
  onUpdateHeader,
}) => {
  const { data: portfolio, isLoading } = useGetIqamFinalPortfolio(applicationId);
  const patchPortfolio = usePatchIqamFinalPortfolio(applicationId);
  const submitPortfolio = useSubmitIqamFinalPortfolio(applicationId);

  const [formData, setFormData] = useState<IqamFinalPortfolioData>({ schemaVersion: 1 });
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    if (portfolio?.data && !hasHydrated) {
      setFormData(portfolio.data);
      setHasHydrated(true);
    }
  }, [portfolio, hasHydrated]);

  const isSubmitted = Boolean(portfolio?.submittedAt);
  const checkpoints = formData.checkpoints?.length ? formData.checkpoints : DEFAULT_CHECKPOINTS;
  const signatures = formData.signatures || {};

  const handleSubmit = async () => {
    if (isSubmitted) return;
    try {
      await patchPortfolio.mutateAsync(formData);
      await submitPortfolio.mutateAsync();
    } catch {
      // Errors already surfaced via toast by the hooks.
    }
  };

  useEffect(() => {
    onUpdateHeader?.({
      title: "Internal Verifiers Final Portfolio / Award Report Form",
      breadcrumb: "Final Portfolio Report",
      actionLabel: isSubmitted ? undefined : "Submit",
      onAction: isSubmitted ? undefined : handleSubmit,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onUpdateHeader, formData, isSubmitted]);

  const toggleAnswer = (id: string, ans: "yes" | "no") => {
    setFormData((prev) => ({
      ...prev,
      checkpoints: checkpoints.map((c) => (c.id === id ? { ...c, answer: ans } : c)),
    }));
  };

  const updateComments = (id: string, text: string) => {
    setFormData((prev) => ({
      ...prev,
      checkpoints: checkpoints.map((c) => (c.id === id ? { ...c, comments: text } : c)),
    }));
  };

  if (isLoading) {
    return (
      <div className="w-full flex flex-col gap-6 select-text pb-12">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-gray-400 py-6">Loading final portfolio…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 select-text pb-12 animate-fadeIn">

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
        {isSubmitted && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs font-bold text-emerald-800">
            This report was submitted on {new Date(portfolio!.submittedAt!).toLocaleDateString("en-GB")}. It is now read-only.
          </div>
        )}

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
            <h4 className="text-xs sm:text-sm font-black text-neutral-primary mt-1 truncate">
              {portfolio?.candidate.name || candidateName || "—"}
            </h4>
          </div>
          <div className="bg-[#f8f9fa] border border-gray-100/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">QUALIFICATION</span>
            <h4 className="text-xs sm:text-sm font-black text-neutral-primary mt-1 truncate">
              {portfolio ? `${portfolio.trade.name} Level ${portfolio.qualificationLevel.level}` : "—"}
            </h4>
          </div>
        </div>

        {/* Metadata Grid Row 2 (4 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#f8f9fa] border border-gray-100/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">INTERNAL VERIFIER</span>
            <h4 className="text-xs sm:text-sm font-black text-neutral-primary mt-1 truncate">{portfolio?.internalVerifier.name || "—"}</h4>
          </div>
          <div className="bg-[#f8f9fa] border border-gray-100/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">CENTRE</span>
            <h4 className="text-xs sm:text-sm font-black text-neutral-primary mt-1">{portfolio?.centre.name || "—"}</h4>
          </div>
          <div className="bg-[#f8f9fa] border border-gray-100/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">NAME OF ASSESSOR</span>
            <h4 className="text-xs sm:text-sm font-black text-neutral-primary mt-1 truncate">{portfolio?.unitAssessor?.name || "—"}</h4>
          </div>
          <div className="bg-[#f8f9fa] border border-gray-100/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">STATUS</span>
            <h4 className="text-xs sm:text-sm font-black text-neutral-primary mt-1">{portfolio?.status || "draft"}</h4>
          </div>
        </div>

        {/* Full Award Verified Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-gray-100 flex items-center justify-between gap-4">
          <span className="text-xs sm:text-sm font-bold text-neutral-primary">Full Award Verified</span>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              disabled={isSubmitted}
              onClick={() => setFormData((prev) => ({ ...prev, fullAwardVerified: true }))}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer disabled:opacity-60 ${
                formData.fullAwardVerified === true ? "bg-[#900B27] text-white" : "bg-white text-gray-700 border border-gray-200"
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              disabled={isSubmitted}
              onClick={() => setFormData((prev) => ({ ...prev, fullAwardVerified: false }))}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer disabled:opacity-60 ${
                formData.fullAwardVerified === false ? "bg-[#900B27] text-white" : "bg-white text-gray-700 border border-gray-200"
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
                      disabled={isSubmitted}
                      onClick={() => toggleAnswer(item.id, "yes")}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer disabled:opacity-60 ${
                        item.answer === "yes" ? "bg-[#900B27] text-white" : "bg-white text-gray-700 border border-gray-200"
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitted}
                      onClick={() => toggleAnswer(item.id, "no")}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer disabled:opacity-60 ${
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
                  disabled={isSubmitted}
                  className="w-full p-3.5 bg-white rounded-xl border border-gray-100 text-xs text-neutral-primary outline-none resize-none focus:border-[#900B27] transition-all disabled:opacity-70"
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
            value={formData.actionForAssessor || ""}
            onChange={(e) => setFormData((prev) => ({ ...prev, actionForAssessor: e.target.value }))}
            disabled={isSubmitted}
            className="w-full p-3.5 bg-[#f8f9fa] rounded-xl border border-gray-100 text-xs text-neutral-primary outline-none resize-none focus:border-[#900B27] transition-all disabled:opacity-70"
          />
        </div>

        {/* Plan Achieved */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 flex flex-col gap-3">
          <h4 className="text-sm font-bold text-neutral-primary">Plan achieved</h4>
          <textarea
            rows={3}
            placeholder="Type here"
            value={formData.planAchieved || ""}
            onChange={(e) => setFormData((prev) => ({ ...prev, planAchieved: e.target.value }))}
            disabled={isSubmitted}
            className="w-full p-3.5 bg-[#f8f9fa] rounded-xl border border-gray-100 text-xs text-neutral-primary outline-none resize-none focus:border-[#900B27] transition-all disabled:opacity-70"
          />
        </div>

        {/* Signature & Date */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 flex flex-col gap-5">
          <h3 className="text-sm sm:text-base font-extrabold text-neutral-primary">Signature & Date</h3>
          <div className="flex flex-col gap-4">
            <IqamSignatureBlock
              label="IV Signature"
              signed={signatures.iv?.status === "appended"}
              dateValue={signatures.iv?.signedAt || ""}
              readOnly={isSubmitted}
              onSign={() => setFormData((prev) => ({ ...prev, signatures: { ...signatures, iv: appendedSignature() } }))}
            />
            <IqamSignatureBlock
              label="Countersigning IQA (Lead)"
              signed={signatures.countersigningIqa?.status === "appended"}
              dateValue={signatures.countersigningIqa?.signedAt || ""}
              readOnly={isSubmitted}
              onSign={() =>
                setFormData((prev) => ({ ...prev, signatures: { ...signatures, countersigningIqa: appendedSignature() } }))
              }
            />
            <IqamSignatureBlock
              label="Assessor Signature"
              signed={signatures.assessor?.status === "appended"}
              dateValue={signatures.assessor?.signedAt || ""}
              readOnly
            />
            <IqamSignatureBlock
              label="Countersigning Assessor"
              signed={signatures.countersigningAssessor?.status === "appended"}
              dateValue={signatures.countersigningAssessor?.signedAt || ""}
              readOnly
            />
          </div>
        </div>
      </div>
    </div>
  );
};
