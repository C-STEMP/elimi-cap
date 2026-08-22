"use client";

import React from "react";
import {
  FiFlag,
  FiClipboard,
  FiSlash,
} from "react-icons/fi";
import { Button } from "@/src/components/ui/button";
import { AssessorItem } from "@/features/assessment-centre/types";
import { StaffStatusModalMode } from "@/features/assessment-centre/features/Staff/components/StaffStatusModal";
import { MOCK_ASSESSORS } from "@/features/assessment-centre/utils/constants";
import {
  useGetRetainedRequests,
  useGetCentreAssessorsSummary,
  useGetCentreAssessorDetail,
} from "@/src/features/shared/centre/hooks";

import { useAppSelector } from "@/src/store/hooks";
import { canDeactivateAssessor } from "@/features/assessment-centre/utils/rbac";

interface AssessorsHeaderProps {
  selectedAssessorId: string | null;
  onBackToList: () => void;
  onDeactivate: (mode: StaffStatusModalMode) => void;
  userRole?: string;
}

export const AssessorsHeader: React.FC<AssessorsHeaderProps> = ({
  selectedAssessorId,
  onBackToList,
  onDeactivate,
  userRole,
}) => {
  if (selectedAssessorId) {
    const mockAssessor = MOCK_ASSESSORS.find((a) => a.id === selectedAssessorId);
    return (
      <AssessorDetailHeader
        assessorId={selectedAssessorId}
        fallbackAssessor={mockAssessor}
        onBack={onBackToList}
        onDeactivate={onDeactivate}
        userRole={userRole}
      />
    );
  }

  return <AssessorsListHeader />;
};

interface AssessorDetailHeaderProps {
  assessorId: string;
  fallbackAssessor?: AssessorItem;
  onBack: () => void;
  onDeactivate: (mode: StaffStatusModalMode) => void;
  userRole?: string;
}

const AssessorDetailHeader: React.FC<AssessorDetailHeaderProps> = ({
  assessorId,
  fallbackAssessor,
  onBack,
  onDeactivate,
  userRole,
}) => {
  const { data: assessorDetail } = useGetCentreAssessorDetail(assessorId);
  const user = useAppSelector((state) => state.auth.user);
  const canDeactivate = canDeactivateAssessor(userRole || user?.role);

  const assessorName =
    assessorDetail?.name ||
    assessorDetail?.email?.split("@")[0] ||
    fallbackAssessor?.name ||
    "Assessor";

  const assessorStatus = assessorDetail?.status
    ? assessorDetail.status === "revoked" || assessorDetail.status === "pending"
      ? "Inactive"
      : "Active"
    : fallbackAssessor?.status || "Active";

  const assignedCount =
    assessorDetail?.workload?.assigned ??
    fallbackAssessor?.assignedCandidatesCount ??
    0;
  const ongoingCount =
    assessorDetail?.workload?.ongoing ?? fallbackAssessor?.ongoingCount ?? 0;
  const completedCount =
    assessorDetail?.workload?.completed ??
    fallbackAssessor?.completedCount ??
    0;

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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80">
              Assigned Candidates
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                {assignedCount}
              </span>
              <span className="text-xs font-normal text-white/70">
                applications
              </span>
            </div>
          </div>
          <div className="w-9 h-9 flex items-center justify-center shrink-0">
            <FiClipboard className="w-5 h-5 text-white/90" />
          </div>
        </div>

        <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80">
              Ongoing
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                {ongoingCount}
              </span>
              <span className="text-xs font-normal text-white/70">
                applications
              </span>
            </div>
          </div>
          <div className="w-9 h-9 flex items-center justify-center shrink-0">
            <FiClipboard className="w-5 h-5 text-white/90" />
          </div>
        </div>

        <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80">
              Completed
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                {completedCount}
              </span>
              <span className="text-xs font-normal text-white/70">
                applications
              </span>
            </div>
          </div>
          <div className="w-9 h-9 flex items-center justify-center shrink-0">
            <FiClipboard className="w-5 h-5 text-white/90" />
          </div>
        </div>
      </div>
    </div>
  );
};

const AssessorsListHeader: React.FC = () => {
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

  return (
    <div className="flex flex-col gap-6 pt-2">
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
        Assessors
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80">
              Total Assessors
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                {totalAssessors}
              </span>
              <span className="text-xs font-normal text-white/70">
                assessors
              </span>
            </div>
          </div>
          <div className="w-9 h-9 flex items-center justify-center shrink-0">
            <FiFlag className="w-5 h-5 text-white/90" />
          </div>
        </div>

        <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80">
              Active Assessors
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                {activeAssessors}
              </span>
              <span className="text-xs font-normal text-white/70">
                assessors
              </span>
            </div>
          </div>
          <div className="w-9 h-9 flex items-center justify-center shrink-0">
            <FiFlag className="w-5 h-5 text-white/90" />
          </div>
        </div>

        <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80">
              Pending Assessors
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                {pendingAssessors}
              </span>
              <span className="text-xs font-normal text-white/70">
                assessors
              </span>
            </div>
          </div>
          <div className="w-9 h-9 flex items-center justify-center shrink-0">
            <FiFlag className="w-5 h-5 text-white/90" />
          </div>
        </div>

        <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80">
              Inactive Assessors
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                {inactiveAssessors}
              </span>
              <span className="text-xs font-normal text-white/70">
                assessors
              </span>
            </div>
          </div>
          <div className="w-9 h-9 flex items-center justify-center shrink-0">
            <FiFlag className="w-5 h-5 text-white/90" />
          </div>
        </div>
      </div>
    </div>
  );
};
