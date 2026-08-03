"use client";

import React, { useState } from "react";
import {
  FiSearch,
  FiList,
  FiGrid,
  FiPlus,
  FiUser,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { MOCK_STAFF_MEMBERS } from "../utils/constants";
import { StaffMember } from "../types";

interface StaffListViewProps {
  onSelectStaff: (staffId: string) => void;
  onAddStaff: () => void;
}

export const StaffListView: React.FC<StaffListViewProps> = ({
  onSelectStaff,
  onAddStaff,
}) => {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(MOCK_STAFF_MEMBERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);

  const toggleSelectStaff = (id: string) => {
    setSelectedStaffIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedStaffIds.length === filteredStaff.length) {
      setSelectedStaffIds([]);
    } else {
      setSelectedStaffIds(filteredStaff.map((s) => s.id));
    }
  };

  const filteredStaff = staffMembers.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || staff.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const renderStatusBadge = (status: StaffMember["status"]) => {
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
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      {/* Header Banner for Staff */}
      <div className="w-full bg-[#a31d38] text-white rounded-3xl p-6 sm:p-8 xl:p-10 flex flex-col gap-6 shadow-md">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Staff
          </h1>

          <Button
            type="button"
            onClick={onAddStaff}
            variant="amber"
            size="md"
            rightIcon={<FiPlus className="w-4.5 h-4.5" />}
            className="px-6 h-11 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-sm cursor-pointer whitespace-nowrap"
          >
            Add Staff
          </Button>
        </div>

        {/* Stat Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15">
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-medium text-white/80">Total Staffs</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl sm:text-2xl font-extrabold text-white">15</span>
                <span className="text-xs font-normal text-white/70">staffs</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <FiUser className="w-5 h-5 text-white/90" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15">
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-medium text-white/80">Active Staff</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl sm:text-2xl font-extrabold text-white">10</span>
                <span className="text-xs font-normal text-white/70">staffs</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <FiUser className="w-5 h-5 text-white/90" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15">
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-medium text-white/80">Pending Staff</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl sm:text-2xl font-extrabold text-white">3</span>
                <span className="text-xs font-normal text-white/70">staffs</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <FiUser className="w-5 h-5 text-white/90" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15">
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-medium text-white/80">Inactive</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl sm:text-2xl font-extrabold text-white">2</span>
                <span className="text-xs font-normal text-white/70">staffs</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <FiUser className="w-5 h-5 text-white/90" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Staff Content Container */}
      <div className="bg-white rounded-3xl p-6 shadow-2xs border border-gray-100/80 flex flex-col gap-6">
        {/* Controls & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Search Bar */}
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

          {/* Right Filters & View Toggle */}
          <div className="flex items-center justify-between sm:justify-end gap-3 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-neutral-primary bg-white outline-none cursor-pointer hover:border-gray-300 transition-colors"
            >
              <option value="All">Status</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Inactive">Inactive</option>
            </select>

            <div className="flex items-center gap-1 bg-[#F8F9FA] p-1 rounded-xl border border-gray-200/80">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-white text-neutral-primary shadow-xs font-bold"
                    : "text-gray-400 hover:text-neutral-primary"
                }`}
                title="List View"
              >
                <FiList className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-[#FEE2E2] text-[#991B1B] shadow-xs font-bold"
                    : "text-gray-400 hover:text-neutral-primary"
                }`}
                title="Grid View"
              >
                <FiGrid className="w-4 h-4" />
              </button>
            </div>

            {/* Deactivate Link */}
            <button
              type="button"
              className="text-xs font-semibold text-gray-400 hover:text-red-600 underline transition-colors cursor-pointer ml-1"
            >
              Deactivate
            </button>
          </div>
        </div>

        {/* View Mode 1: Grid Card View */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStaff.map((staff) => {
              const isSelected = selectedStaffIds.includes(staff.id);
              return (
                <div
                  key={staff.id}
                  className="bg-white rounded-2xl p-5 border border-gray-200/90 shadow-2xs hover:shadow-xs transition-all flex items-start justify-between relative group"
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectStaff(staff.id)}
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-[#a31d38] focus:ring-0 cursor-pointer"
                    />

                    <div className="flex flex-col gap-0.5">
                      <span className="font-extrabold text-sm text-neutral-primary">
                        {staff.name}
                      </span>
                      <span className="text-xs text-gray-400 font-normal">
                        {staff.email}
                      </span>
                      <span className="text-xs text-gray-400 font-normal mt-1">
                        {staff.role} / {staff.dateAdded}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between h-full gap-6">
                    {renderStatusBadge(staff.status)}

                    <button
                      type="button"
                      onClick={() => onSelectStaff(staff.id)}
                      className="text-xs font-bold text-neutral-primary underline hover:text-[#a31d38] transition-colors cursor-pointer mt-2"
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
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#F8F9FA] text-gray-500 text-xs font-semibold uppercase tracking-wider rounded-xl">
                  <th className="p-3.5 rounded-l-xl w-10">
                    <input
                      type="checkbox"
                      checked={
                        selectedStaffIds.length === filteredStaff.length &&
                        filteredStaff.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-[#a31d38] focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="p-3.5">Staff Name</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Date Added</th>
                  <th className="p-3.5 text-right rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs sm:text-sm font-medium text-neutral-primary">
                {filteredStaff.map((staff) => {
                  const isSelected = selectedStaffIds.includes(staff.id);
                  return (
                    <tr key={staff.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-3.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectStaff(staff.id)}
                          className="w-4 h-4 rounded border-gray-300 text-[#a31d38] focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="p-3.5 font-bold text-neutral-primary">
                        {staff.name}
                      </td>
                      <td className="p-3.5 text-neutral-secondary">{staff.email}</td>
                      <td className="p-3.5 text-neutral-secondary">{staff.role}</td>
                      <td className="p-3.5">{renderStatusBadge(staff.status)}</td>
                      <td className="p-3.5 text-neutral-secondary">{staff.dateAdded}</td>
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => onSelectStaff(staff.id)}
                          className="text-neutral-primary font-bold text-xs underline hover:text-[#a31d38] transition-colors cursor-pointer"
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
        )}
      </div>
    </div>
  );
};
