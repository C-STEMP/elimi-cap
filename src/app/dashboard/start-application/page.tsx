"use client";

import React from "react";
import { StartApplication } from "@/src/features/candidate/features/Onboarding/pages/StartApplication";
import { HeaderBanner } from "@/src/features/candidate/features/Dashboard/components/HeaderBanner";

export default function DashboardStartApplicationPage() {
  return (
    <>
      <HeaderBanner
        backHref="/dashboard"
        backTitle="Create Application"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Create Application" },
        ]}
        showCreateButton={false}
      />
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <StartApplication />
      </div>
    </>
  );
}
