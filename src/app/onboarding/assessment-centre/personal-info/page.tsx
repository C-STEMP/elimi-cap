"use client";

import dynamic from "next/dynamic";

const CenterPersonalInfo = dynamic(
  () =>
    import("@/src/features/assessment-centre/features/Onboarding/pages/CenterPersonalInfo").then(
      (mod) => mod.CenterPersonalInfo
    ),
  { ssr: false }
);

export default function CenterPersonalInfoPage() {
  return <CenterPersonalInfo />;
}
