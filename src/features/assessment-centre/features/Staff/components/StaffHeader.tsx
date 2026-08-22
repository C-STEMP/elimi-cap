"use client";

import React from "react";
import {
  FiPlus,
  FiUser,
  FiClipboard,
  FiSlash,
} from "react-icons/fi";
import { Button } from "@/src/components/ui/button";
import { StaffStatusModalMode } from "./StaffStatusModal";
import { StaffMember } from "@/features/assessment-centre/types";
import { MOCK_STAFF_MEMBERS } from "@/features/assessment-centre/utils/constants";
import {
  useGetCentreStaff,
  useGetCentreStaffSummary,
  useGetCentreStaffDetail,
} from "@/src/features/shared/centre/hooks";

interface StaffHeaderProps {
  selectedStaffId: string | null;
  onBack: () => void;
  onAddStaff: () => void;
  onDeactivate: (mode: StaffStatusModalMode) => void;
}

export const StaffHeader: React.FC<StaffHeaderProps> = ({
  selectedStaffId,
  onBack,
  onAddStaff,
  onDeactivate,
}) => {
  if (selectedStaffId) {
    const mockStaff = MOCK_STAFF_MEMBERS.find((s) => s.id === selectedStaffId);
    return (
      <StaffDetailHeader
        staffId={selectedStaffId}
        fallbackStaff={mockStaff}
        onBack={onBack}
        onDeactivate={onDeactivate}
      />
    );
  }

  return <StaffListHeader onAddStaff={onAddStaff} />;
};

interface StaffDetailHeaderProps {
  staffId: string;
  fallbackStaff?: StaffMember;
  onBack: () => void;
  onDeactivate: (mode: StaffStatusModalMode) => void;
}

const StaffDetailHeader: React.FC<StaffDetailHeaderProps> = ({
  staffId,
  fallbackStaff,
  onBack,
  onDeactivate,
}) => {
  const { data: staffDetail } = useGetCentreStaffDetail(staffId);

  const staffName =
    staffDetail?.name ||
    staffDetail?.email?.split("@")[0] ||
    fallbackStaff?.name ||
    "Staff Member";

  const staffStatus = staffDetail?.status
    ? staffDetail.status === "inactive"
      ? "Inactive"
      : "Active"
    : fallbackStaff?.status || "Active";

  const reviewedCount =
    staffDetail?.workload?.reviewed ??
    fallbackStaff?.reviewedApplicationsCount ??
    0;
  const pendingCount =
    staffDetail?.workload?.pending ??
    fallbackStaff?.pendingApplicationsCount ??
    0;
  const requiresAttentionCount =
    staffDetail?.workload?.requiresAttention ??
    fallbackStaff?.requiresAttentionCount ??
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
            <span>{staffName}</span>
          </button>
          <div className="flex items-center gap-2 text-xs lg:text-sm text-white/90 font-normal">
            <span
              onClick={onBack}
              className="hover:underline cursor-pointer"
            >
              Staff
            </span>
            <span>&gt;</span>
            <span className="font-semibold text-white">{staffName}</span>
          </div>
        </div>

        {staffStatus === "Inactive" ? (
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
              Reviewed Applications
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                {reviewedCount}
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
              Pending Applications
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                {pendingCount}
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
              Requires Attention
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                {requiresAttentionCount}
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

interface StaffListHeaderProps {
  onAddStaff: () => void;
}

const StaffListHeader: React.FC<StaffListHeaderProps> = ({ onAddStaff }) => {
  const { data: staffList = [] } = useGetCentreStaff();
  const { data: staffSummary } = useGetCentreStaffSummary();

  const totalStaff = staffSummary?.total ?? staffList.length;
  const activeStaff =
    staffSummary?.active ??
    staffList.filter((s) => s.status === "active").length;
  const pendingStaff =
    staffSummary?.pending ??
    staffList.filter((s) => s.status === "pending").length;
  const inactiveStaff =
    staffSummary?.inactive ??
    staffList.filter((s) => s.status === "inactive").length;

  return (
    <div className="flex flex-col gap-6 pt-2">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Staff
        </h1>
        <Button
          type="button"
          onClick={onAddStaff}
          variant="amber"
          size="md"
          rightIcon={<FiPlus className="w-4.5 h-4.5" />}
          className="px-6 h-11 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-lg cursor-pointer whitespace-nowrap"
        >
          Add Staff
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80">
              Total Staffs
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                {totalStaff}
              </span>
              <span className="text-xs font-normal text-white/70">
                staffs
              </span>
            </div>
          </div>
          <div className="w-9 h-9 flex items-center justify-center shrink-0">
            <FiUser className="w-5 h-5 text-white/90" />
          </div>
        </div>

        <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80">
              Active Staff
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                {activeStaff}
              </span>
              <span className="text-xs font-normal text-white/70">
                staffs
              </span>
            </div>
          </div>
          <div className="w-9 h-9 flex items-center justify-center shrink-0">
            <FiUser className="w-5 h-5 text-white/90" />
          </div>
        </div>

        <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80">
              Pending Staff
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                {pendingStaff}
              </span>
              <span className="text-xs font-normal text-white/70">
                staffs
              </span>
            </div>
          </div>
          <div className="w-9 h-9 flex items-center justify-center shrink-0">
            <FiUser className="w-5 h-5 text-white/90" />
          </div>
        </div>

        <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80">
              Inactive
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                {inactiveStaff}
              </span>
              <span className="text-xs font-normal text-white/70">
                staffs
              </span>
            </div>
          </div>
          <div className="w-9 h-9 flex items-center justify-center shrink-0">
            <FiUser className="w-5 h-5 text-white/90" />
          </div>
        </div>
      </div>
    </div>
  );
};
