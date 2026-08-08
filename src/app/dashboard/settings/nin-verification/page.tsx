"use client";

import dynamic from "next/dynamic";

const NinVerificationPage = dynamic(
  () =>
    import("@/features/shared/settings/pages/NinVerificationPage").then(
      (mod) => mod.NinVerificationPage
    ),
  { ssr: false }
);

export default function NinVerificationRoute() {
  return <NinVerificationPage />;
}
