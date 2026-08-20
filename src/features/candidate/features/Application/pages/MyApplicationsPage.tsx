"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiChevronRight, FiFolder, FiPlus } from "react-icons/fi";
import { HeaderBanner } from "@/features/candidate/features/Dashboard/components/HeaderBanner";
import { CalendarWidget } from "@/features/candidate/features/Dashboard/components/CalendarWidget";
import { UpcomingCard } from "@/features/candidate/features/Dashboard/components/UpcomingCard";
import { VerifiedBadge } from "@/features/candidate/features/Dashboard/components/VerifiedBadge";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  Application,
  ApplicationStatus,
} from "@/src/features/shared/applications/api/application.api";
import { useGetApplications } from "@/src/features/candidate/features/Application/hooks";
import { useCandidateProfile } from "@/src/features/shared/onboarding/hooks";
import { markVerified } from "@/store/slices/authSlice";
import { Loader } from "@/src/components/ui/loader";

type FilterTab = "All" | "Ongoing" | "Completed" | "Draft";

const getStatusDisplay = (status: string) => {
  const statusMap: Record<
    string,
    { label: string; bg: string; text: string; border: string }
  > = {
    draft: {
      label: "Draft",
      bg: "bg-gray-100",
      text: "text-gray-700",
      border: "border-gray-300",
    },
    in_progress: {
      label: "In Progress",
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
    },
    certified: {
      label: "Certified",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
    },
    rejected: {
      label: "Rejected",
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
    },
    withdrawn: {
      label: "Withdrawn",
      bg: "bg-gray-50",
      text: "text-gray-700",
      border: "border-gray-200",
    },
  };

  return (
    statusMap[status] ?? {
      label: status.replace(/_/g, " "),
      bg: "bg-gray-100",
      text: "text-gray-700",
      border: "border-gray-300",
    }
  );
};

export const MyApplicationsPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<FilterTab>("All");

  const authUser = useAppSelector((state) => state.auth.user);
  const savedRPLIdentity = useAppSelector((s) => s.onboarding.rplIdentity);
  const { data: candidateProfile } = useCandidateProfile(true);
  const { data: applications = [], isLoading } = useGetApplications();

  const isVerified = Boolean(
    authUser?.isVerified ||
    candidateProfile?.identityVerified ||
    savedRPLIdentity?.isVerified,
  );

  React.useEffect(() => {
    if (isVerified && !authUser?.isVerified) {
      dispatch(markVerified());
    }
  }, [isVerified, authUser?.isVerified, dispatch]);

  const filteredApplications = applications.filter((app: Application) => {
    if (activeTab === "All") return true;
    if (activeTab === "Draft") return app.status === "draft";
    if (activeTab === "Completed") return app.status === "certified";
    if (activeTab === "Ongoing") {
      return app.status !== "draft" && app.status !== "certified";
    }
    return true;
  });

  const getApplicationTitle = (app: Application) => {
    const typeLabel = app.type === "NSQ" ? "Standard Assessment" : app.type;
    if ((app as any).trade?.name) {
      return `${(app as any).trade.name} (${typeLabel})`;
    }
    return `${typeLabel} Application`;
  };

  const getApplicationSubtitle = (app: Application) => {
    if ((app as any).sector?.name) {
      return `${(app as any).sector.name} • Status: ${app.currentStageKey || app.status}`;
    }
    return `Status: ${app.currentStageKey || app.status}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full flex flex-col min-h-screen"
    >
      <HeaderBanner
        title="My Applications"
        showCreateButton={true}
        createButtonText="Create Application"
      />

      <div className="max-w-7xl xl:max-w-360 mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-9 flex flex-col gap-6">
            <div className="bg-white rounded-[22px] p-5 lg:p-6 shadow-lg border border-[#F7F4EF] min-h-75 flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-4 border-b border-gray-100/60">
                <h2 className="text-black font-medium text-lg tracking-tight">
                  My Applications
                </h2>

                <div className="flex items-center gap-1 sm:gap-2 text-xs font-medium bg-input-bg p-1 rounded-full overflow-x-auto shrink-0">
                  {(["All", "Ongoing", "Completed", "Draft"] as FilterTab[]).map(
                    (tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                          activeTab === tab
                            ? "bg-white text-[#191913] font-medium shadow-xs"
                            : "text-[#191913] hover:bg-white/50"
                        }`}
                      >
                        {tab}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {isLoading ? (
                <Loader
                  fullscreen={false}
                  size="small"
                  tip="Loading applications..."
                  className="py-16"
                />
              ) : filteredApplications.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-30 h-30 rounded-full bg-input-bg flex items-center justify-center mb-4">
                    <FiFolder className="w-10 h-8.5 text-primary/12" />
                  </div>

                  <h3 className="text-[#191918] font-semibold text-xl mb-1.5">
                    No applications yet
                  </h3>
                  <p className="text-gray-400 text-xs leading-relaxed max-w-xs mb-6">
                    Click &quot;Create Application&quot; in the top header to get
                    started with your Recognition of Prior Learning journey.
                  </p>

                  <Link
                    href="/rpl/personal-info"
                    className="bg-secondary hover:bg-[#e89b1f] active:scale-95 text-white font-semibold text-sm px-6 py-2.5 rounded-xl shadow-lg transition-all cursor-pointer inline-flex items-center gap-1.5 no-underline select-none"
                  >
                    <span>Create Application</span>
                    <FiPlus className="w-4 h-4 stroke-[2.5]" />
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3.5 flex-1 justify-start pt-4 pb-2">
                  {filteredApplications.map((app) => {
                    const statusDisplay = getStatusDisplay(app.status);
                    return (
                      <div
                        key={app.id}
                        onClick={() =>
                          router.push(`/dashboard/applications/${app.id}`)
                        }
                        className="bg-input-bg rounded-xl p-4 flex items-center justify-between border-l-[5px] border-secondary hover:bg-[#f0f2f7] transition-all cursor-pointer group shadow-2xs"
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-3">
                            <span className="text-[#191918] font-bold text-base lg:text-xl">
                              {getApplicationTitle(app)}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusDisplay.bg} ${statusDisplay.text} ${statusDisplay.border}`}
                            >
                              {statusDisplay.label}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400 font-normal">
                            {getApplicationSubtitle(app)}
                          </span>
                        </div>

                        <FiChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-3 flex flex-col gap-6">
            <CalendarWidget />
            <UpcomingCard interview={null} />
            <VerifiedBadge isVerified={isVerified} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
