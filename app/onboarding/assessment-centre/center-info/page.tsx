"use client";

import dynamic from "next/dynamic";

const CenterInformation = dynamic(
  () =>
    import("@/features/onboarding/pages/assessment-centre/CenterInformation").then(
      (mod) => mod.CenterInformation
    ),
  { ssr: false }
);

export default function CenterInformationPage() {
  return <CenterInformation />;
}
