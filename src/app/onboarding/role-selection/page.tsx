"use client";

import dynamic from "next/dynamic";

const RoleSelection = dynamic(
  () =>
    import("@/features/shared/onboarding/pages/RoleSelection").then(
      (mod) => mod.RoleSelection
    ),
  { ssr: false }
);

export default function RoleSelectionPage() {
  return <RoleSelection />;
}
