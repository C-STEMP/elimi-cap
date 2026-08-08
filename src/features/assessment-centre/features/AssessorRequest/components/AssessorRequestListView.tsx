"use client";

import React, { useState } from "react";
import {
  FiSearch,
  FiChevronDown,
  FiList,
  FiGrid,
} from "react-icons/fi";
import { MOCK_ASSESSORS } from "@/features/assessment-centre/utils/constants";
import { AssessorItem } from "@/features/assessment-centre/types";

interface AssessorRequestListViewProps {
  onSelectAssessorRequest: (id: string) => void;
}

export const AssessorRequestListView: React.FC<
  AssessorRequestListViewProps
> = ({ onSelectAssessorRequest }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [items, setItems] = useState(MOCK_ASSESSORS);

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

  const handleAccept = () => {
    if (selectedIds.length === 0) return;
    setItems((prev) =>
      prev.map((item) =>
        selectedIds.includes(item.id)
          ? { ...item, status: "Active" as const }
          : item,
      ),
    );
    setSelectedIds([]);
  };

  const handleDecline = () => {
    if (selectedIds.length === 0) return;
    setItems((prev) =>
      prev.map((item) =>
        selectedIds.includes(item.id)
          ? { ...item, status: "Inactive" as const }
          : item,
      ),
    );
    setSelectedIds([]);
  };

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      {/* Table Container Box */}
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

          <div className="flex items-center justify-between sm:justify-end gap-4 flex-wrap">
            {/* Status Dropdown */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-[#F8F9FA] border border-gray-200/80 hover:border-gray-300 rounded-xl px-4 py-2.5 pr-9 text-xs sm:text-sm font-semibold text-neutral-primary cursor-pointer outline-none transition-all"
              >
                <option value="All">Status</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Inactive">Inactive</option>
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* List / Grid Toggle */}
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

            {/* Quick Actions */}
            <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold ml-2">
              <button
                type="button"
                onClick={handleAccept}
                disabled={selectedIds.length === 0}
                className={`underline transition-colors ${
                  selectedIds.length === 0
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-600 hover:text-emerald-700 cursor-pointer"
                }`}
              >
                Accept
              </button>
              <button
                type="button"
                onClick={handleDecline}
                disabled={selectedIds.length === 0}
                className={`underline transition-colors ${
                  selectedIds.length === 0
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-600 hover:text-red-700 cursor-pointer"
                }`}
              >
                Decline
              </button>
            </div>
          </div>
        </div>

        {/* View Mode 1: Grid Card View */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-5 border border-black/20 shadow-2xs hover:shadow-xs transition-all flex items-start justify-between relative group"
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectRow(item.id)}
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-[#a31d38] focus:ring-[#a31d38] cursor-pointer"
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

                  <div className="flex flex-col items-end justify-between h-full gap-4">
                    <button
                      type="button"
                      onClick={() => onSelectAssessorRequest(item.id)}
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
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-[#F8F9FA]/60">
                  <th className="py-3.5 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={
                        filteredItems.length > 0 &&
                        selectedIds.length === filteredItems.length
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-[#a31d38] focus:ring-[#a31d38] cursor-pointer"
                    />
                  </th>
                  <th className="py-3.5 px-4">Assessor Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Trade</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs sm:text-sm font-medium">
                {filteredItems.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50/80 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectRow(item.id)}
                          className="w-4 h-4 rounded border-gray-300 text-[#a31d38] focus:ring-[#a31d38] cursor-pointer"
                        />
                      </td>
                      <td className="py-4 px-4 font-bold text-neutral-primary">
                        {item.name}
                      </td>
                      <td className="py-4 px-4 text-gray-600">{item.email}</td>
                      <td className="py-4 px-4 text-gray-700">{item.trade}</td>
                      <td className="py-4 px-4 text-gray-700">{item.role}</td>
                      <td className="py-4 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => onSelectAssessorRequest(item.id)}
                          className="text-neutral-primary hover:text-[#a31d38] font-bold underline transition-colors cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredItems.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-8 text-center text-gray-400 font-normal"
                    >
                      No assessor requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
