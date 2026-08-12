"use client";

import React, { useState, useMemo } from "react";
import {
  FiSearch,
  FiList,
  FiGrid,
} from "react-icons/fi";
import { Select } from "@/src/components/ui/select";
import { useGetStaff } from "@/features/assessment-centre/features/Staff/hooks";
import { StaffStatusModal, StaffStatusModalMode } from "./StaffStatusModal";

import { useAppSelector } from "@/src/store/hooks";
import { useToast } from "@/src/components/ui/toast";
import { canViewStaffDetails } from "@/features/assessment-centre/utils/rbac";

interface StaffListViewProps {
  onSelectStaff: (staffId: string) => void;
  onAddStaff?: () => void;
  userRole?: string;
}

export const StaffListView: React.FC<StaffListViewProps> = ({
  onSelectStaff,
  userRole,
}) => {
  const { toast } = useToast();
  const user = useAppSelector((state) => state.auth.user);
  const role = userRole || user?.role;
  const canViewDetail = canViewStaffDetails(role);

  const handleSelectStaff = (staffId: string) => {
    if (!canViewDetail) {
      toast({
        type: "info",
        title: "Access Restricted",
        description: "Staff members cannot view detailed staff profiles.",
      });
      return;
    }
    onSelectStaff(staffId);
  };
  const { data: staffMembers = [], isLoading } = useGetStaff();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [deactivateModalMode, setDeactivateModalMode] =
    useState<StaffStatusModalMode>("confirm-deactivate");

  const handleOpenDeactivateModal = () => {
    if (selectedStaffIds.length === 0) return;
    setDeactivateModalMode("confirm-deactivate");
    setIsDeactivateModalOpen(true);
  };

  const handleConfirmDeactivate = () => {
    setDeactivateModalMode("deactivated-success");
  };

  const handleCloseDeactivateModal = () => {
    setIsDeactivateModalOpen(false);
    setSelectedStaffIds([]);
  };

  const toggleSelectStaff = (id: string) => {
    setSelectedStaffIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (selectedStaffIds.length === filteredStaff.length) {
      setSelectedStaffIds([]);
    } else {
      setSelectedStaffIds(filteredStaff.map((s) => s.id));
    }
  };

  const filteredStaff = useMemo(() => staffMembers.filter((staff) => {
    const matchesSearch =
      (staff.email || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || staff.role === statusFilter;
    return matchesSearch && matchesStatus;
  }), [staffMembers, searchQuery, statusFilter]);

  const renderStatusBadge = (role: string) => {
    switch (role) {
      case "super_admin":
        return (
          <span className="bg-[#1E7F4C]/20 text-[#1E7F4C]  px-4 py-1 rounded-full text-xs inline-block">
            Super Admin
          </span>
        );
      case "regular_admin":
        return (
          <span className="bg-secondary/20 text-secondary  px-3 py-1 rounded-full text-xs inline-block">
            Admin
          </span>
        );
      default:
        return (
          <span className="bg-black/20 text-black  px-3 py-1 rounded-full text-xs inline-block">
            Staff
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-solid" />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      <div className="bg-white rounded-3xl p-6 shadow-2xs border border-gray-100/80 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
            <input
              type="text"
              placeholder="Search staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F8F9FA] border border-[#12312B33] focus:border-gray-400 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-neutral-primary outline-none transition-all"
            />
          </div>

          <div className="flex items-center sm:justify-end gap-3">
            <Select
              size="sm"
              showPlaceholderOption={false}
              containerClassName="w-32"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { label: "Role", value: "All" },
                { label: "Super Admin", value: "super_admin" },
                { label: "Admin", value: "regular_admin" },
                { label: "Staff", value: "staff" },
              ]}
            />

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-[#FCE8EC] text-[#a31d38] shadow-2xs"
                    : "bg-[#EAEBED] text-gray-700 hover:text-neutral-primary"
                }`}
                title="List View"
              >
                <FiList className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-[#FCE8EC] text-[#a31d38] shadow-2xs"
                    : "bg-[#EAEBED] text-gray-700 hover:text-neutral-primary"
                }`}
                title="Grid View"
              >
                <FiGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={handleOpenDeactivateModal}
            disabled={selectedStaffIds.length === 0}
            className={`text-xs font-semibold underline transition-colors ml-1 ${
              selectedStaffIds.length === 0
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-400 hover:text-red-600 cursor-pointer"
            }`}
          >
            Deactivate
          </button>
        </div>

        {filteredStaff.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <p className="text-gray-400 font-normal">No staff members found.</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStaff.map((staff) => {
              const isSelected = selectedStaffIds.includes(staff.id);
              return (
                <div
                  key={staff.id}
                  className="bg-white rounded-2xl p-5 border border-black/20 shadow-2xs hover:shadow-xs transition-all flex items-start justify-between relative group"
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectStaff(staff.id)}
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-[#a31d38] focus:ring-0 cursor-pointer place-self-center"
                    />

                    <div className="flex flex-col gap-2 lg:gap-4">
                      <span className=" text-sm text-black">{staff.email}</span>
                      <span className="text-xs text-[#19191880] font-normal">
                        {staff.email}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between h-full gap-6">
                    {renderStatusBadge(staff.role)}

                    <button
                      type="button"
                      onClick={() => handleSelectStaff(staff.id)}
                      className="text-xs lg:text-sm text-black underline hover:text-[#a31d38] transition-colors cursor-pointer mt-2"
                    >
                      View
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-175">
              <thead>
                <tr className="bg-input-bg text-black text-xs lg:text-base tracking-wider rounded-xl whitespace-nowrap">
                  <th className="p-3.5 rounded-l-xl w-10 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={
                        selectedStaffIds.length === filteredStaff.length &&
                        filteredStaff.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded text-primary focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="p-3.5 whitespace-nowrap">Email</th>
                  <th className="p-3.5 whitespace-nowrap">Role</th>
                  <th className="p-3.5 text-right rounded-r-xl whitespace-nowrap">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs sm:text-sm  text-black">
                {filteredStaff.map((staff) => {
                  const isSelected = selectedStaffIds.includes(staff.id);
                  return (
                    <tr
                      key={staff.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="p-3.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectStaff(staff.id)}
                          className="w-4 h-4 rounded border-gray-300 text-[#a31d38] focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="p-3.5 text-black">{staff.email}</td>
                      <td className="p-3.5">
                        {renderStatusBadge(staff.role)}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleSelectStaff(staff.id)}
                          className="text-black font-bold text-xs underline hover:text-[#a31d38] transition-colors cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <StaffStatusModal
        isOpen={isDeactivateModalOpen}
        mode={deactivateModalMode}
        staffName={
          selectedStaffIds.length === 1
            ? staffMembers.find((s) => s.id === selectedStaffIds[0])?.email
            : undefined
        }
        onClose={handleCloseDeactivateModal}
        onConfirmDeactivate={handleConfirmDeactivate}
      />
    </div>
  );
};
