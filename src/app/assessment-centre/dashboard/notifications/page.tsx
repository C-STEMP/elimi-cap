"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AssessmentCentreHeader } from "@/src/features/assessment-centre/features/Dashboard/components/AssessmentCentreHeader";
import { NotificationsListContent } from "@/src/features/shared/notifications/components/NotificationsListContent";

export default function AssessmentCentreNotificationsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full bg-[#f8f9fb] flex flex-col select-text">
      <AssessmentCentreHeader
        activeTab="overview"
        onSelectTab={(tab) => router.push(`/assessment-centre/dashboard/${tab}`)}
      />

      <NotificationsListContent />
    </div>
  );
}
