"use client";

import React, { useState } from "react";
import { FiSearch, FiList, FiGrid, FiPlus } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { MOCK_JOB_LISTINGS } from "../utils/constants";
import { JobListing } from "../types";

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

  const toggleSelectJob = (id: string) => {
    setSelectedJobIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (selectedJobIds.length === filteredJobs.length) {
      setSelectedJobIds([]);
    } else {
      setSelectedJobIds(filteredJobs.map((j) => j.id));
    }
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.trade.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      {/* Header Banner */}
      <div className="w-full bg-[#a31d38] text-white rounded-3xl p-6 sm:p-8 xl:p-10 flex items-center justify-between gap-4 flex-wrap shadow-md">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Job Listings
        </h1>

        <Button
          type="button"
          onClick={onPostRequest}
          variant="amber"
          size="md"
          rightIcon={<FiPlus className="w-4.5 h-4.5" />}
          className="px-6 h-11 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-lg cursor-pointer whitespace-nowrap"
        >
          Post A Request
        </Button>
      </div>

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

            <div className="flex items-center gap-3 text-xs font-semibold text-gray-400">
              <button
                type="button"
                className="hover:text-neutral-primary underline transition-colors cursor-pointer"
              >
                Mark As Filled
              </button>
              <button
                type="button"
                className="hover:text-red-600 underline transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Job Listings Table */}
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
                      {job.status === "Open" ? (
                        <span className="bg-[#D1FAE5] text-[#065F46] font-semibold px-3 py-1 rounded-full text-xs inline-block">
                          Open
                        </span>
                      ) : (
                        <span className="bg-[#FEE2E2] text-[#991B1B] font-semibold px-3 py-1 rounded-full text-xs inline-block">
                          Filled
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
      </div>
    </div>
  );
};
