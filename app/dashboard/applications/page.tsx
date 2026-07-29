"use client";

import dynamic from "next/dynamic";
import React, { Suspense } from "react";

const MyApplicationsPage = dynamic(
  () =>
    import("@/features/dashboard/pages/MyApplicationsPage").then(
      (mod) => mod.MyApplicationsPage
    ),
  { ssr: false }
);

export default function ApplicationsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>}>
      <MyApplicationsPage />
    </Suspense>
  );
}
