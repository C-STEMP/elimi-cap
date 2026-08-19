"use client";

import React from "react";
import { AssessmentType } from "@/src/features/candidate/features/Onboarding/pages/AssessmentType";
import { HeaderBanner } from "@/src/features/candidate/features/Dashboard/components/HeaderBanner";

export default function DashboardAssessmentTypePage() {
  return (
    <>
      <HeaderBanner
        backHref="/dashboard/start-application"
        backTitle="Assessment Type"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Create Application", href: "/dashboard/start-application" },
          { label: "Assessment Type" },
        ]}
        showCreateButton={false}
      />
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <AssessmentType />
      </div>
    </>
  );
}
