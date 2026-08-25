"use client";

import React from "react";
import { StartApplication } from "@/src/features/candidate/features/Onboarding/pages/StartApplication";
import { HeaderBanner } from "@/src/features/candidate/features/Dashboard/components/HeaderBanner";

export default function DashboardStartApplicationPage() {
  return (
    <>
      <HeaderBanner
        backHref="/dashboard"
        backTitle="Start Assessment"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Start Assessment" },
        ]}
        showCreateButton={false}
      />
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <StartApplication />
      </div>
    </>
  );
}
