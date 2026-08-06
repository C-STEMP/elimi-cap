"use client";

import dynamic from "next/dynamic";
import  { Suspense, use } from "react";

const ApplicationDetailsPage = dynamic(
  () =>
    import("@/features/applications/pages/ApplicationDetailsPage").then(
      (mod) => mod.ApplicationDetailsPage
    ),
  { ssr: false }
);

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ApplicationDetailPage({ params }: PageProps) {
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
      <ApplicationDetailsPage id={id} />
    </Suspense>
  );
}
