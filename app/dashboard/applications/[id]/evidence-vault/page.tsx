"use client";

import dynamic from "next/dynamic";
import React, { Suspense } from "react";

const EvidenceVaultPage = dynamic(
  () =>
    import("@/features/dashboard/pages/EvidenceVaultPage").then(
      (mod) => mod.EvidenceVaultPage
    ),
  { ssr: false }
);

export default function EvidenceVaultRoute() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-400">
          Loading...
        </div>
      }
    >
      <EvidenceVaultPage />
    </Suspense>
  );
}
