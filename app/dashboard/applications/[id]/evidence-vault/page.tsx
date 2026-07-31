"use client";

import dynamic from "next/dynamic";
import React, { Suspense, use } from "react";

const EvidenceVaultPage = dynamic(
  () =>
    import("@/features/evidence-vault/pages/EvidenceVaultPage").then(
      (mod) => mod.EvidenceVaultPage
    ),
  { ssr: false }
);

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EvidenceVaultRoute({ params }: PageProps) {
  const { id } = use(params);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-400">
          Loading...
        </div>
      }
    >
      <EvidenceVaultPage applicationId={id} />
    </Suspense>
  );
}
