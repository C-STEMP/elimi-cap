"use client";

import React, { useState } from "react";
import { FiSearch, FiList, FiGrid } from "react-icons/fi";
import { Select } from "@/src/components/ui/select";
import { MOCK_ASSESSORS } from "@/features/assessment-centre/utils/constants";
import { AssessorItem } from "@/features/assessment-centre/types";
import { StaffStatusModal, StaffStatusModalMode } from "../../Staff/components/StaffStatusModal";

interface AssessorsListViewProps {
  onSelectAssessor: (assessorId: string) => void;
}

export const AssessorsListView: React.FC<AssessorsListViewProps> = ({
  onSelectAssessor,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [assessors, setAssessors] = useState(MOCK_ASSESSORS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [deactivateModalMode, setDeactivateModalMode] =
    useState<StaffStatusModalMode>("confirm-deactivate");

  const filteredAssessors = assessors.filter((assessor) => {
    const matchesSearch =
      assessor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assessor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assessor.trade.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || assessor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  const handleOpenDeactivateModal = () => {
    if (selectedIds.length === 0) return;
    setDeactivateModalMode("confirm-deactivate");
    setIsDeactivateModalOpen(true);
  };

  const handleConfirmDeactivate = () => {
    setAssessors((prev) =>
      prev.map((a) =>
        selectedIds.includes(a.id) ? { ...a, status: "Inactive" as const } : a,
      ),
    );
    setDeactivateModalMode("deactivated-success");
  };

  const handleCloseDeactivateModal = () => {
    setIsDeactivateModalOpen(false);
    setSelectedIds([]);
  };

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

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-[#FCE8EC] text-[#a31d38] shadow-2xs"
                    : "bg-[#EAEBED] text-gray-700 hover:text-neutral-primary"
                }`}
                title="List View"
              >
                <FiList className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-[#FCE8EC] text-[#a31d38] shadow-2xs"
                    : "bg-[#EAEBED] text-gray-700 hover:text-neutral-primary"
                }`}
                title="Grid View"
              >
                <FiGrid className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleOpenDeactivateModal}
              disabled={selectedIds.length === 0}
              className={`text-xs font-semibold underline transition-colors ml-1 ${
                selectedIds.length === 0
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-400 hover:text-red-600 cursor-pointer"
              }`}
            >
              Deactivate
            </button>
          </div>
        </div>

        {/* View Mode 1: Grid Card View */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssessors.map((assessor) => {
              const isSelected = selectedIds.includes(assessor.id);
              return (
                <div
                  key={assessor.id}
                  className="bg-white rounded-2xl p-5 border border-black/20 shadow-2xs hover:shadow-xs transition-all flex items-start justify-between relative group"
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectOne(assessor.id)}
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-[#a31d38] focus:ring-0 cursor-pointer"
                    />

                    <div className="flex flex-col gap-2">
                      <span className="font-bold text-sm text-neutral-primary">
                        {assessor.name}
                      </span>
                      <span className="text-xs text-gray-500 font-normal">
                        {assessor.email}
                      </span>
                      <span className="text-xs text-gray-500 font-normal">
                        {assessor.trade} • {assessor.role}
                      </span>
                      <span className="text-xs text-gray-400">
                        Assigned: {assessor.assignedCount}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between h-full gap-4">
                    {renderStatusBadge(assessor.status)}

                    <button
                      type="button"
                      onClick={() => onSelectAssessor(assessor.id)}
                      className="text-xs lg:text-sm text-neutral-primary font-bold underline hover:text-[#a31d38] transition-colors cursor-pointer mt-2"
                    >
                      View
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* View Mode 2: Table List View */
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-175">
              <thead>
                <tr className="bg-[#F8F9FA] text-gray-500 text-xs font-semibold uppercase tracking-wider rounded-xl whitespace-nowrap">
                  <th className="p-3.5 rounded-l-xl w-10 whitespace-nowrap">
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
                  <th className="p-3.5 whitespace-nowrap">Assessor Name</th>
                  <th className="p-3.5 whitespace-nowrap">Email</th>
                  <th className="p-3.5 whitespace-nowrap">Trade</th>
                  <th className="p-3.5 whitespace-nowrap">Role</th>
                  <th className="p-3.5 whitespace-nowrap">Status</th>
                  <th className="p-3.5 whitespace-nowrap">Assigned</th>
                  <th className="p-3.5 text-right rounded-r-xl whitespace-nowrap">
                    Action
                  </th>
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
        )}
      </div>

      <StaffStatusModal
        isOpen={isDeactivateModalOpen}
        mode={deactivateModalMode}
        staffName={
          selectedIds.length === 1
            ? assessors.find((a) => a.id === selectedIds[0])?.name
            : undefined
        }
        onClose={handleCloseDeactivateModal}
        onConfirmDeactivate={handleConfirmDeactivate}
      />
    </div>
  );
};
