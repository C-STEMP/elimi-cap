"use client";

import React from "react";
import { FiSearch, FiList, FiGrid, FiChevronDown } from "react-icons/fi";

interface CandidateRow {
  id: string;
  candidateName: string;
  trade: string;
  assessmentType: string;
  stage: string;
  interviewDate: string;
  interviewTime: string;
}

interface Props {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedTrade: string;
  setSelectedTrade: (val: string) => void;
  selectedAssessmentType: string;
  setSelectedAssessmentType: (val: string) => void;
  selectedStage: string;
  setSelectedStage: (val: string) => void;
  viewMode: "list" | "grid";
  setViewMode: (val: "list" | "grid") => void;
  selectedCandidateIds: string[];
  tradeOptions: string[];
  stageOptions: string[];
  filteredCandidates: CandidateRow[];
  toggleSelectAll: () => void;
  toggleSelectRow: (id: string) => void;
  onSelectCandidate: (candidateName: string, id?: string) => void;
}

export const SittingCandidatesSection: React.FC<Props> = ({
  searchQuery,
  setSearchQuery,
  selectedTrade,
  setSelectedTrade,
  selectedAssessmentType,
  setSelectedAssessmentType,
  selectedStage,
  setSelectedStage,
  viewMode,
  setViewMode,
  selectedCandidateIds,
  tradeOptions,
  stageOptions,
  filteredCandidates,
  toggleSelectAll,
  toggleSelectRow,
  onSelectCandidate,
}) => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs flex flex-col gap-5">
      <h2 className="text-base sm:text-lg font-bold text-black tracking-tight">Candidates</h2>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
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

        <div className="flex items-center gap-3 flex-wrap justify-end w-full md:w-auto">
          {/* Trade Filter */}
          <div className="relative">
            <select
              value={selectedTrade}
              onChange={(e) => setSelectedTrade(e.target.value)}
              className="appearance-none bg-white border border-gray-200 text-gray-700 font-semibold text-xs sm:text-sm pl-4 pr-8 py-2.5 rounded-xl cursor-pointer hover:bg-gray-50 transition-all shadow-2xs outline-none"
            >
              <option value="All">Trade</option>
              {tradeOptions.map((trade) => (
                <option key={trade} value={trade}>{trade}</option>
              ))}
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
              {stageOptions.map((stage) => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
            <FiChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* List / Grid toggle */}
          <div className="flex items-center gap-1.5 ml-1">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              aria-label="List View"
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                viewMode === "list" ? "bg-[#FCE8EC] text-[#A31D38] shadow-2xs" : "bg-[#EAEBED] text-gray-700"
              }`}
            >
              <FiList className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              aria-label="Grid View"
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                viewMode === "grid" ? "bg-[#FCE8EC] text-[#A31D38] shadow-2xs" : "bg-[#EAEBED] text-gray-700"
              }`}
            >
              <FiGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* View Rendering */}
      {viewMode === "list" ? (
        <div className="overflow-x-auto no-scrollbar border border-gray-100 rounded-2xl">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#F8F9FA] text-gray-600 font-bold border-b border-gray-100 whitespace-nowrap">
              <tr>
                <th className="p-4 w-10 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={filteredCandidates.length > 0 && selectedCandidateIds.length === filteredCandidates.length}
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
                filteredCandidates.map((cand) => (
                  <tr
                    key={cand.id}
                    onClick={() => onSelectCandidate(cand.candidateName, cand.id)}
                    className="hover:bg-gray-50/70 transition-colors cursor-pointer group"
                  >
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedCandidateIds.includes(cand.id)}
                        onChange={() => toggleSelectRow(cand.id)}
                        className="w-4 h-4 accent-primary rounded cursor-pointer"
                      />
                    </td>
                    <td className="p-4 font-semibold text-black group-hover:text-primary transition-colors">
                      {cand.candidateName}
                    </td>
                    <td className="p-4 font-normal text-gray-600">{cand.trade}</td>
                    <td className="p-4 font-normal text-gray-600">{cand.assessmentType}</td>
                    <td className="p-4 font-normal text-gray-600">{cand.stage}</td>
                    <td className="p-4 font-normal text-gray-600">{cand.interviewDate}</td>
                    <td className="p-4 font-normal text-gray-600">{cand.interviewTime}</td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCandidate(cand.candidateName, cand.id);
                        }}
                        className="font-semibold text-black underline underline-offset-2 hover:text-primary transition-colors cursor-pointer"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400 font-normal">
                    No candidates found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCandidates.map((cand) => (
            <div
              key={cand.id}
              onClick={() => onSelectCandidate(cand.candidateName, cand.id)}
              className="bg-white rounded-2xl p-5 border border-black/20 shadow-2xs hover:shadow-xs transition-all flex flex-col gap-3 relative cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-3">
                <input
                  type="checkbox"
                  checked={selectedCandidateIds.includes(cand.id)}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => toggleSelectRow(cand.id)}
                  className="w-4 h-4 rounded border-gray-300 text-[#a31d38] cursor-pointer"
                />
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  {cand.stage}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="font-bold text-sm text-black group-hover:text-primary transition-colors">
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
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCandidate(cand.candidateName, cand.id);
                }}
                className="text-xs text-black font-bold underline hover:text-[#a31d38] transition-colors cursor-pointer mt-auto self-start"
              >
                View
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
