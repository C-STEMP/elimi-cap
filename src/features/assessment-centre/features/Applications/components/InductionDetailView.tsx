"use client";

import React, { useState, useMemo } from "react";
import { FiMapPin, FiVideo } from "react-icons/fi";
import { type InductionRowData } from "./ViewInductionDetailModal";
import { SittingCandidatesSection } from "./SittingCandidatesSection";
import { useGetApplications } from "@/src/features/shared/applications/hooks";
import { useGetCentreProfile } from "@/src/features/shared/centre/hooks";
import { useGetAllTrades } from "@/src/features/shared/reference/hooks";

interface Props {
  induction: InductionRowData;
  onBack: () => void;
  onSelectCandidate: (candidateName: string, id?: string) => void;
}

export const InductionDetailView: React.FC<Props> = ({
  induction,
  onSelectCandidate,
}) => {
  const { data: applications = [] } = useGetApplications();
  const { data: centreProfile } = useGetCentreProfile();
  const { data: availableTrades = [] } = useGetAllTrades();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrade, setSelectedTrade] = useState<string>("All");
  const [selectedAssessmentType, setSelectedAssessmentType] = useState<string>("All");
  const [selectedStage, setSelectedStage] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);

  const isVirtual =
    induction.mode.toLowerCase() === "virtual" ||
    induction.mode.toLowerCase() === "online";

  const dateFormatted = induction.scheduledAt
    ? (() => {
        const d = new Date(induction.scheduledAt);
        return `${d.toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        })} - ${d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
      })()
    : induction.scheduledDate
    ? `${induction.scheduledDate}${induction.scheduledTime ? ` - ${induction.scheduledTime}` : ""}`
    : "—";

  const candidatesList = useMemo(() => {
    return applications.map((app: any, idx: number) => {
      const candidateName =
        app.candidate?.name ||
        `${app.candidate?.firstName || ""} ${app.candidate?.lastName || ""}`.trim() ||
        "Candidate";
      const trade =
        app.trade?.name ||
        (typeof app.trade === "string" ? app.trade : null) ||
        app.type ||
        "General Trade";
      const stage = app.currentStageKey
        ? app.currentStageKey
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l: string) => l.toUpperCase())
        : "Induction";
      const interviewDate = induction.scheduledAt
        ? new Date(induction.scheduledAt).toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
          })
        : induction.scheduledDate || "—";
      const hour = 10 + (idx % 4);
      return {
        id: app.id,
        candidateName,
        trade,
        assessmentType: app.type?.toUpperCase() || "NSQ",
        stage,
        interviewDate,
        interviewTime: induction.scheduledTime || `${hour}:00am`,
      };
    });
  }, [applications, induction]);

  const tradeOptions = useMemo(() => {
    const set = new Set<string>();
    candidatesList.forEach((c) => {
      if (c.trade) set.add(c.trade);
    });
    availableTrades.forEach((t: { name: string }) => set.add(t.name));
    return Array.from(set).filter(Boolean);
  }, [candidatesList, availableTrades]);

  const stageOptions = useMemo(() => {
    const set = new Set<string>();
    candidatesList.forEach((c) => {
      if (c.stage) set.add(c.stage);
    });
    return Array.from(set).filter(Boolean);
  }, [candidatesList]);

  const filteredCandidates = useMemo(() => {
    return candidatesList.filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery.trim() ||
        c.candidateName.toLowerCase().includes(q) ||
        c.trade.toLowerCase().includes(q) ||
        c.stage.toLowerCase().includes(q);
      const matchesTrade =
        selectedTrade === "All" ||
        c.trade.toLowerCase() === selectedTrade.toLowerCase();
      const matchesType =
        selectedAssessmentType === "All" ||
        c.assessmentType.toLowerCase() === selectedAssessmentType.toLowerCase();
      const matchesStage =
        selectedStage === "All" ||
        c.stage.toLowerCase().includes(selectedStage.toLowerCase());
      return matchesSearch && matchesTrade && matchesType && matchesStage;
    });
  }, [
    candidatesList,
    searchQuery,
    selectedTrade,
    selectedAssessmentType,
    selectedStage,
  ]);

  const toggleSelectAll = () => {
    setSelectedCandidateIds(
      selectedCandidateIds.length === filteredCandidates.length
        ? []
        : filteredCandidates.map((c) => c.id),
    );
  };

  const toggleSelectRow = (id: string) => {
    setSelectedCandidateIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
              Title
            </span>
            <span className="text-sm sm:text-base font-bold text-gray-950">
              {induction.title || "Induction Session"}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
              Interview Mode
            </span>
            <span className="text-sm sm:text-base font-bold text-gray-950 flex items-center gap-1.5">
              {isVirtual ? (
                <>
                  <FiVideo className="w-4 h-4 text-[#A31D38]" />
                  <span>Virtual</span>
                </>
              ) : (
                <>
                  <FiMapPin className="w-4 h-4 text-emerald-600" />
                  <span>Physical</span>
                </>
              )}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
              Induction Date &amp; Time
            </span>
            <span className="text-sm sm:text-base font-bold text-gray-950">
              {dateFormatted}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
              Country
            </span>
            <span className="text-sm sm:text-base font-bold text-gray-950">
              {induction.country || centreProfile?.address?.country || "Nigeria"}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
              State
            </span>
            <span className="text-sm sm:text-base font-bold text-gray-950">
              {induction.state || centreProfile?.address?.state || "—"}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
              {isVirtual ? "Meeting Link" : "Street Address"}
            </span>
            {isVirtual ? (
              <a
                href={induction.link || "#"}
                target="_blank"
                rel="noreferrer"
                className="text-sm sm:text-base font-bold text-[#A31D38] hover:underline truncate"
              >
                {induction.link || "—"}
              </a>
            ) : (
              <span className="text-sm sm:text-base font-bold text-gray-950 truncate">
                {induction.streetAddress ||
                  induction.location ||
                  centreProfile?.formattedAddress ||
                  centreProfile?.address?.address ||
                  "—"}
              </span>
            )}
          </div>
        </div>
      </div>

      <SittingCandidatesSection
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedTrade={selectedTrade}
        setSelectedTrade={setSelectedTrade}
        selectedAssessmentType={selectedAssessmentType}
        setSelectedAssessmentType={setSelectedAssessmentType}
        selectedStage={selectedStage}
        setSelectedStage={setSelectedStage}
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedCandidateIds={selectedCandidateIds}
        tradeOptions={tradeOptions}
        stageOptions={stageOptions}
        filteredCandidates={filteredCandidates}
        toggleSelectAll={toggleSelectAll}
        toggleSelectRow={toggleSelectRow}
        onSelectCandidate={onSelectCandidate}
      />
    </div>
  );
};
