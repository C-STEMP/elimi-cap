"use client";

import React, { useState } from "react";
import { FiSearch, FiList, FiGrid, FiFlag } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { MOCK_ASSESSORS } from "../utils/constants";
import { AssessorItem } from "../types";

interface AssessorsListViewProps {
  onSelectAssessor: (assessorId: string) => void;
}

export const AssessorsListView: React.FC<AssessorsListViewProps> = ({
  onSelectAssessor,
}) => {
  const [assessors, setAssessors] = useState<AssessorItem[]>(MOCK_ASSESSORS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredAssessors.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAssessors.map((a) => a.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const filteredAssessors = assessors.filter((assessor) => {
    const matchesSearch =
      assessor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assessor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assessor.trade.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || assessor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const renderStatusBadge = (status: AssessorItem["status"]) => {
    switch (status) {
      case "Active":
        return (
          <span className="bg-[#D1FAE5] text-[#065F46] font-semibold px-3 py-1 rounded-full text-xs inline-block">
            Active
          </span>
        );
      case "Pending":
        return (
          <span className="bg-[#FEF3C7] text-[#D97706] font-semibold px-3 py-1 rounded-full text-xs inline-block">
            Pending
          </span>
        );
      case "Inactive":
        return (
          <span className="bg-[#E5E7EB] text-[#4B5563] font-semibold px-3 py-1 rounded-full text-xs inline-block">
            Inactive
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      {/* Header Banner */}
      <div className="w-full bg-[#a31d38] text-white rounded-3xl p-6 sm:p-8 xl:p-10 flex flex-col gap-6 shadow-md">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Assessors
        </h1>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15">
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-medium text-white/80">
                Total Assessors
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl sm:text-2xl font-extrabold text-white">
                  43
                </span>
                <span className="text-xs font-normal text-white/70">
                  assessors
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <FiFlag className="w-5 h-5 text-white/90" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15">
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-medium text-white/80">
                Active Assessors
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl sm:text-2xl font-extrabold text-white">
                  30
                </span>
                <span className="text-xs font-normal text-white/70">
                  assessors
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <FiFlag className="w-5 h-5 text-white/90" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15">
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-medium text-white/80">
                Pending Assessors
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl sm:text-2xl font-extrabold text-white">
                  3
                </span>
                <span className="text-xs font-normal text-white/70">
                  assessors
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <FiFlag className="w-5 h-5 text-white/90" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15">
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-medium text-white/80">
                Inactive Assessors
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl sm:text-2xl font-extrabold text-white">
                  10
                </span>
                <span className="text-xs font-normal text-white/70">
                  assessors
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <FiFlag className="w-5 h-5 text-white/90" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-3xl p-6 shadow-2xs border border-gray-100/80 flex flex-col gap-6">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F8F9FA] border border-gray-200/80 focus:border-gray-400 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-neutral-primary outline-none transition-all"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 flex-wrap">
            <Select
              size="sm"
              showPlaceholderOption={false}
              containerClassName="w-32"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { label: "Status", value: "All" },
                { label: "Active", value: "Active" },
                { label: "Pending", value: "Pending" },
                { label: "Inactive", value: "Inactive" },
              ]}
            />

            <div className="flex items-center gap-1 bg-[#F8F9FA] p-1 rounded-xl border border-gray-200/80">
              <button
                type="button"
                className="p-1.5 rounded-lg bg-white text-neutral-primary shadow-xs font-bold"
                title="List View"
              >
                <FiList className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="p-1.5 rounded-lg text-gray-400 hover:text-neutral-primary"
                title="Grid View"
              >
                <FiGrid className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              className="text-xs font-semibold text-gray-400 hover:text-red-600 underline transition-colors cursor-pointer ml-1"
            >
              Deactivate
            </button>
          </div>
        </div>

        {/* Assessors Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-175">
            <thead>
              <tr className="bg-[#F8F9FA] text-gray-500 text-xs font-semibold uppercase tracking-wider rounded-xl">
                <th className="p-3.5 rounded-l-xl w-10">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length === filteredAssessors.length &&
                      filteredAssessors.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-[#a31d38] focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="p-3.5">Assessor Name</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Trade</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Assigned</th>
                <th className="p-3.5 text-right rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs sm:text-sm font-medium text-neutral-primary">
              {filteredAssessors.map((assessor) => (
                <tr
                  key={assessor.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="p-3.5">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(assessor.id)}
                      onChange={() => toggleSelectOne(assessor.id)}
                      className="w-4 h-4 rounded border-gray-300 text-[#a31d38] focus:ring-0 cursor-pointer"
                    />
                  </td>
                  <td className="p-3.5 font-bold text-neutral-primary">
                    {assessor.name}
                  </td>
                  <td className="p-3.5 text-neutral-secondary">
                    {assessor.email}
                  </td>
                  <td className="p-3.5 text-neutral-secondary">
                    {assessor.trade}
                  </td>
                  <td className="p-3.5 text-neutral-secondary">
                    {assessor.role}
                  </td>
                  <td className="p-3.5">
                    {renderStatusBadge(assessor.status)}
                  </td>
                  <td className="p-3.5 text-neutral-secondary">
                    {assessor.assignedCount}
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => onSelectAssessor(assessor.id)}
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
      </div>
    </div>
  );
};
