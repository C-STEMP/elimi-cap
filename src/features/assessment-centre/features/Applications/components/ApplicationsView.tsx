"use client";

import React from "react";
import { FILTER_TABS } from "../utils/appViewHelpers";
import { useApplicationsViewState } from "../hooks/useApplicationsViewState";
import { AppsFilterBar } from "./AppsFilterBar";
import { AppListTable } from "./AppListTable";
import { InterviewListTable } from "./InterviewListTable";
import { InductionListTable } from "./InductionListTable";
import { PanelListTable } from "./PanelListTable";
import { FilterModal } from "./FilterModal";
import { ViewInterviewDetailModal, type InterviewRowData } from "./ViewInterviewDetailModal";
import { ViewInductionDetailModal, type InductionRowData } from "./ViewInductionDetailModal";
import { ViewPanelDetailModal } from "./ViewPanelDetailModal";
import { ConfirmDeleteInductionModal } from "./ConfirmDeleteInductionModal";
import { ConfirmApprovePendingModal } from "./ConfirmApprovePendingModal";
import { FiCheckCircle } from "react-icons/fi";

interface ApplicationsViewProps {
  onSelectCandidate: (candidateName: string, id?: string) => void;
  onSelectInterview?: (interview: InterviewRowData) => void;
  onSelectInduction?: (induction: InductionRowData) => void;
  onOpenCreatePanel?: () => void;
  onOpenCreateInterview?: () => void;
  onOpenScheduleInterview?: () => void;
  onOpenScheduleInduction?: () => void;
  activeFilterTab?: string;
  onTabChange?: (tab: string) => void;
}

export const ApplicationsView: React.FC<ApplicationsViewProps> = ({
  onSelectCandidate,
  onSelectInterview,
  onSelectInduction,
  activeFilterTab,
  onTabChange,
}) => {
  const state = useApplicationsViewState(activeFilterTab, onTabChange);

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      {/* Filter tabs */}
      <div className="w-full lg:w-fit max-w-full bg-[#F8F9FA] border border-gray-200/80 rounded-2xl p-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
        {FILTER_TABS.map((tab) => {
          const isPendingTab = tab === "Pending";
          const isActive = state.activeFilterTab === tab;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => state.setActiveFilterTab(tab)}
              className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                isActive
                  ? "bg-[#a31d38] text-white shadow-xs"
                  : "text-gray-600 hover:text-black hover:bg-gray-200/60"
              }`}
            >
              <span>{tab}</span>
              {isPendingTab && state.pendingCount > 0 && (
                <span
                  className={`text-[11px] font-bold px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-[#a31d38]/10 text-[#a31d38]"
                  }`}
                >
                  {state.pendingCount}
                </span>
              )}
            </button>
          );
        })}
        {state.activeFilterTab === "Pending" && state.pendingCount > 0 && (
          <button
            type="button"
            onClick={() => state.handleInitiateApprovePending()}
            disabled={state.isApprovingPending}
            className="ml-auto lg:ml-2 bg-[#1E7F4C] hover:bg-[#1E7F4C]/90 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5 shrink-0 disabled:opacity-50"
          >
            <FiCheckCircle className="w-3.5 h-3.5" />
            <span>
              {state.isApprovingPending
                ? "Approving..."
                : state.selectedPendingCount > 0
                ? `Approve All (${state.selectedPendingCount})`
                : `Approve All (${state.pendingCount})`}
            </span>
          </button>
        )}
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
        selectedInductionIds={state.selectedInductionIds}
        onDeleteInductions={state.handleDeleteSelectedInductions}
        selectedPanelIds={state.selectedPanelIds}
        onDeletePanels={state.handleDeleteSelectedPanels}
        onSelectAll={state.toggleSelectAll}
        selectedCount={state.selectedIds.length}
        hasActiveFilters={state.hasActiveFilters}
        onClearFilters={state.handleResetFilters}
        onBulkCertify={state.handleBulkCertify}
        isBulkCertifying={state.isBulkCertifying}
        canApprovePending={state.canApprovePending}
        onApprovePending={state.handleInitiateApprovePending}
        isApprovingPending={state.isApprovingPending}
        selectedPendingCount={state.selectedPendingCount}
        pendingCount={state.pendingCount}
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
      ) : state.activeFilterTab === "Induction" ? (
        <InductionListTable
          filteredInductions={state.filteredInductions}
          isLoadingInductions={state.isLoadingInductions}
          viewMode={state.viewMode}
          selectedInductionIds={state.selectedInductionIds}
          onToggleSelectAll={state.toggleSelectAllInductions}
          onToggleSelect={state.toggleSelectInductionRow}
          onSelectInduction={onSelectInduction}
          onSetViewing={state.setViewingInduction}
          onDeleteInduction={state.handleRequestDeleteSingleInduction}
        />
      ) : state.activeFilterTab === "Panel" ? (
        <PanelListTable
          filteredPanels={state.filteredPanels}
          isLoadingPanels={state.isLoadingPanels}
          viewMode={state.viewMode}
          selectedPanelIds={state.selectedPanelIds}
          onToggleSelectAll={state.toggleSelectAllPanels}
          onToggleSelect={state.toggleSelectPanelRow}
          onSetViewing={state.setViewingPanel}
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
        onApplyFilter={(filters) => state.setModalFilters(filters)}
      />
      <ViewInterviewDetailModal
        isOpen={Boolean(state.viewingInterview)}
        interview={state.viewingInterview}
        onClose={() => state.setViewingInterview(null)}
      />
      <ViewInductionDetailModal
        isOpen={Boolean(state.viewingInduction)}
        induction={state.viewingInduction}
        onClose={() => state.setViewingInduction(null)}
        onDelete={state.handleRequestDeleteSingleInduction}
      />
      <ViewPanelDetailModal
        isOpen={Boolean(state.viewingPanel)}
        panel={state.viewingPanel}
        onClose={() => state.setViewingPanel(null)}
      />
      <ConfirmDeleteInductionModal
        isOpen={state.isDeleteInductionModalOpen}
        isSubmitting={state.isDeletingInductions}
        count={
          state.inductionToDelete ? 1 : state.selectedInductionIds.length
        }
        inductionTitle={
          state.inductionToDelete?.title ||
          (state.selectedInductionIds.length === 1
            ? state.filteredInductions.find(
                (i) => i.id === state.selectedInductionIds[0],
              )?.title
            : undefined)
        }
        onConfirm={state.handleConfirmDeleteInductions}
        onCancel={state.handleCancelDeleteInductions}
      />
      <ConfirmApprovePendingModal
        isOpen={state.isApprovePendingModalOpen}
        isSubmitting={state.isApprovingPending}
        count={state.pendingIdsToApprove.length}
        onConfirm={state.handleConfirmApprovePending}
        onCancel={state.handleCancelApprovePending}
      />
    </div>
  );
};
