"use client";

import React from "react";
import { FiSearch, FiFilter, FiList, FiGrid } from "react-icons/fi";
import { FILTER_TABS } from "../utils/appViewHelpers";

interface Props {
  activeFilterTab: string;
  onTabChange: (tab: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onFilterOpen: () => void;
  viewMode: "list" | "grid";
  onViewModeChange: (mode: "list" | "grid") => void;
  selectedInterviewIds: string[];
  filteredInterviewsLength: number;
  onDeleteInterviews: () => void;
  onSelectAll: () => void;
}

export const AppsFilterBar: React.FC<Props> = ({
  activeFilterTab, onTabChange, searchQuery, onSearchChange,
  onFilterOpen, viewMode, onViewModeChange,
  selectedInterviewIds, filteredInterviewsLength, onDeleteInterviews, onSelectAll,
}) => (
  <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs flex flex-col gap-5">
    <h2 className="text-base sm:text-lg font-bold text-black tracking-tight">
      {activeFilterTab === "All" ? "Applications" : activeFilterTab === "Interviews" ? "Interviews" : `RPL ${activeFilterTab} Applications`}
    </h2>

    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="relative w-full sm:w-80">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search candidates..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-[#F8F9FA] border border-gray-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a31d38]/20 transition-all"
        />
      </div>
      <div className="flex items-center gap-3 justify-end">
        <button type="button" onClick={onFilterOpen} className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-2xs">
          <span>Filter</span><FiFilter className="w-4 h-4 text-gray-500" />
        </button>
        <div className="flex items-center gap-1.5">
          {(["list", "grid"] as const).map((mode) => (
            <button key={mode} type="button" onClick={() => onViewModeChange(mode)} aria-label={`${mode} view`} className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${viewMode === mode ? "bg-[#FCE8EC] text-[#a31d38] shadow-2xs" : "bg-[#EAEBED] text-gray-700"}`}>
              {mode === "list" ? <FiList className="w-4 h-4" /> : <FiGrid className="w-4 h-4" />}
            </button>
          ))}
        </div>
      </div>
    </div>

    {activeFilterTab === "Interviews" ? (
      <div className="flex items-center justify-end gap-5 text-xs font-semibold text-gray-500 pt-1">
        <button type="button" disabled={selectedInterviewIds.length !== 1} className="hover:underline cursor-pointer disabled:opacity-40 transition-colors">Edit</button>
        <button type="button" disabled={selectedInterviewIds.length === 0} onClick={onDeleteInterviews} className="hover:underline cursor-pointer text-gray-500 hover:text-red-600 disabled:opacity-40 transition-colors">Delete</button>
      </div>
    ) : (
      <div className="flex items-center justify-end gap-5 text-xs font-semibold text-gray-600 pt-1">
        <button type="button" onClick={onSelectAll} className="hover:underline cursor-pointer transition-colors">Select All</button>
      </div>
    )}
  </div>
);

export { FILTER_TABS };
