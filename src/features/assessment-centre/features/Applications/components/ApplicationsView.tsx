"use client";

import React from "react";
import { FILTER_TABS } from "../utils/appViewHelpers";
import { useApplicationsViewState } from "../hooks/useApplicationsViewState";
import { AppsFilterBar } from "./AppsFilterBar";
import { AppListTable } from "./AppListTable";
import { InterviewListTable } from "./InterviewListTable";
import { FilterModal } from "./FilterModal";
import { ViewInterviewDetailModal, type InterviewRowData } from "./ViewInterviewDetailModal";

interface ApplicationsViewProps {
  onSelectCandidate: (candidateName: string, id?: string) => void;
  onSelectInterview?: (interview: InterviewRowData) => void;
  onOpenCreatePanel?: () => void;
  onOpenCreateInterview?: () => void;
  onOpenScheduleInterview?: () => void;
}

export const ApplicationsView: React.FC<ApplicationsViewProps> = ({
  onSelectCandidate, onSelectInterview,
}) => {
  const state = useApplicationsViewState();

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      {/* Filter tabs */}
      <div className="bg-[#F8F9FA] border border-gray-200/80 rounded-2xl p-2 flex items-center gap-2 overflow-x-auto no-scrollbar max-w-xl">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => state.setActiveFilterTab(tab)}
            className={`px-6 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              state.activeFilterTab === tab
                ? "bg-[#a31d38] text-white shadow-xs"
                : "text-gray-600 hover:text-black hover:bg-gray-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <AppsFilterBar
        activeFilterTab={state.activeFilterTab}
        onTabChange={state.setActiveFilterTab}
        searchQuery={state.searchQuery}
        onSearchChange={state.setSearchQuery}
        onFilterOpen={() => state.setIsFilterModalOpen(true)}
        viewMode={state.viewMode}
        onViewModeChange={state.setViewMode}
        selectedInterviewIds={state.selectedInterviewIds}
        filteredInterviewsLength={state.filteredInterviews.length}
        onDeleteInterviews={state.handleDeleteSelectedInterviews}
        onSelectAll={state.toggleSelectAll}
      />

      {state.activeFilterTab === "Interviews" ? (
        <InterviewListTable
          filteredInterviews={state.filteredInterviews}
          isLoadingInterviews={state.isLoadingInterviews}
          viewMode={state.viewMode}
          selectedInterviewIds={state.selectedInterviewIds}
          onToggleSelectAll={state.toggleSelectAllInterviews}
          onToggleSelect={state.toggleSelectInterviewRow}
          onSelectInterview={onSelectInterview}
          onSetViewing={state.setViewingInterview}
        />
      ) : (
        <AppListTable
          filteredApplications={state.filteredApplications}
          isLoading={state.isLoading}
          viewMode={state.viewMode}
          selectedIds={state.selectedIds}
          onToggleSelectAll={state.toggleSelectAll}
          onToggleSelect={state.toggleSelectRow}
          onSelectCandidate={onSelectCandidate}
        />
      )}

      <FilterModal
        isOpen={state.isFilterModalOpen}
        onClose={() => state.setIsFilterModalOpen(false)}
      />
      <ViewInterviewDetailModal
        isOpen={Boolean(state.viewingInterview)}
        interview={state.viewingInterview}
        onClose={() => state.setViewingInterview(null)}
      />
    </div>
  );
};
