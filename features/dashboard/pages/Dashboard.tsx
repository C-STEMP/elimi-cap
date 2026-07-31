"use client";

import React from "react";
import { motion } from "framer-motion";
import { HeaderBanner } from "@/features/dashboard/components/HeaderBanner";
import { LearningPromoCard } from "@/features/dashboard/components/LearningPromoCard";
import { StatsCards } from "@/features/dashboard/components/StatsCards";
import { ApplicationsList } from "@/features/dashboard/components/ApplicationsList";
import { UpcomingCard } from "@/features/dashboard/components/UpcomingCard";
import { CalendarWidget } from "@/features/dashboard/components/CalendarWidget";
import { VerifiedBadge } from "@/features/dashboard/components/VerifiedBadge";
import { useAppSelector } from "@/store/hooks";

export const Dashboard: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const applications = useAppSelector((state) => state.application.applications);
  const firstName = user?.fullName?.split(" ")[0] || "User";

  const activeCount = applications.filter(
    (app) => app.status !== "interview_completed" && app.status !== "certification" && app.status !== "draft"
  ).length;
  const completedCount = applications.filter(
    (app) => app.status === "interview_completed" || app.status === "certification"
  ).length;

  const applicationItems = applications.map((app) => ({
    id: app.id,
    title: app.title,
    subtitle: app.subtitle,
    status: (app.status === "draft" ? "Not Started" : 
            app.status === "interview_completed" || app.status === "certification" ? "Completed" : 
            "In Progress") as "Not Started" | "In Progress" | "Completed",
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full flex flex-col gap-2"
    >
      <HeaderBanner userName={firstName} />

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

          <ApplicationsList applications={applicationItems} />
        </div>

        <div className="lg:col-span-3 flex flex-col gap-6">
          <CalendarWidget />
          <UpcomingCard interview={{
            title: "Panel Interview",
            date: "22-07-2026",
            time: "12:00PM",
          }} />
          <VerifiedBadge isVerified={false} />
        </div>
      </div>
    </motion.div>
  );
};
