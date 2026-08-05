"use client";

import React, { useState } from "react";
import {
  FiChevronLeft,
  FiSearch,
  FiClipboard,
  FiSlash,
  FiUnlock,
  FiList,
  FiGrid,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  MOCK_STAFF_MEMBERS,
  MOCK_STAFF_APPLICATIONS,
} from "../utils/constants";
import { PendingApplication } from "../types";
import { StaffStatusModal, StaffStatusModalMode } from "./StaffStatusModal";

interface StaffDetailViewProps {
  staffId: string;
  onBack: () => void;
}

export const StaffDetailView: React.FC<StaffDetailViewProps> = ({
  staffId,
  onBack,
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
  const [isDeactivated, setIsDeactivated] = useState(false);

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
    const matchesSearch = app.candidateName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
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
          <span className="bg-[#FEF3C7] text-[#D97706] font-semibold px-3 py-1 rounded-full text-xs inline-block">
            Ongoing
          </span>
        );
      case "Folder Complete":
        return (
          <span className="bg-[#FEE2E2] text-[#991B1B] font-semibold px-3 py-1 rounded-full text-xs inline-block">
            Folder Complete
          </span>
        );
      case "Certified":
        return (
          <span className="bg-[#D1FAE5] text-[#065F46] font-semibold px-3 py-1 rounded-full text-xs inline-block">
            Certified
          </span>
        );
      default:
        return (
          <span className="bg-[#FEF3C7] text-[#D97706] font-semibold px-3 py-1 rounded-full text-xs inline-block">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      {/* Header Banner for Selected Staff Member */}
      <div className="w-full bg-[#a31d38] text-white rounded-3xl p-6 sm:p-8 xl:p-10 flex flex-col gap-6 shadow-md">
        {/* Breadcrumb & Action Row */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1 text-white/80 hover:text-white text-xs font-semibold transition-colors cursor-pointer w-fit select-none"
            >
              <FiChevronLeft className="w-4 h-4" />
              <span>Staff</span>
              <span className="mx-1">&gt;</span>
              <span className="text-white">{staff.name}</span>
            </button>

            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={onBack}
                className="text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <FiChevronLeft className="w-6 h-6" />
              </button>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {staff.name}
              </h1>
            </div>
          </div>

          {isDeactivated ? (
            <Button
              type="button"
              onClick={handleOpenActivateModal}
              variant="amber"
              size="md"
              rightIcon={<FiUnlock className="w-4 h-4" />}
              className="px-6 h-11 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-lg cursor-pointer whitespace-nowrap"
            >
              Activate
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleOpenDeactivateModal}
              variant="amber"
              size="md"
              rightIcon={<FiSlash className="w-4 h-4" />}
              className="px-6 h-11 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-lg cursor-pointer whitespace-nowrap"
            >
              Deactivate
            </Button>
          )}
        </div>

        {/* Staff Performance Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15">
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-medium text-white/80">
                Reviewed Applications
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl sm:text-2xl font-extrabold text-white">
                  {staff.reviewedApplicationsCount || 220}
                </span>
                <span className="text-xs font-normal text-white/70">
                  applications
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <FiClipboard className="w-5 h-5 text-white/90" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15">
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-medium text-white/80">
                Pending Applications
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl sm:text-2xl font-extrabold text-white">
                  {staff.pendingApplicationsCount || 20}
                </span>
                <span className="text-xs font-normal text-white/70">
                  applications
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <FiClipboard className="w-5 h-5 text-white/90" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15">
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-medium text-white/80">
                Requires Attention
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl sm:text-2xl font-extrabold text-white">
                  {staff.requiresAttentionCount || 10}
                </span>
                <span className="text-xs font-normal text-white/70">
                  applications
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <FiClipboard className="w-5 h-5 text-white/90" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Staff Assigned Applications Table Container */}
      <div className="bg-white rounded-3xl p-6 shadow-2xs border border-gray-100/80 flex flex-col gap-6">
        <h2 className="text-xl font-extrabold text-neutral-primary tracking-tight">
          Applications
        </h2>

        {/* Filter Controls Bar */}
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

          <div className="flex items-center justify-between sm:justify-end gap-3 flex-wrap">
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

            <div className="flex items-center gap-1 bg-[#F8F9FA] p-1 rounded-xl border border-gray-200/80">
              <button
                type="button"
                className="p-1.5 rounded-lg bg-white text-neutral-primary shadow-xs font-bold"
                title="List View"
              >
                <FiList className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="p-1.5 rounded-lg text-gray-400 hover:text-neutral-primary"
                title="Grid View"
              >
                <FiGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Staff Applications Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-175">
            <thead>
              <tr className="bg-[#F8F9FA] text-gray-500 text-xs font-semibold uppercase tracking-wider rounded-xl">
                <th className="p-3.5 rounded-l-xl">Candidate Name</th>
                <th className="p-3.5">Trade</th>
                <th className="p-3.5">Assessment Type</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Submitted at</th>
                <th className="p-3.5 text-right rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs sm:text-sm font-medium text-neutral-primary">
              {filteredApplications.map((app) => (
                <tr
                  key={app.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="p-3.5 font-bold text-neutral-primary">
                    {app.candidateName}
                  </td>
                  <td className="p-3.5 text-neutral-secondary">{app.trade}</td>
                  <td className="p-3.5 text-neutral-secondary">
                    {app.assessmentType}
                  </td>
                  <td className="p-3.5">{renderStatusBadge(app.status)}</td>
                  <td className="p-3.5 text-neutral-secondary">
                    {app.submittedAt}
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      type="button"
                      className="text-neutral-primary font-bold text-xs underline hover:text-[#a31d38] transition-colors cursor-pointer"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
