"use client";

import dynamic from "next/dynamic";

const PersonalInfo = dynamic(
  () =>
    import("@/src/features/candidate/features/Onboarding/pages/PersonalInfo").then(
      (mod) => mod.PersonalInfo
    ),
  { ssr: false }
);

export default function PersonalInfoPage() {
  return <PersonalInfo />;
}
