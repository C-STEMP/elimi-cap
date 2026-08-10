"use client";

import { Suspense, use } from "react";
import { SelfAssessmentPage } from "@/features/candidate/features/self-assessment/pages/SelfAssessmentPage";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function Page({ params }: PageProps) {
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
      <SelfAssessmentPage id={id} />
    </Suspense>
  );
}
