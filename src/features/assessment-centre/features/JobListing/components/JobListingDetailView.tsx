"use client";

import React, { useState } from "react";
import {
  FiChevronLeft,
  FiSearch,
  FiClipboard,
  FiCheckCircle,
  FiList,
  FiGrid,
  FiCheck,
} from "react-icons/fi";
import { Button } from "@/src/components/ui/button";
import { Select } from "@/src/components/ui/select";
import { useToast } from "@/src/components/ui/toast";
import {
  MOCK_JOB_LISTINGS,
  MOCK_ASSESSOR_APPLICANTS,
} from "@/features/assessment-centre/utils/constants";
import { AssessorApplicant } from "@/features/assessment-centre/types";

interface JobListingDetailViewProps {
  jobId: string;
  onBack: () => void;
  onSelectApplicant: (applicantId: string) => void;
}

export const JobListingDetailView: React.FC<JobListingDetailViewProps> = ({
  jobId,
  onBack,
  onSelectApplicant,
}) => {
  const { toast } = useToast();
  const job =
    MOCK_JOB_LISTINGS.find((j) => j.id === jobId) || MOCK_JOB_LISTINGS[0];

  const [applicants, setApplicants] = useState<AssessorApplicant[]>(
    MOCK_ASSESSOR_APPLICANTS,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isFilled, setIsFilled] = useState(job.status === "Filled");
  const [selectedApplicantIds, setSelectedApplicantIds] = useState<string[]>(
    [],
  );
  const [applicantsViewMode, setApplicantsViewMode] = useState<"list" | "grid">(
    "list",
  );

  const handleToggleFilled = () => {
    setIsFilled((prev) => !prev);
    toast({
      type: "info",
      title: isFilled ? "Marked as Open" : "Marked as Filled",
      description: `Job listing status has been updated.`,
    });
  };

  const toggleSelectApplicant = (id: string) => {
    setSelectedApplicantIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const filteredApplicants = applicants.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.trade.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      {/* Description Section */}
      <div className="bg-white rounded-3xl p-6 shadow-2xs border border-gray-100/80 flex flex-col gap-2">
        <h3 className="text-lg font-extrabold text-neutral-primary tracking-tight">
          Description
        </h3>
        <p className="text-xs sm:text-sm text-neutral-secondary font-normal leading-relaxed">
          {job.description}
        </p>
      </div>

      {/* Requirements Section */}
      <div className="bg-white rounded-3xl p-6 shadow-2xs border border-gray-100/80 flex flex-col gap-3">
        <h3 className="text-lg font-extrabold text-neutral-primary tracking-tight">
          Requirement
        </h3>
        <div className="flex flex-col gap-2.5">
          {job.requirements?.map((req, idx) => (
            <div
              key={idx}
              className="bg-[#F8F9FA] p-3.5 rounded-2xl border border-gray-100 flex items-center gap-3"
            >
              <FiCheckCircle className="w-5 h-5 text-[#a31d38] shrink-0" />
              <span className="text-xs sm:text-sm font-semibold text-neutral-primary">
                {req}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Applicants Section */}
      <div className="bg-white rounded-3xl p-6 shadow-2xs border border-gray-100/80 flex flex-col gap-6">
        <h3 className="text-xl font-extrabold text-neutral-primary tracking-tight">
          Applicants
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

          <div className="flex items-center justify-end gap-3">
            <Select
              size="sm"
              showPlaceholderOption={false}
              containerClassName="w-36"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { label: "Status", value: "All" },
                { label: "Pending", value: "Pending" },
                { label: "Shortlisted", value: "Shortlisted" },
                { label: "Rejected", value: "Rejected" },
              ]}
            />

            <div className="flex items-center gap-1 bg-[#F8F9FA] p-1 rounded-xl border border-gray-200/80">
              <button
                type="button"
                onClick={() => setApplicantsViewMode("list")}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  applicantsViewMode === "list"
                    ? "bg-white text-neutral-primary shadow-xs font-bold"
                    : "text-gray-400 hover:text-neutral-primary"
                }`}
                title="List View"
              >
                <FiList className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setApplicantsViewMode("grid")}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  applicantsViewMode === "grid"
                    ? "bg-white text-neutral-primary shadow-xs font-bold"
                    : "text-gray-400 hover:text-neutral-primary"
                }`}
                title="Grid View"
              >
                <FiGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Applicants Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#F8F9FA] text-gray-500 text-xs font-semibold uppercase tracking-wider rounded-xl">
                <th className="p-3.5 rounded-l-xl w-10">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-[#a31d38] focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="p-3.5">Assessor Name</th>
                <th className="p-3.5">Trade</th>
                <th className="p-3.5">Experience</th>
                <th className="p-3.5">Certificates</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs sm:text-sm font-medium text-neutral-primary">
              {filteredApplicants.map((app) => (
                <tr
                  key={app.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="p-3.5">
                    <input
                      type="checkbox"
                      checked={selectedApplicantIds.includes(app.id)}
                      onChange={() => toggleSelectApplicant(app.id)}
                      className="w-4 h-4 rounded border-gray-300 text-[#a31d38] focus:ring-0 cursor-pointer"
                    />
                  </td>
                  <td className="p-3.5 font-bold text-neutral-primary">
                    {app.name}
                  </td>
                  <td className="p-3.5 text-neutral-secondary">{app.trade}</td>
                  <td className="p-3.5 text-neutral-secondary">
                    {app.experienceYears} Years
                  </td>
                  <td className="p-3.5 text-neutral-secondary">
                    {app.certificatesCount} Uploaded
                  </td>
                  <td className="p-3.5">
                    {app.status === "Shortlisted" ? (
                      <span className="bg-[#D1FAE5] text-[#065F46] font-semibold px-3 py-1 rounded-full text-xs inline-block">
                        Shortlisted
                      </span>
                    ) : app.status === "Rejected" ? (
                      <span className="bg-[#FEE2E2] text-[#991B1B] font-semibold px-3 py-1 rounded-full text-xs inline-block">
                        Rejected
                      </span>
                    ) : (
                      <span className="bg-[#FEF3C7] text-[#D97706] font-semibold px-3 py-1 rounded-full text-xs inline-block">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => onSelectApplicant(app.id)}
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
    </div>
  );
};
