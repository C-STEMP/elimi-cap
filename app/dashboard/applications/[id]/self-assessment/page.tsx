"use client";

import dynamic from "next/dynamic";
import { Suspense, use } from "react";

const SelfAssessmentPage = dynamic(
  () =>
    import("@/features/self-assessment/pages/SelfAssessmentPage").then(
      (mod) => mod.SelfAssessmentPage
    ),
  { ssr: false }
);

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function Page({ params }: PageProps) {
  const { id } = use(params);

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

