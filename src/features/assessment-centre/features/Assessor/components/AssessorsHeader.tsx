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
import { useGetRetainedRequests } from "@/src/features/shared/centre/hooks";

interface AssessorsHeaderProps {
  selectedAssessorId: string | null;
  onBackToList: () => void;
  onDeactivate: (mode: StaffStatusModalMode) => void;
}

export const AssessorsHeader: React.FC<AssessorsHeaderProps> = ({
  selectedAssessorId,
  onBackToList,
  onDeactivate,
}) => {
  if (selectedAssessorId) {
    const assessor =
      MOCK_ASSESSORS.find((a) => a.id === selectedAssessorId) ||
      MOCK_ASSESSORS[0];
    return (
      <AssessorDetailHeader
        assessor={assessor}
        onBack={onBackToList}
        onDeactivate={onDeactivate}
      />
    );
  }

  return <AssessorsListHeader />;
};

interface AssessorDetailHeaderProps {
  assessor: AssessorItem;
  onBack: () => void;
  onDeactivate: (mode: StaffStatusModalMode) => void;
}

const AssessorDetailHeader: React.FC<AssessorDetailHeaderProps> = ({
  assessor,
  onBack,
  onDeactivate,
}) => {
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
            <span>{assessor.name}</span>
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
              {assessor.name}
            </span>
          </div>
        </div>

        {assessor.status === "Inactive" ? (
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
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80">
              Assigned Candidates
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                {assessor.assignedCandidatesCount || 0}
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
                {assessor.ongoingCount || 0}
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
                {assessor.completedCount || 0}
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

  const totalAssessors = retainedRequests.length;
  const activeAssessors = retainedRequests.filter((r) => r.status === "approved").length;
  const pendingAssessors = retainedRequests.filter((r) => r.status === "pending").length;
  const inactiveAssessors = retainedRequests.filter(
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
