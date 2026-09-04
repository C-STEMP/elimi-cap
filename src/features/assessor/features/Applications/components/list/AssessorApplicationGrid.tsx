"use client";

import React from "react";
import type { AssessorApplicationRecord } from "../../types/applications.types";

interface AssessorApplicationGridProps {
  applications: AssessorApplicationRecord[];
  onSelectApplication: (app: AssessorApplicationRecord) => void;
  isLoading?: boolean;
}

export const AssessorApplicationGrid: React.FC<
  AssessorApplicationGridProps
> = ({ applications, onSelectApplication, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full animate-pulse py-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-44 bg-gray-100/80 rounded-2xl w-full" />
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
      {applications.map((app) => {
        const isCompleted = app.status === "Completed";
        const isOngoing = app.status === "Ongoing" || app.status === "Pending";

        return (
          <div
            key={app.id}
            onClick={() => onSelectApplication(app)}
            className="bg-white border border-gray-100 hover:border-gray-200 hover:shadow-md rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col">
                <span className="text-[11px] font-medium text-neutral-secondary">
                  {app.role || "Facilitator"}
                </span>
                <h4 className="text-base font-bold text-neutral-primary group-hover:text-primary transition-colors">
                  {app.candidateName}
                </h4>
              </div>
              {isCompleted ? (
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#1E7F4C]/10 text-[#1E7F4C]">
                  Completed
                </span>
              ) : isOngoing ? (
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F9A825]/10 text-[#F9A825]">
                  Ongoing
                </span>
              ) : (
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600">
                  {app.status}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5 text-xs text-neutral-secondary border-t border-gray-50 pt-3">
              <div className="flex items-center justify-between">
                <span>Trade:</span>
                <span className="font-semibold text-neutral-primary">{app.trade}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Assessment Type:</span>
                <span className="font-semibold text-neutral-primary">{app.assessmentType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Assigned at:</span>
                <span>{app.assignedAt || app.submittedAt || "07/22/2026"}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectApplication(app);
              }}
              className="w-full text-center py-2 bg-gray-50 group-hover:bg-primary group-hover:text-white text-xs font-semibold rounded-xl text-neutral-primary transition-all"
            >
              View Application
            </button>
          </div>
        );
      })}
    </div>
  );
};
