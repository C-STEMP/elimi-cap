"use client";

import React, { useEffect, useState } from "react";
import { IqamSignatureBlock } from "../common/IqamSignatureBlock";
import {
  useGetIqamFinalPortfolio,
  usePatchIqamFinalPortfolio,
  useSubmitIqamFinalPortfolio,
} from "../../hooks/useIqam";
import { useGetApplicationById } from "@/src/features/shared/applications/hooks";
import { useAppSelector } from "@/src/store/hooks";
import type {
  IqamFinalPortfolioData,
  IqamFinalPortfolioCheckpoint,
  IqamSignatureStub,
} from "../../api/types";
import { Button } from "@/src/components/ui/button";
import { FiArrowLeft, FiCheck } from "react-icons/fi";

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
  {
    id: "cp-1",
    question:
      "The candidate's details provided on the initial registration form are certified as with the awarding organization",
    answer: "yes",
    comments: "Candidate registration details certified against awarding body records.",
  },
  {
    id: "cp-2",
    question:
      "For unqualified assessors, the assessment decisions have been countersigned",
    answer: "yes",
    comments: "All assessment decisions properly counter-signed and validated.",
  },
  {
    id: "cp-3",
    question:
      "The records of all meetings between Assessor and Candidate, agreed actions, and sign-offs for the achievement of Unit are available and complete",
    answer: "yes",
    comments: "Meeting records, feedback logs, and unit sign-offs are complete.",
  },
  {
    id: "cp-4",
    question:
      "There is complete evidence of the assessor perspective for the full assessment cycle",
    answer: "yes",
    comments: "Full assessment cycle documented across portfolio artifacts.",
  },
  {
    id: "cp-5",
    question:
      "The Assessment plan continues to reflect the progress of the candidate",
    answer: "yes",
    comments: "Assessment plan reflects ongoing candidate progress and outcomes.",
  },
  {
    id: "cp-6",
    question: "All key documentation is dated and signed",
    answer: "yes",
    comments: "All declarations, assessment sheets, and records are signed and dated.",
  },
  {
    id: "cp-7",
    question: "The Award Summary & Unit records are properly completed",
    answer: "yes",
    comments: "Award summary and competency unit requirements properly completed.",
  },
  {
    id: "cp-8",
    question:
      "Assessment process documents are complete and available for the panels",
    answer: "yes",
    comments: "Complete assessment documentation available for quality panel review.",
  },
  {
    id: "cp-9",
    question: "Internal quality assurance documentation is completed",
    answer: "yes",
    comments: "IQA documentation and sampling audit successfully completed.",
  },
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
  const { data: portfolio, isLoading: isPortfolioLoading } =
    useGetIqamFinalPortfolio(applicationId);
  const { data: appDetail, isLoading: isAppLoading } =
    useGetApplicationById(applicationId);
  const currentUser = useAppSelector((state) => state.auth.user);

  const patchPortfolio = usePatchIqamFinalPortfolio(applicationId);
  const submitPortfolio = useSubmitIqamFinalPortfolio(applicationId);

  const isSubmitted = Boolean(portfolio?.submittedAt);

  // Resolved metadata with smart autofill fallbacks from ApplicationDetail and Current User
  const resolvedCandidateName =
    portfolio?.candidate?.name ||
    candidateName ||
    appDetail?.candidate?.name ||
    (appDetail?.personalInformation?.personalDetails
      ? `${appDetail.personalInformation.personalDetails.firstName || ""} ${appDetail.personalInformation.personalDetails.lastName || ""}`.trim()
      : "") ||
    "Candidate";

  const resolvedTradeName =
    portfolio?.trade?.name ||
    appDetail?.trade?.name ||
    (appDetail as any)?.nsq?.trade?.name ||
    "Standard Trade";

  const resolvedLevel =
    portfolio?.qualificationLevel?.level ||
    appDetail?.qualificationLevel?.level ||
    1;

  const resolvedQualification = `${resolvedTradeName} Level ${resolvedLevel}`;

  const resolvedInternalVerifier =
    portfolio?.internalVerifier?.name ||
    appDetail?.internalVerifier?.name ||
    currentUser?.fullName ||
    (currentUser as any)?.name ||
    "Internal Verifier";

  const resolvedCentre =
    portfolio?.centre?.name ||
    appDetail?.centre?.name ||
    (appDetail as any)?.assessmentCentre?.name ||
    "Assessment Centre";

  const resolvedAssessorName =
    portfolio?.unitAssessor?.name ||
    appDetail?.unitAssessor?.name ||
    appDetail?.facilitator?.name ||
    "Lead Assessor";

  const resolvedStatus =
    portfolio?.status || (isSubmitted ? "submitted" : "draft");

  const [formData, setFormData] = useState<IqamFinalPortfolioData>({
    schemaVersion: 1,
    fullAwardVerified: true,
    checkpoints: DEFAULT_CHECKPOINTS,
  });
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    if (portfolio?.data && !hasHydrated) {
      setFormData({
        schemaVersion: 1,
        fullAwardVerified:
          portfolio.data.fullAwardVerified !== undefined &&
          portfolio.data.fullAwardVerified !== null
            ? portfolio.data.fullAwardVerified
            : true,
        checkpoints:
          portfolio.data.checkpoints && portfolio.data.checkpoints.length > 0
            ? portfolio.data.checkpoints.map((cp) => ({
                ...cp,
                answer: cp.answer || "yes",
                comments: cp.comments !== undefined ? cp.comments : "",
              }))
            : DEFAULT_CHECKPOINTS,
        actionForAssessor:
          portfolio.data.actionForAssessor ||
          "Portfolio verified to standard. Maintain records in accordance with centre quality assurance policy.",
        planAchieved:
          portfolio.data.planAchieved ||
          `All planned portfolio units, workplace observation requirements, and evidence criteria for ${resolvedQualification} have been successfully achieved and verified.`,
        signatures: portfolio.data.signatures || {},
      });
      setHasHydrated(true);
    } else if (
      !hasHydrated &&
      (portfolio !== undefined || appDetail !== undefined)
    ) {
      setFormData({
        schemaVersion: 1,
        fullAwardVerified: true,
        checkpoints: DEFAULT_CHECKPOINTS,
        actionForAssessor:
          "Portfolio verified to standard. Maintain records in accordance with centre quality assurance policy.",
        planAchieved:
          `All planned portfolio units, workplace observation requirements, and evidence criteria for ${resolvedQualification} have been successfully achieved and verified.`,
        signatures: {},
      });
      setHasHydrated(true);
    }
  }, [portfolio, appDetail, hasHydrated, resolvedQualification]);

  const checkpoints = formData.checkpoints?.length
    ? formData.checkpoints
    : DEFAULT_CHECKPOINTS;
  const signatures = formData.signatures || {};

  const handleSubmit = async () => {
    if (isSubmitted) return;
    try {
      const submissionData: IqamFinalPortfolioData = {
        ...formData,
        fullAwardVerified:
          formData.fullAwardVerified !== undefined &&
          formData.fullAwardVerified !== null
            ? formData.fullAwardVerified
            : true,
        signatures: {
          ...formData.signatures,
          iv:
            formData.signatures?.iv?.status === "appended"
              ? formData.signatures.iv
              : appendedSignature(),
        },
      };
      await patchPortfolio.mutateAsync(submissionData);
      await submitPortfolio.mutateAsync();
      setFormData(submissionData);
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
      checkpoints: checkpoints.map((c) =>
        c.id === id ? { ...c, answer: ans } : c,
      ),
    }));
  };

  const updateComments = (id: string, text: string) => {
    setFormData((prev) => ({
      ...prev,
      checkpoints: checkpoints.map((c) =>
        c.id === id ? { ...c, comments: text } : c,
      ),
    }));
  };

  const isLoading = isPortfolioLoading && isAppLoading && !portfolio && !appDetail;

  if (isLoading) {
    return (
      <div className="w-full flex flex-col gap-6 select-text pb-12 animate-pulse">
        <div className="w-full max-w-7xl xl:max-w-360 mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-[#f8f9fa] border border-gray-100/80 rounded-2xl p-4 sm:p-5"
              >
                <div className="h-2.5 bg-gray-200 rounded w-24" />
                <div className="h-4 bg-gray-200 rounded w-32 mt-2" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-[#f8f9fa] border border-gray-100/80 rounded-2xl p-4 sm:p-5"
              >
                <div className="h-2.5 bg-gray-200 rounded w-20" />
                <div className="h-4 bg-gray-200 rounded w-28 mt-2" />
              </div>
            ))}
          </div>
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 flex flex-col gap-5">
            <div className="h-4 bg-gray-200 rounded w-56" />
            <div className="flex flex-col gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="p-4 bg-[#f8f9fa] rounded-2xl border border-gray-100/80 flex flex-col gap-3"
                >
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-10 bg-gray-100 rounded-xl w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 select-text pb-12 animate-fadeIn">
      <div className="w-full max-w-7xl xl:max-w-360 mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
        {isSubmitted && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs font-bold text-emerald-800">
            This report was submitted on{" "}
            {new Date(portfolio!.submittedAt!).toLocaleDateString("en-GB")}. It is
            now read-only.
          </div>
        )}

        {/* Metadata Grid Row 1 (3 Cards) */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#f8f9fa] border border-gray-100/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                REF: CON/06/IQAM
              </span>
              <h4 className="text-xs sm:text-sm font-black text-neutral-primary mt-1">
                Internal Verifiers Final Portfolio / Award Report Form
              </h4>
            </div>
            <div className="bg-[#f8f9fa] border border-gray-100/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                CANDIDATE NAME
              </span>
              <h4 className="text-xs sm:text-sm font-black text-neutral-primary mt-1 truncate">
                {resolvedCandidateName}
              </h4>
            </div>
            <div className="bg-[#f8f9fa] border border-gray-100/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                QUALIFICATION
              </span>
              <h4 className="text-xs sm:text-sm font-black text-neutral-primary mt-1 truncate">
                {resolvedQualification}
              </h4>
            </div>
          </div>
        </div>

        {/* Metadata Grid Row 2 (4 Cards) */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#f8f9fa] border border-gray-100/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                INTERNAL VERIFIER
              </span>
              <h4 className="text-xs sm:text-sm font-black text-neutral-primary mt-1 truncate">
                {resolvedInternalVerifier}
              </h4>
            </div>
            <div className="bg-[#f8f9fa] border border-gray-100/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                CENTRE
              </span>
              <h4 className="text-xs sm:text-sm font-black text-neutral-primary mt-1">
                {resolvedCentre}
              </h4>
            </div>
            <div className="bg-[#f8f9fa] border border-gray-100/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                NAME OF ASSESSOR
              </span>
              <h4 className="text-xs sm:text-sm font-black text-neutral-primary mt-1 truncate">
                {resolvedAssessorName}
              </h4>
            </div>
            <div className="bg-[#f8f9fa] border border-gray-100/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                STATUS
              </span>
              <h4 className="text-xs sm:text-sm font-black text-neutral-primary mt-1 uppercase">
                {resolvedStatus}
              </h4>
            </div>
          </div>
        </div>

        {/* Full Award Verified Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-gray-100 flex items-center justify-between gap-4">
          <span className="text-xs sm:text-sm font-bold text-neutral-primary">
            Full Award Verified
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              disabled={isSubmitted}
              onClick={() =>
                setFormData((prev) => ({ ...prev, fullAwardVerified: true }))
              }
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer disabled:opacity-60 ${
                formData.fullAwardVerified === true
                  ? "bg-[#900B27] text-white"
                  : "bg-white text-gray-700 border border-gray-200"
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              disabled={isSubmitted}
              onClick={() =>
                setFormData((prev) => ({ ...prev, fullAwardVerified: false }))
              }
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer disabled:opacity-60 ${
                formData.fullAwardVerified === false
                  ? "bg-[#900B27] text-white"
                  : "bg-white text-gray-700 border border-gray-200"
              }`}
            >
              No
            </button>
          </div>
        </div>

        {/* Comprehensive Portfolio Audit Checkpoints */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xs border border-gray-100 flex flex-col gap-4 sm:gap-5">
          <h3 className="text-sm sm:text-base font-extrabold text-neutral-primary">
            Comprehensive Portfolio Audit Checkpoints (CON/06)
          </h3>
          <div className="flex flex-col gap-3.5 sm:gap-4">
            {checkpoints.map((item) => (
              <div
                key={item.id}
                className="p-3.5 sm:p-4 bg-[#f8f9fa] rounded-2xl border border-gray-100/80 flex flex-col gap-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 sm:gap-4">
                  <span className="text-xs sm:text-sm font-medium text-neutral-primary leading-snug flex-1">
                    {item.question}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start">
                    <button
                      type="button"
                      disabled={isSubmitted}
                      onClick={() => toggleAnswer(item.id, "yes")}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer disabled:opacity-60 ${
                        item.answer === "yes"
                          ? "bg-[#900B27] text-white"
                          : "bg-white text-gray-700 border border-gray-200"
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitted}
                      onClick={() => toggleAnswer(item.id, "no")}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer disabled:opacity-60 ${
                        item.answer === "no"
                          ? "bg-[#900B27] text-white"
                          : "bg-white text-gray-700 border border-gray-200"
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>
                <textarea
                  rows={2}
                  placeholder="Type Comments Here"
                  value={item.comments || ""}
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
          <h4 className="text-sm font-bold text-neutral-primary">
            Action for Assessor
          </h4>
          <textarea
            rows={3}
            placeholder="Type here"
            value={formData.actionForAssessor || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                actionForAssessor: e.target.value,
              }))
            }
            disabled={isSubmitted}
            className="w-full p-3.5 bg-[#f8f9fa] rounded-xl border border-gray-100 text-xs text-neutral-primary outline-none resize-none focus:border-[#900B27] transition-all disabled:opacity-70"
          />
        </div>

        {/* Plan Achieved */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 flex flex-col gap-3">
          <h4 className="text-sm font-bold text-neutral-primary">
            Plan achieved
          </h4>
          <textarea
            rows={3}
            placeholder="Type here"
            value={formData.planAchieved || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                planAchieved: e.target.value,
              }))
            }
            disabled={isSubmitted}
            className="w-full p-3.5 bg-[#f8f9fa] rounded-xl border border-gray-100 text-xs text-neutral-primary outline-none resize-none focus:border-[#900B27] transition-all disabled:opacity-70"
          />
        </div>

        {/* Signature & Date */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 flex flex-col gap-5">
          <h3 className="text-sm sm:text-base font-extrabold text-neutral-primary">
            Signature & Date
          </h3>
          <div className="flex flex-col gap-4">
            <IqamSignatureBlock
              label="IV Signature"
              signed={signatures.iv?.status === "appended"}
              dateValue={signatures.iv?.signedAt || ""}
              readOnly={isSubmitted}
              onSign={() =>
                setFormData((prev) => ({
                  ...prev,
                  signatures: { ...signatures, iv: appendedSignature() },
                }))
              }
            />
            <IqamSignatureBlock
              label="Countersigning IQA (Lead)"
              signed={signatures.countersigningIqa?.status === "appended"}
              dateValue={signatures.countersigningIqa?.signedAt || ""}
              readOnly={isSubmitted}
              onSign={() =>
                setFormData((prev) => ({
                  ...prev,
                  signatures: {
                    ...signatures,
                    countersigningIqa: appendedSignature(),
                  },
                }))
              }
            />
          </div>
        </div>

        {/* Bottom Actions / Submit Bar */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-2">
          <button
            type="button"
            onClick={onBack}
            className="w-full sm:w-auto justify-center px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Back to Application</span>
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {isSubmitted ? (
              <span className="w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
                <FiCheck className="w-4 h-4" />
                <span>Report Submitted</span>
              </span>
            ) : (
              <Button
                type="button"
                variant="primary"
                onClick={handleSubmit}
                loading={patchPortfolio.isPending || submitPortfolio.isPending}
                className="w-full sm:w-auto justify-center bg-[#900B27] hover:bg-[#72081f] text-white text-xs font-bold px-6 py-2.5 rounded-xl cursor-pointer flex items-center gap-2 shadow-sm border-none"
              >
                <span>Submit Final Portfolio Report (CON 06)</span>
                <FiCheck className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
