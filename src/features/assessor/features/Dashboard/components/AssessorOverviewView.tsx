"use client";

import React from "react";
import { FiChevronRight, FiClipboard, FiPlus, FiAward, FiX } from "react-icons/fi";
import { Button } from "@/src/components/ui/button";
import { useGetAssessorApplications } from "@/src/features/assessor/features/Applications/hooks";
import { useGetAssessorProfile } from "@/src/features/assessor/hooks";
import type { Application } from "@/src/features/shared/applications/api";
import { Loader } from "@/src/components/ui/loader";

interface AssessorOverviewViewProps {
  onViewAllApplications: () => void;
  onSelectApplication: (app: any) => void;
  onApplyToCentre: () => void;
}

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  in_progress: { label: "In Progress", className: "bg-[#FEF3C7] text-[#D97706]" },
  draft: { label: "Draft", className: "bg-gray-100 text-gray-600" },
  certified: { label: "Completed", className: "bg-emerald-50 text-emerald-700" },
  rejected: { label: "Rejected", className: "bg-rose-50 text-rose-700" },
  withdrawn: { label: "Withdrawn", className: "bg-gray-100 text-gray-500" },
};

export const AssessorOverviewView: React.FC<AssessorOverviewViewProps> = ({
  onViewAllApplications,
  onSelectApplication,
  onApplyToCentre,
}) => {
  const { data: allApplications = [], isLoading } = useGetAssessorApplications();
  const { data: assessorProfile } = useGetAssessorProfile();

  const [isApprovalDismissed, setIsApprovalDismissed] = React.useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem("elimi_assessor_approval_dismissed") === "true";
    } catch {
      return false;
    }
  });

  const handleDismissApproval = () => {
    setIsApprovalDismissed(true);
    try {
      localStorage.setItem("elimi_assessor_approval_dismissed", "true");
    } catch (e) {
      console.error(e);
    }
  };

  // Show only the latest 8 for the overview
  const applications = allApplications.slice(0, 8);

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      {/* Assessor Accreditation & Approval Status Banner */}
      {assessorProfile?.status === "pending" ? (
        <div className="bg-[#FEF3C7] rounded-3xl p-5 sm:p-6 border border-[#F59E0B]/30 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-[#FDE68A] text-[#92400E] flex items-center justify-center shrink-0 border border-amber-300">
              <FiAward className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-base sm:text-lg font-extrabold text-[#92400E] tracking-tight truncate">
                  {assessorProfile?.name || "Assessor Profile"}
                </h3>
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-white text-[#92400E] border border-[#F59E0B]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse" />
                  Accreditation Pending Review
                </span>
              </div>
              <p className="text-xs text-[#B45309] font-normal">
                Assessor No: <span className="font-semibold">{assessorProfile?.assessorNo || "AS-NBTE-0012"}</span> • Your assessor accreditation is currently under review by NBTE.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <span className="text-xs font-semibold text-[#92400E] bg-white/80 border border-[#F59E0B]/30 px-3.5 py-1.5 rounded-xl">
              Status: <span className="font-bold capitalize">Pending Approval</span>
            </span>
          </div>
        </div>
      ) : !isApprovalDismissed ? (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#1E7F4C]/20 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-[#E6F4EA] text-[#1E7F4C] flex items-center justify-center shrink-0 border border-[#1E7F4C]/20">
              <FiAward className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-base sm:text-lg font-extrabold text-black tracking-tight truncate">
                  {assessorProfile?.name || "Assessor Profile"}
                </h3>
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-[#E6F4EA] text-[#1E7F4C] border border-[#1E7F4C]/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1E7F4C]" />
                  Accredited Assessor
                </span>
              </div>
              <p className="text-xs text-gray-500 font-normal">
                Assessor No: <span className="font-semibold text-gray-800">{assessorProfile?.assessorNo || "AS-NBTE-0012"}</span> • Authorized for RPL &amp; NSQ Assessment
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
            <span className="text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200 px-3.5 py-1.5 rounded-xl">
              Status: <span className="text-[#1E7F4C] font-bold capitalize">{assessorProfile?.status || "Approved"}</span>
            </span>
            <button
              type="button"
              onClick={handleDismissApproval}
              aria-label="Dismiss approval banner"
              className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              title="Dismiss"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : null}

      <div className="w-full bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col min-h-[420px]">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
          <h2 className="text-lg font-bold text-neutral-primary">Applications</h2>
          <button
            type="button"
            onClick={onViewAllApplications}
            className="text-xs sm:text-sm font-semibold text-neutral-primary hover:text-primary-solid flex items-center gap-1 transition-colors cursor-pointer"
          >
            View All
            <FiChevronRight className="w-4 h-4" />
          </button>
        </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader />
        </div>
      ) : applications.length > 0 ? (
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <th className="p-3.5">ID</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Stage</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs sm:text-sm">
              {applications.map((app) => {
                const s =
                  STATUS_LABEL[app.status] || {
                    label: app.status,
                    className: "bg-gray-100 text-gray-600",
                  };
                return (
                  <tr key={app.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="p-3.5 font-mono text-xs text-neutral-primary">
                      {app.id.slice(0, 8)}…
                    </td>
                    <td className="p-3.5 text-gray-600 font-medium">{app.type}</td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.className}`}
                      >
                        {s.label}
                      </span>
                    </td>
                    <td className="p-3.5 text-gray-500 text-xs">
                      {(app as any).currentStageKey ?? "—"}
                    </td>
                    <td className="p-3.5 text-gray-500 text-xs">
                      {app.createdAt
                        ? new Date(app.createdAt).toLocaleDateString("en-GB")
                        : "—"}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => onSelectApplication(app)}
                        className="font-bold text-xs text-neutral-primary hover:text-primary-solid underline cursor-pointer"
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
      ) : (
        <div className="my-auto flex flex-col items-center justify-center text-center p-8">
          <div className="w-16 h-16 rounded-2xl bg-[#FDF2F4] text-[#a31d38] flex items-center justify-center mb-3">
            <FiClipboard className="w-8 h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-neutral-primary">
            No applications yet
          </h3>
          <p className="text-xs sm:text-sm text-neutral-secondary mt-1 mb-6">
            Applications assigned to you will appear here
          </p>

          <Button
            variant="amber"
            size="md"
            rightIcon={<FiPlus className="w-4 h-4" />}
            onClick={onApplyToCentre}
            className="px-6 h-11 font-bold text-sm rounded-xl shadow-md cursor-pointer"
          >
            Apply To Centre
          </Button>
        </div>
      )}
      </div>
    </div>
  );
};
