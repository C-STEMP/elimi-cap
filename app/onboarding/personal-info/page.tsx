"use client";

import dynamic from "next/dynamic";

const PersonalInfo = dynamic(
  () =>
    import("@/features/onboarding/pages/PersonalInfo").then(
      (mod) => mod.PersonalInfo
    ),
  { ssr: false }
);

export default function PersonalInfoPage() {
  return <PersonalInfo />;
}
