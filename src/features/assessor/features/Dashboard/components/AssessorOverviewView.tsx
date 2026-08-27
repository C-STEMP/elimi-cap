"use client";

import React from "react";
import { FiChevronRight, FiClipboard, FiPlus } from "react-icons/fi";
import { Button } from "@/src/components/ui/button";
import { useGetAssessorApplications } from "@/src/features/assessor/features/Applications/hooks";
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

  // Show only the latest 8 for the overview
  const applications = allApplications.slice(0, 8);

  return (
    <div className="w-full bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col min-h-[420px] select-text">
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
  );
};
