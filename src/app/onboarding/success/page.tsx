"use client";

import dynamic from "next/dynamic";

const Success = dynamic(
  () =>
    import("@/src/features/candidate/features/Onboarding/pages/Success").then(
      (mod) => mod.Success
    ),
  { ssr: false }
);

export default function SuccessPage() {
  return <Success />;
}
