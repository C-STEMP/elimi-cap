"use client";

import React, { useState } from "react";
import { FiSearch, FiPlus, FiList, FiGrid } from "react-icons/fi";
import { MOCK_JOB_LISTINGS } from "@/features/assessment-centre/utils/constants";
import { JobListing } from "@/features/assessment-centre/types";

interface JobListingsViewProps {
  onSelectJob: (jobId: string) => void;
  onPostRequest: () => void;
}

export const JobListingsView: React.FC<JobListingsViewProps> = ({
  onSelectJob,
  onPostRequest,
}) => {
  const [jobs, setJobs] = useState<JobListing[]>(MOCK_JOB_LISTINGS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const toggleSelectAll = () => {
    if (selectedJobIds.length === filteredJobs.length) {
      setSelectedJobIds([]);
    } else {
      setSelectedJobIds(filteredJobs.map((j) => j.id));
    }
  };

  const toggleSelectJob = (id: string) => {
    setSelectedJobIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleMarkAsFilled = () => {
    if (selectedJobIds.length === 0) return;
    setJobs((prev) =>
      prev.map((job) =>
        selectedJobIds.includes(job.id)
          ? { ...job, status: "Filled" as const }
          : job,
      ),
    );
    setSelectedJobIds([]);
  };

  const handleDelete = () => {
    if (selectedJobIds.length === 0) return;
    setJobs((prev) => prev.filter((job) => !selectedJobIds.includes(job.id)));
    setSelectedJobIds([]);
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.trade.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      {/* Table Container */}
      <div className="bg-white rounded-3xl p-6 shadow-2xs border border-gray-100/80 flex flex-col gap-6">
        {/* Controls Bar */}
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

          <div className="flex items-center justify-between sm:justify-end gap-4 flex-wrap">
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

            <div className="flex items-center gap-3 text-xs font-semibold">
              <button
                type="button"
                onClick={handleMarkAsFilled}
                disabled={selectedJobIds.length === 0}
                className={`underline transition-colors ${
                  selectedJobIds.length === 0
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-400 hover:text-neutral-primary cursor-pointer"
                }`}
              >
                Mark As Filled
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={selectedJobIds.length === 0}
                className={`underline transition-colors ${
                  selectedJobIds.length === 0
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-400 hover:text-red-600 cursor-pointer"
                }`}
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* View Mode 1: Grid Card View */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredJobs.map((job) => {
              const isSelected = selectedJobIds.includes(job.id);
              return (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl p-5 border border-black/20 shadow-2xs hover:shadow-xs transition-all flex items-start justify-between relative group"
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectJob(job.id)}
                      className="mt-1 place-self-center w-4 h-4 rounded border-gray-300 text-[#a31d38] focus:ring-0 cursor-pointer"
                    />

                    <div className="flex flex-col gap-2">
                      <span className="font-bold text-sm text-neutral-primary">
                        {job.role}
                      </span>
                      <span className="text-xs text-gray-500 font-normal">
                        Trade: {job.trade}
                      </span>
                      <span className="text-xs text-gray-500 font-normal">
                        Slots: {job.slotsFilled}/{job.slotsTotal} filled
                      </span>
                      <span className="text-xs text-gray-400">
                        Deadline: {job.deadline}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between h-full gap-4">
                    {job.status === "Filled" ? (
                      <span className="bg-[#FEE2E2] text-[#991B1B] font-semibold px-3 py-1 rounded-full text-xs inline-block">
                        Filled
                      </span>
                    ) : (
                      <span className="bg-[#D1FAE5] text-[#065F46] font-semibold px-3 py-1 rounded-full text-xs inline-block">
                        Open
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => onSelectJob(job.id)}
                      className="text-xs lg:text-sm text-neutral-primary font-bold underline hover:text-[#a31d38] transition-colors cursor-pointer mt-2"
                    >
                      View
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* View Mode 2: Table List View */
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#F8F9FA] text-gray-500 text-xs font-semibold uppercase tracking-wider rounded-xl">
                  <th className="p-3.5 rounded-l-xl w-10">
                    <input
                      type="checkbox"
                      checked={
                        selectedJobIds.length === filteredJobs.length &&
                        filteredJobs.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-[#a31d38] focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Trade</th>
                  <th className="p-3.5">Slots</th>
                  <th className="p-3.5">Applicants</th>
                  <th className="p-3.5">Deadline</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs sm:text-sm font-medium text-neutral-primary">
                {filteredJobs.map((job) => {
                  const isSelected = selectedJobIds.includes(job.id);
                  return (
                    <tr
                      key={job.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="p-3.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectJob(job.id)}
                          className="w-4 h-4 rounded border-gray-300 text-[#a31d38] focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="p-3.5 font-bold text-neutral-primary">
                        {job.role}
                      </td>
                      <td className="p-3.5 text-neutral-secondary">
                        {job.trade}
                      </td>
                      <td className="p-3.5 text-neutral-secondary">
                        {job.slotsFilled}/{job.slotsTotal} filled
                      </td>
                      <td className="p-3.5 text-neutral-secondary">
                        {job.applicantsCount}
                      </td>
                      <td className="p-3.5 text-neutral-secondary">
                        {job.deadline}
                      </td>
                      <td className="p-3.5">
                        {job.status === "Filled" ? (
                          <span className="bg-[#FEE2E2] text-[#991B1B] font-semibold px-3 py-1 rounded-full text-xs inline-block">
                            Filled
                          </span>
                        ) : (
                          <span className="bg-[#D1FAE5] text-[#065F46] font-semibold px-3 py-1 rounded-full text-xs inline-block">
                            Open
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => onSelectJob(job.id)}
                          className="text-neutral-primary font-bold text-xs underline hover:text-[#a31d38] transition-colors cursor-pointer"
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
    </div>
  );
};
