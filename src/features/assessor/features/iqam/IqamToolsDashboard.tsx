"use client";

import React, { useEffect, useMemo, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { IqaAllocationView } from "./components/con01/IqaAllocationView";
import { SamplingPlanView } from "./components/con02/SamplingPlanView";
import { SamplingRecordView } from "./components/con03/SamplingRecordView";
import { ComprehensiveReportView } from "./components/con04/ComprehensiveReportView";
import { ObservationChecklistView } from "./components/con05/ObservationChecklistView";
import { FinalPortfolioReportView } from "./components/con06/FinalPortfolioReportView";
import { CompleteCandidateModal } from "./components/common/CompleteCandidateModal";
import { useGetIqamCentres, useGetIqamAllocations } from "./hooks/useIqam";
import { useGetApplicationById } from "@/src/features/shared/applications/hooks";
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

// Tools scoped to one candidate application (CON04/05/06) or a trade+level
// matrix that's easiest to reach via a candidate in that matrix (CON02/03).
const TOOLS_NEEDING_CANDIDATE: IqamToolId[] = [
  "CON/02/IQAM",
  "CON/03/IQAM",
  "CON/04/IQAM",
  "CON/05/IQAM",
  "CON/06/IQAM",
];

interface IqamToolsDashboardProps {
  initialToolId?: IqamToolId | null;
  activeTool?: IqamToolId | null;
  initialCandidateName?: string;
  /** Seeds the application context directly — used when the caller already
   * knows exactly which application this dashboard should open into (e.g.
   * an IV opening IQAM tools from inside one specific application). */
  initialApplicationId?: string;
  initialCentreId?: string;
  onToolSelect?: (toolId: IqamToolId | null) => void;
  onBack?: () => void;
  onUpdateHeader?: (config: {
    title: string;
    breadcrumb: string;
    actionLabel?: string;
    onAction?: () => void;
  } | null) => void;
}

export const IqamToolsDashboard: React.FC<IqamToolsDashboardProps> = ({
  initialToolId = null,
  activeTool: externalActiveTool,
  initialCandidateName,
  initialApplicationId,
  initialCentreId,
  onToolSelect,
  onBack,
  onUpdateHeader,
}) => {
  const [internalActiveTool, setInternalActiveTool] = useState<IqamToolId | null>(initialToolId);
  const effectiveActiveTool = externalActiveTool !== undefined ? externalActiveTool : internalActiveTool;
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);

  // Real centre selection — an IV can operate at more than one centre.
  const { data: iqamCentres = [], isLoading: isLoadingCentres } = useGetIqamCentres();
  const [selectedCentreId, setSelectedCentreId] = useState<string | null>(initialCentreId || null);

  useEffect(() => {
    if (!selectedCentreId && iqamCentres.length > 0) {
      // The endpoint returns every centre the assessor has any IQAM-related
      // permission at, with no role field to disambiguate — so default to
      // the one that actually has candidates allocated for IQA, not just
      // whichever centre happened to come back first.
      const centreWithAllocations = iqamCentres.find((c) => c.assignedCount > 0);
      setSelectedCentreId((centreWithAllocations || iqamCentres[0]).centreId);
    }
  }, [iqamCentres, selectedCentreId]);

  // The candidate application currently in scope. CON02/03 (trade+level
  // matrices) and CON04/05/06 (per-application documents) all key off this.
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(
    initialApplicationId || null,
  );
  const [selectedCandidateName, setSelectedCandidateName] = useState<string>(initialCandidateName || "");

  // Resolve tradeId + wished qualification level for the selected
  // application — the real params the sampling-plan/record matrix needs.
  const { data: selectedApp } = useGetApplicationById(selectedApplicationId || "");
  const selectedTradeId = selectedApp?.tradeId || "";
  const selectedQualificationLevelId = (selectedApp as any)?.nsq?.wishedQualificationLevel?.id || "";

  const { data: allocations = [] } = useGetIqamAllocations(selectedCentreId || "", {
    enabled: Boolean(selectedCentreId),
  });
  const candidateOptions = useMemo(
    () => allocations.map((a) => ({ applicationId: a.applicationId, candidateName: a.candidate.name })),
    [allocations],
  );

  useEffect(() => {
    if (externalActiveTool !== undefined) {
      setInternalActiveTool(externalActiveTool);
    }
  }, [externalActiveTool]);

  useEffect(() => {
    if (!effectiveActiveTool) {
      onUpdateHeader?.(null);
    }
  }, [effectiveActiveTool, onUpdateHeader]);

  const handleSelectTool = (id: IqamToolId | null) => {
    if (!id && onBack && (initialToolId || externalActiveTool !== undefined)) {
      onBack();
      return;
    }
    setInternalActiveTool(id);
    onToolSelect?.(id);
    if (!id) {
      onUpdateHeader?.(null);
    }
  };

  const handleSelectApplication = (applicationId: string, candidateName: string) => {
    setSelectedApplicationId(applicationId);
    setSelectedCandidateName(candidateName);
  };

  const handleOpenTool = (id: IqamToolId) => {
    if (id !== "CON/01/IQAM" && TOOLS_NEEDING_CANDIDATE.includes(id) && !selectedApplicationId) {
      setIsCandidateModalOpen(true);
      return;
    }
    handleSelectTool(id);
  };

  if (!selectedCentreId) {
    return (
      <div className="w-full flex flex-col gap-5 select-text pb-12 animate-fadeIn">
        <h3 className="text-sm sm:text-base font-extrabold text-neutral-primary">
          Assessment Tools
        </h3>
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center gap-2">
          {isLoadingCentres ? (
            <p className="text-xs text-gray-400">Loading your IQAM centres…</p>
          ) : (
            <>
              <p className="text-sm font-bold text-neutral-primary">No IQAM centre found</p>
              <p className="text-xs text-gray-400 max-w-xs">
                You need an active IV assignment or retained relationship at a centre to use these
                tools.
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  if (effectiveActiveTool === "CON/01/IQAM") {
    return (
      <IqaAllocationView
        centreId={selectedCentreId}
        onBack={() => handleSelectTool(null)}
        onOpenCandidateForm={(applicationId, candidateName) => {
          handleSelectApplication(applicationId, candidateName);
          handleSelectTool("CON/04/IQAM");
        }}
        onUpdateHeader={onUpdateHeader}
      />
    );
  }

  if (effectiveActiveTool === "CON/02/IQAM") {
    return (
      <SamplingPlanView
        centreId={selectedCentreId}
        tradeId={selectedTradeId}
        qualificationLevelId={selectedQualificationLevelId}
        onBack={() => handleSelectTool(null)}
        onUpdateHeader={onUpdateHeader}
      />
    );
  }

  if (effectiveActiveTool === "CON/03/IQAM") {
    return (
      <SamplingRecordView
        centreId={selectedCentreId}
        tradeId={selectedTradeId}
        qualificationLevelId={selectedQualificationLevelId}
        onBack={() => handleSelectTool(null)}
        onUpdateHeader={onUpdateHeader}
      />
    );
  }

  if (effectiveActiveTool === "CON/04/IQAM" && selectedApplicationId) {
    return (
      <ComprehensiveReportView
        applicationId={selectedApplicationId}
        candidateName={selectedCandidateName}
        onBack={() => handleSelectTool(null)}
        onUpdateHeader={onUpdateHeader}
      />
    );
  }

  if (effectiveActiveTool === "CON/05/IQAM" && selectedApplicationId) {
    return (
      <ObservationChecklistView
        applicationId={selectedApplicationId}
        candidateName={selectedCandidateName}
        onBack={() => handleSelectTool(null)}
        onUpdateHeader={onUpdateHeader}
      />
    );
  }

  if (effectiveActiveTool === "CON/06/IQAM" && selectedApplicationId) {
    return (
      <FinalPortfolioReportView
        applicationId={selectedApplicationId}
        candidateName={selectedCandidateName}
        onBack={() => handleSelectTool(null)}
        onUpdateHeader={onUpdateHeader}
      />
    );
  }

  return (
    <div className="w-full flex flex-col gap-5 select-text pb-12 animate-fadeIn">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-sm sm:text-base font-extrabold text-neutral-primary">
          Assessment Tools
        </h3>

        <div className="flex items-center gap-3">
          {selectedCandidateName && (
            <span className="px-3 py-1 bg-slate-100 text-neutral-primary text-[11px] font-bold rounded-xl">
              Candidate: {selectedCandidateName}
            </span>
          )}
          {iqamCentres.length > 1 ? (
            <div className="relative">
              <select
                value={selectedCentreId}
                onChange={(e) => {
                  setSelectedCentreId(e.target.value);
                  setSelectedApplicationId(null);
                  setSelectedCandidateName("");
                }}
                className="h-9 pl-3 pr-8 bg-white border border-gray-200 rounded-xl text-xs font-bold text-neutral-primary appearance-none cursor-pointer"
              >
                {iqamCentres.map((c) => (
                  <option key={c.centreId} value={c.centreId}>
                    {c.centreName}
                  </option>
                ))}
              </select>
              <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          ) : (
            <span className="px-3 py-1 bg-emerald-100/70 text-emerald-800 text-[11px] font-extrabold rounded-xl">
              Active
            </span>
          )}
        </div>
      </div>

      {/* 6 Tool Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {IQAM_TOOLS.map((tool) => {
          const needsCandidate = TOOLS_NEEDING_CANDIDATE.includes(tool.id);
          return (
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
                onClick={() => handleOpenTool(tool.id)}
                className="w-full h-11 bg-[#fbab2a] hover:bg-[#e89b1f] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center"
              >
                {needsCandidate && !selectedApplicationId ? "Select Candidate" : "Open"}
              </button>
            </div>
          );
        })}
      </div>

      <CompleteCandidateModal
        isOpen={isCandidateModalOpen}
        onClose={() => setIsCandidateModalOpen(false)}
        candidates={candidateOptions}
        onComplete={(applicationId, candidateName) => {
          setIsCandidateModalOpen(false);
          handleSelectApplication(applicationId, candidateName);
        }}
      />
    </div>
  );
};
