"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  FiSearch,
  FiList,
  FiGrid,
  FiChevronLeft,
  FiSlash,
  FiUnlock,
} from "react-icons/fi";
import { Select } from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
import {
  MOCK_STAFF_MEMBERS,
  MOCK_STAFF_APPLICATIONS,
} from "@/features/assessment-centre/utils/constants";
import { PendingApplication } from "@/features/assessment-centre/types";
import { StaffStatusModal, StaffStatusModalMode } from "./StaffStatusModal";
import { userAvatar } from "@/assets";

interface StaffDetailViewProps {
  staffId: string;
  onBack: () => void;
  onViewApplication?: (applicationId: string) => void;
}

export const StaffDetailView: React.FC<StaffDetailViewProps> = ({
  staffId,
  onBack,
  onViewApplication,
}) => {
  const staff =
    MOCK_STAFF_MEMBERS.find((s) => s.id === staffId) || MOCK_STAFF_MEMBERS[1];

  const [applications, setApplications] = useState<PendingApplication[]>(
    MOCK_STAFF_APPLICATIONS,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [tradeFilter, setTradeFilter] = useState("All");
  const [assessmentFilter, setAssessmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isDeactivated, setIsDeactivated] = useState(
    staff.status === "Inactive",
  );
  const [detailViewMode, setDetailViewMode] = useState<"list" | "grid">("list");

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusModalMode, setStatusModalMode] =
    useState<StaffStatusModalMode>("confirm-deactivate");

  const handleOpenDeactivateModal = () => {
    setStatusModalMode("confirm-deactivate");
    setIsStatusModalOpen(true);
  };

  const handleOpenActivateModal = () => {
    setStatusModalMode("confirm-activate");
    setIsStatusModalOpen(true);
  };

  const handleConfirmDeactivate = () => {
    setIsDeactivated(true);
    setStatusModalMode("deactivated-success");
  };

  const handleConfirmActivate = () => {
    setIsDeactivated(false);
    setStatusModalMode("activated-success");
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.trade.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTrade = tradeFilter === "All" || app.trade === tradeFilter;
    const matchesAssessment =
      assessmentFilter === "All" || app.assessmentType === assessmentFilter;
    const matchesStatus = statusFilter === "All" || app.status === statusFilter;
    return matchesSearch && matchesTrade && matchesAssessment && matchesStatus;
  });

  const renderStatusBadge = (status: PendingApplication["status"]) => {
    switch (status) {
      case "Ongoing":
        return (
          <span className="bg-[#FEF3C7] text-[#D97706] font-medium px-4 py-1 rounded-full text-xs inline-block">
            Ongoing
          </span>
        );
      case "Folder Complete":
        return (
          <span className="bg-primary/10 text-primary font-medium px-4 py-1 rounded-full text-xs inline-block">
            Folder Complete
          </span>
        );
      case "Certified":
        return (
          <span className="bg-[#1E7F4C]/20 text-[#1E7F4C] font-medium px-4 py-1 rounded-full text-xs inline-block">
            Certified
          </span>
        );
      default:
        return (
          <span className="bg-[#FEF3C7] text-[#D97706] font-medium px-4 py-1 rounded-full text-xs inline-block">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      {/* Staff Profile Card */}
      <div className="bg-white rounded-3xl p-6 shadow-2xs border border-gray-100/80 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden shrink-0 border border-gray-100 bg-gray-50 flex items-center justify-center">
            <Image
              src={userAvatar}
              alt={staff.name}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="text-lg sm:text-xl font-extrabold text-neutral-primary">
              {staff.name}
            </h2>
            <span className="text-xs text-gray-400 font-medium">
              {staff.email}
            </span>
          </div>
        </div>

        <div className="shrink-0">
          {isDeactivated ? (
            <span className="bg-[#E5E7EB] text-[#4B5563] font-semibold px-4 py-1.5 rounded-full text-xs inline-block">
              Inactive
            </span>
          ) : (
            <span className="bg-[#D1FAE5] text-[#065F46] font-semibold px-4 py-1.5 rounded-full text-xs inline-block">
              Active
            </span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-2xs border border-gray-100/80 flex flex-col gap-6">
        <h2 className="text-xl font-medium text-black tracking-tight">
          Applications
        </h2>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F8F9FA] border border-gray-200/80 focus:border-gray-400 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-neutral-primary outline-none transition-all"
            />
          </div>

          <div className="flex items-center flex-wrap sm:justify-end gap-3">
            <Select
              size="sm"
              showPlaceholderOption={false}
              containerClassName="w-32"
              value={tradeFilter}
              onChange={(e) => setTradeFilter(e.target.value)}
              options={[
                { label: "Trade", value: "All" },
                { label: "Masonry", value: "Masonry" },
                { label: "Carpentry", value: "Carpentry" },
                { label: "Plumbing", value: "Plumbing" },
                { label: "Painting", value: "Painting" },
              ]}
            />

            <Select
              size="sm"
              showPlaceholderOption={false}
              containerClassName="w-40"
              value={assessmentFilter}
              onChange={(e) => setAssessmentFilter(e.target.value)}
              options={[
                { label: "Assessment Type", value: "All" },
                { label: "RPL", value: "RPL" },
                { label: "NSQ", value: "NSQ" },
              ]}
            />

            <Select
              size="sm"
              showPlaceholderOption={false}
              containerClassName="w-36"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { label: "Status", value: "All" },
                { label: "Ongoing", value: "Ongoing" },
                { label: "Folder Complete", value: "Folder Complete" },
                { label: "Certified", value: "Certified" },
              ]}
            />

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setDetailViewMode("list")}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  detailViewMode === "list"
                    ? "bg-[#FCE8EC] text-[#a31d38] shadow-2xs"
                    : "bg-[#EAEBED] text-gray-600 hover:text-neutral-primary"
                }`}
                title="List View"
              >
                <FiList className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setDetailViewMode("grid")}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  detailViewMode === "grid"
                    ? "bg-[#FCE8EC] text-[#a31d38] shadow-2xs"
                    : "bg-[#EAEBED] text-gray-600 hover:text-neutral-primary"
                }`}
                title="Grid View"
              >
                <FiGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* View Mode 1: Grid Card View */}
        {detailViewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredApplications.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-2xl p-5 border border-black/20 shadow-2xs hover:shadow-xs transition-all flex items-start justify-between relative group"
              >
                <div className="flex flex-col gap-2">
                  <span className="font-bold text-sm text-black">
                    {app.candidateName}
                  </span>
                  <span className="text-xs text-[#19191880] font-normal">
                    Trade: {app.trade} • {app.assessmentType}
                  </span>
                  <span className="text-xs text-[#19191880] font-normal">
                    Submitted: {app.submittedAt}
                  </span>
                </div>

                <div className="flex flex-col items-end justify-between h-full gap-4">
                  {renderStatusBadge(app.status)}

                  <button
                    type="button"
                    onClick={() => onViewApplication?.(app.id)}
                    className="text-xs lg:text-sm text-black underline hover:text-[#a31d38] transition-colors cursor-pointer mt-2"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* View Mode 2: Table List View */
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-175">
              <thead>
                <tr className="bg-input-bg text-black text-xs lg:text-base tracking-wider rounded-xl">
                  <th className="p-3.5 rounded-l-xl">Candidate Name</th>
                  <th className="p-3.5">Trade</th>
                  <th className="p-3.5">Assessment Type</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Submitted at</th>
                  <th className="p-3.5 text-right rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y-4 divide-input-bg text-xs sm:text-sm text-black">
                {filteredApplications.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-input-bg transition-colors"
                  >
                    <td className="p-3.5 text-black">{app.candidateName}</td>
                    <td className="p-3.5 text-black">{app.trade}</td>
                    <td className="p-3.5 text-black">{app.assessmentType}</td>
                    <td className="p-3.5">{renderStatusBadge(app.status)}</td>
                    <td className="p-3.5 text-black">{app.submittedAt}</td>
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => onViewApplication?.(app.id)}
                        className="text-black text-xs lg:text-base underline hover:text-[#a31d38] transition-colors cursor-pointer"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Staff Status Deactivation / Activation Modal */}
      <StaffStatusModal
        isOpen={isStatusModalOpen}
        mode={statusModalMode}
        staffName={staff.name}
        onClose={() => setIsStatusModalOpen(false)}
        onConfirmDeactivate={handleConfirmDeactivate}
        onConfirmActivate={handleConfirmActivate}
      />
    </div>
  );
};
