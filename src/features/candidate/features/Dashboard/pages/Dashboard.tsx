"use client";

import React from "react";
import { motion } from "framer-motion";
import { HeaderBanner } from "@/features/candidate/features/Dashboard/components/HeaderBanner";
import { LearningPromoCard } from "@/features/candidate/features/Dashboard/components/LearningPromoCard";
import { StatsCards } from "@/features/candidate/features/Dashboard/components/StatsCards";
import { ApplicationsList } from "@/features/candidate/features/Dashboard/components/ApplicationsList";
import { UpcomingCard } from "@/features/candidate/features/Dashboard/components/UpcomingCard";
import { CalendarWidget } from "@/features/candidate/features/Dashboard/components/CalendarWidget";
import { VerifiedBadge } from "@/features/candidate/features/Dashboard/components/VerifiedBadge";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useGetApplications } from "@/src/features/candidate/features/Application/hooks";
import { useCandidateProfile } from "@/src/features/shared/onboarding/hooks";
import { markVerified } from "@/store/slices/authSlice";
import { savePersona } from "@/src/lib/auth-storage";

export const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);
  const savedRPLIdentity = useAppSelector((s) => s.onboarding.rplIdentity);
  const { data: candidateProfile } = useCandidateProfile(true);
  const { data: applications, isLoading: appsLoading } = useGetApplications();

  const isVerified = Boolean(
    authUser?.isVerified ||
    candidateProfile?.identityVerified ||
    savedRPLIdentity?.isVerified,
  );

  React.useEffect(() => {
    savePersona("candidate");
    if (isVerified && !authUser?.isVerified) {
      dispatch(markVerified());
    }
  }, [isVerified, authUser?.isVerified, dispatch]);

  const firstName =
    authUser?.fullName?.split(" ")[0] ||
    authUser?.email?.split("@")[0] ||
    "User";

  const activeCount =
    applications?.filter(
      (app) => app.status !== "certified" && app.status !== "rejected",
    ).length ?? 0;
  const completedCount =
    applications?.filter((app) => app.status === "certified").length ?? 0;

  const applicationItems = (applications ?? []).map((app) => {
    let status: "Not Started" | "In Progress" | "Completed" = "In Progress";
    if (app.status === "draft") {
      status = "Not Started";
    } else if (app.status === "certified") {
      status = "Completed";
    }

    const typeLabel = app.type === "NSQ" ? "Standard Assessment" : app.type;

    const title = (app as any).trade?.name
      ? `${(app as any).trade.name} (${typeLabel})`
      : `${typeLabel} Application`;

    const subtitle = (app as any).sector?.name
      ? `${(app as any).sector.name} • Status: ${app.currentStageKey || app.status}`
      : `Status: ${app.currentStageKey || app.status}`;

    return {
      id: app.id,
      title,
      subtitle,
      status,
    };
  });

  const upcomingInterview = null;
  const interviewDate = undefined;

  const isLoading = appsLoading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full flex flex-col min-h-screen"
    >
      <HeaderBanner userName={firstName} />

      <div className="max-w-7xl xl:max-w-360 mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-9 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
              <div className="md:col-span-8">
                <LearningPromoCard />
              </div>
              <div className="md:col-span-4">
                <StatsCards
                  activeCount={activeCount}
                  completedCount={completedCount}
                />
              </div>
            </div>

            <ApplicationsList
              applications={applicationItems}
              isLoading={isLoading}
            />
          </div>

          <div className="lg:col-span-3 flex flex-col gap-6">
            <CalendarWidget panelInterviewDate={interviewDate} />
            <UpcomingCard interview={upcomingInterview} />
            <VerifiedBadge isVerified={isVerified} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
