"use client";

import dynamic from "next/dynamic";

const AssessmentCentreDashboardPage = dynamic(
  () =>
    import(
      "@/features/assessment-centre/pages/AssessmentCentreDashboardPage"
    ).then((mod) => mod.AssessmentCentreDashboardPage),
  { ssr: false }
);

export default function Page() {
  return <AssessmentCentreDashboardPage />;
}
