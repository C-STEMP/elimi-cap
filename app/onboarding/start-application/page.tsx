"use client";

import dynamic from "next/dynamic";

const StartApplication = dynamic(
  () =>
    import("@/features/onboarding/pages/StartApplication").then(
      (mod) => mod.StartApplication
    ),
  { ssr: false }
);

export default function StartApplicationPage() {
  return <StartApplication />;
}
