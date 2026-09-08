"use client";

import React, { useState } from "react";
import { IqaAllocationView } from "./components/con01/IqaAllocationView";
import { SamplingPlanView } from "./components/con02/SamplingPlanView";
import { SamplingRecordView } from "./components/con03/SamplingRecordView";
import { ComprehensiveReportView } from "./components/con04/ComprehensiveReportView";
import { ObservationChecklistView } from "./components/con05/ObservationChecklistView";
import { FinalPortfolioReportView } from "./components/con06/FinalPortfolioReportView";
import type { IqamToolCard, IqamToolId } from "./types/iqam.types";

const IQAM_TOOLS: IqamToolCard[] = [
  {
    id: "CON/01/IQAM",
    refCode: "Ref: CON/01/IQAM",
    title: "IQA Allocation Form Of Candidates To Assessor",
    description: "Candidate cohort allocations, qualification units assigned, and planned IQA monitoring dates.",
  },
  {
    id: "CON/02/IQAM",
    refCode: "Ref: CON/02/IQAM",
    title: "Internal Verification Sampling Plan",
    description: "Sampling matrix planning unit audits (1-10) and multiple evidence modalities across candidates.",
  },
  {
    id: "CON/03/IQAM",
    refCode: "Ref: CON/03/IQAM",
    title: "Internal Verification Sampling Record",
    description: "Audit log tracking sampled units, evidence types, feedback given, and dual Assessor-IV signatures.",
  },
  {
    id: "CON/04/IQAM",
    refCode: "Ref: CON/04/IQAM (04A/B/C)",
    title: "Comprehensive Internal Verifier Report Form",
    description: "Standard 3-part NBTE report covering sampling scope, evidence evaluation (VARCS), action plan, and unit signoffs.",
  },
  {
    id: "CON/05/IQAM",
    refCode: "Ref: CON/05/IQAM",
    title: "IV Observation & Questioning Checklist",
    description: "Live 11-point monitoring checklist auditing the assessor during candidate observation and questioning.",
  },
  {
    id: "CON/06/IQAM",
    refCode: "Ref: CON/06/IQAM",
    title: "Final Portfolio / Award Report Form",
    description: "Comprehensive 14-item portfolio compliance audit authorizing certificate claim and full award signoff.",
  },
];

interface IqamToolsDashboardProps {
  initialToolId?: IqamToolId | null;
  initialCandidateName?: string;
  onToolSelect?: (toolId: IqamToolId | null) => void;
  onBack?: () => void;
}

export const IqamToolsDashboard: React.FC<IqamToolsDashboardProps> = ({
  initialToolId = null,
  initialCandidateName = "Samson David",
  onToolSelect,
  onBack,
}) => {
  const [activeTool, setActiveTool] = useState<IqamToolId | null>(initialToolId);
  const [selectedCandidate, setSelectedCandidate] = useState<string>(initialCandidateName);

  const handleSelectTool = (id: IqamToolId | null) => {
    if (!id && onBack && initialToolId) {
      onBack();
      return;
    }
    setActiveTool(id);
    onToolSelect?.(id);
  };

  if (activeTool === "CON/01/IQAM") {
    return (
      <IqaAllocationView
        onBack={() => handleSelectTool(null)}
        onOpenCandidateForm={(cand) => {
          setSelectedCandidate(cand);
          handleSelectTool("CON/04/IQAM");
        }}
      />
    );
  }

  if (activeTool === "CON/02/IQAM") {
    return <SamplingPlanView onBack={() => handleSelectTool(null)} />;
  }

  if (activeTool === "CON/03/IQAM") {
    return <SamplingRecordView onBack={() => handleSelectTool(null)} />;
  }

  if (activeTool === "CON/04/IQAM") {
    return (
      <ComprehensiveReportView
        candidateName={selectedCandidate}
        onBack={() => handleSelectTool(null)}
      />
    );
  }

  if (activeTool === "CON/05/IQAM") {
    return (
      <ObservationChecklistView
        candidateName={selectedCandidate}
        onBack={() => handleSelectTool(null)}
      />
    );
  }

  if (activeTool === "CON/06/IQAM") {
    return (
      <FinalPortfolioReportView
        candidateName={selectedCandidate}
        onBack={() => handleSelectTool(null)}
      />
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 select-text pb-12 animate-fadeIn">
      {/* Top Banner */}
      <div className="w-full bg-[#a31d38] text-white py-7 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            IQAM Assessment Tools
          </h2>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-extrabold text-neutral-primary">
            Assessment Tools
          </h3>
          <span className="px-3 py-1 bg-emerald-100/70 text-emerald-800 text-[11px] font-extrabold rounded-xl">
            Active
          </span>
        </div>

        {/* 6 Tool Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {IQAM_TOOLS.map((tool) => (
            <div
              key={tool.id}
              className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between gap-5 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col gap-2.5">
                <span className="w-fit px-2.5 py-1 bg-rose-50 text-[#a31d38] font-bold text-[10px] rounded-lg">
                  {tool.refCode}
                </span>
                <h4 className="text-sm sm:text-base font-extrabold text-neutral-primary leading-snug">
                  {tool.title}
                </h4>
                <p className="text-xs text-neutral-secondary leading-relaxed line-clamp-3">
                  {tool.description}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleSelectTool(tool.id)}
                className="w-full h-11 bg-[#fbab2a] hover:bg-[#e89b1f] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center"
              >
                Open
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
