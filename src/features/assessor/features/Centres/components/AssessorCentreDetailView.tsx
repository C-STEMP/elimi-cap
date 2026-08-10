"use client";

import React, { useState } from "react";
import {
  FiSearch,
  FiList,
  FiGrid,
  FiFolder,
} from "react-icons/fi";
import { Select } from "@/src/components/ui/select";
import type { AssessorCentreItem } from "./AssessorCentresView";

export interface AssignedCandidateItem {
  id: string;
  role: string;
  candidateName: string;
  trade: string;
  assessmentType: string;
  status: "Ongoing" | "Completed" | "Pending";
  assignedAt: string;
}

const MOCK_ASSIGNED_CANDIDATES: AssignedCandidateItem[] = [
  {
    id: "ac1",
    role: "Panelist",
    candidateName: "Oguntade James",
    trade: "Masonry",
    assessmentType: "RPL",
    status: "Ongoing",
    assignedAt: "07/22/2026",
  },
  {
    id: "ac2",
    role: "Panelist",
    candidateName: "Favour Smith",
    trade: "Carpentry",
    assessmentType: "RPL",
    status: "Ongoing",
    assignedAt: "07/22/2026",
  },
  {
    id: "ac3",
    role: "Internal Verifier",
    candidateName: "Samson David",
    trade: "Plumbing",
    assessmentType: "NSQ",
    status: "Ongoing",
    assignedAt: "07/22/2026",
  },
  {
    id: "ac4",
    role: "Internal Verifier",
    candidateName: "Oriade Sophie",
    trade: "Painting",
    assessmentType: "NSQ",
    status: "Completed",
    assignedAt: "07/22/2026",
  },
];

interface AssessorCentreDetailViewProps {
  centre: AssessorCentreItem;
  onBack: () => void;
}

export const AssessorCentreDetailView: React.FC<
  AssessorCentreDetailViewProps
> = ({ centre, onBack }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [tradeFilter, setTradeFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const [candidates] = useState<AssignedCandidateItem[]>(
    centre.status === "Inactive" ? [] : MOCK_ASSIGNED_CANDIDATES,
  );

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.trade.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTrade =
      tradeFilter === "All" ||
      c.trade.toLowerCase() === tradeFilter.toLowerCase();
    const matchesType =
      typeFilter === "All" ||
      c.assessmentType.toLowerCase() === typeFilter.toLowerCase();
    const matchesStatus =
      statusFilter === "All" ||
      c.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesTrade && matchesType && matchesStatus;
  });

  return (
    <div className="w-full bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-6 select-text min-h-125">
      {/* Top Title & Status Badge Bar */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <h2 className="text-lg font-bold text-neutral-primary">
          Assigned Candidates
        </h2>

        <span
          className={`inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold ${
            centre.status === "Active"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          {centre.status}
        </span>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search candidates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50/70 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-2 focus:ring-primary-solid/20"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
          <div className="w-28">
            <Select
              placeholder="Trade"
              value={tradeFilter === "All" ? "" : tradeFilter}
              onChange={(e) => setTradeFilter(e.target.value || "All")}
              options={["Masonry", "Carpentry", "Plumbing", "Painting"]}
            />
          </div>

          <div className="w-36">
            <Select
              placeholder="Assessment Type"
              value={typeFilter === "All" ? "" : typeFilter}
              onChange={(e) => setTypeFilter(e.target.value || "All")}
              options={["RPL", "NSQ"]}
            />
          </div>

          <div className="w-28">
            <Select
              placeholder="Status"
              value={statusFilter === "All" ? "" : statusFilter}
              onChange={(e) => setStatusFilter(e.target.value || "All")}
              options={["Ongoing", "Completed", "Pending"]}
            />
          </div>

          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                viewMode === "list"
                  ? "bg-red-50 text-red-700 font-bold shadow-2xs"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <FiList className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-red-50 text-red-700 font-bold shadow-2xs"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <FiGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Candidates Table or Empty View */}
      {filteredCandidates.length > 0 ? (
        <div className="w-full overflow-x-auto max-w-full rounded-2xl border border-gray-100">
          <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[650px]">
            <thead>
              <tr className="bg-gray-50/70 text-gray-500 font-semibold border-b border-gray-100">
                <th className="p-3.5 rounded-l-xl">Role</th>
                <th className="p-3.5">Candidate Name</th>
                <th className="p-3.5">Trade</th>
                <th className="p-3.5">Assessment Type</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Assigned at</th>
                <th className="p-3.5 rounded-r-xl text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCandidates.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-gray-50/60 transition-colors"
                >
                  <td className="p-3.5 text-gray-600 font-medium">{c.role}</td>
                  <td className="p-3.5 font-bold text-neutral-primary">
                    {c.candidateName}
                  </td>
                  <td className="p-3.5 text-gray-600">{c.trade}</td>
                  <td className="p-3.5 text-gray-600">{c.assessmentType}</td>
                  <td className="p-3.5">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        c.status === "Completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-gray-500">{c.assignedAt}</td>
                  <td className="p-3.5 text-right">
                    <button
                      type="button"
                      className="font-bold text-xs text-neutral-primary hover:text-primary-solid underline cursor-pointer"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="my-auto flex flex-col items-center justify-center text-center p-12">
          <div className="w-16 h-16 rounded-full bg-[#FDF2F4] text-[#a31d38] flex items-center justify-center mb-3">
            <FiFolder className="w-8 h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-neutral-primary">
            No applications yet
          </h3>
          <p className="text-xs sm:text-sm text-neutral-secondary mt-1 max-w-sm leading-relaxed">
            Click &quot;Create Application&quot; in the top header to get started
            with your Recognition of Prior Learning journey.
          </p>
        </div>
      )}
    </div>
  );
};
