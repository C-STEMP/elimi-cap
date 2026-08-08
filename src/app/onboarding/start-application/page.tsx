"use client";

import dynamic from "next/dynamic";

const StartApplication = dynamic(
  () =>
    import("@/src/features/candidate/features/Onboarding/pages/StartApplication").then(
      (mod) => mod.StartApplication
    ),
  { ssr: false }
);

export default function StartApplicationPage() {
  return <StartApplication />;
}
