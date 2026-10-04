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
  selectedPanelIds?: string[];
  onDeletePanels?: () => void;
  onSelectAll: () => void;
  selectedCount?: number;
  onBulkCertify?: () => void;
  isBulkCertifying?: boolean;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
}

export const AppsFilterBar: React.FC<Props> = ({
  activeFilterTab,
  onTabChange: _onTabChange,
  searchQuery,
  onSearchChange,
  onFilterOpen,
  viewMode,
  onViewModeChange,
  selectedInterviewIds,
  filteredInterviewsLength: _filteredInterviewsLength,
  onDeleteInterviews,
  selectedPanelIds = [],
  onDeletePanels,
  onSelectAll,
  selectedCount = 0,
  onBulkCertify,
  isBulkCertifying,
  hasActiveFilters = false,
  onClearFilters,
}) => (
  <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-gray-100 shadow-2xs flex flex-col gap-4">
    {/* Card Header: Tab Title + Clear filters indicator */}
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
          {activeFilterTab === "All"
            ? "Applications"
            : activeFilterTab === "Interviews"
            ? "Interviews"
            : activeFilterTab === "Panel"
            ? "Panels"
            : `RPL ${activeFilterTab} Applications`}
        </h2>
      </div>

      {hasActiveFilters && onClearFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="text-xs font-semibold text-[#a31d38] hover:underline cursor-pointer flex items-center gap-1 transition-colors"
        >
          Reset Filters
        </button>
      )}
    </div>

    {/* Integrated Toolbar: Search + Action Controls */}
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      {/* Search Input with quick clear */}
      <div className="relative w-full md:w-80">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder={
            activeFilterTab === "Interviews"
              ? "Search interviews..."
              : activeFilterTab === "Panel"
              ? "Search panels..."
              : "Search candidates..."
          }
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl sm:rounded-2xl pl-10 pr-8 py-2.5 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-[#a31d38]/40 focus:ring-2 focus:ring-[#a31d38]/15 transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 text-xs rounded-full hover:bg-gray-200 transition-colors"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Control Buttons: Filter, View Switcher & Action Links in one responsive row */}
      <div className="flex items-center justify-between md:justify-end gap-2.5 sm:gap-3 w-full md:w-auto">
        {/* Left segment on mobile: Filter + View Switcher */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onFilterOpen}
            className={`border font-semibold text-xs sm:text-sm px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer shadow-2xs ${
              hasActiveFilters
                ? "bg-[#FCE8EC] border-[#a31d38]/30 text-[#a31d38]"
                : "bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
            }`}
          >
            <span>Filter</span>
            <FiFilter
              className={`w-3.5 h-3.5 ${
                hasActiveFilters ? "text-[#a31d38]" : "text-gray-500"
              }`}
            />
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#a31d38]" />
            )}
          </button>

          {/* Segmented View Mode Toggle */}
          <div className="flex items-center bg-[#F1F3F5] p-1 rounded-xl">
            <button
              type="button"
              onClick={() => onViewModeChange("list")}
              aria-label="List view"
              className={`p-1.5 sm:p-2 rounded-lg transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-white text-[#a31d38] shadow-2xs font-bold"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <FiList className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              aria-label="Grid view"
              className={`p-1.5 sm:p-2 rounded-lg transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white text-[#a31d38] shadow-2xs font-bold"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <FiGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Divider on desktop */}
        <div className="h-5 w-px bg-gray-200 hidden md:block" />

        {/* Right segment on mobile / desktop: Primary Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm font-semibold text-gray-600">
          {activeFilterTab === "Interviews" ? (
            <>
              <button
                type="button"
                disabled={selectedInterviewIds.length !== 1}
                className="hover:text-black cursor-pointer disabled:opacity-40 transition-colors"
              >
                Edit
              </button>
              <button
                type="button"
                disabled={selectedInterviewIds.length === 0}
                onClick={onDeleteInterviews}
                className="text-gray-500 hover:text-red-600 cursor-pointer disabled:opacity-40 transition-colors"
              >
                Delete
              </button>
            </>
          ) : activeFilterTab === "Panel" ? (
            <button
              type="button"
              disabled={selectedPanelIds.length === 0}
              onClick={onDeletePanels}
              className="text-gray-500 hover:text-red-600 cursor-pointer disabled:opacity-40 transition-colors"
            >
              Delete
            </button>
          ) : (
            <>
              {activeFilterTab === "IV Approved" && onBulkCertify && (
                <button
                  type="button"
                  onClick={onBulkCertify}
                  disabled={isBulkCertifying || selectedCount === 0}
                  className="bg-[#1E7F4C] hover:bg-[#1E7F4C]/90 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-40 whitespace-nowrap"
                >
                  {isBulkCertifying
                    ? "Certifying..."
                    : `Bulk Certify ${selectedCount ? `(${selectedCount})` : ""}`}
                </button>
              )}
              <button
                type="button"
                onClick={onSelectAll}
                className="hover:text-black hover:underline cursor-pointer transition-colors whitespace-nowrap"
              >
                {selectedCount > 0 ? `Selected (${selectedCount})` : "Select All"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  </div>
);

export { FILTER_TABS };
