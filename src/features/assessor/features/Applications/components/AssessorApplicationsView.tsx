"use client";

import React, { useState, useMemo } from "react";
import {
  AssessorApplicationFilters,
  AssessorApplicationTable,
  AssessorApplicationGrid,
} from "./list";
import { useGetAssessorApplications } from "../hooks";
import type {
  AssessorApplicationRecord,
  AssessorFilterCriteria,
} from "../types/applications.types";

export type { AssessorApplicationRecord };

function mapApplicationToRecord(app: any): AssessorApplicationRecord {
  const statusMap: Record<string, AssessorApplicationRecord["status"]> = {
    draft: "Pending",
    in_progress: "Ongoing",
    certified: "Completed",
    rejected: "Archived",
    withdrawn: "Archived",
  };

  const candidateName =
    app.candidate?.name ||
    (app.candidate?.firstName
      ? `${app.candidate.firstName} ${app.candidate.lastName || ""}`.trim()
      : app.candidateId || "Candidate");

  const tradeName =
    app.trade?.name ||
    app.tradeId ||
    (app.type === "NSQ" ? "Standard Assessment" : "RPL");

  const resolvedRole =
    Array.isArray(app.roles) && app.roles.length > 0
      ? app.roles.map((r: string) => r.replace(/_/g, " ")).join(", ")
      : app.role || "Assessor";

  return {
    id: app.id,
    role: resolvedRole.charAt(0).toUpperCase() + resolvedRole.slice(1),
    candidateName,
    trade: tradeName,
    assessmentType: app.type || "RPL",
    status: statusMap[app.status] ?? "Pending",
    assignedAt: app.submittedAt
      ? new Date(app.submittedAt).toLocaleDateString("en-GB")
      : app.createdAt
        ? new Date(app.createdAt).toLocaleDateString("en-GB")
        : "-",
    submittedAt: app.submittedAt
      ? new Date(app.submittedAt).toLocaleDateString("en-GB")
      : app.createdAt
        ? new Date(app.createdAt).toLocaleDateString("en-GB")
        : "-",
  };
}

interface AssessorApplicationsViewProps {
  onSelectApplication: (app: AssessorApplicationRecord) => void;
}

export const AssessorApplicationsView: React.FC<
  AssessorApplicationsViewProps
> = ({ onSelectApplication }) => {
  const { data: apiApplications, isLoading } = useGetAssessorApplications();

  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [filterCriteria, setFilterCriteria] = useState<AssessorFilterCriteria>({
    trade: "",
    assessmentType: "",
    status: "",
  });

  const applications: AssessorApplicationRecord[] = useMemo(() => {
    if (apiApplications && apiApplications.length > 0) {
      return apiApplications.map(mapApplicationToRecord);
    }
    return [];
  }, [apiApplications]);

  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        !searchTerm.trim() ||
        app.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.trade.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.role && app.role.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesTrade =
        !filterCriteria.trade ||
        app.trade.toLowerCase() === filterCriteria.trade.toLowerCase();

      const matchesType =
        !filterCriteria.assessmentType ||
        app.assessmentType.toLowerCase() ===
          filterCriteria.assessmentType.toLowerCase();

      const matchesStatus =
        !filterCriteria.status ||
        app.status.toLowerCase() === filterCriteria.status.toLowerCase();

      return matchesSearch && matchesTrade && matchesType && matchesStatus;
    });
  }, [applications, searchTerm, filterCriteria]);

  return (
    <div className="w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-100 flex flex-col gap-6 select-text">
      {/* Assigned Candidates Header Row */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg sm:text-xl font-bold text-neutral-primary">
          Assigned Candidates
        </h2>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F8F0] text-[#12B76A]">
          Active
        </span>
      </div>

      {/* Filter Controls Row */}
      <AssessorApplicationFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterCriteria={filterCriteria}
        onFilterChange={(criteria) =>
          setFilterCriteria((prev) => ({ ...prev, ...criteria }))
        }
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Candidates List / Grid */}
      {viewMode === "list" ? (
        <AssessorApplicationTable
          applications={filteredApps}
          onSelectApplication={onSelectApplication}
          isLoading={isLoading}
        />
      ) : (
        <AssessorApplicationGrid
          applications={filteredApps}
          onSelectApplication={onSelectApplication}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};
