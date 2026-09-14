"use client";

import React, { useEffect, useState } from "react";
import { Section04AVerificationScope } from "./sections/Section04AVerificationScope";
import { Section04BMethodsQuality } from "./sections/Section04BMethodsQuality";
import { Section04CUnitOutcomes } from "./sections/Section04CUnitOutcomes";
import { useGetIqamIvReport, usePatchIqamIvReport, useSubmitIqamIvReport } from "../../hooks/useIqam";
import type { IqamIvReportData } from "../../api/types";

interface ComprehensiveReportViewProps {
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

type TabType = "04A" | "04B" | "04C";

const EMPTY_DATA: IqamIvReportData = { schemaVersion: 1 };

export const ComprehensiveReportView: React.FC<ComprehensiveReportViewProps> = ({
  applicationId,
  onBack,
  candidateName,
  onUpdateHeader,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("04A");

  const { data: report, isLoading } = useGetIqamIvReport(applicationId);
  const patchReport = usePatchIqamIvReport(applicationId);
  const submitReport = useSubmitIqamIvReport(applicationId);

  const [formData, setFormData] = useState<IqamIvReportData>(EMPTY_DATA);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    if (report?.data && !hasHydrated) {
      setFormData(report.data);
      setHasHydrated(true);
    }
  }, [report, hasHydrated]);

  const isSubmitted = Boolean(report?.submittedAt);

  const handleNextOrSubmit = async () => {
    if (isSubmitted) {
      if (activeTab === "04A") setActiveTab("04B");
      else if (activeTab === "04B") setActiveTab("04C");
      return;
    }
    try {
      await patchReport.mutateAsync(formData);
    } catch {
      return;
    }
    if (activeTab === "04A") setActiveTab("04B");
    else if (activeTab === "04B") setActiveTab("04C");
    else await submitReport.mutateAsync();
  };

  useEffect(() => {
    onUpdateHeader?.({
      title: "Internal Verifier's Comprehensive Report Form",
      breadcrumb: "Internal Verifier's Comprehensive Report Form",
      actionLabel: isSubmitted ? (activeTab === "04C" ? undefined : "Next") : activeTab === "04C" ? "Submit" : "Save & Next",
      onAction: isSubmitted && activeTab === "04C" ? undefined : handleNextOrSubmit,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, onUpdateHeader, formData, isSubmitted]);

  if (isLoading) {
    return (
      <div className="w-full flex flex-col gap-6 select-text pb-12 animate-pulse">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
          {/* Tabs skeleton */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl w-fit">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded-xl w-28" />
            ))}
          </div>

          {/* Content skeleton */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-5">
            <div className="h-4 bg-gray-200 rounded w-48" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 bg-gray-50/70 rounded-2xl border border-gray-100 flex flex-col gap-2.5">
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-10 bg-gray-100 rounded-xl w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 select-text pb-12 animate-fadeIn">

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
        {isSubmitted && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs font-bold text-emerald-800">
            This report was submitted on {new Date(report!.submittedAt!).toLocaleDateString("en-GB")}. It is now read-only.
          </div>
        )}

        {/* Navigation Tabs Pill Container */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("04A")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "04A" ? "bg-[#900B27] text-white shadow-xs" : "text-gray-600 hover:text-neutral-primary"
            }`}
          >
            CON/04A/IQAM
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("04B")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "04B" ? "bg-[#900B27] text-white shadow-xs" : "text-gray-600 hover:text-neutral-primary"
            }`}
          >
            CON/04B/IQAM
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("04C")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "04C" ? "bg-[#900B27] text-white shadow-xs" : "text-gray-600 hover:text-neutral-primary"
            }`}
          >
            CON/04C/IQAM
          </button>
        </div>

        {/* Dynamic Section View */}
        {activeTab === "04A" && (
          <Section04AVerificationScope
            candidateName={report?.candidate.name || candidateName}
            qualificationTitle={report ? `${report.trade.name} Level ${report.qualificationLevel.level}` : undefined}
            internalVerifierName={report?.internalVerifier.name}
            unitAssessorName={report?.unitAssessor?.name}
            data={formData.con04a}
            readOnly={isSubmitted}
            onChange={(con04a) => setFormData((prev) => ({ ...prev, con04a }))}
          />
        )}
        {activeTab === "04B" && (
          <Section04BMethodsQuality
            availableMethods={report?.methods || []}
            data={formData.con04b}
            readOnly={isSubmitted}
            onChange={(con04b) => setFormData((prev) => ({ ...prev, con04b }))}
          />
        )}
        {activeTab === "04C" && (
          <Section04CUnitOutcomes
            units={report?.units || []}
            data={formData.con04c}
            readOnly={isSubmitted}
            onChange={(con04c) => setFormData((prev) => ({ ...prev, con04c }))}
          />
        )}
      </div>
    </div>
  );
};
