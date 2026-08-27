"use client";

import React from "react";
import { FiSearch, FiChevronDown, FiList, FiGrid } from "react-icons/fi";
import type { AssessorFilterCriteria } from "../../types/applications.types";

interface AssessorApplicationFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterCriteria: AssessorFilterCriteria;
  onFilterChange: (criteria: Partial<AssessorFilterCriteria>) => void;
  viewMode: "list" | "grid";
  onViewModeChange: (mode: "list" | "grid") => void;
  availableTrades?: string[];
  availableTypes?: string[];
}

export const AssessorApplicationFilters: React.FC<
  AssessorApplicationFiltersProps
> = ({
  searchTerm,
  onSearchChange,
  filterCriteria,
  onFilterChange,
  viewMode,
  onViewModeChange,
  availableTrades = ["Masonry", "Carpentry", "Plumbing", "Painting"],
  availableTypes = ["RPL", "NSQ"],
}) => {
  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 w-full">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search candidates..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-gray-400"
        />
      </div>

      {/* Filter Dropdowns and View Mode Switcher */}
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
        {/* Trade Filter */}
        <div className="relative inline-block">
          <select
            value={filterCriteria.trade}
            onChange={(e) => onFilterChange({ trade: e.target.value })}
            className="appearance-none bg-white border border-gray-200 text-neutral-primary font-medium text-xs sm:text-sm px-3.5 py-2 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-2xs hover:bg-gray-50/50"
          >
            <option value="">Trade</option>
            {availableTrades.map((trade) => (
              <option key={trade} value={trade}>
                {trade}
              </option>
            ))}
          </select>
          <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
        </div>

        {/* Assessment Type Filter */}
        <div className="relative inline-block">
          <select
            value={filterCriteria.assessmentType}
            onChange={(e) => onFilterChange({ assessmentType: e.target.value })}
            className="appearance-none bg-white border border-gray-200 text-neutral-primary font-medium text-xs sm:text-sm px-3.5 py-2 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-2xs hover:bg-gray-50/50"
          >
            <option value="">Assessment Type</option>
            {availableTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
        </div>

        {/* Status Filter */}
        <div className="relative inline-block">
          <select
            value={filterCriteria.status}
            onChange={(e) => onFilterChange({ status: e.target.value })}
            className="appearance-none bg-white border border-gray-200 text-neutral-primary font-medium text-xs sm:text-sm px-3.5 py-2 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-2xs hover:bg-gray-50/50"
          >
            <option value="">Status</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Archived">Archived</option>
          </select>
          <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
        </div>

        {/* View Switchers */}
        <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            className={`p-1.5 sm:p-2 rounded-lg transition-all cursor-pointer ${
              viewMode === "list"
                ? "bg-[#FDF2F4] text-[#A31D38] font-bold shadow-2xs"
                : "text-gray-400 hover:text-gray-600"
            }`}
            title="List View"
            aria-label="List View"
          >
            <FiList className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className={`p-1.5 sm:p-2 rounded-lg transition-all cursor-pointer ${
              viewMode === "grid"
                ? "bg-[#FDF2F4] text-[#A31D38] font-bold shadow-2xs"
                : "text-gray-400 hover:text-gray-600"
            }`}
            title="Grid View"
            aria-label="Grid View"
          >
            <FiGrid className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
