"use client";

import React, { useState } from "react";
import {
  FiSearch,
  FiSliders,
  FiList,
  FiGrid,
  FiClipboard,
} from "react-icons/fi";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";
import { AssessorFilterModal } from "./AssessorFilterModal";
import { useGetAssessorApplications } from "../hooks";
import type { Application } from "../api";

export interface AssessorApplicationRecord {
  id: string;
  candidateName: string;
  trade: string;
  assessmentType: string;
  status: "Pending" | "Ongoing" | "Completed" | "Archived";
  submittedAt: string;
}

function mapApplicationToRecord(app: Application): AssessorApplicationRecord {
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
      : app.candidateId);
  const tradeName =
    app.trade?.name ||
    app.tradeId ||
    (app.type === "NSQ" ? "Standard Assessment" : "RPL");

  return {
    id: app.id,
    candidateName,
    trade: tradeName,
    assessmentType: app.type,
    status: statusMap[app.status] ?? "Pending",
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
  const { toast } = useToast();
  const { data: apiApplications, isLoading, isError } = useGetAssessorApplications();

  const [activeTab, setActiveTab] = useState<
    "All" | "Pending" | "Ongoing" | "Completed" | "Archived"
  >("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState<{
    type: string;
    stage: string;
    status: string;
  }>({ type: "", stage: "", status: "" });

  const applications: AssessorApplicationRecord[] = (apiApplications ?? []).map(
    mapApplicationToRecord,
  );

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.trade.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab =
      activeTab === "All" ||
      app.status.toLowerCase() === activeTab.toLowerCase();
    const matchesType =
      !filterCriteria.type ||
      app.assessmentType.toLowerCase() === filterCriteria.type.toLowerCase();
    const matchesStatus =
      !filterCriteria.status ||
      app.status.toLowerCase() === filterCriteria.status.toLowerCase();
    return matchesSearch && matchesTab && matchesType && matchesStatus;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredApps.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredApps.map((a) => a.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleNotifyAwardingBody = () => {
    if (selectedIds.length === 0) {
      toast({
        type: "error",
        title: "Selection Required",
        description: "Please select at least one application to notify Awarding Body.",
      });
      return;
    }
    toast({
      type: "success",
      title: "Awarding Body Notified",
      description: `Notified Awarding Body for ${selectedIds.length} application(s).`,
    });
  };

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      <div className="bg-gray-100/70 p-1.5 rounded-2xl flex items-center gap-1.5 overflow-x-auto max-w-full w-fit">
        {(["All", "Pending", "Ongoing", "Completed", "Archived"] as const).map(
          (tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-5 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab
                  ? "bg-[#a31d38] text-white shadow-sm"
                  : "text-neutral-secondary hover:text-neutral-primary hover:bg-white/50"
              }`}
            >
              {tab}
            </button>
          ),
        )}
      </div>

      <div className="w-full bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-5 min-h-120">
        <h2 className="text-base sm:text-lg font-bold text-neutral-primary">
          RPL {activeTab} Applications
        </h2>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50/70 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-2 focus:ring-primary-solid/20"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFilterModalOpen(true)}
              leftIcon={<FiSliders className="w-4 h-4" />}
              className="h-10 border-gray-200 text-neutral-primary font-semibold text-xs sm:text-sm px-4 rounded-xl hover:bg-gray-50 cursor-pointer"
            >
              Filter
            </Button>

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

        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-neutral-secondary pt-1 px-1">
          <button
            type="button"
            onClick={toggleSelectAll}
            className="hover:text-neutral-primary transition-colors cursor-pointer"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={handleNotifyAwardingBody}
            className="hover:text-primary-solid underline transition-colors cursor-pointer"
          >
            Notify Awarding Body
          </button>
        </div>

        {isLoading ? (
          <div className="my-auto flex flex-col gap-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-xl w-full" />
            ))}
          </div>
        ) : isError ? (
          <div className="my-auto flex flex-col items-center justify-center text-center p-12">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-3">
              <FiClipboard className="w-8 h-8" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-neutral-primary">
              Failed to load applications
            </h3>
            <p className="text-xs sm:text-sm text-neutral-secondary mt-1">
              Please check your connection and try again.
            </p>
          </div>
        ) : filteredApps.length > 0 ? (
          <div className="w-full overflow-x-auto max-w-full rounded-2xl border border-gray-100">
            <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-gray-50/70 text-gray-500 font-semibold border-b border-gray-100">
                  <th className="p-3.5 w-10">
                    <input
                      type="checkbox"
                      checked={
                        filteredApps.length > 0 &&
                        selectedIds.length === filteredApps.length
                      }
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-primary-solid focus:ring-primary-solid cursor-pointer"
                    />
                  </th>
                  <th className="p-3.5">Candidate ID</th>
                  <th className="p-3.5">Stage</th>
                  <th className="p-3.5">Assessment Type</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Submitted at</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredApps.map((app) => {
                  const isSelected = selectedIds.includes(app.id);
                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-gray-50/60 transition-colors"
                    >
                      <td className="p-3.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(app.id)}
                          className="rounded border-gray-300 text-primary-solid focus:ring-primary-solid cursor-pointer"
                        />
                      </td>
                      <td className="p-3.5 font-medium text-neutral-primary">
                        {app.candidateName}
                      </td>
                      <td className="p-3.5 text-gray-600">{app.trade}</td>
                      <td className="p-3.5 text-gray-600">{app.assessmentType}</td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            app.status === "Pending"
                              ? "bg-[#FEF3C7] text-[#D97706]"
                              : app.status === "Ongoing"
                              ? "bg-rose-100 text-rose-700"
                              : app.status === "Completed"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-gray-500">{app.submittedAt}</td>
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => onSelectApplication(app)}
                          className="font-bold text-xs text-neutral-primary hover:text-primary-solid underline cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="my-auto flex flex-col items-center justify-center text-center p-12">
            <div className="w-16 h-16 rounded-2xl bg-[#FDF2F4] text-[#a31d38] flex items-center justify-center mb-3">
              <FiClipboard className="w-8 h-8" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-neutral-primary">
              No applications yet
            </h3>
            <p className="text-xs sm:text-sm text-neutral-secondary mt-1">
              Applications assigned to you will appear here
            </p>
          </div>
        )}
      </div>

      <AssessorFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilter={(filters) => setFilterCriteria(filters)}
      />
    </div>
  );
};
