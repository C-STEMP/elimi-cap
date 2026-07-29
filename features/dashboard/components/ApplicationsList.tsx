"use client";

import React from "react";
import Link from "next/link";
import { FiChevronRight, FiFolder } from "react-icons/fi";

export interface ApplicationItem {
  id: string;
  title: string;
  subtitle: string;
  status: "Not Started" | "In Progress" | "Completed";
}

interface ApplicationsListProps {
  applications?: ApplicationItem[];
}

export const ApplicationsList: React.FC<ApplicationsListProps> = ({
  applications = [],
}) => {
  const hasApplications = applications.length > 0;

  return (
    <div className="bg-white rounded-[22px] p-4 shadow-sm border border-gray-100 flex flex-col justify-between h-full min-h-75">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-black font-medium text-lg tracking-tight">
          My Applications
        </h3>
        {hasApplications && (
          <Link
            href="/dashboard/applications"
            className="text-primary text-xs font-semibold flex items-center gap-0.5 hover:underline cursor-pointer transition-colors"
          >
            View All
            <FiChevronRight className="w-4 h-4 stroke-[2.5]" />
          </Link>
        )}
      </div>

      {!hasApplications ? (
        <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
          <div className="w-30 h-30 rounded-full bg-input-bg flex items-center justify-center mb-4">
            <FiFolder className="w-10 h-8.5 text-primary/12" />
          </div>
          <h4 className="text-[#191918] font-semibold text-xl mb-1.5">
            No applications yet
          </h4>
          <p className="text-gray-400 text-xs leading-relaxed max-w-xs mb-6">
            Click &quot;Create Application&quot; in the top header to get
            started with your Recognition of Prior Learning journey.
          </p>
          <button
            type="button"
            onClick={() =>
              (window.location.href =
                "/onboarding/assessment-type?from=dashboard")
            }
            className="bg-secondary hover:bg-[#e89b1f] active:scale-95 text-white font-semibold text-sm px-6 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
          >
            Start Assessment +
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5 flex-1 justify-center">
          {applications.map((app) => (
            <Link
              key={app.id}
              href={`/dashboard/applications/${app.id}`}
              className="bg-input-bg rounded-xl p-4 flex items-center justify-between border-l-[5px] border-secondary hover:bg-[#f0f2f7] transition-all cursor-pointer group shadow-2xs"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <span className="text-[#191918] font-bold text-base lg:text-xl">
                    {app.title}
                  </span>
                  <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                    {app.status}
                  </span>
                </div>
                <span className="text-gray-400 text-xs lg:text-sm font-normal">
                  {app.subtitle}
                </span>
              </div>
              <FiChevronRight className="w-5 h-5 text-[#141B34] group-hover:translate-x-1 transition-transform" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
