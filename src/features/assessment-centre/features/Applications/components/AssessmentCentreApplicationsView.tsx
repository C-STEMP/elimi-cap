"use client";

import React, { useState } from "react";
import { FiSearch, FiFilter, FiList, FiGrid } from "react-icons/fi";
import { AssessmentCentreFilterModal } from "./AssessmentCentreFilterModal";
import { useToast } from "@/src/components/ui/toast";
import { MOCK_APPLICATIONS_LIST } from "@/features/assessment-centre/utils/constants";

import { useApplication, useGetApplications } from "@/features/assessment-centre/features/Applications/hooks";

interface ApplicationsViewProps {
  onSelectCandidate: (candidateName: string) => void;
}

export const AssessmentCentreApplicationsView: React.FC<
  ApplicationsViewProps
> = ({ onSelectCandidate }) => {
  const { toast } = useToast();
  const { forwardToAwardingBody } = useApplication();
  const { data: remoteApps } = useGetApplications();

  const [activeFilterTab, setActiveFilterTab] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filterTabs = ["All", "Pending", "Ongoing", "Completed", "Archived"];

  const applicationsList = (remoteApps ?? []).map((app) => ({
    id: app.id,
    candidateName: `Candidate (${app.candidateId.slice(0, 8)})`,
    trade: app.type,
    assessmentType: app.type,
    status:
      app.status === "certified"
        ? "Completed"
        : app.status === "in_progress"
        ? "Ongoing"
        : app.status === "rejected" || app.status === "withdrawn"
        ? "Archived"
        : "Pending",
    submittedAt: new Date(app.createdAt).toLocaleDateString("en-GB"),
  }));

  const filteredApplications = applicationsList.filter((app) => {
    const matchesTab =
      activeFilterTab === "All" || app.status === activeFilterTab;
    const matchesSearch =
      app.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.trade.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.assessmentType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredApplications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredApplications.map((a) => a.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleNotifyAwardingBody = () => {
    if (selectedIds.length === 0) {
      toast({
        type: "info",
        title: "No Candidates Selected",
        description: "Please select candidates to notify the Awarding Body.",
      });
      return;
    }

    selectedIds.forEach((id) => {
      forwardToAwardingBody.mutate(id);
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-[#FEF3C7] text-[#D97706]";
      case "Ongoing":
        return "bg-[#FCE8EB] text-[#A31D38]";
      case "Completed":
        return "bg-[#E6F4EA] text-[#1E7F4C]";
      case "Archived":
        return "bg-[#E5E7EB] text-[#4B5563]";
      default:
        return "bg-[#E5E7EB] text-[#6B7280]";
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      <div className="bg-[#F8F9FA] border border-gray-200/80 rounded-2xl p-2 flex items-center gap-2 overflow-x-auto no-scrollbar max-w-xl">
        {filterTabs.map((tab) => {
          const isActive = activeFilterTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveFilterTab(tab)}
              className={`px-6 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-[#a31d38] text-white shadow-xs"
                  : "text-gray-600 hover:text-black hover:bg-gray-100"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs flex flex-col gap-5">
        <h2 className="text-base sm:text-lg font-bold text-black tracking-tight">
          {activeFilterTab === "All"
            ? "Applications"
            : `RPL ${activeFilterTab} Applications`}
        </h2>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F8F9FA] border border-gray-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a31d38]/20 transition-all"
            />
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setIsFilterModalOpen(true)}
              className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <span>Filter</span>
              <FiFilter className="w-4 h-4 text-gray-500" />
            </button>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                aria-label="List View"
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-[#FCE8EC] text-[#a31d38] shadow-2xs"
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
                    ? "bg-[#FCE8EC] text-[#a31d38] shadow-2xs"
                    : "bg-[#EAEBED] text-gray-700 hover:text-neutral-primary"
                }`}
              >
                <FiGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-5 text-xs font-semibold text-gray-600 pt-1">
          <button
            type="button"
            onClick={toggleSelectAll}
            className="hover:underline cursor-pointer transition-colors"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={handleNotifyAwardingBody}
            className="hover:underline cursor-pointer transition-colors"
          >
            Notify Awarding Body
          </button>
        </div>

        {viewMode === "list" ? (
          <div className="overflow-x-auto no-scrollbar border border-gray-100 rounded-2xl">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#F8F9FA] text-gray-600 font-bold border-b border-gray-100 whitespace-nowrap">
                <tr>
                  <th className="p-4 w-10 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={
                        filteredApplications.length > 0 &&
                        selectedIds.length === filteredApplications.length
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4 accent-primary rounded cursor-pointer"
                    />
                  </th>
                  <th className="p-4 whitespace-nowrap">Candidate Name</th>
                  <th className="p-4 whitespace-nowrap">Trade</th>
                  <th className="p-4 whitespace-nowrap">Assessment Type</th>
                  <th className="p-4 whitespace-nowrap">Status</th>
                  <th className="p-4 whitespace-nowrap">Submitted at</th>
                  <th className="p-4 text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredApplications.length > 0 ? (
                  filteredApplications.map((app) => (
                    <tr
                      key={app.id}
                      className="hover:bg-gray-50/70 transition-colors"
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(app.id)}
                          onChange={() => toggleSelectRow(app.id)}
                          className="w-4 h-4 accent-primary rounded cursor-pointer"
                        />
                      </td>
                      <td
                        onClick={() => onSelectCandidate(app.candidateName)}
                        className="p-4 font-semibold text-black cursor-pointer hover:text-primary transition-colors"
                      >
                        {app.candidateName}
                      </td>
                      <td className="p-4 font-normal text-gray-600">
                        {app.trade}
                      </td>
                      <td className="p-4 font-normal text-gray-600">
                        {app.assessmentType}
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusBadgeClass(
                            app.status,
                          )}`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="p-4 font-normal text-gray-600">
                        {app.submittedAt}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={() => onSelectCandidate(app.candidateName)}
                          className="font-semibold text-black underline underline-offset-2 hover:text-primary transition-colors cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-8 text-center text-gray-400 font-normal"
                    >
                      No applications found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredApplications.length > 0 ? (
              filteredApplications.map((app) => {
                const isSelected = selectedIds.includes(app.id);
                return (
                  <div
                    key={app.id}
                    className="bg-white rounded-2xl p-5 border border-black/20 shadow-2xs hover:shadow-xs transition-all flex flex-col gap-3 relative group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectRow(app.id)}
                        className="mt-1 w-4 h-4 rounded border-gray-300 text-[#a31d38] focus:ring-0 cursor-pointer"
                      />
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusBadgeClass(
                          app.status,
                        )}`}
                      >
                        {app.status}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2">
                      <span
                        onClick={() => onSelectCandidate(app.candidateName)}
                        className="font-bold text-sm text-black cursor-pointer hover:text-primary transition-colors"
                      >
                        {app.candidateName}
                      </span>
                      <span className="text-xs text-gray-500 font-normal">
                        Trade: {app.trade}
                      </span>
                      <span className="text-xs text-gray-500 font-normal">
                        Type: {app.assessmentType}
                      </span>
                      <span className="text-xs text-gray-400">
                        Submitted: {app.submittedAt}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectCandidate(app.candidateName)}
                      className="text-xs lg:text-sm text-black font-bold underline hover:text-[#a31d38] transition-colors cursor-pointer mt-auto self-start"
                    >
                      View
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full p-8 text-center text-gray-400 font-normal">
                No applications found.
              </div>
            )}
          </div>
        )}
      </div>

      <AssessmentCentreFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
      />
    </div>
  );
};
