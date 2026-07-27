"use client";

import dynamic from "next/dynamic";

const Welcome = dynamic(
  () =>
    import("@/features/onboarding/pages/Welcome").then(
      (mod) => mod.Welcome
    ),
  { ssr: false }
);

export default function WelcomePage() {
  return <Welcome />;
}
