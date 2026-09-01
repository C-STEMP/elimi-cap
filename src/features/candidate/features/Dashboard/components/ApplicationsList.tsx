"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiChevronRight, FiFolder, FiPlus } from "react-icons/fi";
import { Button } from "@/src/components/ui/button";
import { Loader } from "@/src/components/ui/loader";

export interface ApplicationItem {
  id: string;
  title: string;
  subtitle: string;
  status: "Not Started" | "In Progress" | "Completed";
  statusLabel?: string;
  type?: string;
}

interface ApplicationsListProps {
  applications?: ApplicationItem[];
  isLoading?: boolean;
}

export const ApplicationsList: React.FC<ApplicationsListProps> = ({
  applications = [],
  isLoading = false,
}) => {
  const router = useRouter();
  const hasApplications = applications.length > 0;

  const handleCreateApplication = () => {
    router.push("/onboarding/assessment-type");
  };

  return (
    <div className="bg-white rounded-[22px] p-5 lg:p-6 shadow-lg border border-gray-100 flex flex-col justify-start">
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

      {isLoading ? (
        <Loader fullscreen={false} size="small" tip="Loading applications..." className="py-8" />
      ) : !hasApplications ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-30 h-30 rounded-full bg-input-bg flex items-center justify-center mb-4">
            <FiFolder className="w-10 h-8.5 text-primary/12" />
          </div>
          <h4 className="text-[#191918] font-semibold text-xl mb-1.5">
            No applications yet
          </h4>
          <p className="text-gray-400 text-xs leading-relaxed max-w-xs mb-6">
            Click &quot;Start Assessment&quot; in the top header to get
            started with your Recognition of Prior Learning journey.
          </p>
          <Link
            href="/onboarding/assessment-type"
            className="bg-secondary hover:bg-[#e89b1f] active:scale-95 text-white font-semibold text-sm px-6 py-2.5 rounded-xl shadow-lg transition-all cursor-pointer inline-flex items-center gap-1.5 no-underline select-none"
          >
            <span>Start Assessment</span>
            <FiPlus className="w-4 h-4 stroke-[2.5]" />
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5 w-full">
          {applications.map((app) => (
            <Link
              key={app.id}
              href={`/dashboard/applications/${app.id}`}
              className="bg-[#f8f9fa] rounded-xl p-4 flex items-center justify-between border-l-[5px] border-[#fbab2a] hover:bg-[#f0f2f7] transition-all cursor-pointer group shadow-2xs"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <span className="text-[#191918] font-bold text-base lg:text-xl">
                    {app.title}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      app.status === "Completed"
                        ? "bg-emerald-100 text-emerald-800"
                        : app.status === "Not Started"
                          ? "bg-gray-100 text-gray-600"
                          : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {app.statusLabel || app.status}
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
