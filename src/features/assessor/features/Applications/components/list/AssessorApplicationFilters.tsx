"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  FiSearch,
  FiList,
  FiGrid,
  FiChevronDown,
  FiCheck,
  FiX,
  FiRotateCcw,
} from "react-icons/fi";
import type { AssessorFilterCriteria } from "../../types/applications.types";

interface FilterOption {
  label: string;
  value: string;
  dotColor?: string;
}

interface FilterDropdownProps {
  value: string;
  defaultLabel: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  className?: string;
  align?: "left" | "right";
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  value,
  defaultLabel,
  options,
  onChange,
  className = "",
  align = "left",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const isFiltered = Boolean(value && value !== "All" && value !== "");
  const selectedOption = options.find((opt) => opt.value === value);
  const displayText =
    isFiltered && selectedOption ? selectedOption.label : defaultLabel;

  return (
    <div
      ref={containerRef}
      className={`relative shrink-0 ${isOpen ? "z-50" : "z-10"} ${className}`}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm transition-all cursor-pointer shadow-2xs select-none border ${
          isFiltered
            ? "bg-[#FDF2F4] border-[#A31D38]/30 text-[#A31D38] font-bold"
            : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-neutral-primary font-medium"
        }`}
      >
        <span className="truncate max-w-[110px] sm:max-w-[150px]">
          {displayText}
        </span>
        {isFiltered ? (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onChange(options[0]?.value ?? "");
              setIsOpen(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                onChange(options[0]?.value ?? "");
                setIsOpen(false);
              }
            }}
            className="p-0.5 rounded-md hover:bg-[#A31D38]/15 text-[#A31D38] transition-colors cursor-pointer"
            title="Clear filter"
            aria-label="Clear filter"
          >
            <FiX className="w-3 h-3 stroke-[2.5]" />
          </span>
        ) : (
          <FiChevronDown
            className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-gray-600" : ""
            }`}
          />
        )}
      </button>

      {isOpen && (
        <div
          className={`absolute top-full mt-1.5 z-50 min-w-[180px] max-w-[260px] max-h-64 overflow-y-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-1.5 flex flex-col gap-0.5 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {options.map((option) => {
            const isSelected =
              (option.value === "" &&
                (!value || value === "All" || value === "")) ||
              (option.value === "All" &&
                (!value || value === "All" || value === "")) ||
              option.value === value;
            return (
              <button
                key={option.value || option.label}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm text-left transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-[#FDF2F4] text-[#A31D38] font-bold"
                    : "text-gray-700 hover:bg-gray-50 font-medium"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {option.dotColor && (
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${option.dotColor}`}
                    />
                  )}
                  <span className="truncate">{option.label}</span>
                </div>
                {isSelected && (
                  <FiCheck className="w-3.5 h-3.5 text-[#A31D38] shrink-0 stroke-[2.5]" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

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
  availableTrades = [],
  availableTypes = ["RPL", "NSQ"],
}) => {
  const typeOptions: FilterOption[] = useMemo(() => {
    return [
      { label: "All Types", value: "" },
      ...availableTypes.map((t) => ({ label: t, value: t })),
    ];
  }, [availableTypes]);

  const tradeOptions: FilterOption[] = useMemo(() => {
    return [
      { label: "All Trades", value: "All" },
      ...availableTrades.map((t) => ({ label: t, value: t })),
    ];
  }, [availableTrades]);

  const statusOptions: FilterOption[] = useMemo(() => {
    return [
      { label: "All Statuses", value: "All" },
      { label: "Ongoing", value: "Ongoing", dotColor: "bg-amber-500" },
      { label: "Completed", value: "Completed", dotColor: "bg-emerald-500" },
      { label: "Pending", value: "Pending", dotColor: "bg-sky-500" },
      { label: "Archived", value: "Archived", dotColor: "bg-gray-400" },
    ];
  }, []);

  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
      (filterCriteria.trade && filterCriteria.trade !== "All") ||
      (filterCriteria.status && filterCriteria.status !== "All") ||
      filterCriteria.assessmentType,
  );

  const handleResetFilters = () => {
    onSearchChange("");
    onFilterChange({
      trade: "",
      status: "All",
      assessmentType: "",
    });
  };

  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 sm:gap-3 w-full">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px] max-w-md">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search candidates, trades, roles..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-[#F8F9FA] hover:bg-white focus:bg-white border border-gray-200/90 rounded-xl pl-10 pr-9 py-2 text-xs sm:text-sm text-neutral-primary placeholder:text-gray-400 focus:outline-none focus:border-[#A31D38]/40 focus:ring-2 focus:ring-[#A31D38]/15 transition-all shadow-2xs"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200/70 transition-colors cursor-pointer"
            aria-label="Clear search"
          >
            <FiX className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        )}
      </div>

      {/* Filter Dropdowns and View Controls */}
      <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2 relative z-20">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Assessment Type Dropdown (First) */}
          <FilterDropdown
            value={filterCriteria.assessmentType || ""}
            defaultLabel="All Types"
            options={typeOptions}
            onChange={(newType) =>
              onFilterChange({ assessmentType: newType })
            }
          />

          {/* Trade Filter Dropdown */}
          <FilterDropdown
            value={filterCriteria.trade || "All"}
            defaultLabel="All Trades"
            options={tradeOptions}
            onChange={(newTrade) =>
              onFilterChange({
                trade: newTrade === "All" ? "" : newTrade,
              })
            }
          />

          {/* Status Filter Dropdown */}
          <FilterDropdown
            value={filterCriteria.status || "All"}
            defaultLabel="All Statuses"
            options={statusOptions}
            align="right"
            onChange={(newStatus) => onFilterChange({ status: newStatus })}
          />

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-bold text-[#A31D38] hover:bg-[#FDF2F4] transition-colors cursor-pointer shrink-0"
              title="Reset all filters"
            >
              <FiRotateCcw className="w-3 h-3 stroke-[2.5]" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-gray-200 hidden sm:block shrink-0 mx-0.5" />

        {/* View Switchers */}
        <div className="flex items-center gap-0.5 bg-gray-100/80 p-1 rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            className={`p-1.5 sm:p-2 rounded-lg transition-all cursor-pointer ${
              viewMode === "list"
                ? "bg-white text-[#A31D38] font-bold shadow-2xs"
                : "text-gray-400 hover:text-gray-700"
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
                ? "bg-white text-[#A31D38] font-bold shadow-2xs"
                : "text-gray-400 hover:text-gray-700"
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
