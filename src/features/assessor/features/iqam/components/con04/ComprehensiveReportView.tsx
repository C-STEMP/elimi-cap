"use client";

import React, { useState, useEffect } from "react";
import { Section04AVerificationScope } from "./sections/Section04AVerificationScope";
import { Section04BMethodsQuality } from "./sections/Section04BMethodsQuality";
import { Section04CUnitOutcomes } from "./sections/Section04CUnitOutcomes";

interface ComprehensiveReportViewProps {
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

type TabType = "04A" | "04B" | "04C";

export const ComprehensiveReportView: React.FC<ComprehensiveReportViewProps> = ({
  onBack,
  candidateName = "Samson David",
  onSubmit,
  onUpdateHeader,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("04A");

  const handleNextOrSubmit = () => {
    if (activeTab === "04A") setActiveTab("04B");
    else if (activeTab === "04B") setActiveTab("04C");
    else onSubmit?.();
  };

  useEffect(() => {
    onUpdateHeader?.({
      title: "Internal Verifier's Comprehensive Report Form",
      breadcrumb: "Internal Verifier's Comprehensive Report Form",
      actionLabel: activeTab === "04C" ? "Submit" : "Next",
      onAction: handleNextOrSubmit,
    });
  }, [activeTab, onUpdateHeader]);

  return (
    <div className="w-full flex flex-col gap-6 select-text pb-12 animate-fadeIn">

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
        {/* Navigation Tabs Pill Container */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("04A")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "04A" ? "bg-[#a31d38] text-white shadow-xs" : "text-gray-600 hover:text-neutral-primary"
            }`}
          >
            CON/04A/IQAM
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("04B")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "04B" ? "bg-[#a31d38] text-white shadow-xs" : "text-gray-600 hover:text-neutral-primary"
            }`}
          >
            CON/04B/IQAM
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("04C")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "04C" ? "bg-[#a31d38] text-white shadow-xs" : "text-gray-600 hover:text-neutral-primary"
            }`}
          >
            CON/04C/IQAM
          </button>
        </div>

        {/* Section Ref & Candidate Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 sm:p-5">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              REF: {activeTab === "04A" ? "CON/04A/IQAM" : activeTab === "04B" ? "CON/04B/IQAM" : "CON/04C/IQAM"}
            </span>
            <h4 className="text-sm sm:text-base font-extrabold text-neutral-primary mt-1 truncate">
              {activeTab === "04A" && "Verification Scope & Sampled Units"}
              {activeTab === "04B" && "Methods Sampled, VACSR Quality & Action Plan"}
              {activeTab === "04C" && "Verified Unit Outcomes, Appeals & Formal Signoffs"}
            </h4>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 sm:p-5">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              CANDIDATE NAME
            </span>
            <h4 className="text-sm sm:text-base font-extrabold text-neutral-primary mt-1 truncate">
              {candidateName}
            </h4>
          </div>
        </div>

        {/* Dynamic Section View */}
        {activeTab === "04A" && <Section04AVerificationScope />}
        {activeTab === "04B" && <Section04BMethodsQuality />}
        {activeTab === "04C" && <Section04CUnitOutcomes />}
      </div>
    </div>
  );
};
