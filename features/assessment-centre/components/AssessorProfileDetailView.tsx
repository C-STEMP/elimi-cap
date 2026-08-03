"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  FiChevronLeft,
  FiSearch,
  FiClipboard,
  FiFileText,
  FiEye,
  FiSlash,
  FiUnlock,
  FiList,
  FiGrid,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import {
  MOCK_ASSESSORS,
  MOCK_ASSIGNED_CANDIDATES,
} from "../utils/constants";
import { AssignedCandidate } from "../types";
import {
  StaffStatusModal,
  StaffStatusModalMode,
} from "./StaffStatusModal";
import { ASSETS_URL } from "@/assets";

interface AssessorProfileDetailViewProps {
  assessorId: string;
  onBack: () => void;
}

export const AssessorProfileDetailView: React.FC<
  AssessorProfileDetailViewProps
> = ({ assessorId, onBack }) => {
  const assessor =
    MOCK_ASSESSORS.find((a) => a.id === assessorId) || MOCK_ASSESSORS[0];

  const [candidates, setCandidates] = useState<AssignedCandidate[]>(
    MOCK_ASSIGNED_CANDIDATES
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [tradeFilter, setTradeFilter] = useState("All");
  const [assessmentFilter, setAssessmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isDeactivated, setIsDeactivated] = useState(
    assessor.status === "Inactive"
  );

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

  const filteredCandidates = candidates.filter((cand) => {
    const matchesSearch =
      cand.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cand.trade.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTrade = tradeFilter === "All" || cand.trade === tradeFilter;
    const matchesAssessment =
      assessmentFilter === "All" || cand.assessmentType === assessmentFilter;
    const matchesStatus =
      statusFilter === "All" || cand.status === statusFilter;
    return matchesSearch && matchesTrade && matchesAssessment && matchesStatus;
  });

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      {/* Header Banner */}
      <div className="w-full bg-[#a31d38] text-white rounded-3xl p-6 sm:p-8 xl:p-10 flex flex-col gap-6 shadow-md">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1 text-white/80 hover:text-white text-xs font-semibold transition-colors cursor-pointer w-fit select-none"
            >
              <FiChevronLeft className="w-4 h-4" />
              <span>Assessor</span>
              <span className="mx-1">&gt;</span>
              <span className="text-white">{assessor.name}</span>
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
                {assessor.name}
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
              className="px-6 h-11 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-sm cursor-pointer whitespace-nowrap"
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
              className="px-6 h-11 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-sm cursor-pointer whitespace-nowrap"
            >
              Deactivate
            </Button>
          )}
        </div>

        {/* 3 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15">
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-medium text-white/80">Assigned Candidates</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl sm:text-2xl font-extrabold text-white">
                  {assessor.assignedCandidatesCount || 10}
                </span>
                <span className="text-xs font-normal text-white/70">applications</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <FiClipboard className="w-5 h-5 text-white/90" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15">
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-medium text-white/80">Ongoing</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl sm:text-2xl font-extrabold text-white">
                  {assessor.ongoingCount || 6}
                </span>
                <span className="text-xs font-normal text-white/70">applications</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <FiClipboard className="w-5 h-5 text-white/90" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15">
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-medium text-white/80">Completed</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl sm:text-2xl font-extrabold text-white">
                  {assessor.completedCount || 4}
                </span>
                <span className="text-xs font-normal text-white/70">applications</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <FiClipboard className="w-5 h-5 text-white/90" />
            </div>
          </div>
        </div>
      </div>

      {/* Assessor Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 shadow-2xs border border-gray-100/80 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden shrink-0 border border-gray-100 bg-gray-50 flex items-center justify-center">
            <Image
              src={ASSETS_URL.userAvatar}
              alt={assessor.name}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="text-lg sm:text-xl font-extrabold text-neutral-primary">
              {assessor.name}
            </h2>

            <span className="text-xs text-gray-400 font-medium">
              {assessor.email} · {assessor.experienceYears || 8} years experience
            </span>

            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {assessor.tags?.map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-[#FCE7F3] text-[#9D174D] text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
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

      {/* Certificates & Qualification Section */}
      <div className="bg-white rounded-3xl p-6 shadow-2xs border border-gray-100/80 flex flex-col gap-4">
        <h3 className="text-lg font-extrabold text-neutral-primary tracking-tight">
          Certificates & Qualification
        </h3>

        <div className="flex flex-col gap-3">
          <div className="bg-[#F8F9FA] hover:bg-[#F3F4F6] p-4 rounded-2xl border border-gray-100 flex items-center justify-between gap-4 transition-colors">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-100/80 text-red-500 flex items-center justify-center shrink-0">
                <FiFileText className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-sm sm:text-base text-neutral-primary">
                  NSQ Level 4 Carpentry
                </span>
                <span className="text-xs text-gray-400 font-medium mt-0.5">
                  National Board for Technical Education · 2020
                </span>
              </div>
            </div>
            <button
              type="button"
              className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-neutral-primary flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-2xs"
              title="Preview Certificate"
            >
              <FiEye className="w-4.5 h-4.5" />
            </button>
          </div>

          <div className="bg-[#F8F9FA] hover:bg-[#F3F4F6] p-4 rounded-2xl border border-gray-100 flex items-center justify-between gap-4 transition-colors">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-100/80 text-red-500 flex items-center justify-center shrink-0">
                <FiFileText className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-sm sm:text-base text-neutral-primary">
                  Certified Trade Assessor
                </span>
                <span className="text-xs text-gray-400 font-medium mt-0.5">
                  Nigeria Skills Qualification Awarding Body · 2021
                </span>
              </div>
            </div>
            <button
              type="button"
              className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-neutral-primary flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-2xs"
              title="Preview Certificate"
            >
              <FiEye className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Assigned Candidates Section */}
      <div className="bg-white rounded-3xl p-6 shadow-2xs border border-gray-100/80 flex flex-col gap-6">
        <h3 className="text-xl font-extrabold text-neutral-primary tracking-tight">
          Assigned Candidates
        </h3>

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
            <select
              value={tradeFilter}
              onChange={(e) => setTradeFilter(e.target.value)}
              className="border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-neutral-primary bg-white outline-none cursor-pointer hover:border-gray-300 transition-colors"
            >
              <option value="All">Trade</option>
              <option value="Masonry">Masonry</option>
              <option value="Carpentry">Carpentry</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Painting">Painting</option>
            </select>

            <select
              value={assessmentFilter}
              onChange={(e) => setAssessmentFilter(e.target.value)}
              className="border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-neutral-primary bg-white outline-none cursor-pointer hover:border-gray-300 transition-colors"
            >
              <option value="All">Assessment Type</option>
              <option value="RPL">RPL</option>
              <option value="NSQ">NSQ</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-neutral-primary bg-white outline-none cursor-pointer hover:border-gray-300 transition-colors"
            >
              <option value="All">Status</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
            </select>

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

        {/* Assigned Candidates Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#F8F9FA] text-gray-500 text-xs font-semibold uppercase tracking-wider rounded-xl">
                <th className="p-3.5 rounded-l-xl">Role</th>
                <th className="p-3.5">Candidate Name</th>
                <th className="p-3.5">Trade</th>
                <th className="p-3.5">Assessment Type</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Assigned at</th>
                <th className="p-3.5 text-right rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs sm:text-sm font-medium text-neutral-primary">
              {filteredCandidates.map((cand) => (
                <tr key={cand.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-3.5 text-neutral-secondary">{cand.role}</td>
                  <td className="p-3.5 font-bold text-neutral-primary">
                    {cand.candidateName}
                  </td>
                  <td className="p-3.5 text-neutral-secondary">{cand.trade}</td>
                  <td className="p-3.5 text-neutral-secondary">{cand.assessmentType}</td>
                  <td className="p-3.5">
                    {cand.status === "Completed" ? (
                      <span className="bg-[#D1FAE5] text-[#065F46] font-semibold px-3 py-1 rounded-full text-xs inline-block">
                        Completed
                      </span>
                    ) : (
                      <span className="bg-[#FEF3C7] text-[#D97706] font-semibold px-3 py-1 rounded-full text-xs inline-block">
                        Ongoing
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-neutral-secondary">{cand.assignedAt}</td>
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

      {/* Staff / Assessor Status Modal */}
      <StaffStatusModal
        isOpen={isStatusModalOpen}
        mode={statusModalMode}
        staffName={assessor.name}
        onClose={() => setIsStatusModalOpen(false)}
        onConfirmDeactivate={handleConfirmDeactivate}
        onConfirmActivate={handleConfirmActivate}
      />
    </div>
  );
};
