"use client";

import dynamic from "next/dynamic";

const OnboardingWizard = dynamic(
  () =>
    import("@/features/shared/onboarding/components/OnboardingWizard").then(
      (mod) => mod.OnboardingWizard
    ),
  { ssr: false }
);

export default function OnboardingPage() {
  return <OnboardingWizard />;
}
