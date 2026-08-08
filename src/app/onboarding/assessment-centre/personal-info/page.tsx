"use client";

import dynamic from "next/dynamic";

const CenterPersonalInfo = dynamic(
  () =>
    import("@/features/onboarding/pages/assessment-centre/CenterPersonalInfo").then(
      (mod) => mod.CenterPersonalInfo
    ),
  { ssr: false }
);

export default function CenterPersonalInfoPage() {
  return <CenterPersonalInfo />;
}
