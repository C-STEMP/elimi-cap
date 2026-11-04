"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiChevronRight, FiFolder, FiPlus } from "react-icons/fi";
import { Button } from "@/src/components/ui/button";

export interface ApplicationItem {
  id: string;
  title: string;
  subtitle: string;
  status: "Not Started" | "In Progress" | "Completed";
  statusLabel?: string;
  rawStatus?: string;
  type?: string;
}

interface ApplicationsListProps {
  applications?: ApplicationItem[];
  isLoading?: boolean;
}

type DashboardAppTab = "Active" | "Withdrawn";

export const ApplicationsList: React.FC<ApplicationsListProps> = ({
  applications = [],
  isLoading = false,
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<DashboardAppTab>("Active");

  const filteredApplications = React.useMemo(() => {
    return applications.filter((app) => {
      const isWithdrawn =
        app.rawStatus === "withdrawn" || app.statusLabel === "Withdrawn";
      return activeTab === "Withdrawn" ? isWithdrawn : !isWithdrawn;
    });
  }, [applications, activeTab]);

  const hasApplications = applications.length > 0;
  const hasFilteredApplications = filteredApplications.length > 0;

  const handleCreateApplication = () => {
    router.push("/onboarding/assessment-type");
  };

  return (
    <div className="bg-white rounded-[22px] p-5 lg:p-6 shadow-lg border border-gray-100 flex flex-col justify-start">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h3 className="text-black font-medium text-lg tracking-tight">
          My Applications
        </h3>
        <div className="flex items-center justify-between sm:justify-end gap-3">
          {hasApplications && (
            <div className="flex items-center gap-1 text-xs font-medium bg-input-bg p-1 rounded-full shrink-0">
              {(["Active", "Withdrawn"] as DashboardAppTab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded-full transition-all duration-200 cursor-pointer ${
                    activeTab === tab
                      ? "bg-white text-[#191913] font-medium shadow-xs"
                      : "text-[#191913] hover:bg-white/50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}
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
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3.5 w-full">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-[#f8f9fa] rounded-xl p-4 flex items-center justify-between border-l-[5px] border-gray-200 shadow-2xs animate-pulse"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div className="h-4 bg-gray-200 rounded w-32" />
                  <div className="h-4 bg-gray-200 rounded-full w-20" />
                </div>
                <div className="h-3 bg-gray-100 rounded w-40" />
              </div>
              <div className="w-5 h-5 bg-gray-200 rounded shrink-0" />
            </div>
          ))}
        </div>
      ) : !hasFilteredApplications ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-30 h-30 rounded-full bg-input-bg flex items-center justify-center mb-4">
            <FiFolder className="w-10 h-8.5 text-primary/12" />
          </div>
          <h4 className="text-[#191918] font-semibold text-xl mb-1.5">
            {activeTab === "Withdrawn"
              ? "No withdrawn applications"
              : "No active applications"}
          </h4>
          <p className="text-gray-400 text-xs leading-relaxed max-w-xs mb-6">
            {activeTab === "Withdrawn"
              ? "Applications you have withdrawn will appear here."
              : 'Click "Start Assessment" in the top header to get started with your Recognition of Prior Learning journey.'}
          </p>
          {activeTab !== "Withdrawn" && (
            <Link
              href="/onboarding/assessment-type"
              className="bg-secondary hover:bg-[#e89b1f] active:scale-95 text-white font-semibold text-sm px-6 py-2.5 rounded-xl shadow-lg transition-all cursor-pointer inline-flex items-center gap-1.5 no-underline select-none"
            >
              <span>Start Assessment</span>
              <FiPlus className="w-4 h-4 stroke-[2.5]" />
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3.5 w-full">
          {filteredApplications.map((app) => (
            <Link
              key={app.id}
              href={`/applications/${app.id}`}
              className="bg-[#f8f9fa] rounded-xl p-3.5 sm:p-4 flex items-center justify-between border-l-[5px] border-[#fbab2a] hover:bg-[#f0f2f7] transition-all cursor-pointer group shadow-2xs gap-3"
            >
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-3">
                  <span className="text-[#191918] font-bold text-sm sm:text-base lg:text-xl truncate">
                    {app.title}
                  </span>
                  <span
                    className={`text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 rounded-full shrink-0 ${
                      app.statusLabel === "Withdrawn" || app.status === "Not Started"
                        ? "bg-gray-100 text-gray-600"
                        : app.statusLabel === "Rejected"
                          ? "bg-red-50 text-red-700"
                          : app.status === "Completed"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {app.statusLabel || app.status}
                  </span>
                </div>
                <span className="text-gray-400 text-xs lg:text-sm font-normal truncate">
                  {app.subtitle}
                </span>
              </div>
              <FiChevronRight className="w-5 h-5 text-[#141B34] group-hover:translate-x-1 transition-transform shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
