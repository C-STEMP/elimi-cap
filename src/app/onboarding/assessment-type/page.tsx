"use client";

import dynamic from "next/dynamic";

const AssessmentType = dynamic(
  () =>
    import("@/src/features/candidate/features/Onboarding/pages/AssessmentType").then(
      (mod) => mod.AssessmentType
    ),
  { ssr: false }
);

export default function AssessmentTypePage() {
  return <AssessmentType />;
}
