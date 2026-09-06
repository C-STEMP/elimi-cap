"use client";

import React, { useState, useMemo } from "react";
import {
  FiSearch,
  FiList,
  FiGrid,
  FiChevronDown,
  FiMapPin,
  FiVideo,
} from "react-icons/fi";
import { useGetApplications } from "@/src/features/shared/applications/hooks";
import {
  useGetCentreInterviewDetail,
  useGetCentreInterviewBookings,
  useGetCentrePanels,
} from "@/src/features/shared/centre/hooks";
import { type InterviewRowData } from "./ViewInterviewDetailModal";

interface AssessmentCentreInterviewDetailViewProps {
  interview: InterviewRowData;
  onBack: () => void;
  onSelectCandidate: (candidateName: string, id?: string) => void;
}

export const AssessmentCentreInterviewDetailView: React.FC<
  AssessmentCentreInterviewDetailViewProps
> = ({ interview, onBack, onSelectCandidate }) => {
  const { data: applications = [] } = useGetApplications();
  const { data: interviewDetail } = useGetCentreInterviewDetail(interview.id);
  const { data: bookings = [] } = useGetCentreInterviewBookings();
  const { data: panels = [] } = useGetCentrePanels();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrade, setSelectedTrade] = useState<string>("All");
  const [selectedAssessmentType, setSelectedAssessmentType] =
    useState<string>("All");
  const [selectedStage, setSelectedStage] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>(
    [],
  );

  // Panel details & assessors resolution from backend
  const resolvedPanel = useMemo(() => {
    if (interviewDetail?.panel) return interviewDetail.panel;
    if (interviewDetail?.panelId) {
      return panels.find((p) => p.id === interviewDetail.panelId) || null;
    }
    return null;
  }, [interviewDetail, panels]);

  const leadAssessor = useMemo(() => {
    return (
      resolvedPanel?.members?.find((m) => m.isLead) ||
      resolvedPanel?.members?.[0] || {
        name: interview.leadPanelist || "Lead Assessor",
        email: `${(interview.leadPanelist || "lead").toLowerCase().replace(/\s+/g, "")}@cstemp.org`,
      }
    );
  }, [resolvedPanel, interview.leadPanelist]);

  const memberAssessor = useMemo(() => {
    return (
      resolvedPanel?.members?.find((m) => !m.isLead && !m.isObserver) ||
      resolvedPanel?.members?.[1] || {
        name: interview.panelMember || "Panel Member",
        email: `${(interview.panelMember || "member").toLowerCase().replace(/\s+/g, "")}@cstemp.org`,
      }
    );
  }, [resolvedPanel, interview.panelMember]);

  const ivAssessor = useMemo(() => {
    return (
      resolvedPanel?.members?.find((m) => m.isObserver) ||
      resolvedPanel?.members?.[2] || {
        name: interview.internalVerifier || "Internal Verifier",
        email: `${(interview.internalVerifier || "verifier").toLowerCase().replace(/\s+/g, "")}@cstemp.org`,
      }
    );
  }, [resolvedPanel, interview.internalVerifier]);

  // Derive candidate rows for this interview sitting strictly from backend bookings and applications
  const candidatesList = useMemo(() => {
    const interviewBookings = bookings.filter(
      (b) => b.centreInterviewId === interview.id,
    );

    if (interviewBookings.length > 0) {
      return interviewBookings.map((b) => {
        const candidateName =
          b.candidate?.name ||
          `Candidate (${b.application?.id?.slice(0, 8) || b.id.slice(0, 8)})`;
        const trade =
          b.application?.trade?.name || b.application?.type || "General Trade";
        const stage =
          b.application?.currentStageKey === "interview"
            ? "Interview Stage"
            : b.application?.currentStageKey || "Interview Stage";
        const dateObj = b.scheduledAt ? new Date(b.scheduledAt) : new Date();
        return {
          id: b.application?.id || b.id,
          candidateName,
          trade,
          assessmentType: b.application?.type || "RPL",
          stage,
          interviewDate: dateObj.toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
          }),
          interviewTime: dateObj.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
      });
    }

    // Applications at interview stage
    const activeInterviewApps = applications.filter(
      (app: any) => app.currentStageKey === "interview",
    );

    if (activeInterviewApps.length > 0) {
      return activeInterviewApps.map((app: any, idx: number) => {
        const raw = app as any;
        const candidateName =
          raw.candidate?.name ||
          `${raw.candidate?.firstName || ""} ${raw.candidate?.lastName || ""}`.trim() ||
          `Candidate (${app.id.slice(0, 8)})`;
        const trade = raw.trade?.name || app.type || "General Trade";
        const stage = "Interview Stage";
        const hour = 12 + (idx % 4);
        const timeStr = `${hour > 12 ? hour - 12 : hour}:00pm`;

        return {
          id: app.id,
          candidateName,
          trade,
          assessmentType: app.type || "RPL",
          stage,
          interviewDate: interview.scheduledAt
            ? new Date(interview.scheduledAt).toLocaleDateString("en-US", {
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
              })
            : "—",
          interviewTime: timeStr,
        };
      });
    }

    return [];
  }, [bookings, applications, interview]);

  const filteredCandidates = useMemo(() => {
    return candidatesList.filter((c) => {
      const matchesSearch =
        !searchQuery.trim() ||
        c.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.trade.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.stage.toLowerCase().includes(searchQuery.toLowerCase());

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
    if (selectedCandidateIds.length === filteredCandidates.length) {
      setSelectedCandidateIds([]);
    } else {
      setSelectedCandidateIds(filteredCandidates.map((c) => c.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedCandidateIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      {/* Sitting Metadata Card matching media_1788703578265.png */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
          {/* Row 1, Col 1 */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
              Title
            </span>
            <span className="text-sm sm:text-base font-bold text-gray-950">
              {interview.title || "Masonry Interview"}
            </span>
          </div>

          {/* Row 1, Col 2 */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
              Interview Mode
            </span>
            <span className="text-sm sm:text-base font-bold text-gray-950 flex items-center gap-1.5">
              {interview.mode.toLowerCase() === "online" ? (
                <>
                  <FiVideo className="w-4 h-4 text-[#A31D38]" />
                  <span>Online</span>
                </>
              ) : (
                <>
                  <FiMapPin className="w-4 h-4 text-emerald-600" />
                  <span>Physical</span>
                </>
              )}
            </span>
          </div>

          {/* Row 1, Col 3 */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
              Interview Date &amp; Time
            </span>
            <span className="text-sm sm:text-base font-bold text-gray-950">
              {interview.scheduledAt
                ? `${new Date(interview.scheduledAt).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })} - ${new Date(interview.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                : `${interview.createdAt || "07/22/2026"} - 12:00pm`}
            </span>
          </div>

          {/* Row 2, Col 1 */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
              Country
            </span>
            <span className="text-sm sm:text-base font-bold text-gray-950">
              Nigeria
            </span>
          </div>

          {/* Row 2, Col 2 */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
              State
            </span>
            <span className="text-sm sm:text-base font-bold text-gray-950">
              FCT Abuja
            </span>
          </div>

          {/* Row 2, Col 3 */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
              {interview.mode.toLowerCase() === "online"
                ? "Meeting Link"
                : "Street Address"}
            </span>
            {interview.mode.toLowerCase() === "online" ? (
              <a
                href={interview.link || "#"}
                target="_blank"
                rel="noreferrer"
                className="text-sm sm:text-base font-bold text-[#A31D38] hover:underline truncate"
              >
                {interview.link || "https://meet.google.com/abc-defg-hij"}
              </a>
            ) : (
              <span className="text-sm sm:text-base font-bold text-gray-950">
                {interview.location || "3 Abbey Street Kubwa Expressway"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3 Assessors Cards Row matching media_1788703578265.png */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Lead Panelist */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-2xs flex items-center gap-4">
          <img
            src={(leadAssessor as any)?.avatarUrl || "/images/facilitator_ngozi.jpg"}
            alt={leadAssessor.name}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200";
            }}
            className="w-13 h-13 rounded-full object-cover shrink-0 border border-gray-100 shadow-2xs"
          />
          <div className="flex flex-col min-w-0">
            <h4 className="font-bold text-sm text-gray-900 truncate">
              {leadAssessor.name}
            </h4>
            <span className="text-xs text-gray-500 font-medium">
              Lead Panelist
            </span>
            <span className="text-[11px] text-gray-400 truncate">
              {leadAssessor.email || `${leadAssessor.name.toLowerCase().replace(/\s+/g, "")}@gmail.com`}
            </span>
          </div>
        </div>

        {/* Card 2: Panel Member */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-2xs flex items-center gap-4">
          <img
            src={(memberAssessor as any)?.avatarUrl || "/images/facilitator_ngozi.jpg"}
            alt={memberAssessor.name}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200";
            }}
            className="w-13 h-13 rounded-full object-cover shrink-0 border border-gray-100 shadow-2xs"
          />
          <div className="flex flex-col min-w-0">
            <h4 className="font-bold text-sm text-gray-900 truncate">
              {memberAssessor.name}
            </h4>
            <span className="text-xs text-gray-500 font-medium">
              Panel Member
            </span>
            <span className="text-[11px] text-gray-400 truncate">
              {memberAssessor.email || `${memberAssessor.name.toLowerCase().replace(/\s+/g, "")}@gmail.com`}
            </span>
          </div>
        </div>

        {/* Card 3: Internal Verifier */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-2xs flex items-center gap-4">
          <img
            src={(ivAssessor as any)?.avatarUrl || "/images/facilitator_ngozi.jpg"}
            alt={ivAssessor.name}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200";
            }}
            className="w-13 h-13 rounded-full object-cover shrink-0 border border-gray-100 shadow-2xs"
          />
          <div className="flex flex-col min-w-0">
            <h4 className="font-bold text-sm text-gray-900 truncate">
              {ivAssessor.name}
            </h4>
            <span className="text-xs text-gray-500 font-medium">
              Internal Verifier
            </span>
            <span className="text-[11px] text-gray-400 truncate">
              {ivAssessor.email || `${ivAssessor.name.toLowerCase().replace(/\s+/g, "")}@gmail.com`}
            </span>
          </div>
        </div>
      </div>

      {/* Candidates Section matching media_1788703578265.png */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs flex flex-col gap-5">
        <h2 className="text-base sm:text-lg font-bold text-black tracking-tight">
          Candidates
        </h2>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F8F9FA] border border-gray-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#A31D38]/20 transition-all"
            />
          </div>

          {/* Filter Dropdowns & View Toggles */}
          <div className="flex items-center gap-3 flex-wrap justify-end w-full md:w-auto">
            {/* Trade Filter */}
            <div className="relative">
              <select
                value={selectedTrade}
                onChange={(e) => setSelectedTrade(e.target.value)}
                className="appearance-none bg-white border border-gray-200 text-gray-700 font-semibold text-xs sm:text-sm pl-4 pr-8 py-2.5 rounded-xl cursor-pointer hover:bg-gray-50 transition-all shadow-2xs outline-none"
              >
                <option value="All">Trade</option>
                <option value="Masonry">Masonry</option>
                <option value="Carpentry">Carpentry</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Painting">Painting</option>
              </select>
              <FiChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Assessment Type Filter */}
            <div className="relative">
              <select
                value={selectedAssessmentType}
                onChange={(e) => setSelectedAssessmentType(e.target.value)}
                className="appearance-none bg-white border border-gray-200 text-gray-700 font-semibold text-xs sm:text-sm pl-4 pr-8 py-2.5 rounded-xl cursor-pointer hover:bg-gray-50 transition-all shadow-2xs outline-none"
              >
                <option value="All">Assessment Type</option>
                <option value="RPL">RPL</option>
                <option value="NSQ">NSQ</option>
              </select>
              <FiChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Status / Stage Filter */}
            <div className="relative">
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="appearance-none bg-white border border-gray-200 text-gray-700 font-semibold text-xs sm:text-sm pl-4 pr-8 py-2.5 rounded-xl cursor-pointer hover:bg-gray-50 transition-all shadow-2xs outline-none"
              >
                <option value="All">Status</option>
                <option value="Folder Arrangement">Folder Arrangement</option>
                <option value="Interview Stage">Interview Stage</option>
              </select>
              <FiChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* List / Grid toggle icons */}
            <div className="flex items-center gap-1.5 ml-1">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                aria-label="List View"
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-[#FCE8EC] text-[#A31D38] shadow-2xs"
                    : "bg-[#EAEBED] text-gray-700 hover:text-neutral-primary"
                }`}
              >
                <FiList className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                aria-label="Grid View"
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-[#FCE8EC] text-[#A31D38] shadow-2xs"
                    : "bg-[#EAEBED] text-gray-700 hover:text-neutral-primary"
                }`}
              >
                <FiGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Candidates List View */}
        {viewMode === "list" ? (
          <div className="overflow-x-auto no-scrollbar border border-gray-100 rounded-2xl">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#F8F9FA] text-gray-600 font-bold border-b border-gray-100 whitespace-nowrap">
                <tr>
                  <th className="p-4 w-10 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={
                        filteredCandidates.length > 0 &&
                        selectedCandidateIds.length ===
                          filteredCandidates.length
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4 accent-primary rounded cursor-pointer"
                    />
                  </th>
                  <th className="p-4 whitespace-nowrap">Candidate Name</th>
                  <th className="p-4 whitespace-nowrap">Trade</th>
                  <th className="p-4 whitespace-nowrap">Assessment Type</th>
                  <th className="p-4 whitespace-nowrap">Stage</th>
                  <th className="p-4 whitespace-nowrap">Interview Date</th>
                  <th className="p-4 whitespace-nowrap">Interview Time</th>
                  <th className="p-4 text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredCandidates.length > 0 ? (
                  filteredCandidates.map((cand) => {
                    const isSelected = selectedCandidateIds.includes(cand.id);
                    return (
                      <tr
                        key={cand.id}
                        className="hover:bg-gray-50/70 transition-colors"
                      >
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectRow(cand.id)}
                            className="w-4 h-4 accent-primary rounded cursor-pointer"
                          />
                        </td>
                        <td
                          onClick={() =>
                            onSelectCandidate(cand.candidateName, cand.id)
                          }
                          className="p-4 font-semibold text-black cursor-pointer hover:text-primary transition-colors"
                        >
                          {cand.candidateName}
                        </td>
                        <td className="p-4 font-normal text-gray-600">
                          {cand.trade}
                        </td>
                        <td className="p-4 font-normal text-gray-600">
                          {cand.assessmentType}
                        </td>
                        <td className="p-4 font-normal text-gray-600">
                          {cand.stage}
                        </td>
                        <td className="p-4 font-normal text-gray-600">
                          {cand.interviewDate}
                        </td>
                        <td className="p-4 font-normal text-gray-600">
                          {cand.interviewTime}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              onSelectCandidate(cand.candidateName, cand.id)
                            }
                            className="font-semibold text-black underline underline-offset-2 hover:text-primary transition-colors cursor-pointer"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="p-8 text-center text-gray-400 font-normal"
                    >
                      No candidates found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCandidates.map((cand) => {
              const isSelected = selectedCandidateIds.includes(cand.id);
              return (
                <div
                  key={cand.id}
                  className="bg-white rounded-2xl p-5 border border-black/20 shadow-2xs hover:shadow-xs transition-all flex flex-col gap-3 relative"
                >
                  <div className="flex items-start justify-between gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectRow(cand.id)}
                      className="w-4 h-4 rounded border-gray-300 text-[#a31d38] cursor-pointer"
                    />
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      {cand.stage}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span
                      onClick={() =>
                        onSelectCandidate(cand.candidateName, cand.id)
                      }
                      className="font-bold text-sm text-black cursor-pointer hover:text-primary"
                    >
                      {cand.candidateName}
                    </span>
                    <span className="text-xs text-gray-500">
                      Trade: {cand.trade} • {cand.assessmentType}
                    </span>
                    <span className="text-xs text-gray-500">
                      Scheduled: {cand.interviewDate} at {cand.interviewTime}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      onSelectCandidate(cand.candidateName, cand.id)
                    }
                    className="text-xs text-black font-bold underline hover:text-[#a31d38] transition-colors cursor-pointer mt-auto self-start"
                  >
                    View
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
