"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { HeaderBanner } from "@/features/dashboard/components/HeaderBanner";
import { LearningPromoCard } from "@/features/dashboard/components/LearningPromoCard";
import { StatsCards } from "@/features/dashboard/components/StatsCards";
import {
  ApplicationsList,
  ApplicationItem,
} from "@/features/dashboard/components/ApplicationsList";
import {
  UpcomingCard,
  InterviewData,
} from "@/features/dashboard/components/UpcomingCard";
import {
  FacilitatorCard,
  FacilitatorData,
} from "@/features/dashboard/components/FacilitatorCard";
import { CalendarWidget } from "@/features/dashboard/components/CalendarWidget";
import { VerifiedBadge } from "@/features/dashboard/components/VerifiedBadge";
import { useAppSelector } from "@/store/hooks";
import { userAvatar } from "@/assets";

const POPULATED_APPLICATIONS: ApplicationItem[] = [
  {
    id: "app-1",
    title: "Carpentry",
    subtitle: "Recognition Of Prior Learning",
    status: "Not Started",
  },
  {
    id: "app-2",
    title: "Carpentry",
    subtitle: "Recognition Of Prior Learning",
    status: "Not Started",
  },
  {
    id: "app-3",
    title: "Carpentry",
    subtitle: "Recognition Of Prior Learning",
    status: "Not Started",
  },
];

const POPULATED_INTERVIEW: InterviewData = {
  title: "Panel Interview",
  date: "22-07-2026",
  time: "12:00PM",
};

const POPULATED_FACILITATOR: FacilitatorData = {
  name: "Ngozi Eze",
  avatar: userAvatar,
  role: "Facilitator · Carpentry (Level 3)",
  tags: ["Carpentry", "RPL Coordinator"],
};

export const Dashboard: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const firstName = user?.fullName?.split(" ")[0] || "Chidi";
  const searchParams = useSearchParams();
  const isSubmitted = searchParams?.get("status") === "submitted";

  const [demoState, setDemoState] = useState<"empty" | "populated">("empty");

  const isPopulated = demoState === "populated" || isSubmitted;

  const applications = isPopulated ? POPULATED_APPLICATIONS : [];
  const activeCount = isPopulated ? 3 : 0;
  const completedCount = isPopulated ? 1 : 0;
  const interview = isPopulated ? POPULATED_INTERVIEW : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full flex flex-col gap-2"
    >
      <HeaderBanner userName={firstName} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Main Content Area (8 Columns) */}
        <div className="lg:col-span-9 flex flex-col gap-6">
          {/* Top Row: Promo Card & Stats Cards */}
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

          {/* Applications List */}
          <ApplicationsList applications={applications} />
        </div>

        {/* Right Sidebar Column (4 Columns) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <CalendarWidget />
          <UpcomingCard interview={interview} />
          <VerifiedBadge isVerified={isPopulated} />
        </div>
      </div>
    </motion.div>
  );
};
