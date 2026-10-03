"use client";

import React, { useEffect, useRef, useState } from "react";
import { FiCalendar, FiChevronDown, FiPlus } from "react-icons/fi";
import { useGetApplications } from "@/src/features/shared/applications/hooks";
import { useGetCentreApplicationsSummary } from "@/src/features/shared/centre/hooks";
import { ApplicationsHeaderBreadcrumb } from "./ApplicationsHeaderBreadcrumb";
import { ApplicationsStatsCards } from "./ApplicationsStatsCards";

interface ApplicationsHeaderProps {
  selectedCandidateName: string | null;
  selectedInterviewTitle?: string | null;
  selectedUnitNumber?: string | null;
  selectedTradeName?: string | null;
  showSelfAssessmentForm: boolean;
  showEvidenceVault: boolean;
  showCandidateForm: boolean;
  isApplicationApproved?: boolean;
  isNsqApplication?: boolean;
  applicationId?: string;
  isNsqIqaComplete?: boolean;
  isNsqIqaFormsComplete?: boolean;
  isNsqIvApproved?: boolean;
  onBackToList: () => void;
  onBackFromInterview?: () => void;
  onBackFromUnit?: () => void;
  onBackFromSelfAssessment: () => void;
  onBackFromEvidenceVault: () => void;
  onBackFromCandidateForm: () => void;
  onAcceptApplication?: () => void;
  onScheduleInterview?: () => void;
  onCreateInterview?: () => void;
  onCreatePanel?: () => void;
  activeFilterTab?: string;
  onSelectFilterTab?: (tab: string) => void;
}

export const ApplicationsHeader: React.FC<ApplicationsHeaderProps> = (props) => {
  const {
    selectedCandidateName,
    selectedInterviewTitle,
    showSelfAssessmentForm,
    showEvidenceVault,
    showCandidateForm,
    onScheduleInterview,
    onCreateInterview,
    onCreatePanel,
    activeFilterTab,
    onSelectFilterTab,
  } = props;

  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        actionsMenuRef.current &&
        !actionsMenuRef.current.contains(event.target as Node)
      ) {
        setIsActionsMenuOpen(false);
      }
    };
    if (isActionsMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isActionsMenuOpen]);

  // Mobile collapses the header actions into one "Actions" menu.
  const mobileActions = [
    onScheduleInterview && {
      label: "Schedule Interview",
      icon: <FiCalendar className="w-4 h-4 text-[#F59E0B]" />,
      onClick: onScheduleInterview,
    },
    onCreateInterview && {
      label: "Create Interview",
      icon: <FiPlus className="w-4 h-4 text-gray-500" />,
      onClick: onCreateInterview,
    },
    onCreatePanel && {
      label: "Create Panel",
      icon: <FiPlus className="w-4 h-4 text-[#F59E0B]" />,
      onClick: onCreatePanel,
    },
  ].filter(Boolean) as { label: string; icon: React.ReactNode; onClick: () => void }[];

  const { data: applications = [] } = useGetApplications();
  const { data: appSummary } = useGetCentreApplicationsSummary();

  const totalCount = appSummary?.total ?? applications.length;
  const pendingCount =
    appSummary?.pending ?? applications.filter((a) => a.status === "draft").length;
  const ongoingCount =
    appSummary?.ongoing ?? applications.filter((a) => a.status === "in_progress").length;
  const completedCount =
    appSummary?.completed ?? applications.filter((a) => a.status === "certified").length;
  const archivedCount =
    appSummary?.archived ??
    applications.filter((a) => a.status === "rejected" || a.status === "withdrawn").length;

  const isDetailView = Boolean(
    selectedInterviewTitle ||
      (selectedCandidateName &&
        (showSelfAssessmentForm || showEvidenceVault || showCandidateForm)) ||
      selectedCandidateName,
  );

  if (isDetailView) {
    return <ApplicationsHeaderBreadcrumb {...props} />;
  }

  return (
    <div className="flex flex-col gap-6 pt-2">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Applications
        </h1>

        {mobileActions.length > 0 && (
          <div ref={actionsMenuRef} className="relative sm:hidden shrink-0">
            <button
              type="button"
              onClick={() => setIsActionsMenuOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={isActionsMenuOpen}
              className="bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-amber-500/20"
            >
              <span>Actions</span>
              <FiChevronDown
                className={`w-4 h-4 transition-transform ${isActionsMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isActionsMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-12 w-56 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-20 flex flex-col text-left animate-in fade-in zoom-in-95 duration-150"
              >
                {mobileActions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsActionsMenuOpen(false);
                      action.onClick();
                    }}
                    className="px-4 py-2.5 text-sm text-neutral-primary hover:bg-gray-50 text-left transition-colors cursor-pointer font-medium flex items-center justify-between gap-3"
                  >
                    <span>{action.label}</span>
                    {action.icon}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="hidden sm:flex items-center gap-2.5 sm:gap-3 flex-wrap">
          {onScheduleInterview && (
            <button
              type="button"
              onClick={onScheduleInterview}
              className="bg-[#8B182E]/90 hover:bg-[#8B182E] border border-[#F59E0B] text-[#F59E0B] font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <span>Schedule Interview</span>
              <FiCalendar className="w-4 h-4 text-[#F59E0B]" />
            </button>
          )}

          {onCreateInterview && (
            <button
              type="button"
              onClick={onCreateInterview}
              className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <span>Create Interview</span>
              <span className="text-base font-black leading-none">+</span>
            </button>
          )}

          {onCreatePanel && (
            <button
              type="button"
              onClick={onCreatePanel}
              className="bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-amber-500/20"
            >
              <span>Create Panel</span>
              <span className="text-lg font-black leading-none">+</span>
            </button>
          )}
        </div>
      </div>

      <ApplicationsStatsCards
        totalCount={totalCount}
        pendingCount={pendingCount}
        ongoingCount={ongoingCount}
        completedCount={completedCount}
        archivedCount={archivedCount}
        activeFilterTab={activeFilterTab}
        onSelectFilterTab={onSelectFilterTab}
      />
    </div>
  );
};
