"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  AssessorHeaderBanner,
  type AssessorNavTab,
} from "@/src/features/assessor/features/Dashboard/components/AssessorHeaderBanner";
import { NotificationsListContent } from "@/src/features/shared/notifications/components/NotificationsListContent";
import { useAppSelector } from "@/src/store/hooks";

const TAB_TO_SLUG: Record<AssessorNavTab, string> = {
  Overview: "overview",
  Centres: "centres",
  Applications: "applications",
  "IQAM Tools": "iqam-tools",
  "Job Board": "job-board",
  Payments: "payments",
  Settings: "settings",
};

export default function AssessorNotificationsPage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const userName = user?.fullName || user?.email?.split("@")[0] || "Assessor";

  return (
    <div className="min-h-screen w-full bg-[#f8f9fb] flex flex-col select-text">
      <AssessorHeaderBanner
        userName={userName}
        activeTab="Overview"
        onSelectTab={(tab) => router.push(`/assessor/dashboard/${TAB_TO_SLUG[tab] || "overview"}`)}
      />

      <NotificationsListContent />
    </div>
  );
}
