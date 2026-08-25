"use client";

import React from "react";
import type { AssessorApplicationRecord } from "../../types/applications.types";

interface AssessorApplicationTableProps {
  applications: AssessorApplicationRecord[];
  onSelectApplication: (app: AssessorApplicationRecord) => void;
  isLoading?: boolean;
}

export const AssessorApplicationTable: React.FC<
  AssessorApplicationTableProps
> = ({ applications, onSelectApplication, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="w-full flex flex-col gap-3 animate-pulse py-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 bg-gray-100/80 rounded-xl w-full" />
        ))}
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="w-full py-12 flex flex-col items-center justify-center text-center text-gray-500 text-xs sm:text-sm">
        <p>No assigned candidates found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto max-w-full">
      <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[700px]">
        <thead>
          <tr className="border-b border-gray-100 text-gray-600 font-semibold">
            <th className="py-3 px-4">Role</th>
            <th className="py-3 px-4">Candidate Name</th>
            <th className="py-3 px-4">Trade</th>
            <th className="py-3 px-4">Assessment Type</th>
            <th className="py-3 px-4 text-center">Status</th>
            <th className="py-3 px-4">Assigned at</th>
            <th className="py-3 px-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 text-neutral-primary">
          {applications.map((app) => {
            const isCompleted = app.status === "Completed";
            const isOngoing = app.status === "Ongoing" || app.status === "Pending";

            return (
              <tr
                key={app.id}
                className="hover:bg-gray-50/60 transition-colors group cursor-pointer"
                onClick={() => onSelectApplication(app)}
              >
                <td className="py-3.5 px-4 font-normal text-neutral-secondary">
                  {app.role || "Facilitator"}
                </td>
                <td className="py-3.5 px-4 font-medium text-neutral-primary">
                  {app.candidateName}
                </td>
                <td className="py-3.5 px-4 text-neutral-secondary">
                  {app.trade}
                </td>
                <td className="py-3.5 px-4 text-neutral-secondary font-medium">
                  {app.assessmentType}
                </td>
                <td className="py-3.5 px-4 text-center">
                  {isCompleted ? (
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F8F0] text-[#12B76A]">
                      Completed
                    </span>
                  ) : isOngoing ? (
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF4E5] text-[#FF9800]">
                      Ongoing
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                      {app.status}
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-neutral-secondary font-normal">
                  {app.assignedAt || app.submittedAt || "07/22/2026"}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectApplication(app);
                    }}
                    className="text-neutral-primary hover:text-primary font-medium text-xs sm:text-sm hover:underline cursor-pointer"
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
  );
};
