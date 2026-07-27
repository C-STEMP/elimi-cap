"use client";

import dynamic from "next/dynamic";

const AssessmentType = dynamic(
  () =>
    import("@/features/onboarding/pages/AssessmentType").then(
      (mod) => mod.AssessmentType
    ),
  { ssr: false }
);

export default function AssessmentTypePage() {
  return <AssessmentType />;
}
