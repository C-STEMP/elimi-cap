"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FiSearch, FiList, FiGrid, FiBriefcase } from "react-icons/fi";
import { ASSETS_URL } from "@/assets";
import { Button } from "@/src/components/ui/button";
import { Select } from "@/src/components/ui/select";
import { ApplyJobModal } from "./ApplyJobModal";
import { useGetAssessorMarketplace } from "../hooks";
import type { JobPosting } from "../api";

export interface AssessorJobRecord {
  id: string;
  company: string;
  title: string;
  trade: string;
  duration: string;
  deadline: string;
  description: string;
  requirements: string[];
}

function mapJobPostingToRecord(job: JobPosting): AssessorJobRecord {
  const tradeTitle = job.trade?.name || job.tradeId || "Trade";
  return {
    id: job.id,
    company: "Assessment Centre",
    title: job.title,
    trade: tradeTitle,
    duration: job.duration ?? "N/A",
    deadline: job.deadline
      ? new Date(job.deadline).toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        })
      : "-",
    description: job.description,
    requirements: job.requirements,
  };
}

interface AssessorJobBoardViewProps {
  onSelectJob: (job: AssessorJobRecord) => void;
}

export const AssessorJobBoardView: React.FC<AssessorJobBoardViewProps> = ({
  onSelectJob,
}) => {
  const { data: apiJobs, isLoading, isError } = useGetAssessorMarketplace();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [countryFilter, setCountryFilter] = useState("All");
  const [stateFilter, setStateFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedApplyingJobId, setSelectedApplyingJobId] = useState<
    string | null
  >(null);

  const jobs: AssessorJobRecord[] = (apiJobs ?? []).map(mapJobPostingToRecord);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.trade.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole =
      roleFilter === "All" ||
      job.title.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  return (
    <div className="w-full bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-6 select-text min-h-125">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search job postings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50/70 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-2 focus:ring-primary-solid/20"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
          <div className="w-28">
            <Select
              placeholder="Role"
              value={roleFilter === "All" ? "" : roleFilter}
              onChange={(e) => setRoleFilter(e.target.value || "All")}
              options={["Internal Verifier", "Assessor", "Facilitator"]}
            />
          </div>

          <div className="w-32">
            <Select
              placeholder="Country"
              value={countryFilter === "All" ? "" : countryFilter}
              onChange={(e) => setCountryFilter(e.target.value || "All")}
              options={["Nigeria", "Ghana", "Kenya"]}
            />
          </div>

          <div className="w-28">
            <Select
              placeholder="State"
              value={stateFilter === "All" ? "" : stateFilter}
              onChange={(e) => setStateFilter(e.target.value || "All")}
              options={["Lagos", "Abuja", "Kano"]}
            />
          </div>

          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                viewMode === "list"
                  ? "bg-red-50 text-red-700 font-bold shadow-2xs"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <FiList className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-red-50 text-red-700 font-bold shadow-2xs"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <FiGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-52 bg-gray-100 rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="my-auto flex flex-col items-center justify-center text-center p-12">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-3">
            <FiBriefcase className="w-8 h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-neutral-primary">
            Failed to load job postings
          </h3>
          <p className="text-xs sm:text-sm text-neutral-secondary mt-1">
            Please check your connection and try again.
          </p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="my-auto flex flex-col items-center justify-center text-center p-12">
          <div className="w-16 h-16 rounded-2xl bg-[#FDF2F4] text-[#a31d38] flex items-center justify-center mb-3">
            <FiBriefcase className="w-8 h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-neutral-primary">
            No job postings available
          </h3>
          <p className="text-xs sm:text-sm text-neutral-secondary mt-1">
            Eligible job postings from centres will appear here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs flex flex-col justify-between gap-4 hover:border-gray-300 hover:shadow-xs transition-all"
            >
              <div className="flex flex-col gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 bg-white flex items-center justify-center">
                  <Image
                    src={ASSETS_URL.faviconIcon}
                    alt={job.company}
                    width={36}
                    height={36}
                    className="w-8 h-8 object-contain"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold tracking-wider text-gray-400 uppercase">
                    {job.company}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-neutral-primary">
                    {job.title}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 w-fit mt-0.5">
                    {job.trade}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs">
                  <div className="flex flex-col">
                    <span className="text-gray-400 font-medium">Duration</span>
                    <span className="font-bold text-neutral-primary mt-0.5">
                      {job.duration}
                    </span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-gray-400 font-medium">Deadline</span>
                    <span className="font-bold text-neutral-primary mt-0.5">
                      {job.deadline}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectJob(job)}
                  className="w-full border-gray-200 text-neutral-primary font-bold text-xs rounded-xl hover:bg-gray-50 h-9 cursor-pointer"
                >
                  View
                </Button>
                <Button
                  variant="amber"
                  size="sm"
                  onClick={() => setSelectedApplyingJobId(job.id)}
                  className="w-full bg-[#FBAB2A] hover:bg-[#E89B1F] text-white font-bold text-xs rounded-xl h-9 cursor-pointer"
                >
                  Apply
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ApplyJobModal
        isOpen={!!selectedApplyingJobId}
        jobId={selectedApplyingJobId ?? ""}
        onClose={() => setSelectedApplyingJobId(null)}
        onSuccess={() => setSelectedApplyingJobId(null)}
      />
    </div>
  );
};
