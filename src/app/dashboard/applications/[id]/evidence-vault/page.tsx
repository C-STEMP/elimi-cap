"use client";

import React, { Suspense, use } from "react";
import { EvidenceVaultPage } from "@/features/shared/evidence-vault/pages/EvidenceVaultPage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EvidenceVaultRoute({ params }: PageProps) {
  const resolvedParams = use(Promise.resolve(params));
  const id = resolvedParams?.id || "app-1786013185522";

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
