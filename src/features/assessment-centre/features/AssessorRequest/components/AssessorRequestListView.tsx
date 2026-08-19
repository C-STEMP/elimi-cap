"use client";

import React, { useState } from "react";
import { FiSearch, FiList, FiGrid } from "react-icons/fi";
import { AssessorItem } from "@/features/assessment-centre/types";
import { useGetRetainedRequests } from "@/src/features/shared/centre/hooks";
import { Loader } from "@/src/components/ui/loader";

interface AssessorRequestListViewProps {
  onSelectAssessorRequest: (id: string) => void;
}

export const AssessorRequestListView: React.FC<
  AssessorRequestListViewProps
> = ({ onSelectAssessorRequest }) => {
  const { data: requests = [], isLoading } = useGetRetainedRequests("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const items: AssessorItem[] = requests.map((req) => {
    const assessorSnap = req.assessor;
    const sectorsStr = (assessorSnap?.sectors || []).map((s) => s.name).join(", ");
    const primaryRole = (assessorSnap?.qualifications?.[0] as any) || "Assessor";
    return {
      id: req.id,
      name: assessorSnap?.name || (req.assessorId ? `Assessor (${req.assessorId.slice(0, 8)})` : "Assessor"),
      email: assessorSnap?.email || (req.assessorId ? `${req.assessorId.slice(0, 8)}@assessor.ng` : "assessor@ng.org"),
      trade: sectorsStr || "Technical Trade",
      role: primaryRole,
      status: "Pending",
      assignedCount: 0,
      experienceYears: assessorSnap?.yearsOfExperience || 0,
      tags: assessorSnap?.qualifications || [],
      assignedCandidatesCount: 0,
      ongoingCount: 0,
      completedCount: 0,
    };
  });

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.trade.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((item) => item.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-3xl p-12 flex items-center justify-center">
        <Loader fullscreen={false} size="small" tip="Loading requests..." />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      <div className="bg-white rounded-3xl p-6 shadow-2xs border border-gray-100/80 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F8F9FA] border border-gray-200/80 focus:border-gray-400 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-neutral-primary outline-none transition-all"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 flex-wrap">
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

        {filteredItems.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <p className="text-gray-400 font-normal">No assessor requests found.</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-5 border border-black/20 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between relative group"
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectRow(item.id)}
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-[#a31d38] focus:ring-0 cursor-pointer"
                    />

                    <div className="flex flex-col gap-2">
                      <span className="font-bold text-sm text-neutral-primary">
                        {item.name}
                      </span>
                      <span className="text-xs text-gray-500 font-normal">
                        {item.email}
                      </span>
                      <span className="text-xs text-gray-500 font-normal">
                        {item.trade} • {item.role}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <span className="bg-[#FEF3C7] text-[#D97706] font-semibold px-3 py-1 rounded-full text-xs inline-block">
                      Pending
                    </span>

                    <button
                      type="button"
                      onClick={() => onSelectAssessorRequest(item.id)}
                      className="text-xs lg:text-sm text-neutral-primary font-bold underline hover:text-[#a31d38] transition-colors cursor-pointer"
                    >
                      View
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-175">
              <thead>
                <tr className="bg-[#F8F9FA] text-gray-500 text-xs font-semibold uppercase tracking-wider rounded-xl whitespace-nowrap">
                  <th className="p-3.5 rounded-l-xl w-10 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.length === filteredItems.length &&
                        filteredItems.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-[#a31d38] focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="p-3.5 whitespace-nowrap">Assessor Name</th>
                  <th className="p-3.5 whitespace-nowrap">Email</th>
                  <th className="p-3.5 whitespace-nowrap">Trade</th>
                  <th className="p-3.5 whitespace-nowrap">Role</th>
                  <th className="p-3.5 whitespace-nowrap">Status</th>
                  <th className="p-3.5 text-right rounded-r-xl whitespace-nowrap">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs sm:text-sm font-medium text-neutral-primary">
                {filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="p-3.5">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelectRow(item.id)}
                        className="w-4 h-4 rounded border-gray-300 text-[#a31d38] focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td className="p-3.5 font-bold text-neutral-primary">
                      {item.name}
                    </td>
                    <td className="p-3.5 text-neutral-secondary">
                      {item.email}
                    </td>
                    <td className="p-3.5 text-neutral-secondary">
                      {item.trade}
                    </td>
                    <td className="p-3.5 text-neutral-secondary">
                      {item.role}
                    </td>
                    <td className="p-3.5">
                      <span className="bg-[#FEF3C7] text-[#D97706] font-semibold px-3 py-1 rounded-full text-xs inline-block">
                        Pending
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => onSelectAssessorRequest(item.id)}
                        className="text-neutral-primary font-bold text-xs underline hover:text-[#a31d38] transition-colors cursor-pointer"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
