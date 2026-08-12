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
import {
  useCandidateProfile,
  useApplicationsSummary,
  useCandidateEvents,
} from "@/src/features/shared/onboarding/hooks";
import { useGetApplications } from "@/src/features/candidate/features/Application/hooks";

export const Dashboard: React.FC = () => {
  const { data: profile, isLoading: profileLoading } = useCandidateProfile();
  const { data: summary, isLoading: summaryLoading } = useApplicationsSummary();
  const { data: applications, isLoading: appsLoading } = useGetApplications();
  const { data: events, isLoading: eventsLoading } = useCandidateEvents();

  const firstName = profile?.name?.split(" ")[0] || "User";
  const isVerified = profile?.identityVerified ?? false;

  const activeCount = summary?.active ?? 0;
  const completedCount = summary?.completed ?? 0;

  const applicationItems = (applications ?? []).map((app) => {
    let status: "Not Started" | "In Progress" | "Completed" = "In Progress";
    if (app.status === "draft") {
      status = "Not Started";
    } else if (app.status === "certified") {
      status = "Completed";
    }

    return {
      id: app.id,
      title: `${app.type} Application`,
      subtitle: `Status: ${app.currentStageKey || app.status}`,
      status,
    };
  });

  const nextEvent = events && events.length > 0 ? events[0] : null;
  const upcomingInterview = nextEvent
    ? {
        title: nextEvent.name,
        date: new Date(nextEvent.eventAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
        time: new Date(nextEvent.eventAt).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        liveUrl: nextEvent.link || undefined,
      }
    : null;

  const interviewDate = nextEvent?.eventAt;

  const isLoading = profileLoading || summaryLoading || appsLoading || eventsLoading;

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

          <ApplicationsList applications={applicationItems} isLoading={isLoading} />
        </div>

        <div className="lg:col-span-3 flex flex-col gap-6">
          <CalendarWidget panelInterviewDate={interviewDate} />
          <UpcomingCard interview={upcomingInterview} />
          <VerifiedBadge isVerified={isVerified} />
        </div>
      </div>
    </motion.div>
  );
};
