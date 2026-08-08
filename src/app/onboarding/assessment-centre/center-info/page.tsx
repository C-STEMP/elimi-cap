"use client";

import dynamic from "next/dynamic";

const CenterInformation = dynamic(
  () =>
    import("@/src/features/assessment-centre/features/Onboarding/pages/CenterInformation").then(
      (mod) => mod.CenterInformation
    ),
  { ssr: false }
);

export default function CenterInformationPage() {
  return <CenterInformation />;
}
