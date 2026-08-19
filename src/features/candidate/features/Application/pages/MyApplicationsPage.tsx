"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiChevronRight, FiFolder, FiPlus } from "react-icons/fi";
import { HeaderBanner } from "@/features/candidate/features/Dashboard/components/HeaderBanner";
import { CalendarWidget } from "@/features/candidate/features/Dashboard/components/CalendarWidget";
import { UpcomingCard } from "@/features/candidate/features/Dashboard/components/UpcomingCard";
import { VerifiedBadge } from "@/features/candidate/features/Dashboard/components/VerifiedBadge";
import { Button } from "@/src/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Application, ApplicationStatus } from "@/store/slices/applicationSlice";
import { useGetApplications } from "@/src/features/candidate/features/Application/hooks";
import { useCandidateProfile } from "@/src/features/shared/onboarding/hooks";
import { markVerified } from "@/store/slices/authSlice";
import { Loader } from "@/src/components/ui/loader";

type FilterTab = "All" | "Ongoing" | "Completed" | "Draft";

const getStatusDisplay = (status: ApplicationStatus) => {
  const statusMap: Record<
    ApplicationStatus,
    { label: string; bg: string; text: string; border: string }
  > = {
    draft: {
      label: "Draft",
      bg: "bg-[#F9A8251A]",
      text: "text-[#F9A825]",
      border: "#F9A825",
    },
    submitted: {
      label: "Submitted",
      bg: "bg-[#AA1D3F1A]",
      text: "text-primary",
      border: "#AA1D3F",
    },
    payment_pending: {
      label: "Payment Pending",
      bg: "bg-[#F9A8251A]",
      text: "text-[#F9A825]",
      border: "#F9A825",
    },
    payment_completed: {
      label: "Payment Completed",
      bg: "bg-[#1E7F4C1A]",
      text: "text-[#1E7F4C]",
      border: "#1E7F4C",
    },
    folder_arrangement: {
      label: "Folder Arrangement",
      bg: "bg-[#AA1D3F1A]",
      text: "text-primary",
      border: "#AA1D3F",
    },
    self_assessment: {
      label: "Self Assessment",
      bg: "bg-[#F9A8251A]",
      text: "text-[#F9A825]",
      border: "#F9A825",
    },
    evidence_upload: {
      label: "Evidence Upload",
      bg: "bg-[#AA1D3F1A]",
      text: "text-primary",
      border: "#AA1D3F",
    },
    interview_scheduled: {
      label: "Interview Scheduled",
      bg: "bg-[#1E7F4C1A]",
      text: "text-[#1E7F4C]",
      border: "#1E7F4C",
    },
    interview_completed: {
      label: "Interview Completed",
      bg: "bg-[#1E7F4C1A]",
      text: "text-[#1E7F4C]",
      border: "#1E7F4C",
    },
    certification: {
      label: "Certification",
      bg: "bg-[#1E7F4C1A]",
      text: "text-[#1E7F4C]",
      border: "#1E7F4C",
    },
  };
  return statusMap[status] || statusMap.draft;
};

const getCategory = (
  status: ApplicationStatus,
): "Ongoing" | "Completed" | "Draft" => {
  if (status === "draft") return "Draft";
  if (status === "interview_completed" || status === "certification")
    return "Completed";
  return "Ongoing";
};

export const MyApplicationsPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);
  const savedRPLIdentity = useAppSelector((s) => s.onboarding.rplIdentity);
  const { data: candidateProfile } = useCandidateProfile(true);

  const isVerified = Boolean(
    authUser?.isVerified ||
    candidateProfile?.identityVerified ||
    savedRPLIdentity?.isVerified
  );

  React.useEffect(() => {
    if (isVerified && !authUser?.isVerified) {
      dispatch(markVerified());
    }
  }, [isVerified, authUser?.isVerified, dispatch]);

  const { data: remoteApps = [], isLoading } = useGetApplications();

  const applications = React.useMemo(() => {
    return remoteApps.map((app) => ({
      id: app.id,
      title: (app as any).trade?.name
        ? `${(app as any).trade.name} (${app.type})`
        : `${app.type} Application`,
      subtitle: (app as any).sector?.name
        ? `${(app as any).sector.name} • Status: ${app.currentStageKey || app.status}`
        : `Status: ${app.currentStageKey || app.status}`,
      status: (app.status as any) || "draft",
      createdAt: app.createdAt,
      updatedAt: app.updatedAt || app.createdAt,
      selfAssessmentCompleted: false,
      paymentCompleted: false,
      evidenceUploaded: false,
    }));
  }, [remoteApps]);

  const [activeTab, setActiveTab] = useState<FilterTab>("All");

  const filteredApplications = applications.filter((app) => {
    const category = getCategory(app.status);
    if (activeTab === "All") return true;
    if (activeTab === "Ongoing") return category === "Ongoing";
    if (activeTab === "Completed") return category === "Completed";
    if (activeTab === "Draft") return category === "Draft";
    return true;
  });

  const handleCreateApplication = () => {
    router.push("/onboarding/assessment-type?from=dashboard");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full flex flex-col gap-2"
    >
      <HeaderBanner
        title="My Applications"
        showCreateButton={true}
        createButtonText="Create Application"
      />

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
              <Loader fullscreen={false} size="small" tip="Loading applications..." className="py-12" />
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

                <Button
                  variant="secondary"
                  onClick={handleCreateApplication}
                  rightIcon={<FiPlus className="w-4 h-4 stroke-[2.5]" />}
                  className="bg-secondary hover:bg-[#e89b1f] active:scale-95 text-white font-semibold text-sm px-6 py-2.5 rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                >
                  Create Application
                </Button>
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
                      className="bg-input-bg rounded-xl p-4 flex items-center justify-between border-l-[5px] hover:bg-[#f0f2f7] transition-all cursor-pointer group shadow-2xs"
                      style={{ borderLeftColor: statusDisplay.border }}
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                          <span className="text-[#191918] font-bold text-base lg:text-xl">
                            {app.title}
                          </span>
                          <span
                            className={`${statusDisplay.bg} ${statusDisplay.text} text-xs font-semibold px-2.5 py-1 rounded-full`}
                          >
                            {statusDisplay.label}
                          </span>
                        </div>
                        <span className="text-gray-400 text-xs lg:text-sm font-normal">
                          {app.subtitle}
                        </span>
                      </div>

                      <FiChevronRight className="w-5 h-5 text-[#141B34] group-hover:translate-x-1 transition-transform" />
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
    </motion.div>
  );
};
