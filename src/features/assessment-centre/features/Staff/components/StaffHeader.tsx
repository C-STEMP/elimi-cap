"use client";

import React from "react";
import {
  FiUser,
  FiPlus,
  FiSlash,
  FiMail,
  FiPhone,
  FiClipboard,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
} from "react-icons/fi";
import { Button } from "@/src/components/ui/button";
import { Avatar } from "@/src/components/ui/avatar";
import { StaffStatusModalMode } from "./StaffStatusModal";
import {
  useGetCentreStaff,
  useGetCentreStaffSummary,
  useGetCentreStaffDetail,
} from "@/src/features/shared/centre/hooks";

const isAllFilter = (value?: string | null) => !value || value.toLowerCase() === "all";

interface StaffHeaderProps {
  selectedStaffId: string | null;
  onBack: () => void;
  onAddStaff: () => void;
  onDeactivate: (mode: StaffStatusModalMode) => void;
  activeStatusFilter?: string;
  onSelectStatusFilter?: (status: string) => void;
}

export const StaffHeader: React.FC<StaffHeaderProps> = ({
  selectedStaffId,
  onBack,
  onAddStaff,
  onDeactivate,
  activeStatusFilter,
  onSelectStatusFilter,
}) => {
  if (selectedStaffId) {
    return (
      <StaffDetailHeader
        staffId={selectedStaffId}
        onBack={onBack}
        onDeactivate={onDeactivate}
      />
    );
  }

  return (
    <StaffListHeader
      onAddStaff={onAddStaff}
      activeStatusFilter={activeStatusFilter}
      onSelectStatusFilter={onSelectStatusFilter}
    />
  );
};

interface StaffDetailHeaderProps {
  staffId: string;
  onBack: () => void;
  onDeactivate: (mode: StaffStatusModalMode) => void;
}

const StaffDetailHeader: React.FC<StaffDetailHeaderProps> = ({
  staffId,
  onBack,
  onDeactivate,
}) => {
  const { data: staffDetail } = useGetCentreStaffDetail(staffId);

  const staffName =
    staffDetail?.name || staffDetail?.email?.split("@")[0] || "";

  const staffStatus = staffDetail?.status === "inactive" ? "Inactive" : "Active";

  const reviewedCount = staffDetail?.workload?.reviewed ?? 0;
  const pendingCount = staffDetail?.workload?.pending ?? 0;
  const requiresAttentionCount = staffDetail?.workload?.requiresAttention ?? 0;

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

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="col-span-2 sm:col-span-1 bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
          <div className="flex flex-col min-w-0">
            <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80 truncate">
              Reviewed Applications
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                {reviewedCount}
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

        <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
          <div className="flex flex-col min-w-0">
            <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80 truncate">
              Pending Applications
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                {pendingCount}
              </span>
              <span className="text-xs lg:text-sm font-normal text-white/80">
                applications
              </span>
            </div>
          </div>
          <div className="w-9 h-9 flex items-center justify-center shrink-0 ml-2">
            <FiClock className="w-5 h-5 text-white/90" />
          </div>
        </div>

        <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
          <div className="flex flex-col min-w-0">
            <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80 truncate">
              Requires Attention
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                {requiresAttentionCount}
              </span>
              <span className="text-xs lg:text-sm font-normal text-white/80">
                applications
              </span>
            </div>
          </div>
          <div className="w-9 h-9 flex items-center justify-center shrink-0 ml-2">
            <FiAlertCircle className="w-5 h-5 text-white/90" />
          </div>
        </div>
      </div>
    </div>
  );
};

interface StaffListHeaderProps {
  onAddStaff: () => void;
  activeStatusFilter?: string;
  onSelectStatusFilter?: (status: string) => void;
}

const StaffListHeader: React.FC<StaffListHeaderProps> = ({
  onAddStaff,
  activeStatusFilter,
  onSelectStatusFilter,
}) => {
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

  const stats = [
    {
      id: "total",
      label: "Total Staffs",
      count: totalStaff,
      status: "All",
      icon: <FiUser className="w-5 h-5 text-white/90" />,
    },
    {
      id: "active",
      label: "Active Staff",
      count: activeStaff,
      status: "Active",
      icon: <FiCheckCircle className="w-5 h-5 text-white/90" />,
    },
    {
      id: "pending",
      label: "Pending Staff",
      count: pendingStaff,
      status: "Pending",
      icon: <FiClock className="w-5 h-5 text-white/90" />,
    },
    {
      id: "inactive",
      label: "Inactive Staff",
      count: inactiveStaff,
      status: "Inactive",
      icon: <FiSlash className="w-5 h-5 text-white/90" />,
    },
  ];

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
                    staffs
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
