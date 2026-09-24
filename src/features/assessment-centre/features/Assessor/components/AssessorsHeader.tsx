"use client";

import React from "react";
import {
  FiFlag,
  FiClipboard,
  FiSlash,
  FiCheckCircle,
  FiClock,
  FiActivity,
} from "react-icons/fi";
import { Button } from "@/src/components/ui/button";
import { AssessorItem } from "@/features/assessment-centre/types";
import { StaffStatusModalMode } from "@/features/assessment-centre/features/Staff/components/StaffStatusModal";
import {
  useGetRetainedRequests,
  useGetCentreAssessorsSummary,
  useGetCentreAssessorDetail,
} from "@/src/features/shared/centre/hooks";

import { useAppSelector } from "@/src/store/hooks";
import { canDeactivateAssessor } from "@/features/assessment-centre/utils/rbac";

const isAllFilter = (value?: string | null) => !value || value.toLowerCase() === "all";

interface AssessorsHeaderProps {
  selectedAssessorId: string | null;
  onBackToList: () => void;
  onDeactivate: (mode: StaffStatusModalMode) => void;
  userRole?: string;
  activeStatusFilter?: string;
  onSelectStatusFilter?: (status: string) => void;
}

export const AssessorsHeader: React.FC<AssessorsHeaderProps> = ({
  selectedAssessorId,
  onBackToList,
  onDeactivate,
  userRole,
  activeStatusFilter,
  onSelectStatusFilter,
}) => {
  if (selectedAssessorId) {
    return (
      <AssessorDetailHeader
        assessorId={selectedAssessorId}
        onBack={onBackToList}
        onDeactivate={onDeactivate}
        userRole={userRole}
      />
    );
  }

  return (
    <AssessorsListHeader
      activeStatusFilter={activeStatusFilter}
      onSelectStatusFilter={onSelectStatusFilter}
    />
  );
};

interface AssessorDetailHeaderProps {
  assessorId: string;
  onBack: () => void;
  onDeactivate: (mode: StaffStatusModalMode) => void;
  userRole?: string;
}

const AssessorDetailHeader: React.FC<AssessorDetailHeaderProps> = ({
  assessorId,
  onBack,
  onDeactivate,
  userRole,
}) => {
  const { data: assessorDetail } = useGetCentreAssessorDetail(assessorId);
  const user = useAppSelector((state) => state.auth.user);
  const canDeactivate = canDeactivateAssessor(userRole || user?.role);

  const assessorName =
    assessorDetail?.name ||
    (assessorDetail?.email ? assessorDetail.email.split("@")[0] : null) ||
    "Assessor";

  const assessorStatus = assessorDetail?.status
    ? assessorDetail.status === "revoked" || assessorDetail.status === "pending"
      ? "Inactive"
      : "Active"
    : "Active";

  const assignedCount = assessorDetail?.workload?.assigned ?? 0;
  const ongoingCount = assessorDetail?.workload?.ongoing ?? 0;
  const completedCount = assessorDetail?.workload?.completed ?? 0;

  return (
    <div className="flex flex-col gap-6 pt-2">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-white font-bold text-2xl lg:text-3xl tracking-tight hover:opacity-90 text-left cursor-pointer"
          >
            <span className="text-xl font-bold">&lt;</span>
            <span>{assessorName}</span>
          </button>
          <div className="flex items-center gap-2 text-xs lg:text-sm text-white/90 font-normal">
            <span
              onClick={onBack}
              className="hover:underline cursor-pointer"
            >
              Assessor
            </span>
            <span>&gt;</span>
            <span className="font-semibold text-white">
              {assessorName}
            </span>
          </div>
        </div>

        {canDeactivate ? (
          assessorStatus === "Inactive" ? (
            <Button
              type="button"
              onClick={() => onDeactivate("confirm-activate")}
              variant="amber"
              size="md"
              className="px-6 h-11 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-lg cursor-pointer whitespace-nowrap"
            >
              Activate
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => onDeactivate("confirm-deactivate")}
              variant="amber"
              size="md"
              rightIcon={<FiSlash className="w-4 h-4" />}
              className="px-6 h-11 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-lg cursor-pointer whitespace-nowrap"
            >
              Deactivate
            </Button>
          )
        ) : null}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="col-span-2 sm:col-span-1 bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
          <div className="flex flex-col min-w-0">
            <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80 truncate">
              Assigned Candidates
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                {assignedCount}
              </span>
              <span className="text-xs lg:text-sm font-normal text-white/80">
                applications
              </span>
            </div>
          </div>
          <div className="w-9 h-9 flex items-center justify-center shrink-0 ml-2">
            <FiClipboard className="w-5 h-5 text-white/90" />
          </div>
        </div>

        <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
          <div className="flex flex-col min-w-0">
            <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80 truncate">
              Ongoing
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                {ongoingCount}
              </span>
              <span className="text-xs lg:text-sm font-normal text-white/80">
                applications
              </span>
            </div>
          </div>
          <div className="w-9 h-9 flex items-center justify-center shrink-0 ml-2">
            <FiActivity className="w-5 h-5 text-white/90" />
          </div>
        </div>

        <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
          <div className="flex flex-col min-w-0">
            <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80 truncate">
              Completed
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                {completedCount}
              </span>
              <span className="text-xs lg:text-sm font-normal text-white/80">
                applications
              </span>
            </div>
          </div>
          <div className="w-9 h-9 flex items-center justify-center shrink-0 ml-2">
            <FiCheckCircle className="w-5 h-5 text-white/90" />
          </div>
        </div>
      </div>
    </div>
  );
};

interface AssessorsListHeaderProps {
  activeStatusFilter?: string;
  onSelectStatusFilter?: (status: string) => void;
}

const AssessorsListHeader: React.FC<AssessorsListHeaderProps> = ({
  activeStatusFilter,
  onSelectStatusFilter,
}) => {
  const { data: retainedRequests = [] } = useGetRetainedRequests();
  const { data: assessorSummary } = useGetCentreAssessorsSummary();

  const totalAssessors = assessorSummary?.total ?? retainedRequests.length;
  const activeAssessors =
    assessorSummary?.active ??
    retainedRequests.filter((r) => r.status === "approved").length;
  const pendingAssessors =
    assessorSummary?.pending ??
    retainedRequests.filter((r) => r.status === "pending").length;
  const inactiveAssessors =
    assessorSummary?.inactive ??
    retainedRequests.filter(
      (r) => r.status === "rejected" || r.status === "revoked",
    ).length;

  const stats = [
    {
      id: "total",
      label: "Total Assessors",
      count: totalAssessors,
      status: "All",
      icon: <FiFlag className="w-5 h-5 text-white/90" />,
    },
    {
      id: "active",
      label: "Active Assessors",
      count: activeAssessors,
      status: "Active",
      icon: <FiCheckCircle className="w-5 h-5 text-white/90" />,
    },
    {
      id: "pending",
      label: "Pending Assessors",
      count: pendingAssessors,
      status: "Pending",
      icon: <FiClock className="w-5 h-5 text-white/90" />,
    },
    {
      id: "inactive",
      label: "Inactive Assessors",
      count: inactiveAssessors,
      status: "Inactive",
      icon: <FiSlash className="w-5 h-5 text-white/90" />,
    },
  ];

  return (
    <div className="flex flex-col gap-6 pt-2">
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
        Assessors
      </h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((item) => {
          // The "All" card is the default selection when no filter is set.
          const isActive = isAllFilter(activeStatusFilter)
            ? item.status === "All"
            : activeStatusFilter!.toLowerCase() === item.status.toLowerCase();
          const isClickable = Boolean(onSelectStatusFilter);

          return (
            <button
              key={item.id}
              type="button"
              onClick={
                isClickable ? () => onSelectStatusFilter?.(item.status) : undefined
              }
              className={`bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border transition-all shadow-xs text-left w-full ${
                isClickable
                  ? "cursor-pointer active:scale-[0.98]"
                  : "cursor-default"
              } ${
                isActive
                  ? "ring-2 ring-white/60 bg-white/20 border-white/40 shadow-md"
                  : "border-white/15"
              }`}
            >
              <div className="flex flex-col min-w-0">
                <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80 truncate">
                  {item.label}
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                    {item.count}
                  </span>
                  <span className="text-xs lg:text-sm font-normal text-white/90">
                    assessors
                  </span>
                </div>
              </div>
              <div className="w-9 h-9 flex items-center justify-center shrink-0 ml-2">
                {item.icon}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
